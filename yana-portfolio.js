(() => {
  "use strict";

  // === CONFIG: only edit if your repo/branch/file changes ===
  const DATA_URL = "https://cdn.jsdelivr.net/gh/TsukiyomiYana/yana-portfolio@main/yana-portfolio-data.js";
  const ROOT_ID  = "yana-carousel-portfolio";

  boot();

  function boot(){
    waitForRoot(ROOT_ID, () => {
      ensureMarkup();
      loadScript(DATA_URL, () => {
        const cats = normalizeCats(getCatsFromGlobals());
        if (!Array.isArray(cats) || !cats.length){
          showError("No data loaded. Ensure your data file sets window.YANA_PORTFOLIO_CATS (or CATS).");
          console.error("[YANA] No category data found.");
          return;
        }
        initCarousel(cats);
      });
    });
  }

  function waitForRoot(id, cb){
    const MAX_TRIES = 120, STEP_MS = 100;
    let n = 0;
    const t = setInterval(() => {
      if (document.getElementById(id)) { clearInterval(t); cb(); return; }
      if (++n >= MAX_TRIES) { clearInterval(t); console.error("[YANA] root not found:", id); }
    }, STEP_MS);
  }

  function loadScript(src, onload){
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = onload;
    s.onerror = () => {
      showError("Failed to load data script. Check DATA_URL.");
      console.error("[YANA] Failed to load data:", src);
    };
    document.head.appendChild(s);
  }

  function getCatsFromGlobals(){
    if (typeof window.YANA_PORTFOLIO_CATS !== "undefined") return window.YANA_PORTFOLIO_CATS;
    if (typeof window.CATS !== "undefined") return window.CATS;
    if (typeof window.yanaPortfolioCats !== "undefined") return window.yanaPortfolioCats;
    return [];
  }

  function normalizeCats(raw){
    if (!Array.isArray(raw)) return [];
    const first = raw[0] || {};
    if ("k" in first && "i" in first) return raw;
    if ("key" in first && "items" in first){
      return raw.map(c => ({
        k: c.key,
        l: c.label ?? c.key,
        i: (c.items || []).map(it => ({
          t: it.type ?? "image",
          ti: it.title ?? "",
          s: it.src ?? "",
          th: it.thumb ?? it.src ?? "",
          d: it.d ?? it.desc ?? it.description ?? "",
          links: it.links ?? [],
          tht: it.tht ?? it.thumbText ?? ""
        }))
      }));
    }
    return raw;
  }

  function ensureMarkup(){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    // if user already put markup in Carrd, keep it
    if (root.querySelector(".yana-stage")) return;

    root.classList.add("yana-carousel");
    root.innerHTML = `
      <div class="yana-stage" aria-label="Portfolio viewer">
        <div class="yana-tabs" role="tablist" aria-label="Categories"></div>
        <button class="yana-nav yana-prev" type="button" aria-label="Previous item">‹</button>
        <div class="yana-media" aria-live="polite"></div>
        <button class="yana-nav yana-next" type="button" aria-label="Next item">›</button>
      </div>
      <div class="yana-thumbbar" aria-label="Thumbnails">
        <button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>
        <div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>
        <button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>
      </div>
    `;
  }

  function showError(msg){
    const root = document.getElementById(ROOT_ID);
    const med  = root && root.querySelector(".yana-media");
    if (!med) return;

    med.textContent = "";
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "grid";
    overlay.style.placeItems = "center";
    overlay.style.padding = "16px";
    overlay.style.font = "14px/1.6 system-ui";
    overlay.style.background = "rgba(255,255,255,.75)";
    overlay.style.textAlign = "center";
    overlay.textContent = msg;
    med.appendChild(overlay);
  }

  // =========================
  // Carousel
  // =========================
  function initCarousel(CATS){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const tabs = root.querySelector(".yana-tabs");
    const med  = root.querySelector(".yana-media");
    const prev = root.querySelector(".yana-prev");
    const next = root.querySelector(".yana-next");
    const ths  = root.querySelector(".yana-thumbs");
    const lbtn = root.querySelector(".yana-page-prev");
    const rbtn = root.querySelector(".yana-page-next");

    const WRAP = true, SR = 0.6, EPS = 2;
    const state = new Map();
    let ck = CATS[0]?.k || "";
    let ix = 0;

    let md = 0, sx = 0, sl = 0, mv = 0;

    const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
    const cat = () => CATS.find(x => x.k === ck);

    function load(k){
      const c = CATS.find(x => x.k === k);
      if (!c) return;
      const s = state.get(k);
      ix = s ? clamp(s.ix, 0, Math.max(0, c.i.length - 1)) : 0;
    }
    function save(){ state.set(ck, { ix }); }

    function stopMedia(){
      const ifs = med.querySelectorAll("iframe");
      ifs.forEach(f => { try { f.src = "about:blank"; } catch(e){} });
      med.innerHTML = "";
    }

    function renderTabs(){
      tabs.innerHTML = "";
      for (const c of CATS){
        const b = document.createElement("button");
        b.type = "button";
        b.className = "yana-tab";
        b.setAttribute("role","tab");
        b.setAttribute("aria-selected", c.k === ck ? "true" : "false");
        b.textContent = String(c.l || c.k || "").toUpperCase();
        b.addEventListener("click", () => {
          if (c.k === ck) return;
          save();
          ck = c.k;
          load(ck);
          renderAll();
        });
        tabs.appendChild(b);
      }
    }

    function renderMedia(){
      const c = cat();
      stopMedia();
      if (!c || !c.i.length) return;

      const it = c.i[ix];
      if (!it) return;

      if (it.t === "card"){
        const wrap = document.createElement("div");
        wrap.className = "yana-card";

        const box = document.createElement("div");
        box.className = "box";

        const title = document.createElement("div");
        title.className = "t";
        title.textContent = it.ti || "";

        const desc = document.createElement("div");
        desc.className = "d";
        desc.textContent = it.d || "";

        const links = document.createElement("div");
        links.className = "yana-links";
        (it.links || []).forEach(L => {
          const a = document.createElement("a");
          a.href = L.url || "#";
          a.textContent = String(L.label || "Link").toUpperCase();
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          links.appendChild(a);
        });

        box.appendChild(title);
        if (it.d) box.appendChild(desc);
        if ((it.links || []).length) box.appendChild(links);

        wrap.appendChild(box);
        med.appendChild(wrap);
        return;
      }

      const frame = document.createElement("div");
      frame.className = "yana-frame";

      if (it.t === "image"){
        const im = document.createElement("img");
        im.src = it.s;
        im.alt = it.ti || "";
        im.loading = "lazy";
        frame.appendChild(im);
      } else if (it.t === "youtube" || it.t === "vimeo"){
        const f = document.createElement("iframe");
        f.src = it.s;
        f.title = it.ti || "video";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true;
        frame.appendChild(f);
      } else {
        const im = document.createElement("img");
        im.src = it.s;
        im.alt = it.ti || "";
        im.loading = "lazy";
        frame.appendChild(im);
      }

      med.appendChild(frame);

      const hasDesc  = !!(it.d && String(it.d).trim());
      const hasLinks = Array.isArray(it.links) && it.links.length;

      if (hasDesc || hasLinks){
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

    function updateThumbUI(){
      const canScroll = ths.scrollWidth > ths.clientWidth + 1;
      lbtn.disabled = !canScroll;
      rbtn.disabled = !canScroll;
      ths.classList.toggle("is-centered", !canScroll);
      ths.classList.toggle("has-fade", canScroll);
    }

    function renderThumbs(){
      const c = cat();
      ths.innerHTML = "";
      if (!c || !c.i.length) return;

      c.i.forEach((it, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "yana-thumb";
        b.setAttribute("role","tab");
        b.setAttribute("aria-selected", i === ix ? "true" : "false");
        b.title = it.ti || "";

        if (it.t === "card"){
          const d = document.createElement("div");
          d.className = "tcard";
          d.textContent = String(it.tht || it.ti || "Card").slice(0, 24);
          b.appendChild(d);
        } else {
          const im = document.createElement("img");
          im.src = it.th || it.s;
          im.alt = it.ti || "";
          im.loading = "lazy";
          im.draggable = false;
          b.appendChild(im);
        }

        b.addEventListener("click", () => {
          if (mv > 6) return;
          ix = i;
          renderAll();
          b.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
        });

        ths.appendChild(b);
      });

      requestAnimationFrame(updateThumbUI);
    }

    function step(d){
      const c = cat();
      if (!c || !c.i.length) return;

      let nx = ix + d;
      if (WRAP){
        if (nx < 0) nx = c.i.length - 1;
        if (nx >= c.i.length) nx = 0;
      } else {
        nx = clamp(nx, 0, c.i.length - 1);
      }

      ix = nx;
      renderAll();

      const sel = ths.querySelector('.yana-thumb[aria-selected="true"]');
      if (sel) sel.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
    }

    function scrollThumb(dir){
      updateThumbUI();
      if (lbtn.disabled && rbtn.disabled) return;

      const max = Math.max(0, ths.scrollWidth - ths.clientWidth);
      if (dir < 0 && ths.scrollLeft <= EPS){ ths.scrollLeft = max; return; }
      if (dir > 0 && ths.scrollLeft >= max - EPS){ ths.scrollLeft = 0; return; }

      ths.scrollBy({ left: dir * (ths.clientWidth * SR), behavior:"smooth" });
    }

    function renderAll(){
      renderTabs();
      renderMedia();
      renderThumbs();

      const c = cat();
      const dis = !c || c.i.length <= 1;
      prev.disabled = dis;
      next.disabled = dis;
    }

    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step( 1));
    lbtn.addEventListener("click", () => scrollThumb(-1));
    rbtn.addEventListener("click", () => scrollThumb( 1));
    ths.addEventListener("scroll", () => updateThumbUI(), { passive:true });

    ths.addEventListener("mousedown", (e) => {
      md = 1; mv = 0;
      sx = e.clientX;
      sl = ths.scrollLeft;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!md) return;
      const dx = e.clientX - sx;
      mv = Math.max(mv, Math.abs(dx));
      ths.scrollLeft = sl - dx;
    });
    window.addEventListener("mouseup", () => {
      if (!md) return;
      md = 0;
      updateThumbUI();
    });

    load(ck);
    renderAll();
    requestAnimationFrame(() => {
      const sel = ths.querySelector('.yana-thumb[aria-selected="true"]');
      if (sel) sel.scrollIntoView({ behavior:"auto", inline:"center", block:"nearest" });
    });
  }
})();
