# Diagram Guide (diagram-guide)

Rich illustration is the core selling point of this skill: **at least 1-2 figures per chapter, and every figure must have textual explanation** (aria-label + a note below the figure). This document gives the selection rules and all writing patterns.

## Selection decision table

| What you want to express | What to use | Where to find the pattern |
|---|---|---|
| Multi-role/multi-system collaboration flows (who does what, how it flows, how work is divided) | **HTML/CSS swimlane diagram** (preferred) | The "Swimlane Diagram" section of this document |
| Single-line flow / algorithm steps / decision branches | Mermaid `flowchart` | The "Mermaid" section of this document |
| Request-response interaction sequences (has built-in swimlane feel) | Mermaid `sequenceDiagram` | Same as above |
| State transitions (state machine) | Mermaid `stateDiagram-v2` | Same as above |
| Data models / table relationships | Mermaid `erDiagram` | Same as above |
| Timeline plans / learning path planning | Mermaid `gantt` | Same as above |
| Share statistics | Mermaid `pie` | Same as above |

Rule of thumb: **whenever there is "division of labor/collaboration", prefer a swimlane diagram; without division of labor, it's an ordinary diagram (Mermaid).**

## Swimlane diagram (native HTML/CSS, preferred)

No library dependencies, always renders offline, and styles are customizable. **A complete copyable example is in `assets/swimlane-example.html` — open it before you start.** The key points follow:

### Structure (variant H: horizontal lanes, lane = row)

```html
<div class="swimlane" data-variant="h" style="--sw-lanes: 3;" role="img" aria-label="...one-sentence description...">
  <div class="sw-head">                          <!-- header: first cell is "Stage", the rest are participants -->
    <span class="sw-stage">Stage</span>
    <span data-lane="l1">Participant A</span>
    <span data-lane="l2">Participant B</span>
    <span data-lane="l3">Participant C</span>
  </div>
  <div class="sw-row">                           <!-- one row per stage -->
    <span class="sw-stage">Step 1</span>
    <div class="sw-cell" data-lane="l1"><div class="sw-steps"><span class="sw-step">Action A</span></div></div>
    <div class="sw-cell" data-lane="l2"><div class="sw-steps"><span class="sw-step">Action B</span><span class="sw-arrow">→</span><span class="sw-step">Action C</span></div></div>
    <div class="sw-cell" data-lane="l3"></div>   <!-- leaving empty = this participant is not involved at this stage -->
  </div>
  <!-- ...more sw-row ... -->
</div>
<p class="sw-note">Figure X-X: ...note below the figure...</p>
```

### Rules checklist (follow each one)

1. `--sw-lanes` must equal the number of participants (excluding the "Stage" column).
2. The same participant must use the **same `data-lane` value** throughout (l1-l5 five-level color palette; loop when participants > 5).
3. Every `.sw-cell` contains at least one `.sw-steps` (leave the cell empty if there's no action).
4. Chain multiple steps in the same cell with `<span class="sw-arrow">→</span>`; when the flow needs to wrap to a new line, use `<span class="sw-arrow down">↓</span>` (combined with style="display:block", handled by CSS; just write the down class).
5. `role="img"` and `aria-label` are required; there must be a `.sw-note` textual explanation below the figure.
6. Swimlane diagrams also need a title (`<h3>Figure X-X Title</h3>`), numbered in sequence with the body text.

### Variant V: vertical lanes (lane = column, time top to bottom)

Structure is identical to variant H; only change `data-variant="h"` to `"v"`. Use V when there are many steps or individual steps have long content.

### When not to use a swimlane diagram

Single-role single-line flows, pure state machines, and request-response sequences — these are cleaner with Mermaid. The value of a swimlane diagram is in "multi-participant division of labor and flow"; shoehorning it is just verbose.

## Mermaid (CDN-loaded + offline fallback)

Syntax: `<div class="mermaid">...mermaid source...</div>`. app.js automatically loads and renders it from a CDN; **when there's no network, it automatically degrades the content to a `<pre>` source text** (the user can still understand the diagram content).

### ⚠️ Syntax iron rules (must read before writing diagrams, otherwise rendering reports Syntax error)

A Mermaid syntax error causes the entire diagram to fail to render, which is fatal in HTML. **After generating, you must run `scripts/validate-mermaid.mjs` to parse and validate each diagram** (see Stage 4 of SKILL.md). Keep these in mind when writing diagrams:

1. **Always wrap all node labels and subgraph titles in double quotes**: `A["forward: pred = model(x)"]`, `B{"is it an error?"}`, `subgraph A ["shape (3,1)"]`.
   - As long as a label contains `(`, `)`, `=`, `/`, `:`, `<br/>`, or Chinese punctuation, not quoting it will almost certainly cause an error.
   - Counter-examples (will error): `subgraph A[shape (3,1)]`, `B[forward: pred = model(x)]`, `F[uniform .to(device)]`.
2. **Edge labels use the `-->|"label"|` form** (especially when containing spaces or special characters): `A -->|"size mismatch"| B`, `B -->|"RuntimeError"| C`. Avoid the bare `A -- size mismatch --> B` style.
3. Don't invent syntax: sequenceDiagram / stateDiagram-v2 / erDiagram / gantt / pie strictly follow the runnable examples below.

### flowchart (single-line flows / architecture)

```html
<div class="mermaid">
flowchart LR
  A["input"] --> B{"is it valid?"}
  B -->|"yes"| C["process"]
  B -->|"no"| D["error"]
  C --> E["output"]
</div>
```

### sequenceDiagram (request-response sequences, has built-in swimlane feel)

```html
<div class="mermaid">
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend
  U->>F: Click submit
  F->>B: POST /api/submit
  B-->>F: 200 OK
  F-->>U: Show success
</div>
```

### stateDiagram-v2 (state transitions)

```html
<div class="mermaid">
stateDiagram-v2
  [*] --> Pending
  Pending --> Paid: Payment success
  Pending --> Cancelled: Timeout
  Paid --> Completed
  Completed --> [*]
</div>
```

### erDiagram (data models)

```html
<div class="mermaid">
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  ORDER_ITEM }o--|| PRODUCT : refers
</div>
```

### gantt (timeline plans / learning paths)

```html
<div class="mermaid">
gantt
  title Learning Plan
  dateFormat YYYY-MM-DD
  section Basics
  Overview and Setup :a1, 2024-01-01, 7d
  Core Concepts   :a2, after a1, 14d
  section Advanced
  Principles and Practice :a3, after a2, 14d
</div>
```

### pie (share statistics)

```html
<div class="mermaid">
pie title Usage Share
  "Scenario A" : 45
  "Scenario B" : 35
  "Scenario C" : 20
</div>
```

## General requirements for all figures

- Every figure has a number (Figure 1-1, Figure 2-3...), incremented sequentially within the chapter, and must be referenced in the body text ("as shown in Figure 1-1").
- Figure titles use `<h3>`; below the figure use `.sw-note` for the explanation (what the figure shows, how to read it, key points).
- For figures that can't fit on one screen, prefer swimlane diagrams to present them stage by stage; don't draw Mermaid diagrams as giant figures.
- Figures are for "people who didn't understand the body text": first check whether the figure can convey the flow on its own; if not, add explanation.
