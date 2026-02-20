/* =========================================================
  Yana Portfolio Data (Global)
  - IMPORTANT: Must attach to window so Carrd embed can read it.
  - Format:
    window.YANA_PORTFOLIO_CATS = [
      { k:"chars", l:"3D Chars", i:[ {t,ti,s,th, ...optional...}, ... ] },
      ...
    ]

  Item fields:
  - t  : "image" | "youtube" | "vimeo"
  - ti : title (string)
  - s  : src (image = image URL; youtube = embed URL; vimeo = player URL)
  - th : thumbnail URL (optional; fallback to s)

  Optional (used for overlay info, especially Game Dev):
  - d     : description text
  - links : [{ label:"ITCH.IO", url:"https://..." }, ...]
========================================================= */

window.YANA_PORTFOLIO_CATS = [
  /* =========================
    3D CHARS
  ========================= */
  {
    k: "chars",
    l: "3D Chars",
    i: [
      { t:"image",  ti:"Char 01", s:"https://picsum.photos/id/1011/1600/900", th:"https://picsum.photos/id/1011/320/180" },
      { t:"image",  ti:"Char 02", s:"https://picsum.photos/id/1012/1600/900", th:"https://picsum.photos/id/1012/320/180" },
      { t:"youtube",ti:"Char Turntable", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1013/320/180" },
      { t:"image",  ti:"Char 04", s:"https://picsum.photos/id/1014/1600/900", th:"https://picsum.photos/id/1014/320/180" },
      { t:"image",  ti:"Char 05", s:"https://picsum.photos/id/1015/1600/900", th:"https://picsum.photos/id/1015/320/180" },

      /* 你要測多張就一直加，這裡示範加到 9+ 也沒問題（資料在外部檔，不吃 Carrd 長度） */
      { t:"image",  ti:"Char 06", s:"https://picsum.photos/id/1020/1600/900", th:"https://picsum.photos/id/1020/320/180" },
      { t:"image",  ti:"Char 07", s:"https://picsum.photos/id/1021/1600/900", th:"https://picsum.photos/id/1021/320/180" },
      { t:"image",  ti:"Char 08", s:"https://picsum.photos/id/1022/1600/900", th:"https://picsum.photos/id/1022/320/180" },
      { t:"image",  ti:"Char 09", s:"https://picsum.photos/id/1023/1600/900", th:"https://picsum.photos/id/1023/320/180" }
    ]
  },

  /* =========================
    3D PROPS
  ========================= */
  {
    k: "props",
    l: "3D Props",
    i: [
      { t:"image", ti:"Prop 01", s:"https://picsum.photos/id/1020/1600/900", th:"https://picsum.photos/id/1020/320/180" },
      { t:"image", ti:"Prop 02", s:"https://picsum.photos/id/1021/1600/900", th:"https://picsum.photos/id/1021/320/180" },
      { t:"image", ti:"Prop 03", s:"https://picsum.photos/id/1022/1600/900", th:"https://picsum.photos/id/1022/320/180" },
      { t:"image", ti:"Prop 04", s:"https://picsum.photos/id/1023/1600/900", th:"https://picsum.photos/id/1023/320/180" }
    ]
  },

  /* =========================
    LIVE2D
  ========================= */
  {
    k: "live2d",
    l: "Live2D",
    i: [
      { t:"youtube", ti:"L2D Showcase 01", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1030/320/180" },
      { t:"youtube", ti:"L2D Showcase 02", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1031/320/180" }
    ]
  },

  /* =========================
    GAME DEVELOPMENT
    - 同一個 item 可以是 youtube/vimeo/image
    - 只要加上 links / d，就會在主畫面顯示「影片 + itch/steam/github」overlay
  ========================= */
  {
    k: "game",
    l: "Game Development",
    i: [
      {
        t: "youtube",
        ti: "Gameplay Prototype A",
        s: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        th:"https://picsum.photos/id/1061/320/180",
        d: "Short description for your game. Put engine/role/feature highlights here.",
        links: [
          { label:"ITCH.IO", url:"https://itch.io/" },
          { label:"STEAM",   url:"https://store.steampowered.com/" },
          { label:"GITHUB",  url:"https://github.com/" }
        ]
      },
      {
        t: "image",
        ti: "Game Screenshot / Feature",
        s: "https://picsum.photos/id/1060/1600/900",
        th:"https://picsum.photos/id/1060/320/180",
        d: "This one is an image but still can show links.",
        links: [
          { label:"ITCH.IO", url:"https://itch.io/" },
          { label:"GITHUB",  url:"https://github.com/" }
        ]
      }
    ]
  },

  /* =========================
    SKETCH
  ========================= */
  {
    k: "sketch",
    l: "Sketch",
    i: [
      { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
      { t:"image", ti:"Sketch 02", s:"https://picsum.photos/id/1041/1600/900", th:"https://picsum.photos/id/1041/320/180" }
    ]
  }
];
