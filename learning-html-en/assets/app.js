/* ============================================================
   learning-html shared runtime (copy verbatim into the output dir assets/)
   Features:
   0. Dark/light theme toggle (light by default; remembers the user's choice)
   1. Auto-generates chapter navigation (prev/next) from window.CHAPTERS / window.CURRENT
   2. Loads Mermaid from CDN to render .mermaid diagrams; falls back to
      readable source when loading fails or times out
   3. Loads highlight.js from CDN for syntax highlighting; keeps plain text
      on failure (still readable as-is)
   4. Learning-objective checkboxes persisted to localStorage; index.html
      shows the aggregated progress bar
   (No fallback ever throws, so the site stays fully readable offline via file://)
   ============================================================ */
(function () {
  "use strict";

  var CHAPTERS = window.CHAPTERS || [];
  var CURRENT = window.CURRENT || null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- 0. Dark/light theme toggle (light by default; remembers choice) ---------- */
  var THEME_KEY = "learning-html-theme";
  var toggleBtn = $("#theme-toggle");
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (toggleBtn) {
      toggleBtn.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
      toggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignored in private mode */ }
    // Light is the default: only use dark when the user explicitly chose it
    applyTheme(saved === "dark" ? "dark" : "light");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        var next = cur === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }
  })();

  /* ---------- 1. Auto-generated chapter navigation ---------- */
  if (CURRENT) {
    var idx = -1;
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].file === CURRENT) { idx = i; break; }
    }
    var navEl = $("#chapter-nav");
    if (navEl) {
      var html = '<a class="nav-link" href="index.html">📚 Back to index</a>';
      if (idx > 0) {
        html += '<a class="nav-link" href="' + CHAPTERS[idx - 1].file + '">← ' + CHAPTERS[idx - 1].title + '</a>';
      }
      if (idx >= 0 && idx < CHAPTERS.length - 1) {
        html += '<a class="nav-link" href="' + CHAPTERS[idx + 1].file + '">' + CHAPTERS[idx + 1].title + ' →</a>';
      }
      navEl.innerHTML = html;
    }
  }

  /* ---------- 2. Mermaid (CDN + graceful degradation) ---------- */
  function loadScript(src, onok, onfail) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = onok;
    s.onerror = onfail;
    document.head.appendChild(s);
  }

  var mermaidBlocks = $$(".mermaid");
  var fallbackShown = false;
  function showMermaidFallback() {
    if (fallbackShown) return;
    fallbackShown = true;
    $$(".mermaid").forEach(function (el) {
      var pre = document.createElement("pre");
      pre.className = "diagram-fallback";
      pre.textContent = "(Diagram not loaded: you may be offline. Source below.)\n\n" + (el.textContent || "").trim();
      if (el.parentNode) el.parentNode.replaceChild(pre, el);
    });
  }
  if (mermaidBlocks.length) {
    var mermaidTimer = setTimeout(showMermaidFallback, 5000); // CDN timeout guard
    loadScript(
      "https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.min.js",
      function () {
        clearTimeout(mermaidTimer);
        if (window.mermaid) {
          try {
            mermaid.initialize({
              startOnLoad: false,
              theme: "default",
              securityLevel: "loose",
              flowchart: { useMaxWidth: true, curve: "basis" },
              sequence: { useMaxWidth: true, mirrorActors: false }
            });
            mermaid.run({ nodes: mermaidBlocks });
          } catch (e) { showMermaidFallback(); }
        } else { showMermaidFallback(); }
      },
      showMermaidFallback
    );
  }

  /* ---------- 3. Syntax highlighting (CDN; plain text on failure) ---------- */
  if ($$("pre code").length) {
    loadScript(
      "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js",
      function () {
        if (window.hljs) {
          $$("pre code").forEach(function (block) {
            try { hljs.highlightElement(block); } catch (e) { /* ignore failures on single blocks */ }
          });
        }
      },
      function () { /* offline: plain-text code blocks remain readable */ }
    );
  }

  /* ---------- 4. Learning-objective progress (localStorage; works best under file:// in Chrome) ---------- */
  var STORE_KEY = "learning-html-progress";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) { /* ignored, e.g. private mode */ }
  }

  var progress = loadProgress();
  $$(".obj-check").forEach(function (cb, n) {
    var key = cb.getAttribute("data-key") || (CURRENT ? CURRENT + "::" + (n + 1) : null);
    if (!key) return;
    cb.setAttribute("data-key", key);
    if (progress[key]) {
      cb.checked = true;
      var li = cb.closest("li");
      if (li) li.classList.add("done");
    }
    cb.addEventListener("change", function () {
      if (cb.checked) { progress[key] = true; } else { delete progress[key]; }
      saveProgress(progress);
      var li = cb.closest("li");
      if (li) li.classList.toggle("done", cb.checked);
      renderIndexProgress();
    });
  });

  function renderIndexProgress() {
    $$("[data-progress-chapter]").forEach(function (item) {
      var file = item.getAttribute("data-progress-chapter");
      var total = parseInt(item.getAttribute("data-total") || "0", 10);
      var done = 0;
      for (var k in progress) {
        if (progress[k] && k.indexOf(file + "::") === 0) done++;
      }
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;
      var fill = item.querySelector(".bar-fill");
      var text = item.querySelector(".bar-text");
      if (fill) fill.style.width = pct + "%";
      if (text) text.textContent = done + "/" + total + " mastered";
    });
  }
  renderIndexProgress();
})();
