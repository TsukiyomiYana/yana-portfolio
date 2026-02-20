(() => {
  "use strict";

  const ROOT_ID = "yana-carousel-portfolio";
  const DATA_URL = "https://cdn.jsdelivr.net/gh/TsukiyomiYana/yana-portfolio@main/yana-portfolio-data.js";

  // -------- boot --------
  waitForRoot(() => {
    ensureMarkup();
    loadScript(DATA_URL, () => {
      const cats = window.YANA_PORTFOLIO_CATS || window.CATS || [];
      if (!Array.isArray(cats) || !cats.length) return showError("No data. Check data file exports window.YANA_PORTFOLIO_CATS.");

      init(cats);
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

  function ensureMarkup(){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (root.querySelector(".yana-stage")) return;

    root.classList.add("yana-carousel");
    root.innerHTML =
      '<div class="yana-stage" aria-label="Portfolio viewer">' +
        '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +
        '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">◄</button>' +
        '<div class="yana-media" aria-live="polite"></div>' +
        '<button class="yana-nav yana-next" type="button" aria-label="Next item">►</button>' +
      '</div>' +
      '<div class="yana-thumbbar" aria-label="Thumbnails">' +
        '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
        '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
        '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
      '</div>';
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
    const tabs  = root.querySelector(".yana-tabs");
    const med   = root.querySelector(".yana-media");
    const prev  = root.querySelector(".yana-prev");
    const next  = root.querySelector(".yana-next");
    const ths   = root.querySelector(".yana-thumbs");
    const lbtn  = root.querySelector(".yana-page-prev");
    const rbtn  = root.querySelector(".yana-page-next");

    let ci = 0;  // category index
    let ii = 0;  // item index

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
      med.innerHTML = "";
    }

    function renderMedia(){
      const items = curItems();
      stopMedia();
      if (!items.length) return;

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
          // fallback (e.g., video without thumbnail)
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
