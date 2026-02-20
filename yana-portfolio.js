(() => {
  "use strict";

  // =========================================================
  // YANA Portfolio (Carrd Embed)
  // - Auto list assets via jsDelivr Data API (tree)
  // - Fixed category folders (always show)
  // - Tabs are OUTSIDE the portfolio box (no overlay)
  // - Sort: pin (-p00-) first, then NEW FIRST (filename desc)
  // - Image fallback: GitHub Pages -> jsDelivr file CDN
  // =========================================================

  const ROOT_ID = "yana-carousel-portfolio";

  // ===== Assets repo (放圖片的 repo) =====
  const ASSETS = {
    user: "TsukiyomiYana",
    repo: "yana-portfolio-assets",
    version: "main",

    // primary image base
    pagesBase: "https://tsukiyomiyana.github.io/yana-portfolio-assets/",

    // fallback image base (direct file CDN)
    cdnBase: "https://cdn.jsdelivr.net/gh/TsukiyomiYana/yana-portfolio-assets@main/"
  };

  // ===== 固定分類 = 固定資料夾（永遠顯示）=====
  const FOLDER_CATS = [
    { k: "chars",  l: "3D Chars",         dir: "works/chars" },
    { k: "props",  l: "3D Props",         dir: "works/props" },
    { k: "live2d", l: "Live2D",           dir: "works/live2d" },
    { k: "game",   l: "Game Development", dir: "works/game" },
    { k: "sketch", l: "Sketch",           dir: "works/sketch" }
  ];

  // ===== 可手動置頂命名：在檔名裡放 -p00- / -p01- ... =====
  // 數字越小越前；沒放 p 視為 9999，照「新在前」排
  function getPinOrderFromName(path) {
    const name = String(path || "").split("/").pop() || "";
    const m = name.match(/-p(\d{1,3})-/i);
    if (!m) return 9999;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : 9999;
  }

  // -------- boot --------
  waitForRoot(async () => {
    ensureMarkup();
    injectCssPatch();
    normalizeBoxStyles();

    try {
      const cats = await loadCatsFromRepo();
      init(cats);
    } catch (e) {
      showError(e && e.message ? e.message : String(e));
    }
  });

  function waitForRoot(cb) {
    let n = 0;
    const t = setInterval(() => {
      if (document.getElementById(ROOT_ID)) { clearInterval(t); cb(); }
      else if (++n > 120) { clearInterval(t); console.error("[YANA] root not found"); }
    }, 100);
  }

  // ===== Markup: Tabs OUTSIDE the grey portfolio box =====
  function ensureMarkup() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (root.querySelector(".yana-box")) return;

    root.classList.add("yana-carousel");

    // Tabs row (outside box)
    // Box (stage + thumbs) is the portfolio frame
    root.innerHTML =
      '<div class="yana-head-out" aria-label="Portfolio categories">' +
        '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +
      '</div>' +
      '<div class="yana-box">' +
        '<div class="yana-stage" aria-label="Portfolio viewer">' +
          '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">‹</button>' +
          '<div class="yana-media" aria-live="polite"></div>' +
          '<button class="yana-nav yana-next" type="button" aria-label="Next item">›</button>' +
        '</div>' +
        '<div class="yana-thumbbar" aria-label="Thumbnails">' +
          '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
          '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
          '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
        '</div>' +
      '</div>';
  }

  // ===== CSS patch: force tabs to be normal flow above the box =====
  function injectCssPatch() {
    const id = "yana-css-patch-tabs-outside-v2";
    if (document.getElementById(id)) return;

    const css =
      `#${ROOT_ID}{background:transparent !important; box-shadow:none !important; border:0 !important; padding:0 !important;}` +

      `#${ROOT_ID} .yana-head-out{` +
        `display:flex !important; align-items:center !important; gap:10px !important;` +
        `margin:0 0 10px 0 !important;` +
        `position:relative !important; z-index:50 !important;` +
      `}` +

      // make sure tabs never become absolute/overlay
      `#${ROOT_ID} .yana-head-out .yana-tabs{` +
        `position:static !important; inset:auto !important; transform:none !important;` +
        `z-index:50 !important;` +
      `}` +

      // portfolio frame container
      `#${ROOT_ID} .yana-box{position:relative !important;}` +

      // empty state
      `#${ROOT_ID} .yana-empty{padding:24px 16px !important; opacity:0.85 !important; text-align:center !important;}`;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Copy the old root "box" look (bg/padding/radius/shadow) onto .yana-box if needed
  function normalizeBoxStyles() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const box = root.querySelector(".yana-box");
    if (!box) return;

    const cs = getComputedStyle(root);
    const isTransparentBg =
      (cs.backgroundColor === "rgba(0, 0, 0, 0)" || cs.backgroundColor === "transparent") &&
      (cs.backgroundImage === "none");

    // If root had styling (older CSS), preserve it onto box
    // Even if transparent, this won't break anything.
    box.style.backgroundImage = cs.backgroundImage;
    box.style.backgroundColor = isTransparentBg ? "" : cs.backgroundColor;
    box.style.boxShadow = cs.boxShadow;
    box.style.border = cs.border;
    box.style.borderRadius = cs.borderRadius;
    box.style.padding = cs.padding;

    // Root should be clean (tabs sit outside)
    root.style.background = "transparent";
    root.style.boxShadow = "none";
    root.style.border = "0";
    root.style.padding = "0";
  }

  function showError(msg) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const med = root.querySelector(".yana-media");
    if (!med) return;
    med.textContent = msg;
    console.error("[YANA]", msg);
  }

  // ===== Auto-load cats by listing repo files (jsDelivr Data API) =====
  async function loadCatsFromRepo() {
    const api =
      "https://data.jsdelivr.com/v1/packages/gh/" +
      encodeURIComponent(ASSETS.user) + "/" +
      encodeURIComponent(ASSETS.repo) + "@" +
      encodeURIComponent(ASSETS.version) +
      "?structure=tree";

    const res = await fetch(api, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch file list (${res.status})`);

    const data = await res.json();
    const allPaths = flattenJsDelivrFiles((data && data.files) ? data.files : [], "");

    const mediaPaths = allPaths.filter(p => isImagePath(p) || isVideoPath(p));

    // Fixed categories; even empty should exist
    const cats = FOLDER_CATS.map(c => {
      const prefix = c.dir.replace(/\/+$/, "") + "/";

      const items = mediaPaths
        .filter(p => p.startsWith(prefix))
        .sort((a, b) => {
          const pa = getPinOrderFromName(a);
          const pb = getPinOrderFromName(b);
          if (pa !== pb) return pa - pb;

          // NEW FIRST: filename desc (numeric-aware)
          return b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" });
        })
        .map(p => pathToItem(p));

      return { k: c.k, l: c.l, i: items };
    });

    return cats;
  }

  function flattenJsDelivrFiles(files, prefix) {
    const out = [];
    for (const f of files) {
      const name = (f && typeof f.name === "string") ? f.name : "";
      if (!name) continue;

      const path = prefix ? (prefix + name) : name;

      if (Array.isArray(f.files) && f.files.length) {
        out.push(...flattenJsDelivrFiles(f.files, path.replace(/\/+$/, "") + "/"));
      } else {
        out.push(path);
      }
    }
    return out;
  }

  function isImagePath(p) {
    const x = String(p).toLowerCase();
    return x.endsWith(".png") || x.endsWith(".jpg") || x.endsWith(".jpeg") || x.endsWith(".webp");
  }

  function isVideoPath(p) {
    const x = String(p).toLowerCase();
    return x.endsWith(".mp4") || x.endsWith(".webm");
  }

  function joinBase(base, path) {
    return String(base || "").replace(/\/+$/, "/") + String(path || "").replace(/^\/+/, "");
  }

  function pathToItem(path) {
    const clean = String(path || "").replace(/^\/+/, "");

    const urlPrimary = joinBase(ASSETS.pagesBase, clean);
    const urlFallback = joinBase(ASSETS.cdnBase, clean);

    return {
      t: isVideoPath(clean) ? "video_file" : "image",
      s: urlPrimary,      // primary
      s2: urlFallback,    // fallback
      th: isVideoPath(clean) ? "" : urlPrimary,
      th2: isVideoPath(clean) ? "" : urlFallback,
      ti: "",
      d: "",
      links: []
    };
  }

  // -------- carousel --------
  function init(CATS) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const tabs  = root.querySelector(".yana-tabs");
    const med   = root.querySelector(".yana-media");
    const prev  = root.querySelector(".yana-prev");
    const next  = root.querySelector(".yana-next");
    const ths   = root.querySelector(".yana-thumbs");
    const lbtn  = root.querySelector(".yana-page-prev");
    const rbtn  = root.querySelector(".yana-page-next");

    let ci = 0; // category index
    let ii = 0; // item index

    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step( 1));
    lbtn.addEventListener("click", () => ths.scrollBy({ left: -ths.clientWidth * 0.8, behavior: "smooth" }));
    rbtn.addEventListener("click", () => ths.scrollBy({ left:  ths.clientWidth * 0.8, behavior: "smooth" }));

    renderTabs();
    renderAll();

    function curCat(){ return CATS[ci] || null; }
    function curItems(){ const c = curCat(); return (c && Array.isArray(c.i)) ? c.i : []; }

    function step(d){
      const items = curItems();
      if (items.length <= 1) return;
      ii = (ii + d + items.length) % items.length;
      renderMedia();
      updateThumbSelected();
    }

    function renderTabs(){
      tabs.innerHTML = "";
      CATS.forEach((c, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "yana-tab";
        b.setAttribute("role","tab");
        b.setAttribute("aria-selected", idx === ci ? "true" : "false");
        b.textContent = String(c.l || c.k || "").toUpperCase();

        b.addEventListener("click", () => {
          if (idx === ci) return;
          ci = idx; ii = 0;
          updateTabSelected();
          renderAll();
        });

        tabs.appendChild(b);
      });
    }

    function updateTabSelected(){
      const btns = tabs.querySelectorAll(".yana-tab");
      btns.forEach((b, idx) => b.setAttribute("aria-selected", idx === ci ? "true" : "false"));
    }

    function renderAll(){
      renderMedia();
      renderThumbs();
      updateNav();
    }

    function updateNav(){
      const items = curItems();
      const dis = items.length <= 1;
      prev.disabled = dis;
      next.disabled = dis;
    }

    function stopMedia(){
      const ifs = med.querySelectorAll("iframe");
      ifs.forEach(f => { try { f.src = "about:blank"; } catch(e){} });

      const vids = med.querySelectorAll("video");
      vids.forEach(v => { try { v.pause(); v.removeAttribute("src"); v.load(); } catch(e){} });

      med.innerHTML = "";
    }

    function renderEmpty(){
      stopMedia();
      med.innerHTML = '<div class="yana-empty">No items</div>';
      ths.innerHTML = "";
      prev.disabled = true;
      next.disabled = true;
    }

    function setImgWithFallback(img, primary, fallback){
      img.src = primary || "";
      img.onerror = () => {
        if (!fallback) return;
        if (img.dataset._fallbackApplied === "1") return;
        img.dataset._fallbackApplied = "1";
        img.src = fallback;
      };
    }

    function renderMedia(){
      const items = curItems();
      if (!items.length) return renderEmpty();

      stopMedia();
      const it = items[ii];
      if (!it) return renderEmpty();

      const frame = document.createElement("div");
      frame.className = "yana-frame";

      if (it.t === "image"){
        const im = document.createElement("img");
        im.alt = it.ti || "";
        im.loading = "lazy";
        setImgWithFallback(im, it.s || "", it.s2 || "");
        frame.appendChild(im);
      } else if (it.t === "video_file") {
        const v = document.createElement("video");
        v.controls = true;
        v.playsInline = true;
        v.preload = "metadata";
        v.src = it.s || it.s2 || "";
        frame.appendChild(v);
      } else {
        const f = document.createElement("iframe");
        f.src = it.s || "";
        f.title = it.ti || "video";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true;
        frame.appendChild(f);
      }

      med.appendChild(frame);

      const hasDesc  = !!(it.d && String(it.d).trim());
      const hasLinks = Array.isArray(it.links) && it.links.length;

      if (it.ti || hasDesc || hasLinks){
        const meta = document.createElement("div");
        meta.className = "yana-meta";

        if (it.ti){
          const t = document.createElement("div");
          t.className = "t";
          t.textContent = it.ti;
          meta.appendChild(t);
        }

        if (hasDesc){
          const d = document.createElement("div");
          d.className = "d";
          d.textContent = it.d;
          meta.appendChild(d);
        }

        if (hasLinks){
          const links = document.createElement("div");
          links.className = "yana-links";
          it.links.forEach(L => {
            const a = document.createElement("a");
            a.href = L.url || "#";
            a.textContent = String(L.label || "Link").toUpperCase();
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            links.appendChild(a);
          });
          meta.appendChild(links);
        }

        med.appendChild(meta);
      }

      updateNav();
    }

    function renderThumbs(){
      const items = curItems();
      ths.innerHTML = "";
      if (!items.length) return;

      items.forEach((it, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "yana-thumb";
        b.setAttribute("role","tab");
        b.setAttribute("aria-selected", idx === ii ? "true" : "false");
        b.title = it.ti || "";

        const src1 = it.th || (it.t === "image" ? it.s : "");
        const src2 = it.th2 || (it.t === "image" ? it.s2 : "");

        if (src1){
          const im = document.createElement("img");
          im.alt = it.ti || "";
          im.loading = "lazy";
          im.draggable = false;
          setImgWithFallback(im, src1, src2);
          b.appendChild(im);
        } else {
          const d = document.createElement("div");
          d.className = "tcard";
          d.textContent = String(it.ti || "Item").slice(0, 24);
          b.appendChild(d);
        }

        b.addEventListener("click", () => {
          if (idx === ii) return;
          ii = idx;
          renderMedia();
          updateThumbSelected();
          b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });

        ths.appendChild(b);
      });
    }

    function updateThumbSelected(){
      const btns = ths.querySelectorAll(".yana-thumb");
      btns.forEach((b, idx) => b.setAttribute("aria-selected", idx === ii ? "true" : "false"));
    }
  }

})();
