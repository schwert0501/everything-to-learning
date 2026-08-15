/* ============================================================
   learning-html 共享运行时（必须原样复制到输出目录 assets/）
   功能：
   0. 深色/浅色主题切换（默认浅色，记忆用户选择）
   1. 根据 window.CHAPTERS / window.CURRENT 自动生成章节导航（上/下一章）
   2. 从 CDN 加载 Mermaid 渲染 .mermaid 图表；加载失败/超时自动降级为可读源码
   3. 从 CDN 加载 highlight.js 高亮代码；失败时保持纯文本（本身可读）
   4. 学习目标勾选进度：localStorage 持久化，index.html 汇总进度条
   （所有降级均不抛错，保证 file:// 离线打开也能完整阅读）
   ============================================================ */
(function () {
  "use strict";

  var CHAPTERS = window.CHAPTERS || [];
  var CURRENT = window.CURRENT || null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- 0. 深色/浅色主题切换（默认浅色，记忆用户选择） ---------- */
  var THEME_KEY = "learning-html-theme";
  var toggleBtn = $("#theme-toggle");
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (toggleBtn) {
      toggleBtn.textContent = theme === "dark" ? "☀️ 浅色模式" : "🌙 深色模式";
      toggleBtn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
    }
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* 隐私模式忽略 */ }
    // 默认浅色：仅当用户曾明确选择深色时才用深色
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

  /* ---------- 1. 自动章节导航 ---------- */
  if (CURRENT) {
    var idx = -1;
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].file === CURRENT) { idx = i; break; }
    }
    var navEl = $("#chapter-nav");
    if (navEl) {
      var html = '<a class="nav-link" href="index.html">📚 返回目录</a>';
      if (idx > 0) {
        html += '<a class="nav-link" href="' + CHAPTERS[idx - 1].file + '">← ' + CHAPTERS[idx - 1].title + '</a>';
      }
      if (idx >= 0 && idx < CHAPTERS.length - 1) {
        html += '<a class="nav-link" href="' + CHAPTERS[idx + 1].file + '">' + CHAPTERS[idx + 1].title + ' →</a>';
      }
      navEl.innerHTML = html;
    }
  }

  /* ---------- 2. Mermaid（CDN + 优雅降级） ---------- */
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
      pre.textContent = "（图表未加载：当前可能无网络连接，以下为图表源码）\n\n" + (el.textContent || "").trim();
      if (el.parentNode) el.parentNode.replaceChild(pre, el);
    });
  }
  if (mermaidBlocks.length) {
    var mermaidTimer = setTimeout(showMermaidFallback, 5000); // CDN 超时保护
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

  /* ---------- 3. 代码高亮（CDN，失败则保持纯文本） ---------- */
  if ($$("pre code").length) {
    loadScript(
      "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js",
      function () {
        if (window.hljs) {
          $$("pre code").forEach(function (block) {
            try { hljs.highlightElement(block); } catch (e) { /* 忽略单个块失败 */ }
          });
        }
      },
      function () { /* 无网络：纯文本代码块仍可读 */ }
    );
  }

  /* ---------- 4. 学习目标进度（localStorage，file:// 下 Chrome 效果最佳） ---------- */
  var STORE_KEY = "learning-html-progress";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) { /* 隐私模式等场景忽略 */ }
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
      if (text) text.textContent = done + "/" + total + " 已掌握";
    });
  }
  renderIndexProgress();
})();
