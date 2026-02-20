(() => {
  "use strict";

  // =========================================================
  //  YANA Portfolio (Carrd Embed)
  //  - Auto list assets via jsDelivr Data API (tree)
  //  - Fixed category folders
  //  - Tabs are OUTSIDE the image frame (no overlay)
  //  - Sort: pin (-p00-) first, then NEW FIRST (filename desc)
  //  - Empty categories still show with "No items"
  // =========================================================

  const ROOT_ID = "yana-carousel-portfolio";

  // ===== Assets repo (放圖片的 repo) =====
  const ASSETS = {
    user: "TsukiyomiYana",
    repo: "yana-portfolio-assets",
    version: "main",
    pagesBase: "https://tsukiyomiyana.github.io/yana-portfolio-assets/"
  };

  // ===== 固定分類 = 固定資料夾 =====
  const FOLDER_CATS = [
    { k: "chars",  l: "3D Chars",         dir: "works/chars" },
    { k: "props",  l: "3D Props",         dir: "works/props" },
    { k: "live2d", l: "Live2D",           dir: "works/live2d" },
    { k: "game",   l: "Game Development", dir: "works/game" },
    { k: "sketch", l: "Sketch",           dir: "works/sketch" }
  ];

  // ===== 可手動置頂命名：在檔名裡放 -p00- / -p01- ... =====
  // 數字越小越前。沒放 p 就視為 9999，照「新在前」排。
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

  // ===== 重要：這裡把 Tabs 放到「作品框外」(head) =====
  function ensureMarkup() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (root.querySelector(".yana-stage")) return;

    root.classList.add("yana-carousel");
    root.innerHTML =
      // Tabs/header row (outside frame)
      '<div class="yana-head" aria-label="Portfolio categories">' +
        '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +
      '</div>' +

      // Stage/frame row (image/video only)
      '<div class="yana-stage" aria-label="Portfolio viewer">' +
        '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">‹</button>' +
        '<div class="yana-media" aria-live="polite"></div>' +
        '<button class="yana-nav yana-next" type="button" aria-label="Next item">›</button>' +
      '</div>' +

      // Thumbs row
      '<div class="yana-thumbbar" aria-label="Thumbnails">' +
        '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
        '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
        '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
      '</div>';
  }

  // ===== 如果你原本 CSS 把 tabs 設成 absolute 疊在圖上，這裡強制改回正常流 =====
  function injectCssPatch() {
    const id = "yana-css-patch-tabs-outside";
    if (document.getElementById(id)) return;

    const css =
      `#${ROOT_ID} .yana-head{` +
        `display:flex !important;` +
        `align-items:center !important;` +
        `gap:10px !important;` +
        `margin:0 0 10px 0 !important;` +
        `position:relative !important;` +
        `z-index:1 !important;` +
      `}` +
      `#${ROOT_ID} .yana-tabs{` +
        `position:static !important;` +
        `inset:auto !important;` +
        `top:auto !important; left:auto !important; right:auto !important; bottom:auto !important;` +
        `transform:none !important;` +
        `z-index:1 !important;` +
      `}` +
      // 避免任何 padding/top 讓圖被擠怪
      `#${ROOT_ID} .yana-stage{` +
        `padding-top:0 !important;` +
      `}` +
      // Empty state
      `#${ROOT_ID} .yana-empty{` +
        `padding:24px 16px !important;` +
        `opacity:0.8 !important;` +
        `text-align:center !important;` +
      `}`;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
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

    // only media files
    const mediaPaths = allPaths.filter(p => isImagePath(p) || isVideoPath(p));

    // 產生固定 5 類（就算空也要）
    const cats = FOLDER_CATS.map(c => {
      const prefix = c.dir.replace(/\/+$/, "") + "/";

      const items = mediaPaths
        .filter(p => p.startsWith(prefix))
        .sort((a, b) => {
          // 1) pin order
          const pa = getPinOrderFromName(a);
          const pb = getPinOrderFromName(b);
          if (pa !== pb) return pa - pb;

          // 2) NEW FIRST: filename desc
          // numeric:true 讓 -s10- > -s2- 這種排序更直覺
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

  function pathToItem(path) {
    const clean = String(path || "").replace(/^\/+/, "");
    const url = ASSETS.pagesBase.replace(/\/+$/, "/") + clean;

    return {
      t: isVideoPath(clean) ? "video_file" : "image",
      s: url,
      th: isVideoPath(clean) ? "" : url,
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
        im.src = it.s || "";
        im.alt = it.ti || "";
        im.loading = "lazy";
        frame.appendChild(im);
      } else if (it.t === "video_file") {
        const v = document.createElement("video");
        v.src = it.s || "";
        v.controls = true;
        v.playsInline = true;
        v.preload = "metadata";
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

        const src = it.th || (it.t === "image" ? it.s : "");
        if (src){
          const im = document.createElement("img");
          im.src = src;
          im.alt = it.ti || "";
          im.loading = "lazy";
          im.draggable = false;
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
