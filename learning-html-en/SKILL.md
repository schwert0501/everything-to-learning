---
name: learning-html
description: >-
  Generate chaptered, richly illustrated, step-by-step HTML learning materials. Use when the user wants to systematically learn an unfamiliar domain or new technology and wants highly readable HTML learning materials, tutorials, getting-started guides, or knowledge-base web pages, or mentions needs such as "chaptered", "step-by-step", "richly illustrated", "swimlane diagram", "learning path", "from beginner to expert", "light/dark mode", "fixed template", and so on. This skill should also trigger when the user simply says "I want to learn XX", "help me learn XX", "generate learning materials for XX", "make a tutorial page for XX", or "a web page for learning XX". This skill is suitable for the user to reuse across different new domains: it first clarifies requirements (domain, background, goals, length, content preferences), then plans a progressive chapter outline, and finally produces a complete HTML learning site — an index.html table of contents + numbered chapter pages + shared styles — using HTML/CSS swimlane diagrams as the primary visual and Mermaid as a supplement for rich illustration, with graceful offline degradation, learning-progress tracking, and free light/dark mode switching (light by default) built in. The entire site uses a fixed template; visual principles such as typography, highlighting, charts, and color schemes are unified, guaranteeing consistent style across generations and a layout the user grows increasingly familiar with the more they read.
---

# Generate Learning Material HTML (Learning HTML)

When the user wants to learn a new domain or technology, generate a set of HTML learning materials that are **highly readable, chaptered, richly illustrated, and step-by-step**. This skill has five core values — return to them before making any decision:

1. **HTML reading experience**: typography, color scheme, code highlighting, charts, and navigation are all tuned so that "opening it feels comfortable to read".
2. **Progressive continuity**: chapters are numbered along a cognitive ladder (01, 02, ...); each chapter connects the previous one to the next, so finishing one chapter naturally makes the reader want to continue.
3. **Richly illustrated**: each chapter has at least 1-2 figures, preferring native HTML/CSS swimlane diagrams (no library dependencies, works offline), supplemented by various Mermaid diagram types.
4. **Content depth**: prefer writing more explanations, analogies, and examples over dry bullet points — the user wants "both breadth and depth".
5. **Fixed template, consistent style**: **all visual principles** — typography, colors, fonts, code highlighting, chart styles, light/dark mode switching — **are pre-decided and locked in the skill's assets/**. Every generated site looks nearly identical, so the more the user reads, the more familiar the layout becomes — therefore when generating content, **only fill in the content, never change styles or structure**.

---

## Stage 0: Load this skill's resources

Before starting, read these bundled resources and strictly reuse them during generation:

| Resource | Purpose |
|---|---|
| `assets/chapter-template.html` | Chapter page skeleton template: **every chapter file is based on it**; keep all structural blocks and only replace content |
| `assets/index-template.html` | Table-of-contents page skeleton template: index.html is based on it |
| `assets/style.css` | Shared styles, **copied verbatim** to the output directory's `assets/`, do not modify (unless fixing a bug) |
| `assets/app.js` | Shared script: auto-generated chapter navigation, Mermaid/highlight CDN loading with offline fallback, localStorage learning progress, **copied verbatim** |
| `assets/swimlane-example.html` | Complete examples of the two swimlane variants; look at it before drawing a swimlane diagram |
| `references/diagram-guide.md` | Chart selection rules and all writing patterns (swimlane diagrams, each Mermaid type + syntax iron rules); consult when drawing charts |
| `references/content-guide.md` | Chapter planning template, per-chapter content composition, writing style and length rules; consult when planning the outline |
| `scripts/validate-mermaid.mjs` | **Mermaid syntax validation script** (must run in Stage 4); uses the official Mermaid parser to parse every diagram one by one |

Templates are "skeleton + complete example for each component" in one: every structural block has a filled-in sample next to it. Replace following the sample; do not invent new structures.

