(() => {
  "use strict";

  const ROOT_ID = "yana-carousel-portfolio";

  const ASSETS = {
    user: "TsukiyomiYana",
    repo: "yana-portfolio-assets",
    version: "main",
    pagesBase: "https://tsukiyomiyana.github.io/yana-portfolio-assets/"
  };

  const FOLDER_CATS = [
    { k: "chars",  l: "3D Chars",         dir: "works/chars" },
    { k: "props",  l: "3D Props",         dir: "works/props" },
    { k: "live2d", l: "Live2D",           dir: "works/live2d" },
    { k: "game",   l: "Game Development", dir: "works/game" },
    { k: "sketch", l: "Sketch",           dir: "works/sketch" }
  ];

  const EMPTY_TEXT = "No items";

  // -------- boot --------
  waitForRoot(async () => {
    ensureMarkup();
    injectHardLayoutOverrides();

    try {
      const cats = await loadCatsFromRepo();
      init(cats);
    } catch (e) {
      showError(e && e.message ? e.message : String(e));
    }
  });

  function waitForRoot(cb){
    let n = 0;
    const t = setInterval(() => {
      if (document.getElementById(ROOT_ID)) { clearInterval(t); cb(); }
      else if (++n > 120) { clearInterval(t); console.error("[YANA] root not found"); }
    }, 100);
  }

  // ✅ 這個結構保證 tabs 在「作品上方一列」，不會疊在圖片上
  function ensureMarkup(){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    // 已經是新結構就不重建（避免重複綁事件）
    if (root.querySelector(".yana-head") && root.querySelector(".yana-body")) return;

    root.classList.add("yana-carousel");
    root.innerHTML =
      '<div class="yana-stage" aria-label="Portfolio viewer">' +
        '<div class="yana-head" aria-label="Category header">' +
          '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +
        '</div>' +
        '<div class="yana-body">' +
          '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">‹</button>' +
          '<div class="yana-media" aria-live="polite"></div>' +
          '<button class="yana-nav yana-next" type="button" aria-label="Next item">›</button>' +
        '</div>' +
      '</div>' +
      '<div class="yana-thumbbar" aria-label="Thumbnails">' +
        '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
        '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
        '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
      '</div>';
  }

  // ✅ 強制把 tabs 從 overlay 模式拉回「正常排版流」
  function injectHardLayoutOverrides(){
    const id = "yana-hard-layout-v1";
    if (document.getElementById(id)) return;

    const css = `
/* 讓 stage 變成上下兩列：head( tabs ) + body( media ) */
#${ROOT_ID}.yana-carousel .yana-stage{
  display:flex !important;
  flex-direction:column !important;
}

/* tabs 標題列：一定是正常 flow，不准 absolute */
#${ROOT_ID}.yana-carousel .yana-head{
  position:relative !important;
  display:block !important;
  padding: 12px 12px 8px 12px !important;
  z-index: 5 !important;
}
#${ROOT_ID}.yana-carousel .yana-tabs{
  position:static !important;      /* <- 最關鍵：打掉 absolute 疊圖 */
  inset:auto !important;
  display:flex !important;
  flex-wrap:wrap !important;
  gap: 10px !important;
  align-items:center !important;
  justify-content:flex-start !important;
}

/* body 用 grid 排版：左箭頭 / 作品 / 右箭頭 */
#${ROOT_ID}.yana-carousel .yana-body{
  display:grid !important;
  grid-template-columns: 56px 1fr 56px !important;
  align-items:center !important;
  gap: 0 !important;
  padding: 0 12px 12px 12px !important;
}
#${ROOT_ID}.yana-carousel .yana-media{
  min-height:0 !important;
}
`;
    const st = document.createElement("style");
    st.id = id;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showError(msg){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const med = root.querySelector(".yana-media");
    if (!med) return;
    med.textContent = msg;
    console.error("[YANA]", msg);
  }

  // ===== Auto-load cats by listing repo files (jsDelivr Data API) =====
  async function loadCatsFromRepo(){
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

    // ✅ tabs 永遠顯示：不 filter 空分類
    return FOLDER_CATS.map(c => {
      const prefix = c.dir.replace(/\/+$/,"") + "/";
      const items = mediaPaths
        .filter(p => p.startsWith(prefix))
        .sort((a,b) => b.localeCompare(a)) // ✅ 新在前（檔名倒序）
        .map(p => pathToItem(p));
      return { k: c.k, l: c.l, i: items };
    });
  }

  function flattenJsDelivrFiles(files, prefix){
    const out = [];
    for (const f of files) {
      const name = (f && typeof f.name === "string") ? f.name : "";
      if (!name) continue;

      const p = prefix ? (prefix + name) : name;

      if (Array.isArray(f.files) && f.files.length) {
        out.push(...flattenJsDelivrFiles(f.files, p.replace(/\/+$/,"") + "/"));
      } else {
        out.push(p);
      }
    }
    return out;
  }

  function isImagePath(p){
    const x = String(p).toLowerCase();
    return x.endsWith(".png") || x.endsWith(".jpg") || x.endsWith(".jpeg") || x.endsWith(".webp");
  }
  function isVideoPath(p){
    const x = String(p).toLowerCase();
    return x.endsWith(".mp4") || x.endsWith(".webm");
  }

  function pathToItem(path){
    const clean = String(path || "").replace(/^\/+/, "");
    const url = ASSETS.pagesBase.replace(/\/+$/,"/") + clean;

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
  function init(CATS){
    const root  = document.getElementById(ROOT_ID);
    const tabs  = root.querySelector(".yana-tabs");
    const med   = root.querySelector(".yana-media");
    const prev  = root.querySelector(".yana-prev");
    const next  = root.querySelector(".yana-next");
    const ths   = root.querySelector(".yana-thumbs");
    const lbtn  = root.querySelector(".yana-page-prev");
    const rbtn  = root.querySelector(".yana-page-next");

    let ci = 0;
    let ii = 0;

    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step( 1));
    lbtn.addEventListener("click", () => ths.scrollBy({ left: -ths.clientWidth * 0.8, behavior:"smooth" }));
    rbtn.addEventListener("click", () => ths.scrollBy({ left:  ths.clientWidth * 0.8, behavior:"smooth" }));

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

    function renderMedia(){
      const items = curItems();
      stopMedia();

      if (!items.length){
        const empty = document.createElement("div");
        empty.className = "yana-empty";
        empty.textContent = EMPTY_TEXT;
        med.appendChild(empty);
        updateNav();
        return;
      }

      const it = items[ii];
      if (!it) return;

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

        const src = it.th || (it.t === "image" ? it.s : "");
        if (src){
          const im = document.createElement("img");
          im.src = src;
          im.loading = "lazy";
          im.draggable = false;
          b.appendChild(im);
        } else {
          const d = document.createElement("div");
          d.className = "tcard";
          d.textContent = "Item";
          b.appendChild(d);
        }

        b.addEventListener("click", () => {
          if (idx === ii) return;
          ii = idx;
          renderMedia();
          updateThumbSelected();
          b.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
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
