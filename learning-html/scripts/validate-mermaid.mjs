#!/usr/bin/env node
// ============================================================
// learning-html 技能：Mermaid 图表语法校验脚本
// 用法:
//   node validate-mermaid.mjs <输出目录> [--mermaid-root <含 node_modules 的目录>]
//
// 功能：递归找出 <输出目录> 下所有 HTML 里的 <div class="mermaid"> 块，
//       用 Mermaid 官方解析器逐块 parse，报出每一处语法错误（文件 + 图内容首行）。
// 依赖：node + mermaid + jsdom（用 --mermaid-root 指定含 node_modules 的根目录，
//       如 DSH 的 deepseek-harness checkout 目录；找不到则跳过并给出警告）。
// 退出码：0=全部通过；1=存在语法错误；2=未找到 mermaid 无法校验。
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
  console.error("用法: node validate-mermaid.mjs <输出目录> [--mermaid-root <dir>]");
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
  console.error("[validate-mermaid] 警告：未找到 mermaid，无法做语法校验。");
  console.error("  请用 --mermaid-root 指定含 node_modules 的目录（如 deepseek-harness checkout）。");
  process.exit(2);
}

async function main() {
  const { JSDOM } = located.req("jsdom");

  // 关键：必须先搭好 DOM 全局再 import mermaid——
  // dompurify 在 import 时检测 window 并自动绑定实例，否则 .sanitize 缺失。
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });

  // 用 bundled 构建（内部已正确初始化 dompurify），而非 mermaid.core.mjs
  let mermaidPath;
  try {
    mermaidPath = located.req.resolve("mermaid/dist/mermaid.esm.min.mjs");
  } catch {
    mermaidPath = located.mermaidPath; // 回退到 exports 指向的入口
  }
  const { default: mermaid } = await import(pathToFileURL(mermaidPath).href);

  // 只做语法校验，用 loose 关闭清洗，聚焦语法本身
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
  console.log(`\n[validate-mermaid] 共检查 ${total} 个 Mermaid 块，错误 ${errors.length} 个。`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("[validate-mermaid] 运行时错误:", e.message || e);
  process.exit(2);
});