---

## Stage 1: Requirement clarification (ask only when information is missing)

First take stock of what the user has already provided — **never re-ask for information already given**. Ask for missing key items in **one round, at most 5 questions**, and give each question option-style defaults so the user can answer quickly:

1. **Target domain/technology** (required): what to learn?
2. **Existing background**: completely zero experience / experience in a neighboring domain / some relevant foundation / already senior in the field
3. **Learning goal**: get an overview / be able to use it / understand principles deeply and apply them / exam or certification
4. **Length preference**: concise (2000-3000 words per chapter) / standard (4000-8000 words per chapter, default) / in-depth (8000+ words per chapter)
5. **Content preference**: want code examples? want self-test questions? any specific subtopics you'd like covered?

Rules:

- When the user answers "you decide / anything is fine / whatever", enable the defaults: standard length, include code and exercises, and reasonably assume the foundation based on domain common sense (if they say "I want to learn", default to starting from zero).
- If the domain is clearly a routine technical learning scenario (the user says "I want to learn XX" with no further information), **don't rigidly ask all 5 questions** — go straight to Stage 2 with the default configuration, asking at most 1-2 questions that genuinely affect the outline (e.g., background, whether code is wanted).
- Questions should be specific and provide defaults, e.g.: "What's your programming background? A. Completely zero experience B. Know a bit of programming C. Have experience in X domain D. Senior".
- After clarification, write the "domain + background + goal + length + content preference" as a one- or two-sentence generation config and show it to the user for confirmation before starting generation (if the user has no objections, continue).

---

## Stage 2: Outline planning (progressive learning curve)

Following the planning template in `references/content-guide.md`, design **8-12 chapters** along the cognitive ladder (fine-tuning is allowed, but the order must not change):

| Position | Topic | Purpose |
|---|---|---|
| 01 | Domain overview and value | Panorama, why learn it, what you can do, terminology primer; build overall understanding |
| 02 | Environment setup + first example | Let the user "get it running" within 5 minutes; build confidence |
| 03-05 | Core concepts from easy to deep | Each chapter focuses on 1-2 big concepts, with figures and examples, until thoroughly explained |
| 06-08 | Advanced principles and best practices | Underlying mechanisms, common patterns, performance/security/engineering best practices |
| 09-10 | Comprehensive hands-on | One continuous case built up from scratch step by step |
| 11 | Common problems and troubleshooting | High-frequency pitfalls + debugging methods + debugging techniques |
| 12 | Summary and further learning path | Knowledge map, self-test, subsequent learning paths and resources |

Adjust depth based on the user's background:

- **Zero experience**: thicken the groundwork in 01-02 (backstory, everyday analogies), slow down 03-05.
- **Has a foundation**: compress 01-02, invest the saved space into 06-08 advanced topics and 09-10 hands-on practice.
- **Senior/improvement-oriented**: start directly at 03, make 06-08 the core, emphasize trade-offs, comparisons, and underlying principles.

Each chapter must define metadata: **title, 3-6 checkable learning objectives, prerequisite chapters, and connection points to the previous and next chapters**. Chapter titles should be specific (e.g., "04 Docker Images and Containers: Core Abstractions"), not just "Chapter 4".

---

## Stage 3: Generate HTML (core)

### Output directory

By default, create a `<topic>-learning/` subdirectory in the current working directory (topic is an English lowercase hyphenated slug, e.g., `docker-learning/`); if the user specifies a path, use it. If the directory already exists and is old, confirm whether to overwrite first.

### File structure (self-contained site, works directly when opened via file://)

```
<topic>-learning/
├── index.html            # Table-of-contents page (cover, learning path, chapter cards, progress overview, learning tips)
├── 01-overview.html      # One file per chapter
├── 02-setup.html
├── ...                   # 8-12 chapter files in total
└── assets/
    ├── style.css         # Copied verbatim from the skill's assets/
    └── app.js            # Copied verbatim from the skill's assets/
```

