(() => {
  const ROOT_ID = "yana-carousel-portfolio";

  // ===== Config =====
  const ASSETS = {
    user: "TsukiyomiYana",
    repo: "yana-portfolio-assets",
    version: "main", // branch
    // GitHub Pages base (assets repo)
    pagesBase: "https://tsukiyomiyana.github.io/yana-portfolio-assets/"
  };

  // 作品固定分類資料夾（對應 assets repo 路徑）
  const FOLDER_CATS = [
    { k:"chars",  l:"3D Chars",        dir:"works/chars" },
    { k:"props",  l:"3D Props",        dir:"works/props" },
    { k:"live2d", l:"Live2D",          dir:"works/live2d" },
    { k:"game",   l:"Game Development",dir:"works/game" },
    { k:"sketch", l:"Sketch",          dir:"works/sketch" },
  ];

  // ===== Boot =====
  const waitForRoot = () => new Promise((resolve) => {
    const t = setInterval(() => {
      const root = document.getElementById(ROOT_ID);
      if (root) { clearInterval(t); resolve(root); }
    }, 80);
    setTimeout(() => { clearInterval(t); resolve(null); }, 8000);
  });

  (async () => {
    const root = await waitForRoot();
    if (!root) return;

    ensureMarkup();

    try {
      // 動態從 repo 樹狀結構生成分類資料
      const CATS = await loadCatsFromRepo();
      init(CATS);
    } catch (e) {
      showError(e);
      // eslint-disable-next-line no-console
      console.error(e);
    }
  })();

  // ===== Markup =====
  function ensureMarkup(){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (root.querySelector(".yana-stage")) return;

    root.classList.add("yana-carousel");
    root.innerHTML =
      // tabs 移到 stage 外（第一層）
      '<div class="yana-tabs" role="tablist" aria-label="Categories"></div>' +

      '<div class="yana-stage" aria-label="Portfolio viewer">' +
        '<button class="yana-nav yana-prev" type="button" aria-label="Previous item">‹</button>' +
        '<div class="yana-media" aria-live="polite"></div>' +
        '<button class="yana-nav yana-next" type="button" aria-label="Next item">›</button>' +
      '</div>' +

      '<div class="yana-thumbbar" aria-label="Thumbnails">' +
        '<button class="yana-page yana-page-prev" type="button" aria-label="Scroll thumbnails left">◄</button>' +
        '<div class="yana-thumbs" role="tablist" aria-label="Thumbnail list"></div>' +
        '<button class="yana-page yana-page-next" type="button" aria-label="Scroll thumbnails right">►</button>' +
      '</div>';
  }

  function showError(err){
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.innerHTML =
      '<div class="yana-card"><div class="box">' +
      '<b>Load failed.</b><br>' +
      '<small>' + escapeHtml(String(err && err.message ? err.message : err)) + '</small>' +
      '</div></div>';
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  // ===== Auto-load cats by listing repo files (GitHub API: always reflects latest repo state) =====
  async function loadCatsFromRepo(){
    const allPaths = await listRepoPathsViaGitHubAPI();
    const mediaPaths = allPaths.filter(p => isImagePath(p) || isVideoPath(p));

    const cats = FOLDER_CATS.map(c => {
      const prefix = c.dir.replace(/\/+$/,"") + "/";

      const items = mediaPaths
        .filter(p => p.startsWith(prefix))
        .sort((a,b) => b.localeCompare(a)) // 新在前（檔名倒序）
        .map(p => pathToItem(p));

      return { k: c.k, l: c.l, i: items };
    });

    return cats;
  }

  async function listRepoPathsViaGitHubAPI(){
    // 1) 先拿 branch 最新 commit（可讀到 tree sha）
    const commitApi =
      "https://api.github.com/repos/" +
      encodeURIComponent(ASSETS.user) + "/" +
      encodeURIComponent(ASSETS.repo) +
      "/commits/" + encodeURIComponent(ASSETS.version);

    const commitRes = await fetch(commitApi, {
      cache: "no-store",
      headers: { "Accept": "application/vnd.github+json" }
    });

    if (!commitRes.ok) {
      const extra = rateLimitHint(commitRes);
      throw new Error(`GitHub commit API failed (${commitRes.status})${extra}`);
    }

    const commitData = await commitRes.json();
    const treeSha = commitData && commitData.commit && commitData.commit.tree && commitData.commit.tree.sha;
    if (!treeSha) throw new Error("GitHub API: tree sha not found.");

    // 2) 用 tree sha 拿完整檔案樹
    const treeApi =
      "https://api.github.com/repos/" +
      encodeURIComponent(ASSETS.user) + "/" +
      encodeURIComponent(ASSETS.repo) +
      "/git/trees/" + encodeURIComponent(treeSha) +
      "?recursive=1";

    const treeRes = await fetch(treeApi, {
      cache: "no-store",
      headers: { "Accept": "application/vnd.github+json" }
    });

    if (!treeRes.ok) {
      const extra = rateLimitHint(treeRes);
      throw new Error(`GitHub tree API failed (${treeRes.status})${extra}`);
    }

    const treeData = await treeRes.json();
    const tree = Array.isArray(treeData && treeData.tree) ? treeData.tree : [];

    // 只要檔案（blob），回傳 path list
    return tree
      .filter(n => n && n.type === "blob" && typeof n.path === "string")
      .map(n => n.path);
  }

  function rateLimitHint(res){
    // 403 有可能是 rate limit；提示一下（不影響正常情況）
    if (res.status !== 403) return "";
    const rem = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    if (rem === "0" && reset) return " (rate limit hit; try again later)";
    return "";
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
    const root = document.getElementById(ROOT_ID);
    const tabs = root.querySelector(".yana-tabs");
    const stage = root.querySelector(".yana-stage");
    const med = root.querySelector(".yana-media");
    const prev = root.querySelector(".yana-prev");
    const next = root.querySelector(".yana-next");
    const ths  = root.querySelector(".yana-thumbs");
    const pagePrev = root.querySelector(".yana-page-prev");
    const pageNext = root.querySelector(".yana-page-next");

    // state
    let ci = 0;      // category index
    let ii = 0;      // item index
    let dragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    // helpers
    const curItems = () => (CATS[ci] && Array.isArray(CATS[ci].i)) ? CATS[ci].i : [];

    // events
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(+1));

    // thumb paging
    pagePrev.addEventListener("click", () => scrollThumbs(-1));
    pageNext.addEventListener("click", () => scrollThumbs(+1));

    // drag scroll on thumbs
    ths.addEventListener("mousedown", (e) => {
      dragging = true;
      ths.classList.add("dragging");
      dragStartX = e.pageX;
      dragStartScroll = ths.scrollLeft;
    });
    window.addEventListener("mouseup", () => {
      dragging = false;
      ths.classList.remove("dragging");
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.pageX - dragStartX;
      ths.scrollLeft = dragStartScroll - dx;
    });

    // fade mask
    ths.addEventListener("scroll", () => updateThumbFade());
    window.addEventListener("resize", () => updateThumbFade(), { passive:true });

    // initial
    renderTabs();

    // tabs 會因為換行/寬度改變高度：量測後用 CSS 變數把 stage 往下推，避免遮到作品圖
    const syncTabsSpace = () => {
      const h = Math.ceil(tabs.getBoundingClientRect().height || 0);
      // 額外 +12px：讓 tabs 和作品框有一點呼吸空間
      root.style.setProperty("--yana-tabs-space", (h ? (h + 12) : 56) + "px");
    };
    syncTabsSpace();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(syncTabsSpace);
      ro.observe(tabs);
    }
    window.addEventListener("resize", syncTabsSpace, { passive: true });

    renderAll();
    updateThumbFade();

    // ===== functions =====
    function scrollThumbs(dir){
      const w = ths.clientWidth || 1;
      ths.scrollBy({ left: dir * (w * 0.85), behavior:"smooth" });
      setTimeout(updateThumbFade, 260);
    }

    function updateThumbFade(){
      const max = ths.scrollWidth - ths.clientWidth;
      const hasOverflow = max > 6;
      ths.classList.toggle("has-fade", hasOverflow);

      const center = !hasOverflow;
      ths.classList.toggle("is-centered", center);

      pagePrev.disabled = !hasOverflow || ths.scrollLeft <= 2;
      pageNext.disabled = !hasOverflow || ths.scrollLeft >= max - 2;
    }

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

      // 空分類顯示提示（tab 固定存在）
      if (!items.length){
        const empty = document.createElement("div");
        empty.className = "yana-frame";
        empty.textContent = "No items in this category yet.";
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
        // 你原本的 video（iframe / YouTube embed 等）
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
