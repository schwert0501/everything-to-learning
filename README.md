# learning-html

<p align="center">
  <strong>简体中文</strong> | <a href="README.en.md">English</a>
</p>

`learning-html` 是一个用于生成分章节、图文并茂、循序渐进的 HTML 学习资料的 Agent Skill。仓库同时提供中文原版和完整英文版，两者采用相同的目录结构、模板能力和校验流程。

## 版本

| 目录 | 语言 | 说明 |
|---|---|---|
| [`learning-html/`](learning-html/) | 简体中文 | 中文技能定义、指南、模板和运行时资源 |
| [`learning-html-en/`](learning-html-en/) | English | 与中文版本结构一致的完整英文翻译 |

两个版本都包含：

- 渐进式章节规划与内容写作规范
- Mermaid 图表和 HTML/CSS 泳道图指南
- 目录页、章节页和泳道图模板
- 深色/浅色主题切换
- 章节导航与学习进度持久化
- Mermaid 和 highlight.js 的离线降级
- Mermaid 语法校验脚本

## 目录结构

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

## 使用方式

1. 根据需要选择 `learning-html/` 或 `learning-html-en/`，将整个目录放入支持 `SKILL.md` 的 Agent skills 目录。
2. 让 Agent 生成某个主题的学习资料，例如：`帮我生成一套 Docker 入门学习网页`。
3. Skill 会先确认学习领域、已有基础、学习目标、篇幅和内容偏好，再生成章节大纲。
4. 确认大纲后，Skill 会输出一个可直接打开的多章节 HTML 学习站点。

生成的站点以 `index.html` 为入口，每章使用独立的 HTML 文件，并共享 `assets/style.css` 与 `assets/app.js`。即使 CDN 无法访问，正文、代码和 Mermaid 源码仍可阅读。

## 关键文件

- [`learning-html/SKILL.md`](learning-html/SKILL.md)：中文技能定义和完整工作流
- [`learning-html-en/SKILL.md`](learning-html-en/SKILL.md)：英文技能定义和完整工作流
- [`learning-html/references/content-guide.md`](learning-html/references/content-guide.md)：章节规划与内容标准
- [`learning-html/references/diagram-guide.md`](learning-html/references/diagram-guide.md)：图表选型、Mermaid 和泳道图规范
- [`learning-html/assets/chapter-template.html`](learning-html/assets/chapter-template.html)：章节页面模板
- [`learning-html/assets/index-template.html`](learning-html/assets/index-template.html)：目录页面模板
- [`learning-html/assets/swimlane-example.html`](learning-html/assets/swimlane-example.html)：可直接预览的泳道图示例
- [`learning-html/scripts/validate-mermaid.mjs`](learning-html/scripts/validate-mermaid.mjs)：Mermaid 语法校验工具

## Mermaid 校验

对生成结果中的 Mermaid 图表执行语法检查：

```bash
node learning-html/scripts/validate-mermaid.mjs <输出目录> \
  --mermaid-root <包含 mermaid 和 jsdom 的 node_modules 目录>
```

英文版脚本的使用方式相同：

```bash
node learning-html-en/scripts/validate-mermaid.mjs <output-directory> \
  --mermaid-root <directory-containing-mermaid-and-jsdom-node_modules>
```

退出码：

- `0`：全部图表通过
- `1`：存在 Mermaid 语法错误
- `2`：参数错误或找不到 Mermaid 依赖，未执行校验

## 维护说明

- 中文版是原始版本，英文版保持相同的相对文件结构和运行时行为。
- 更新任一版本的模板、脚本或规范时，应同步更新另一版本。
- 翻译时不要修改 CSS 类名、DOM ID、`window.CHAPTERS`、`window.CURRENT`、localStorage key、CDN 地址、CLI 参数或 Mermaid 关键字。
- `assets/style.css` 中的 CJK 字体名称属于兼容性回退，不代表英文内容未翻译。