### Hard rules

- **Chapter filenames** = two digits + English slug: `01-overview.html`, `02-setup.html` ...; the Chinese/English title is written inside the HTML. Numbers are sequential with no duplicates.
- **Each chapter page** = a complete page based on `chapter-template.html`, keeping all structural blocks: learning objectives (checkable), body sections, figures, code examples, terminology cards, self-test questions, chapter summary, further reading. Structural blocks may only be added, never removed.
- **index.html** = based on `index-template.html`: cover info, learning path map, chapter cards (number + title + objective summary + link), progress overview, learning tips. It must embed the `window.CHAPTERS` chapter list (the chapter template embeds it too; the two copies must stay consistent) — app.js uses it to auto-generate the previous/next chapter navigation on every page and the progress bar on the index page — **do not hand-write previous/next chapter links**, let app.js handle them.
- **Relative paths**: `assets/style.css` and `assets/app.js` are all referenced relatively, so the site works when opened via file://.
- **At least 1-2 figures per chapter**, richly illustrated.
- **Light/dark mode toggle**: the header of every page must have a `<button id="theme-toggle" class="theme-toggle">` (already built into the template; copy it as-is). Light is the default; the user can click to toggle freely, and app.js remembers the choice. **Do not** switch to automatic system-follow mode, and do not remove this button.
- **Fixed template — change content only, never styles**: `assets/style.css` and `assets/app.js` must be **copied verbatim** from the skill directory and never modified (including colors, font sizes, spacing, highlight themes, chart styles, theme-switching logic). Typography/highlighting/charts/light-dark mode visual principles are all locked in; any "I think this looks nicer" custom styling will break the goal of "consistent style on every read" — the template guarantees the design quality, and the model is only responsible for filling in high-quality content.

### Chart specs (see `references/diagram-guide.md` for details)

| Scenario | What to use |
|---|---|
| Multi-role/multi-system collaboration flows (who does what, how it flows) | **HTML/CSS swimlane diagram** (`class="swimlane"`, preferred) |
| Single-line flows / algorithm steps | Mermaid `flowchart` |
| Interaction sequences (request/response) | Mermaid `sequenceDiagram` (has built-in swimlane feel) |
| State transitions | Mermaid `stateDiagram-v2` |
| Data models / table relationships | Mermaid `erDiagram` |
| Timeline plans / learning paths | Mermaid `gantt` |
| Share statistics | Mermaid `pie` |

Swimlane diagram essentials: lanes = participant rows, time flows left to right; step cards + arrows; **each lane is color-coded** (via the `data-lane` attribute); a title above the diagram and an aria-label plus a paragraph of explanation below it. "Richly illustrated" = figure + explanatory text; both are indispensable. To write one, copy the complete example in `swimlane-example.html` and fill it in.

Mermaid block syntax: `<div class="mermaid">flowchart LR ...</div>`. app.js loads and renders it from a CDN; **if loading fails, it automatically degrades to readable source text** (so the diagram content is still visible offline).

**Mermaid syntax iron rules (must follow when writing diagrams, otherwise rendering errors)**: a Mermaid syntax error makes the diagram fail to render, which is fatal in HTML, so it must be prevented at the source. Core rules:

- **Always wrap all node labels and subgraph titles in double quotes**: `A["forward: pred = model(x)"]`, `B{"is it an error?"}`, `subgraph A ["shape (3,1)"]`. Whenever a label contains `(`, `)`, `=`, `/`, `?`, `:`, `<br/>`, or Chinese punctuation, not quoting it will almost certainly cause a `Syntax error`.
- **Edge labels use the `-->|"label"|` form** (especially with spaces or special characters): `A -->|"size mismatch"| B`, not the bare `A -- size mismatch --> B` style.
- For the other types (sequenceDiagram / stateDiagram-v2 / erDiagram / gantt / pie), strictly follow the runnable examples in `references/diagram-guide.md`; do not invent syntax.

