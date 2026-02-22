// qa.js (FINAL)
(() => {
  const hosts = Array.from(document.querySelectorAll("[data-qa-host]"));
  if (!hosts.length) return;

  const HTML = `
  <div class="yana-faq" data-qaaccordion data-mode="single">

    <details>
      <summary>
        <span class="row-left">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.6-1.7 1.2-1.7 2.2v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="txt lang-tw">角色檔案</span>
          <span class="txt lang-ja">キャラクタープロフィール</span>
          <span class="txt lang-en">Character Profile</span>
        </span>
      </summary>
      <div class="content">
          <div class="lang-tw">
          <p>⟡ 173cm、中性、阿努比斯後裔<br>
          ⟡ 小麥色肌、狼耳、火焰尾巴<br>
          ⟡ 本體 = 眼鏡・面具<br>
          ⟡ 守護神獸 = 阿努皮斯（Anu Peace）</p>

          <p>▼ 標籤・Tag ▼<br>
          🎨 #YanaAbyss #やなアビス</p>

          <p>▼ 其他・Others・その他 ▼<br>
          中文⭕日本語⭕English⭕</p>
          </div>
          
         <div class="lang-ja">
          <p>⟡ 173cm、中性、アヌビスの末裔<br>
          ⟡ 小麦色の肌、狼耳、炎のしっぽ<br>
          ⟡ 本体 = 眼鏡・仮面<br>
          ⟡ 守護神獣 = アヌピス（Anu Peace）</p>

          <p>▼ タグ ▼<br>
          🎨 #YanaAbyss #やなアビス</p>

          <p>▼ その他 ▼<br>
          中国語⭕日本語⭕English⭕</p>
          </div>

          <div class="lang-en">
          <p>⟡ 173 cm / Neutral / Descendant of Anubis<br>
          ⟡ Tanned skin / Wolf ears / Flame tail<br>
          ⟡ Noumenon = Glasses, Mask<br>
          ⟡ Guardian Beast = Anu Peace</p>

          <p>▼ Tags ▼<br>
          🎨 #YanaAbyss #やなアビス</p>

          <p>▼ Other ▼<br>
          Mandarin / Japanese / English</p>
          </div>
      </div>
    </details>

  <!-- 2) WORK PROCESS -->
    <details>
      <summary>
        <span class="row-left">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 7h10M7 12h6M7 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M5 7h.01M5 12h.01M5 17h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="txt lang-tw">WORK PROCESS（工作流程）</span>
          <span class="txt lang-ja">WORK PROCESS（制作フロー）</span>
          <span class="txt lang-en">WORK PROCESS</span>
        </span>
      </summary>
      <div class="content">
        <div class="lang-tw">
          <ol>
            <li>需求確認 / 報價</li>
            <li>方向確認（Blockout / 草圖）</li>
            <li>製作 + 進度回報</li>
            <li>交付 + 修正範圍</li>
          </ol>
        </div>
        <div class="lang-ja"><p>（ここに制作フロー）</p></div>
        <div class="lang-en"><p>(Write your workflow steps here.)</p></div>
      </div>
    </details>

    <details>
      <summary>
        <span class="row-left">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 12l-8 8-10-10V2h8L20 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M7 7h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="txt lang-tw">PRICE（估價表）</span>
          <span class="txt lang-ja">PRICE（料金）</span>
          <span class="txt lang-en">PRICE</span>
        </span>
      </summary>
      <div class="content">
        <div class="lang-tw">
          <ul>
            <li>3D Prop：$X–$Y</li>
            <li>3D Character：$X–$Y</li>
            <li>Live2D：$X–$Y</li>
          </ul>
        </div>
        <div class="lang-ja"><p>（ここに料金表）</p></div>
        <div class="lang-en"><p>(Put your price range list here.)</p></div>
      </div>
    </details>

    <details>
      <summary>
        <span class="row-left">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M14 3v4h4" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M9 11h6M9 15h6M9 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="txt lang-tw">TERMS OF SERVICE（委託條款）</span>
          <span class="txt lang-ja">TERMS OF SERVICE（利用規約）</span>
          <span class="txt lang-en">TERMS OF SERVICE</span>
        </span>
      </summary>
      <div class="content">
        <div class="lang-tw">
          <ul>
            <li>不接急件（NO RUSH ORDERS）</li>
            <li>付款節點 / 付款方式</li>
            <li>修改次數與範圍</li>
            <li>授權與使用範圍</li>
          </ul>
        </div>
        <div class="lang-ja"><p>（ここに規約）</p></div>
        <div class="lang-en"><p>(Write your ToS here.)</p></div>
      </div>
    </details>

  </div>
  `;

  // 你指定的縮放 CFG
  const CFG = {
    minW: 260, maxW: 520,
    minFS: 12, maxFS: 15,
    minLS: 0.06, maxLS: 0.09,
    // 這兩個用來讓 row spacing / icon 跟著縮放更穩（不影響你指定的 FS/LS）
    minPY: 12, maxPY: 16,
    minIC: 14, maxIC: 16
  };

  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));

  function applyScale(root){
    const w = root.getBoundingClientRect().width;
    const t = clamp((w - CFG.minW) / (CFG.maxW - CFG.minW), 0, 1);

    const fs = CFG.minFS + (CFG.maxFS - CFG.minFS) * t;
    const ls = CFG.minLS + (CFG.maxLS - CFG.minLS) * t;
    const py = CFG.minPY + (CFG.maxPY - CFG.minPY) * t;
    const ic = CFG.minIC + (CFG.maxIC - CFG.minIC) * t;

    root.style.setProperty("--fs", fs.toFixed(2) + "px");
    root.style.setProperty("--ls", ls.toFixed(3) + "em");
    root.style.setProperty("--py", py.toFixed(2) + "px");
    root.style.setProperty("--ic", ic.toFixed(2) + "px");
  }

  function mount(host){
    if (host.dataset.mounted === "1") return;
    host.dataset.mounted = "1";
    host.innerHTML = HTML;

    const root = host.querySelector("[data-qaaccordion]");
    if (!root) return;

    // resize scaling
    const onResize = () => requestAnimationFrame(() => applyScale(root));
    applyScale(root);

    if (window.ResizeObserver){
      const ro = new ResizeObserver(onResize);
      ro.observe(root);
    } else {
      window.addEventListener("resize", onResize);
    }

    // single-open
    const items = Array.from(root.querySelectorAll("details"));
    items.forEach(d => {
      d.addEventListener("toggle", () => {
        if(!d.open) return;
        items.forEach(o => { if(o !== d) o.open = false; });
      });
    });
  }

  hosts.forEach(mount);
})();
