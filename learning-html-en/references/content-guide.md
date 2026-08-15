# Content Guide (content-guide)

This document defines: how to plan the chapter outline, what goes into each chapter, and how to write so that the result achieves "breadth and depth".

## I. Progressive chapter planning (8-12 chapters)

A fixed cognitive ladder — order does not change, topics can be fine-tuned:

| Position | Topic | Core task of each chapter |
|---|---|---|
| 01 | Domain overview and value | Panorama + why learn it + what you can do + terminology primer + learning path |
| 02 | Environment setup + first example | "Get it running" within 5 minutes, build confidence |
| 03-05 | Core concepts from easy to deep | Each chapter focuses on 1-2 big concepts, explained until thorough |
| 06-08 | Advanced principles and best practices | Underlying mechanisms, patterns, performance/security/engineering |
| 09-10 | Comprehensive hands-on | One continuous case, built up step by step from scratch |
| 11 | Common problems and troubleshooting | High-frequency pitfalls + debugging methods |
| 12 | Summary and further learning path | Knowledge map + self-test + subsequent path |

### Adjust by user's background

- **Completely zero experience**: thicken 01-02 (backstory, everyday analogies, why you need it), slow down 03-05.
- **Has neighboring experience**: compress 01-02 (skim quickly), invest the space in 06-08 and 09-10.
- **Senior/improvement-oriented**: start at 03, make 06-08 the main body (trade-offs, comparisons, principles); talk less about "what it is" and more about "why / how to choose".

### Chapter metadata (required for every chapter)

- Title: make it specific ("04 Docker Images and Containers: Core Abstractions"), not "Chapter 4".
- Learning objectives: 3-6 items, starting with verbs (can explain / can build / can troubleshoot...), self-checkable after reading.
- Connections: open with one sentence reviewing the previous chapter, close with one sentence previewing the next.

## II. Per-chapter content composition (structural blocks may only be added, never removed)

1. Learning objectives (checkable)
2. Body sections (h2/h3 levels, numbered 1.1 / 1.2...)
3. Figures ≥ 1-2 (swimlane diagrams preferred, Mermaid as supplement), each figure with a number + explanation
4. Code examples (with comments + expected output)
5. Terminology cards (3-8 terms)
6. Self-test questions (3-6, answers collapsed in `<details>`)
7. Chapter summary (3-5 bullets, echoing the learning objectives)
8. Further reading (1-3 items, give the name + a one-sentence reason)
9. Previous-chapter review / next-chapter preview

## III. Writing style (the key to breadth and depth)

- **Length targets** (based on the mode the user chose):
  - Concise: 2000-3000 Chinese characters per chapter, full set ≥ 16,000 characters
  - Standard (default): 4000-8000 Chinese characters per chapter, full set ≥ 40,000 characters
  - In-depth: 8000+ Chinese characters per chapter
- **Write more rather than be hollow**: each concept should pair with at least 2-3 items from the four-piece set of "one-sentence definition + everyday analogy + in-domain example + code/figure". A chapter with only headings and no explanations is unqualified.
- **Terminology management**: bold at first occurrence; obscure terms go into terminology cards and are explained in plain language, not copied from official docs.
- **Example density**: at least 2-3 concrete examples per chapter. For abstract concepts, first use an everyday analogy (delivery/restaurant/bank...), then land on an in-domain example.
- **Breadth**: for each concept covered, mention "its relationship to adjacent concepts" (comparison tables and trade-off tables work well).
- **Depth**: advanced chapters should explain "why it was designed this way", "what happens if you don't do this", and "how the industry weighs the trade-offs".
- **Language**: all Chinese, colloquial but accurate; code comments in Chinese; avoid machine-translation tone.

## IV. Self-test question rules

- 3-6 per chapter, increasing difficulty: restate the concept → explain the principle → apply to a scenario → open-ended thinking.
- Answers must be provided (`<details><summary>question</summary><div class="a">answer</div></details>`), and the answer must explain why, not just give the conclusion.
- Questions should be specific, not one-line "What is XX?" style.

## V. Hands-on chapters (09-10) rules

- Use one **continuous case** (e.g., "build an XX app from scratch"), completed step by step over the two chapters: break down requirements → design → code → run → verify.
- For each step, give complete runnable code + expected output + common errors.
- Strong inter-chapter connection: chapter 9 ends at "the next step is to do X", chapter 10 picks up from there.

## VI. Trade-off order when space is insufficient (what not to sacrifice)

1. Can cut: number of further-reading items, secondary sections.
2. Can compress: code comments (but keep them), number of analogies.
3. **Cannot cut**: learning objectives, figures, terminology cards, self-test questions, summaries, chapter connections — these are the skeleton of "continuity" and "rich illustration".