### Code and content rules

- Use `<pre><code class="language-xxx">` for code blocks; app.js highlights them with highlight.js, and falls back to plain text automatically if it fails. Code must have comments and an "expected output/effect" explanation.
- 4000-8000 Chinese characters per chapter (standard mode; concise 2000-3000; in-depth 8000+). Full set in standard mode ≥ 40,000 characters.
- Bold a term at first occurrence and add it to a terminology card; use everyday analogies for abstract concepts; keep a high density of examples.
- 3-6 self-test questions per chapter, with answers collapsed in `<details>` (works offline, no JS needed).
- Chapter connections: open with one sentence reviewing the previous chapter, close with one sentence previewing the next.

---

## Stage 4: Delivery self-check (must go through item by item after generation)

1. File list complete: index.html + 8-12 chapter files + the two files under assets/ all exist.
2. Chapter numbers are sequential, non-duplicated, and slugs are valid.
3. `window.CHAPTERS` in index.html corresponds one-to-one with the actual files, and every link resolves.
4. Every chapter has an `id="chapter-nav"` container (app.js fills in navigation automatically).
5. Every chapter has at least one figure (`class="swimlane"` or `class="mermaid"`), with explanatory text next to it.
6. `assets/style.css` and `assets/app.js` have been copied and are referenced by every page.
7. Total content meets the target (standard mode full set ≥ 40,000 characters; concise mode ≥ 16,000 characters).
8. HTML structure is valid (tags closed, no leftover template placeholders like `TODO`, `{{ }}`).
9. **Mermaid syntax validation (required, do not skip)**: use the bundled script to parse every `.mermaid` block one by one, report any syntax errors, and fix them:

   ```bash
   node <this skill directory>/scripts/validate-mermaid.mjs <output directory> --mermaid-root <directory containing node_modules>
   ```

   - `--mermaid-root` should point to a directory where mermaid and jsdom can be resolved (in the DSH environment, that's the deepseek-harness checkout path given in your system prompt).
   - A script output of `✗ <file>#<index>` means a syntax error; fix them one by one (most are labels missing quotes) and re-run until "0 errors".
   - If the script reports "mermaid not found, cannot validate", fall back to manually checking every block against the syntax iron rules in `references/diagram-guide.md`, especially whether every label is double-quoted.

Fix problems immediately when found; never deliver with known issues. After finishing, report to the user: **output directory, number of chapters, total word count, and how to open (open index.html in a browser)**. If the user wants online access, mention that the popo skill can be used for deployment, but do not deploy proactively.

---

## Common mistakes (be sure to avoid)

- Generating only one HTML file or no index.html (the user needs table-of-contents navigation).
- Forgetting to copy `assets/style.css` and `assets/app.js` to the output directory (pages would render unstyled / links would 404).
- Unilaterally modifying the styles, colors, or theme-switching logic of `style.css`/`app.js`, or removing the theme-toggle button from the header (breaks the "fixed template, consistent style" goal).
- Chapter files without numeric prefixes, or skipped numbers.
- Hand-writing previous/next chapter links (easy to get file paths wrong; app.js should auto-generate them).
- Swimlane diagrams without color coding or explanatory text, or shoehorning a simple flow into a swimlane diagram.
- Mermaid node labels/subgraph titles without double quotes, or edge labels using the `-- bare text -->` style (causing Syntax errors so the diagram won't render) — read the syntax iron rules in `references/diagram-guide.md` before drawing, and always run `scripts/validate-mermaid.mjs` after generating.
- Hollow content: only a list of headings with no explanations, analogies, or examples.
- Obscure terms not explained and not added to terminology cards.
- Figures disconnected from the text (the figure and the prose each say their own thing).
- Leftover template placeholders (TODO, {{placeholder}}, sample content not replaced).
