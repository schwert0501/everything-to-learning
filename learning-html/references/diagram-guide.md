# 图表指南（diagram-guide）

图文并茂是本技能的核心卖点：**每章至少 1-2 张图，图旁必须有文字说明**（aria-label + 图下说明）。本文给出选型规则与全部写法。

## 选型决策表

| 想表达什么 | 用什么 | 写法位置 |
|---|---|---|
| 多角色/多系统协作流程（谁做什么、怎么流转、怎么分工） | **HTML/CSS 泳道图**（首选） | 本文「泳道图」节 |
| 单线流程 / 算法步骤 / 决策分支 | Mermaid `flowchart` | 本文「Mermaid」节 |
| 请求-响应交互时序（自带泳道感） | Mermaid `sequenceDiagram` | 同上 |
| 状态流转（状态机） | Mermaid `stateDiagram-v2` | 同上 |
| 数据模型 / 表关系 | Mermaid `erDiagram` | 同上 |
| 时间计划 / 学习路线规划 | Mermaid `gantt` | 同上 |
| 占比统计 | Mermaid `pie` | 同上 |

判断口诀：**有「分工/协作」就优先泳道图；没有分工就是普通图（Mermaid）。**

## 泳道图（HTML/CSS 原生，首选）

不依赖任何库、离线永远能渲染、样式可定制。**完整可复制的示例在 `assets/swimlane-example.html`，动手前先打开它。** 以下是要点：

### 结构（变体 H：横向泳道，泳道 = 行）

```html
<div class="swimlane" data-variant="h" style="--sw-lanes: 3;" role="img" aria-label="…一句话描述…">
  <div class="sw-head">                          <!-- 表头：第一格是「阶段」，其余是参与者 -->
    <span class="sw-stage">阶段</span>
    <span data-lane="l1">参与者A</span>
    <span data-lane="l2">参与者B</span>
    <span data-lane="l3">参与者C</span>
  </div>
  <div class="sw-row">                           <!-- 每个阶段一行 -->
    <span class="sw-stage">步骤1</span>
    <div class="sw-cell" data-lane="l1"><div class="sw-steps"><span class="sw-step">动作A</span></div></div>
    <div class="sw-cell" data-lane="l2"><div class="sw-steps"><span class="sw-step">动作B</span><span class="sw-arrow">→</span><span class="sw-step">动作C</span></div></div>
    <div class="sw-cell" data-lane="l3"></div>   <!-- 留空 = 该参与者此阶段不参与 -->
  </div>
  <!-- …更多 sw-row … -->
</div>
<p class="sw-note">图 X-X：…图下文字说明…</p>
```

### 规则清单（逐条遵守）

1. `--sw-lanes` 必须等于参与者数量（不含「阶段」列）。
2. 同一参与者全程用**同一个 `data-lane` 值**（l1-l5 五档配色，参与者 >5 时循环使用）。
3. 每个 `.sw-cell` 里至少一个 `.sw-steps`（没有动作就留空单元格）。
4. 同格多步用 `<span class="sw-arrow">→</span>` 连接；需要换行流向时用 `<span class="sw-arrow down">↓</span>`（配 style="display:block" 由 CSS 处理，直接写 down 类即可）。
5. 必须写 `role="img"` 和 `aria-label`；图下必须有 `.sw-note` 文字说明。
6. 泳道图也要有标题（`<h3>图 X-X 标题</h3>`），与正文编号衔接。

### 变体 V：纵向泳道（泳道 = 列，时间自上而下）

结构与变体 H 完全一致，只把 `data-variant="h"` 改为 `"v"`。步骤多、单步内容长时用 V。

### 什么时候不用泳道图

单角色单线流程、纯状态机、请求响应时序——这些用 Mermaid 更简洁。泳道图的价值在「多参与者分工流转」，硬凑反而啰嗦。

## Mermaid（CDN 加载 + 离线降级）

写法：`<div class="mermaid">…mermaid 源码…</div>`。app.js 自动从 CDN 加载渲染；**无网络时自动把内容降级为 `<pre>` 源码文本**（用户仍能读懂图的内容）。

### ⚠️ 语法铁律（写图必读，否则渲染报 Syntax error）

Mermaid 语法错误会导致整张图渲染失败，在 HTML 里是致命的。**生成后必须用 `scripts/validate-mermaid.mjs` 逐个 parse 校验**（见 SKILL.md 阶段 4）。写图时牢记：

1. **所有节点标签、子图标题一律加双引号**：`A["前向: pred = model(x)"]`、`B{"是错误吗?"}`、`subgraph A ["形状 (3,1)"]`。
   - 标签里只要出现 `(`、`)`、`=`、`/`、`:`、`<br/>` 或中文标点，不加引号几乎必报错。
   - 反面教材（会报错）：`subgraph A[形状 (3,1)]`、`B[前向: pred = model(x)]`、`F[统一 .to(device)]`。
2. **边标签用 `-->|"标签"|` 形式**（尤其含空格或特殊字符时）：`A -->|"size mismatch"| B`、`B -->|"RuntimeError"| C`。避免 `A -- size mismatch --> B` 这种裸写法。
3. 别自创语法：sequenceDiagram / stateDiagram-v2 / erDiagram / gantt / pie 严格照下面的可运行示例套用。

### flowchart（单线流程 / 架构）

```html
<div class="mermaid">
flowchart LR
  A["输入"] --> B{"是否合法?"}
  B -->|"是"| C["处理"]
  B -->|"否"| D["报错"]
  C --> E["输出"]
</div>
```

### sequenceDiagram（请求响应时序，自带泳道感）

```html
<div class="mermaid">
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant B as 后端
  U->>F: 点击提交
  F->>B: POST /api/submit
  B-->>F: 200 OK
  F-->>U: 展示成功
</div>
```

### stateDiagram-v2（状态流转）

```html
<div class="mermaid">
stateDiagram-v2
  [*] --> 待支付
  待支付 --> 已支付: 支付成功
  待支付 --> 已取消: 超时
  已支付 --> 已完成
  已完成 --> [*]
</div>
```

### erDiagram（数据模型）

```html
<div class="mermaid">
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  ORDER_ITEM }o--|| PRODUCT : refers
</div>
```

### gantt（时间计划 / 学习路线）

```html
<div class="mermaid">
gantt
  title 学习计划
  dateFormat YYYY-MM-DD
  section 入门
  概览与搭建 :a1, 2024-01-01, 7d
  核心概念   :a2, after a1, 14d
  section 进阶
  原理与实践 :a3, after a2, 14d
</div>
```

### pie（占比统计）

```html
<div class="mermaid">
pie title 使用占比
  "场景A" : 45
  "场景B" : 35
  "场景C" : 20
</div>
```

## 图表通用要求

- 每张图一个编号（图 1-1、图 2-3…），编号按章节内顺序递增，正文中要引用（「如图 1-1 所示」）。
- 图标题用 `<h3>`，图下用 `.sw-note` 写说明（图讲了什么、怎么读、关键点）。
- 一屏装不下的图优先用泳道图分阶段展示，别把 Mermaid 画成巨图。
- 图是给「没看懂正文的人」看的：先看图能否独立理解流程，不能就补说明。
