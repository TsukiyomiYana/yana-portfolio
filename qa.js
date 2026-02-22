// qa.js (FINAL - uses <p><br> for the "⟡" lines, no <li> in Character Profile)
(() => {
  const hosts = Array.from(document.querySelectorAll("[data-qa-host]"));
  if (!hosts.length) return;

  const HTML = `
  <div class="yana-faq" data-qaaccordion data-mode="single">

    <!-- 1) Character Profile -->
    <details>
      <summary>
        <span class="row-left">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>

          <span class="txt lang-tw">角色檔案</span>
          <span class="txt lang-ja">キャラクタープロフィール</span>
          <span class="txt lang-en">Character Profile</span>
        </span>
      </summary>

      <div class="content">
        <div class="profile-grid">

          <!-- LEFT: text -->
          <div class="profile-text">

            <div class="lang-tw">
              <p class="spark-par">
                ⟡ 173cm、中性、阿努比斯後裔<br>
                ⟡ 小麥色肌、狼耳、火焰尾巴<br>
                ⟡ 本體 = 眼鏡・面具<br>
                ⟡ 守護神獸 = 阿努比斯（Anu Peace）
              </p>

              <p class="sub-par">
                ▼ 標籤・Tag ▼<br>
                🎨 #YanaAbyss #やなアビス
              </p>

              <p class="sub-par">
                ▼ 其他・Others・その他 ▼<br>
                中文⭕日本語⭕English⭕
              </p>
            </div>

            <div class="lang-ja">
              <p class="spark-par">
                ⟡ 173cm、中性、アヌビスの末裔<br>
                ⟡ 小麦色の肌、狼耳、炎のしっぽ<br>
                ⟡ 本体 = 眼鏡・仮面<br>
                ⟡ 守護神獣 = アヌピス（Anu Peace）
              </p>

              <p class="sub-par">
                ▼ タグ ▼<br>
                🎨 #YanaAbyss #やなアビス
              </p>

              <p class="sub-par">
                ▼ その他 ▼<br>
                中国語⭕日本語⭕English⭕
              </p>
            </div>

            <div class="lang-en">
              <p class="spark-par">
                ⟡ 173 cm / Neutral / Descendant of Anubis<br>
                ⟡ Tanned skin / Wolf ears / Flame tail<br>
                ⟡ Noumenon = Glasses, Mask<br>
                ⟡ Guardian Beast = Anu Peace
              </p>

              <p class="sub-par">
                ▼ Tags ▼<br>
                🎨 #YanaAbyss #やなアビス
              </p>

              <p class="sub-par">
                ▼ Other ▼<br>
                Mandarin / Japanese / English
              </p>
            </div>

          </div>

          <!-- RIGHT: photos -->
          <div class="profile-media">
            <div class="media-grid">
              <img src="https://YOUR_IMAGE_URL_1.png" alt="Character Photo 1">
              <img src="https://YOUR_IMAGE_URL_2.png" alt="Character Photo 2">
            </div>

            <!-- 單張版本（要單張就把上面 media-grid 刪掉，改用這行） -->
            <!-- <img src="https://YOUR_IMAGE_URL.png" alt="Character Photo"> -->
          </div>

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

    <!-- 3) PRICE -->
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

    <!-- 4) TERMS OF SERVICE -->
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

  const CFG = {
    minW: 260, maxW: 520,
    minFS: 12, maxFS: 15,
    minLS: 0.06, maxLS: 0.09,
    minPY: 12, maxPY: 16,
    minIC: 14, maxIC: 16
  };

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

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
