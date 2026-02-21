(() => {
  const ROOT_ID = "yana-carousel-portfolio";

  // ===== Config =====
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

  const VIDEO_MANIFEST = {
    chars:  "works/chars/videos.json",
    props:  "works/props/videos.json",
    live2d: "works/live2d/videos.json",
    game:   "works/game/videos.json"
};

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
      const CATS = await loadCatsFromRepo();
      init(CATS);
    } catch (e) {
      showError(e);
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

  // ===== Repo listing (GitHub API) =====
  async function loadCatsFromRepo(){
    const allPaths = await listRepoPathsViaGitHubAPI();
    const mediaPaths = allPaths.filter(p => isImagePath(p) || isVideoFilePath(p));

    const cats = await Promise.all(FOLDER_CATS.map(async (c) => {
      const prefix = c.dir.replace(/\/+$/,"") + "/";

      const folderItems = mediaPaths
        .filter(p => p.startsWith(prefix))
        .sort((a,b) => b.localeCompare(a))
        .map(p => pathToFileItem(p));

      const manifestPath = VIDEO_MANIFEST[c.k];
      if (manifestPath) {
        const videoItems = await loadVideoItemsFromManifest(manifestPath, c.k);
        return { k: c.k, l: c.l, i: [...videoItems, ...folderItems] };
      }

      return { k: c.k, l: c.l, i: folderItems };
    }));

    return cats;
  }

  async function listRepoPathsViaGitHubAPI(){
    const commitApi =
      "https://api.github.com/repos/" +
      encodeURIComponent(ASSETS.user) + "/" +
      encodeURIComponent(ASSETS.repo) +
      "/commits/" + encodeURIComponent(ASSETS.version);

    const commitRes = await fetch(commitApi, {
      cache: "no-store",
      headers: { "Accept": "application/vnd.github+json" }
    });

    if (!commitRes.ok) throw new Error(`GitHub commit API failed (${commitRes.status})${rateLimitHint(commitRes)}`);

    const commitData = await commitRes.json();
    const treeSha = commitData && commitData.commit && commitData.commit.tree && commitData.commit.tree.sha;
    if (!treeSha) throw new Error("GitHub API: tree sha not found.");

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

    if (!treeRes.ok) throw new Error(`GitHub tree API failed (${treeRes.status})${rateLimitHint(treeRes)}`);

    const treeData = await treeRes.json();
    const tree = Array.isArray(treeData && treeData.tree) ? treeData.tree : [];

    return tree
      .filter(n => n && n.type === "blob" && typeof n.path === "string")
      .map(n => n.path);
  }

  function rateLimitHint(res){
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
  function isVideoFilePath(p){
    const x = String(p).toLowerCase();
    return x.endsWith(".mp4") || x.endsWith(".webm");
  }

  function pathToFileItem(path){
    const clean = String(path || "").replace(/^\/+/, "");
    const url = ASSETS.pagesBase.replace(/\/+$/,"/") + clean;

    return {
      t: isVideoFilePath(clean) ? "video_file" : "image",
      s: url,
      th: isVideoFilePath(clean) ? "" : url,
      ti: "",
      d: "",
      links: [],
      hm: false
    };
  }

  // ===== Video manifest =====
  async function loadVideoItemsFromManifest(manifestPath, catKey){
    const urls = [
      `https://raw.githubusercontent.com/${ASSETS.user}/${ASSETS.repo}/${ASSETS.version}/${manifestPath}`,
      ASSETS.pagesBase.replace(/\/+$/,"/") + manifestPath.replace(/^\/+/,""),
      `https://cdn.jsdelivr.net/gh/${ASSETS.user}/${ASSETS.repo}@${ASSETS.version}/${manifestPath}`
    ];

    let data = null;
    for (const u of urls) {
      try {
        const res = await fetch(u, { cache: "no-store" });
        if (!res.ok) continue;
        data = await res.json();
        if (data) break;
      } catch (_) {}
    }

    if (!Array.isArray(data)) return [];
    const items = await Promise.all(data.map((entry) => entryToVideoItem(entry, catKey)));
    return items.filter(Boolean);
  }

  async function entryToVideoItem(entry, catKey){
    try {
      const obj = (typeof entry === "string") ? { url: entry } : (entry && typeof entry === "object" ? entry : null);
      if (!obj) return null;

      const url = String(obj.url || obj.embed || "").trim();
      if (!url) return null;

      // Live2D 預設不顯示小卡片
      const hideMetaByCat = (catKey === "live2d");

      const yt = parseYouTube(url);
      if (yt) {
        const origin = location.origin;
        const embed = `https://www.youtube-nocookie.com/embed/${yt}?rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
        const thumb = obj.thumb ? String(obj.thumb) : `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
        return {
          t:"embed",
          s:embed,
          th:thumb,
          ti: obj.title ? String(obj.title) : "",
          d:  obj.desc  ? String(obj.desc)  : "",
          links: normalizeLinks(obj.links),
          hm: !!(obj.hideMeta ?? hideMetaByCat)
        };
      }

      const vm = parseVimeo(url);
      if (vm) {
        const embed = `https://player.vimeo.com/video/${vm}?title=0&byline=0&portrait=0`;
        let thumb = obj.thumb ? String(obj.thumb) : "";
        if (!thumb) thumb = await fetchVimeoThumb(`https://vimeo.com/${vm}`);
        return {
          t:"embed",
          s:embed,
          th:thumb || "",
          ti: obj.title ? String(obj.title) : "",
          d:  obj.desc  ? String(obj.desc)  : "",
          links: normalizeLinks(obj.links),
          hm: !!(obj.hideMeta ?? hideMetaByCat)
        };
      }

      return {
        t:"embed",
        s:url,
        th: obj.thumb ? String(obj.thumb) : "",
        ti: obj.title ? String(obj.title) : "",
        d:  obj.desc  ? String(obj.desc)  : "",
        links: normalizeLinks(obj.links),
        hm: !!(obj.hideMeta ?? hideMetaByCat)
      };
    } catch (_) {
      return null;
    }
  }

  function normalizeLinks(links){
    if (!Array.isArray(links)) return [];
    return links
      .filter(x => x && typeof x === "object")
      .map(x => ({ label: String(x.label || "Link"), url: String(x.url || "#") }))
      .filter(x => x.url && x.url !== "#");
  }

  function parseYouTube(url){
    const u = String(url);
    if (/^[a-zA-Z0-9_-]{11}$/.test(u)) return u;
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const re of patterns) {
      const m = u.match(re);
      if (m && m[1]) return m[1];
    }
    return null;
  }

  function parseVimeo(url){
    const u = String(url);
    if (/^\d+$/.test(u)) return u;
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/
    ];
    for (const re of patterns) {
      const m = u.match(re);
      if (m && m[1]) return m[1];
    }
    return null;
  }

  async function fetchVimeoThumb(vimeoUrl){
    try {
      const api = "https://vimeo.com/api/oembed.json?url=" + encodeURIComponent(vimeoUrl);
      const res = await fetch(api, { cache: "no-store" });
      if (!res.ok) return "";
      const j = await res.json();
      return j && j.thumbnail_url ? String(j.thumbnail_url) : "";
    } catch (_) {
      return "";
    }
  }

  // ===== Player APIs (YouTube / Vimeo) =====
  function loadYouTubeApi(){
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (window.__yanaYTReady) return window.__yanaYTReady;

    window.__yanaYTReady = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try { if (typeof prev === "function") prev(); } catch(_) {}
        resolve(window.YT);
      };

      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => reject(new Error("Failed to load YouTube IFrame API"));
      document.head.appendChild(s);
    });

    return window.__yanaYTReady;
  }

  function loadVimeoApi(){
    if (window.Vimeo && window.Vimeo.Player) return Promise.resolve(window.Vimeo);
    if (window.__yanaVimeoReady) return window.__yanaVimeoReady;

    window.__yanaVimeoReady = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://player.vimeo.com/api/player.js";
      s.async = true;
      s.onload = () => resolve(window.Vimeo);
      s.onerror = () => reject(new Error("Failed to load Vimeo Player API"));
      document.head.appendChild(s);
    });

    return window.__yanaVimeoReady;
  }

  function attachPlaybackAutoHide(iframe, onPlay, onStop){
    const src = String(iframe && iframe.src || "");

    // YouTube
    if (/youtube(-nocookie)?\.com\/embed\//i.test(src)) {
      let player = null;
      let destroyed = false;

      if (!iframe.id) iframe.id = "yana-yt-" + Math.random().toString(36).slice(2);

      loadYouTubeApi().then((YT) => {
        if (destroyed || !YT || !YT.Player) return;

        player = new YT.Player(iframe.id, {
          events: {
            onReady: () => {
              try {
                const st = player.getPlayerState();
                if (st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING) onPlay();
                else onStop();
              } catch(_) {}
            },
            onStateChange: (e) => {
              const st = e.data;
              if (st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING) onPlay();
              if (st === YT.PlayerState.PAUSED || st === YT.PlayerState.ENDED) onStop();
            }
          }
        });
      }).catch(() => {});

      return () => {
        destroyed = true;
        onStop();
        try { player && player.destroy && player.destroy(); } catch(_) {}
      };
    }

    // Vimeo
    if (/player\.vimeo\.com\/video\//i.test(src)) {
      let player = null;
      let destroyed = false;

      loadVimeoApi().then((Vimeo) => {
        if (destroyed || !Vimeo || !Vimeo.Player) return;

        player = new Vimeo.Player(iframe);
        player.on("play", onPlay);
        player.on("pause", onStop);
        player.on("ended", onStop);

        player.getPaused().then((paused) => {
          if (!destroyed) paused ? onStop() : onPlay();
        }).catch(() => {});
      }).catch(() => {});

      return () => {
        destroyed = true;
        onStop();
        try {
          if (player) {
            player.off("play", onPlay);
            player.off("pause", onStop);
            player.off("ended", onStop);
            player.destroy && player.destroy();
          }
        } catch(_) {}
      };
    }

    return () => { onStop(); };
  }

  // ===== Carousel UI =====
  function init(CATS){
    const root = document.getElementById(ROOT_ID);
    const tabs = root.querySelector(".yana-tabs");
    const med = root.querySelector(".yana-media");
    const prev = root.querySelector(".yana-prev");
    const next = root.querySelector(".yana-next");
    const ths  = root.querySelector(".yana-thumbs");
    const pagePrev = root.querySelector(".yana-page-prev");
    const pageNext = root.querySelector(".yana-page-next");

    let ci = 0;
    let ii = 0;

    const curItems = () => (CATS[ci] && Array.isArray(CATS[ci].i)) ? CATS[ci].i : [];

    // avoid TDZ
    let fadeToken = 0;

    function syncTabsSpace(){
      const h = Math.ceil(tabs.getBoundingClientRect().height || 0);
      root.style.setProperty("--yana-tabs-space", (h ? (h + 12) : 56) + "px");
    }

    function updateThumbFade(){
    const max = ths.scrollWidth - ths.clientWidth;
    const hasOverflow = max > 6;

    ths.classList.toggle("has-fade", hasOverflow);
    ths.classList.toggle("is-centered", !hasOverflow);

    // 沒有 overflow：兩個都不能按
    if (!hasOverflow) {
    pagePrev.disabled = true;
    pageNext.disabled = true;
    return;
  }

  // 有 overflow：左邊在最左時禁用；右邊永遠不禁用（到最右時按一下回到第一張）
  pagePrev.disabled = ths.scrollLeft <= 2;
  pageNext.disabled = false;
}

    function queueThumbFade(){
      const token = ++fadeToken;

      requestAnimationFrame(() => {
        if (token !== fadeToken) return;
        updateThumbFade();
      });

      setTimeout(() => { if (token === fadeToken) updateThumbFade(); }, 150);
      setTimeout(() => { if (token === fadeToken) updateThumbFade(); }, 600);
    }

    function scrollThumbs(dir){
      const max = ths.scrollWidth - ths.clientWidth;
      const hasOverflow = max > 6;
      if (!hasOverflow) return;

      const atEnd = ths.scrollLeft >= max - 2;

      // 在最右邊時，按右鍵 → 回到第一張（scrollLeft = 0）
      if (dir > 0 && atEnd) {
      ths.scrollTo({ left: 0, behavior: "smooth" });
      setTimeout(queueThumbFade, 260);
      return;
  }

  // 一般情況：照原本「翻頁」的距離滾動
  const w = ths.clientWidth || 1;
  ths.scrollBy({ left: dir * (w * 0.85), behavior:"smooth" });
  setTimeout(queueThumbFade, 260);
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
          queueThumbFade();
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
      if (med.__cleanupPlayer) {
        try { med.__cleanupPlayer(); } catch(_) {}
        med.__cleanupPlayer = null;
      }
      med.classList.remove("is-playing");

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

      let iframeEl = null;
      let videoEl = null;

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
        videoEl = v;
      } else {
        const f = document.createElement("iframe");
        f.src = it.s || "";
        f.title = it.ti || "video";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true;
        frame.appendChild(f);
        iframeEl = f;
      }

      med.appendChild(frame);

      // ---- Auto-hide meta while playing (only matters when meta exists; Game has meta) ----
      if (iframeEl) {
        if (med.__cleanupPlayer) { try { med.__cleanupPlayer(); } catch(_) {} }
        med.__cleanupPlayer = attachPlaybackAutoHide(
          iframeEl,
          () => med.classList.add("is-playing"),
          () => med.classList.remove("is-playing")
        );
      } else if (videoEl) {
        const onPlay = () => med.classList.add("is-playing");
        const onStop = () => med.classList.remove("is-playing");
        videoEl.addEventListener("play", onPlay);
        videoEl.addEventListener("pause", onStop);
        videoEl.addEventListener("ended", onStop);
        med.__cleanupPlayer = () => {
          try {
            videoEl.removeEventListener("play", onPlay);
            videoEl.removeEventListener("pause", onStop);
            videoEl.removeEventListener("ended", onStop);
          } catch(_) {}
          onStop();
        };
      }

      // 小卡片（Live2D 預設隱藏）
      const catKey = (CATS[ci] && CATS[ci].k) ? CATS[ci].k : "";
      const hideMeta = (it.hm === true) || (catKey === "live2d");

      const hasDesc  = !!(it.d && String(it.d).trim());
      const hasLinks = Array.isArray(it.links) && it.links.length;

      if (!hideMeta && (it.ti || hasDesc || hasLinks)){
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

          im.addEventListener("load", queueThumbFade, { once:true });
          im.addEventListener("error", queueThumbFade, { once:true });

          b.appendChild(im);
        } else {
          const d = document.createElement("div");
          d.className = "tcard";
          d.textContent = String(it.ti || "Video").slice(0, 24);
          b.appendChild(d);
        }

        b.addEventListener("click", () => {
          if (idx === ii) return;
          ii = idx;
          renderMedia();
          updateThumbSelected();
          b.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
          setTimeout(queueThumbFade, 260);
        });

        ths.appendChild(b);
      });

      queueThumbFade();
    }

    function updateThumbSelected(){
      const btns = ths.querySelectorAll(".yana-thumb");
      btns.forEach((b, idx) => b.setAttribute("aria-selected", idx === ii ? "true" : "false"));
    }

    // ===== Wire events =====
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(+1));
    pagePrev.addEventListener("click", () => scrollThumbs(-1));
    pageNext.addEventListener("click", () => scrollThumbs(+1));
    ths.addEventListener("scroll", queueThumbFade);
    window.addEventListener("resize", () => { queueThumbFade(); syncTabsSpace(); }, { passive:true });

    renderTabs();
    syncTabsSpace();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(syncTabsSpace);
      ro.observe(tabs);
    }

    renderAll();
    queueThumbFade();

    // 放在 init 結尾：字型載入完成後重算一次（穩定）
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => queueThumbFade()).catch(() => {});
    }
  }
})();

