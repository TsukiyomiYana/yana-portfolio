(() => {
  "use strict";

  const YANA_VER = "20260219-ARROWPATCH-01";
  const ROOT_ID = "yana-carousel-portfolio";
  const DATA_URL = "https://cdn.jsdelivr.net/gh/TsukiyomiYana/yana-portfolio@main/yana-portfolio-data.js";

  // -------- boot --------
  waitForRoot(() => {
    const root = document.getElementById(ROOT_ID);
    if (root) root.dataset.yanaVer = YANA_VER;

    ensureMarkupOrPatchArrows(); // ✅ 即使已存在 .yana-stage 也會 patch 箭頭
    loadScript(DATA_URL, () => {
      const cats = window.YANA_PORTFOLIO_CATS || window.CATS || [];
      if (!Array.isArray(cats) || !cats.length) {
        return showError("No data. Check data file exports window.YANA_PORTFOLIO_CATS.");
      }
      init(cats);
      console.log("[YANA] loaded", YANA_VER);
    });
  });

  function waitForRoot(cb){
    let n = 0;
    const t = setInterval(() => {
      if (document.getElementById(ROOT_ID)) { clearInterval(t); cb(); }
      else if (++n > 120) { clearInterval(t); console.error("[YANA] root not found"); }
    }, 100);
  }

  function loadScript(src, onload){
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = onload;
    s.onerror = () => showError("Failed to load data script. Check DATA_URL.");
    document.head.appendChild(s);
  }

  function svgPrev(){
    return (
      '<svg class="yana-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '</svg>'
    );
  }
  function svgNext(){
    return (
      '<svg class="yana-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '</svg>'
    );
  }

  function ensureMarkupOrPatchArrows(){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    // 如果還沒建立 stage，就建立「含 SVG」的完整 markup
    if (!root.querySelector(".yana-stage")){
      root.classList.add("yana-carousel");
      root.innerHTML =
        '<div class="yana-stage" aria-label="Portfolio viewer">' +
          '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +
          '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">' + svgPrev() + '</button>' +
          '<div class="yana-media" aria-live="polite"></div>' +
          '<button class="yana-nav yana-next" type="button" aria-label="Next item">' + svgNext() + '</button>' +
        '</div>' +
        '<div class="yana-thumbbar" aria-label="Thumbnails">' +
          '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
          '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
          '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
        '</div>';
      return;
    }

    // ✅ 如果已經有 stage（舊版可能有 ‹ ›），也強制 patch 成 SVG
    const p = root.querySelector(".yana-prev");
    const n = root.querySelector(".yana-next");
    if (p && !p.querySelector(".yana-ico")) p.innerHTML = svgPrev();
    if (n && !n.querySelector(".yana-ico")) n.innerHTML = svgNext();
  }

  function showError(msg){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const med = root.querySelector(".yana-media");
    if (!med) return;
    med.textContent = msg;
    console.error("[YANA]", msg);
  }

  // -------- carousel --------
  function init(CATS){
    const root  = document.getElementById(ROOT_ID);
    const tabs  = root.querySelec
