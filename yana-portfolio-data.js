/* =========================================================
- Only data here.
- Carrd embed JS will read: window.YANA_PORTFOLIO_CATS

Category:
- k: key (unique)
- l: label (tab text)
- i: items array

Item:
- t : "image" | "youtube" | "vimeo"
- ti: title
- s : src (image=big image URL / youtube=embed URL / vimeo=player URL)
- th: thumbnail URL (optional; if missing, your script may fallback to s)
========================================================= */

const CATS = [
  /* =========================
  3D CHARS
  ========================= */
  { k:"chars", l:"3D Chars", i:[
    { t:"image",  ti:"Char 01", s:"https://picsum.photos/id/1011/1600/900", th:"https://picsum.photos/id/1011/320/180" },
    { t:"image",  ti:"Char 02", s:"https://picsum.photos/id/1012/1600/900", th:"https://picsum.photos/id/1012/320/180" },
    { t:"youtube",ti:"Char Turntable", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1013/320/180" },
    { t:"image",  ti:"Char 04", s:"https://picsum.photos/id/1014/1600/900", th:"https://picsum.photos/id/1014/320/180" },
    { t:"image",  ti:"Char 05", s:"https://picsum.photos/id/1015/1600/900", th:"https://picsum.photos/id/1015/320/180" },
  ]},

  /* =========================
  3D PROPS
  ========================= */
  { k:"props", l:"3D Props", i:[
    { t:"image", ti:"Prop 01", s:"https://picsum.photos/id/1020/1600/900", th:"https://picsum.photos/id/1020/320/180" },
    { t:"image", ti:"Prop 02", s:"https://picsum.photos/id/1021/1600/900", th:"https://picsum.photos/id/1021/320/180" },
    { t:"image", ti:"Prop 03", s:"https://picsum.photos/id/1022/1600/900", th:"https://picsum.photos/id/1022/320/180" },
    { t:"image", ti:"Prop 04", s:"https://picsum.photos/id/1023/1600/900", th:"https://picsum.photos/id/1023/320/180" },
  ]},

  /* =========================
  LIVE2D
  ========================= */
  { k:"live2d", l:"Live2D", i:[
    { t:"vimeo",  ti:"Live2D 01", s:"https://player.vimeo.com/video/76979871", th:"https://picsum.photos/id/1030/320/180" },
    { t:"youtube",ti:"Live2D Showcase", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1031/320/180" },
    { t:"youtube",ti:"Live2D Showcase", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1031/320/180" },
    { t:"youtube",ti:"Live2D Showcase", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1031/320/180" },
    { t:"youtube",ti:"Live2D Showcase", s:"https://www.youtube.com/embed/dQw4w9WgXcQ", th:"https://picsum.photos/id/1031/320/180" },
  ]},

  /* =========================
  GAME DEVELOPMENT
  影片同時也有 ITCH / STEAM
  放在同一個 item 的 links
  ========================= */
  { k:"game", l:"Game Development", i:[
    {
      t:"youtube",
      ti:"Gameplay 01",
      s:"https://www.youtube.com/embed/dQw4w9WgXcQ",
      th:"https://picsum.photos/id/1061/320/180",
      desc:"Prototype gameplay / WIP build.",
      links:[
        { label:"ITCH.IO", url:"https://itch.io/" },
      ]
    },
    {
      t:"youtube",
      ti:"Gameplay 01",
      s:"https://www.youtube.com/embed/dQw4w9WgXcQ",
      th:"https://picsum.photos/id/1061/320/180",
      desc:"Prototype gameplay / WIP build.",
      links:[
        { label:"ITCH.IO", url:"https://itch.io/" },
      ]
    },
    {
      t:"image",
      ti:"Screenshot 01",
      s:"https://picsum.photos/id/1060/1600/900",
      th:"https://picsum.photos/id/1060/320/180",
      desc:"In-game screenshot.",
      links:[
        { label:"STEAM", url:"https://store.steampowered.com/" },
      ]
    },
  ]},

  /* =========================
  SKETCH
  ========================= */
  { k:"sketch", l:"Sketch", i:[
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 02", s:"https://picsum.photos/id/1041/1600/900", th:"https://picsum.photos/id/1041/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
    { t:"image", ti:"Sketch 01", s:"https://picsum.photos/id/1040/1600/900", th:"https://picsum.photos/id/1040/320/180" },
  ]},
];

/* =========================================================
Expose to global (Carrd embed JS reads this)
========================================================= */
window.YANA_PORTFOLIO_CATS = CATS;
