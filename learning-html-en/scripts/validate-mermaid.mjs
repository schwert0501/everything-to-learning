#!/usr/bin/env node
// ============================================================
// learning-html skill: Mermaid diagram syntax validation script
// Usage:
//   node validate-mermaid.mjs <output-dir> [--mermaid-root <dir containing node_modules>]
//
// What it does: recursively finds every <div class="mermaid"> block in all
//   HTML files under <output-dir> and parses each block with Mermaid's
//   official parser, reporting every syntax error (file + first line of the
//   diagram content).
// Dependencies: node + mermaid + jsdom (point --mermaid-root at a root that
//   has node_modules, e.g. the deepseek-harness checkout; if it cannot be
//   found, the script skips validation with a warning).
// Exit codes: 0 = all passed; 1 = syntax errors found; 2 = mermaid not
//   found, validation skipped.
// ============================================================
import { createRequire } from "module";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { pathToFileURL } from "url";

const args = process.argv.slice(2);
let target = null;
let mermaidRoot = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mermaid-root") mermaidRoot = args[++i];
  else if (target === null) target = args[i];
}
if (!target) {
  console.error("Usage: node validate-mermaid.mjs <output-dir> [--mermaid-root <dir>]");
  process.exit(2);
}

function collectHtml(root) {
  const out = [];
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".html")) out.push(p);
    }
  })(root);
  return out;
}

function extractBlocks(html) {
  const blocks = [];
  const re = /<div class="mermaid">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const code = m[1].replace(/^\s*\n/, "").replace(/\s+$/, "");
    if (code.trim()) blocks.push(code);
  }
  return blocks;
}

function resolveMermaidPath(candidates) {
  for (const root of candidates) {
    if (!root) continue;
    try {
      const req = createRequire(join(root, "package.json"));
      return { req, mermaidPath: req.resolve("mermaid") };
    } catch { /* try next */ }
  }
  return null;
}

const candidates = [];
if (mermaidRoot) candidates.push(resolve(mermaidRoot));
if (process.env.DSH_HARNESS_ROOT) candidates.push(resolve(process.env.DSH_HARNESS_ROOT));
let up = resolve(target);
for (let i = 0; i < 8; i++) {
  candidates.push(up);
  const parent = dirname(up);
  if (parent === up) break;
  up = parent;
}

const located = resolveMermaidPath(candidates);
if (!located) {
  console.error("[validate-mermaid] Warning: mermaid not found; skipping syntax validation.");
  console.error("  Use --mermaid-root to point at a directory containing node_modules (e.g. the deepseek-harness checkout).");
  process.exit(2);
}

async function main() {
  const { JSDOM } = located.req("jsdom");

  // Key step: set up the DOM globals before importing mermaid——
  // dompurify checks for `window` at import time and binds an instance to it;
  // otherwise `.sanitize` is missing.
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });

  // Use the bundled build (dompurify is initialized correctly inside),
  // rather than mermaid.core.mjs
  let mermaidPath;
  try {
    mermaidPath = located.req.resolve("mermaid/dist/mermaid.esm.min.mjs");
  } catch {
    mermaidPath = located.mermaidPath; // fall back to the entry point pointed to by exports
  }
  const { default: mermaid } = await import(pathToFileURL(mermaidPath).href);

  // Syntax-only validation; use "loose" to disable sanitization and focus on syntax
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });

  const files = collectHtml(target);
  let total = 0;
  const errors = [];

  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const blocks = extractBlocks(html);
    for (let i = 0; i < blocks.length; i++) {
      total++;
      const code = blocks[i];
      const firstLine = code.split("\n").map((s) => s.trim()).find(Boolean) || code.slice(0, 40);
      try {
        await mermaid.parse(code);
      } catch (e) {
        errors.push({ file, idx: i + 1, firstLine, msg: String(e.message || e) });
      }
    }
  }

  if (errors.length) {
    for (const e of errors) {
      console.error(`✗ ${e.file}#${e.idx} [${e.firstLine}]`);
      console.error(`    ${e.msg.split("\n")[0].slice(0, 220)}`);
    }
  }
  console.log(`\n[validate-mermaid] Checked ${total} Mermaid block(s), ${errors.length} error(s).`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("[validate-mermaid] Runtime error:", e.message || e);
  process.exit(2);
});
