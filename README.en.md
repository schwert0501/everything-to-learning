# learning-html

<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

`learning-html` is an Agent Skill for generating chapter-based, richly illustrated, progressive HTML learning materials. This repository provides both the original Chinese version and a complete English version with the same directory structure, template capabilities, and validation workflow.

## Versions

| Directory | Language | Description |
|---|---|---|
| [`learning-html/`](learning-html/) | Simplified Chinese | Chinese skill definition, guides, templates, and runtime assets |
| [`learning-html-en/`](learning-html-en/) | English | Complete English translation with the same structure as the Chinese version |

Both versions include:

- Progressive chapter planning and content-writing standards
- Mermaid diagram and HTML/CSS swimlane guidance
- Index, chapter, and swimlane templates
- Light/dark theme switching
- Chapter navigation and persistent learning progress
- Offline fallbacks for Mermaid and highlight.js
- A Mermaid syntax validation script

## Directory Structure

```text
.
├── README.md
├── README.en.md
├── learning-html/
│   ├── SKILL.md
│   ├── assets/
│   ├── references/
│   └── scripts/
└── learning-html-en/
    ├── SKILL.md
    ├── assets/
    ├── references/
    └── scripts/
```

## Usage

1. Choose `learning-html/` or `learning-html-en/` and place the entire directory in an Agent skills directory that supports `SKILL.md`.
2. Ask the Agent to generate learning materials for a topic, for example: `Create a beginner-friendly Docker learning website.`
3. The skill first confirms the domain, prior knowledge, learning goals, desired length, and content preferences, then prepares a chapter outline.
4. After the outline is confirmed, the skill generates a multi-chapter HTML learning site that can be opened directly.

The generated site uses `index.html` as its entry point, stores each chapter in a separate HTML file, and shares `assets/style.css` and `assets/app.js`. If the CDN is unavailable, the main content, code, and Mermaid source remain readable.

## Key Files

- [`learning-html/SKILL.md`](learning-html/SKILL.md): Chinese skill definition and complete workflow
- [`learning-html-en/SKILL.md`](learning-html-en/SKILL.md): English skill definition and complete workflow
- [`learning-html-en/references/content-guide.md`](learning-html-en/references/content-guide.md): chapter planning and content standards
- [`learning-html-en/references/diagram-guide.md`](learning-html-en/references/diagram-guide.md): diagram selection, Mermaid, and swimlane rules
- [`learning-html-en/assets/chapter-template.html`](learning-html-en/assets/chapter-template.html): chapter page template
- [`learning-html-en/assets/index-template.html`](learning-html-en/assets/index-template.html): index page template
- [`learning-html-en/assets/swimlane-example.html`](learning-html-en/assets/swimlane-example.html): directly previewable swimlane example
- [`learning-html-en/scripts/validate-mermaid.mjs`](learning-html-en/scripts/validate-mermaid.mjs): Mermaid syntax validator

## Mermaid Validation

Validate Mermaid diagrams in generated output with:

```bash
node learning-html/scripts/validate-mermaid.mjs <output-directory> \
  --mermaid-root <directory-containing-mermaid-and-jsdom-node_modules>
```

Use the English script in the same way:

```bash
node learning-html-en/scripts/validate-mermaid.mjs <output-directory> \
  --mermaid-root <directory-containing-mermaid-and-jsdom-node_modules>
```

Exit codes:

- `0`: all diagrams pass
- `1`: one or more Mermaid syntax errors are found
- `2`: arguments are invalid or Mermaid dependencies cannot be found, so validation is skipped

## Maintenance

- The Chinese directory is the original version; the English directory preserves the same relative file structure and runtime behavior.
- When templates, scripts, or guidance change in either version, update the other version as well.
- During translation, do not change CSS class names, DOM IDs, `window.CHAPTERS`, `window.CURRENT`, the localStorage key, CDN URLs, CLI arguments, or Mermaid keywords.
- CJK font names in `assets/style.css` are compatibility fallbacks and do not indicate untranslated English content.
