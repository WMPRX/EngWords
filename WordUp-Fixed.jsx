import { useState, useEffect, useReducer, useCallback, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   CLAYMORPHISM STYLES
   Signature: puffy inflated cards, multi-layer shadows,
   pastel backgrounds, thick outlines, bouncy animations
═══════════════════════════════════════════════════════════════ */
const CSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body, #root { height: 100%; }
    body { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; }

    :root {
      /* Clay palette */
      --sky:    #E8F4FF;
      --mint:   #E2FBF0;
      --peach:  #FFF0E6;
      --lemon:  #FFFBE6;
      --lilac:  #F3EEFF;
      --rose:   #FFF0F4;

      /* Accent solids */
      --blue:   #4D9FFF;
      --green:  #3DD68C;
      --orange: #FF8C47;
      --yellow: #FFD447;
      --purple: #A478FF;
      --pink:   #FF6FA8;
      --red:    #FF5C5C;
      --teal:   #2ECFCF;

      /* Darks (for text/outlines) */
      --blue-d:   #1A6FD4;
      --green-d:  #1A9E62;
      --orange-d: #CC5F1A;
      --purple-d: #7040D0;
      --pink-d:   #CC3E78;

      /* Neutrals */
      --bg:     #F0F4FF;
      --white:  #FFFFFF;
      --ink:    #2B2D42;
      --ink2:   #5C607A;
      --ink3:   #9EA4BC;
      --border: rgba(0,0,0,0.07);

      /* Clay shadows = 3 layers: outer soft, outer medium, inner highlight */
      --clay-blue:   0 4px 0 #1A6FD4, 0 8px 24px rgba(77,159,255,.35), inset 0 2px 4px rgba(255,255,255,.7);
      --clay-green:  0 4px 0 #1A9E62, 0 8px 24px rgba(61,214,140,.35), inset 0 2px 4px rgba(255,255,255,.7);
      --clay-orange: 0 4px 0 #CC5F1A, 0 8px 24px rgba(255,140,71,.35), inset 0 2px 4px rgba(255,255,255,.7);
      --clay-purple: 0 4px 0 #7040D0, 0 8px 24px rgba(164,120,255,.35), inset 0 2px 4px rgba(255,255,255,.7);
      --clay-pink:   0 4px 0 #CC3E78, 0 8px 24px rgba(255,111,168,.35), inset 0 2px 4px rgba(255,255,255,.7);
      --clay-yellow: 0 4px 0 #C49A00, 0 8px 24px rgba(255,212,71,.4),  inset 0 2px 4px rgba(255,255,255,.7);
      --clay-red:    0 4px 0 #C42020, 0 8px 24px rgba(255,92,92,.35),  inset 0 2px 4px rgba(255,255,255,.7);
      --clay-white:  0 4px 0 #C8CEEC, 0 8px 24px rgba(0,0,0,.12),      inset 0 2px 4px rgba(255,255,255,.9);
      --clay-card:   0 6px 0 #C0C8E8, 0 12px 32px rgba(0,0,0,.1),      inset 0 2px 6px rgba(255,255,255,.85);
    }

    .app {
      max-width: 430px; margin: 0 auto;
      height: 100vh; height: 100dvh;
      display: flex; flex-direction: column;
      background: var(--bg);
      position: relative; overflow: hidden;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(77,159,255,.12) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(164,120,255,.12) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(61,214,140,.08) 0%, transparent 60%);
    }

    .scr { flex: 1; overflow-y: auto; overflow-x: hidden; }
    .scr::-webkit-scrollbar { display: none; }

    /* ── ANIMATIONS ── */
    @keyframes bounceIn {
      0%   { opacity:0; transform:scale(0.5) translateY(20px); }
      60%  { opacity:1; transform:scale(1.08) translateY(-6px); }
      80%  { transform:scale(0.96) translateY(2px); }
      100% { transform:scale(1) translateY(0); }
    }
    @keyframes floatUp {
      0%   { opacity:0; transform:translateY(18px); }
      100% { opacity:1; transform:translateY(0); }
    }
    @keyframes slideUp  { from{transform:translateY(110%);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes jelly {
      0%,100% { transform:scale(1,1); }
      30%     { transform:scale(1.1,.9); }
      50%     { transform:scale(0.95,1.05); }
      70%     { transform:scale(1.03,.97); }
    }
    @keyframes wobble {
      0%,100% { transform:rotate(0deg); }
      25%     { transform:rotate(-6deg); }
      75%     { transform:rotate(6deg); }
    }
    @keyframes xpPop {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-160%) scale(1.3); }
    }
    @keyframes swipeR { to { transform:translateX(130%) rotate(18deg); opacity:0; } }
    @keyframes swipeL { to { transform:translateX(-130%) rotate(-18deg); opacity:0; } }
    @keyframes shake  {
      0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)}
      40%{transform:translateX(7px)}   60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
    }
    @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes cardFlip {
      0%   { transform:rotateY(0deg); }
      100% { transform:rotateY(180deg); }
    }
    @keyframes streak { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.3) rotate(-8deg)} }
    @keyframes popCheck {
      0%   { transform:scale(0); opacity:0; }
      60%  { transform:scale(1.3); opacity:1; }
      100% { transform:scale(1);  opacity:1; }
    }

    .bounce-in  { animation: bounceIn .55s cubic-bezier(.22,1,.36,1) both; }
    .float-up   { animation: floatUp .38s cubic-bezier(.22,1,.36,1) both; }
    .jelly      { animation: jelly .5s ease; }

    /* ── CLAY CARD base ── */
    .clay {
      border-radius: 24px;
      border: 2.5px solid var(--border);
      box-shadow: var(--clay-card);
      background: var(--white);
      transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s;
    }
    .clay:active { transform: translateY(3px); box-shadow: 0 1px 0 #C0C8E8, 0 4px 12px rgba(0,0,0,.1), inset 0 2px 6px rgba(255,255,255,.85); }

    /* ── CLAY BUTTONS ── */
    .cbtn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      border: none; cursor: pointer;
      font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 15px;
      border-radius: 18px; padding: 15px 22px; width: 100%;
      transition: all .16s cubic-bezier(.22,1,.36,1);
      touch-action: manipulation; -webkit-user-select: none; user-select: none;
      border: 2.5px solid transparent;
      position: relative; overflow: hidden;
    }
    .cbtn:active { transform: translateY(3px); }

    .cbtn-blue   { background: var(--blue);   color:#fff; border-color:#1A6FD4; box-shadow: var(--clay-blue); }
    .cbtn-blue:active   { box-shadow: 0 1px 0 #1A6FD4, 0 2px 8px rgba(77,159,255,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-green  { background: var(--green);  color:#fff; border-color:#1A9E62; box-shadow: var(--clay-green); }
    .cbtn-green:active  { box-shadow: 0 1px 0 #1A9E62, 0 2px 8px rgba(61,214,140,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-orange { background: var(--orange); color:#fff; border-color:#CC5F1A; box-shadow: var(--clay-orange); }
    .cbtn-orange:active { box-shadow: 0 1px 0 #CC5F1A, 0 2px 8px rgba(255,140,71,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-purple { background: var(--purple); color:#fff; border-color:#7040D0; box-shadow: var(--clay-purple); }
    .cbtn-purple:active { box-shadow: 0 1px 0 #7040D0, 0 2px 8px rgba(164,120,255,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-pink   { background: var(--pink);   color:#fff; border-color:#CC3E78; box-shadow: var(--clay-pink); }
    .cbtn-pink:active   { box-shadow: 0 1px 0 #CC3E78, 0 2px 8px rgba(255,111,168,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-yellow { background: var(--yellow); color:#7A5500; border-color:#C49A00; box-shadow: var(--clay-yellow); }
    .cbtn-yellow:active { box-shadow: 0 1px 0 #C49A00, 0 2px 8px rgba(255,212,71,.3), inset 0 2px 4px rgba(255,255,255,.4); }
    .cbtn-white  { background: var(--white);  color:var(--ink); border-color:#C8CEEC; box-shadow: var(--clay-white); }
    .cbtn-white:active  { box-shadow: 0 1px 0 #C8CEEC, 0 2px 8px rgba(0,0,0,.08), inset 0 2px 4px rgba(255,255,255,.85); }
    .cbtn-red    { background: var(--red);    color:#fff; border-color:#C42020; box-shadow: var(--clay-red); }
    .cbtn-red:active    { box-shadow: 0 1px 0 #C42020, 0 2px 8px rgba(255,92,92,.3), inset 0 2px 4px rgba(255,255,255,.4); }

    /* ── PILL CHIPS ── */
    .chips { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; }
    .chips::-webkit-scrollbar { display:none; }
    .chip {
      flex-shrink: 0; padding: 7px 16px; border-radius: 50px;
      font-size: 13px; font-weight: 800; cursor: pointer;
      border: 2.5px solid rgba(0,0,0,.1);
      background: var(--white); color: var(--ink2);
      box-shadow: 0 3px 0 rgba(0,0,0,.12), inset 0 1px 3px rgba(255,255,255,.9);
      transition: all .14s; touch-action: manipulation;
      font-family: 'Nunito', sans-serif;
    }
    .chip:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.1); }
    .chip.on { background: var(--blue); color: #fff; border-color: #1A6FD4; box-shadow: 0 3px 0 #1A6FD4, inset 0 1px 3px rgba(255,255,255,.4); }

    /* ── PROGRESS BAR ── */
    .pbar { height: 14px; background: rgba(0,0,0,.08); border-radius: 99px; overflow: hidden; border: 2px solid rgba(0,0,0,.07); box-shadow: inset 0 2px 4px rgba(0,0,0,.1); }
    .pfill { height: 100%; border-radius: 99px; transition: width .55s cubic-bezier(.22,1,.36,1); background: linear-gradient(90deg, var(--blue), var(--teal)); box-shadow: inset 0 1px 3px rgba(255,255,255,.5); }
    .pfill.green  { background: linear-gradient(90deg, var(--green), var(--teal)); }
    .pfill.orange { background: linear-gradient(90deg, var(--orange), var(--yellow)); }
    .pfill.purple { background: linear-gradient(90deg, var(--purple), var(--pink)); }
    .pfill.gold   { background: linear-gradient(90deg, var(--yellow), var(--orange)); }

    /* ── CLAY NAV ── */
    .nav {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: var(--white); border-top: 3px solid rgba(0,0,0,.07);
      display: flex; align-items: stretch; padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -4px 20px rgba(0,0,0,.08);
    }
    .ni { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; cursor:pointer; padding:8px 0; min-height:58px; touch-action:manipulation; transition:transform .12s; }
    .ni:active { transform: scale(.88); }
    .ni-icon { width:38px; height:38px; border-radius:14px; display:flex; align-items:center; justify-content:center; transition:all .18s; }
    .ni.on .ni-icon { background: var(--sky); box-shadow: 0 2px 0 #A0BBEA, inset 0 1px 3px rgba(255,255,255,.8); transform: translateY(-2px); }
    .ni-lbl { font-size:10px; font-weight:800; color:var(--ink3); transition:color .18s; font-family:'Nunito',sans-serif; }
    .ni.on .ni-lbl { color:var(--blue-d); }

    /* ── LEVEL BADGES ── */
    .lv { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800; border:2px solid; }
    .la1 { background:#D1FAE5; color:#065F46; border-color:#6EE7B7; }
    .la2 { background:#DBEAFE; color:#1E40AF; border-color:#93C5FD; }
    .lb1 { background:#EDE9FE; color:#5B21B6; border-color:#C4B5FD; }
    .lb2 { background:#FEF3C7; color:#92400E; border-color:#FCD34D; }
    .lc1 { background:#FFE4E6; color:#9F1239; border-color:#FCA5A5; }

    /* ── FLASH CARD ── */
    .fscene { perspective: 1200px; }
    .finner { transform-style: preserve-3d; transition: transform .6s cubic-bezier(.22,1,.36,1); }
    .finner.flipped { transform: rotateY(180deg); }
    .fface { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .fback { position: absolute; inset: 0; transform: rotateY(180deg); }

    /* ── SWIPE HINTS ── */
    .sbadge { position:absolute; top:18px; padding:7px 16px; border-radius:50px; font-size:14px; font-weight:800; opacity:0; pointer-events:none; z-index:10; transition:opacity .1s; border:2.5px solid; }
    .sbadge.L { left:14px; background:var(--rose); color:var(--red); border-color:var(--red); transform:rotate(-12deg); }
    .sbadge.R { right:14px; background:var(--mint); color:var(--green-d); border-color:var(--green); transform:rotate(12deg); }

    /* ── QUIZ OPTION ── */
    .qopt {
      width:100%; text-align:left; padding:14px 16px;
      background:var(--white); border:2.5px solid rgba(0,0,0,.1);
      border-radius:18px; cursor:pointer; touch-action:manipulation;
      display:flex; align-items:center; gap:12px;
      font-family:'Nunito',sans-serif; font-size:14px; font-weight:700; color:var(--ink);
      box-shadow: 0 4px 0 rgba(0,0,0,.1), inset 0 2px 4px rgba(255,255,255,.8);
      transition: all .14s;
    }
    .qopt:active:not(:disabled) { transform:translateY(3px); box-shadow:0 1px 0 rgba(0,0,0,.08); }
    .qopt.ok { background:var(--mint); border-color:var(--green); color:var(--green-d); box-shadow:0 4px 0 var(--green-d), 0 8px 20px rgba(61,214,140,.3), inset 0 2px 4px rgba(255,255,255,.7); }
    .qopt.no { background:var(--rose); border-color:var(--red); color:var(--red); box-shadow:0 4px 0 #C42020, 0 8px 20px rgba(255,92,92,.3), inset 0 2px 4px rgba(255,255,255,.7); }

    /* ── CLAY INPUT ── */
    .cinput {
      width:100%; background:var(--white); border:2.5px solid rgba(0,0,0,.1);
      border-radius:18px; padding:14px 16px;
      font-family:'Nunito',sans-serif; font-size:15px; font-weight:700; color:var(--ink);
      outline:none;
      box-shadow: 0 4px 0 rgba(0,0,0,.1), inset 0 3px 6px rgba(0,0,0,.06);
      transition:all .15s;
    }
    .cinput:focus { border-color:var(--blue); box-shadow:0 4px 0 #1A6FD4, 0 8px 20px rgba(77,159,255,.2), inset 0 3px 6px rgba(77,159,255,.08); }
    .cinput.ok { border-color:var(--green); background:var(--mint); box-shadow:0 4px 0 var(--green-d), inset 0 3px 6px rgba(61,214,140,.08); }
    .cinput.no { border-color:var(--red); background:var(--rose); box-shadow:0 4px 0 #C42020, inset 0 3px 6px rgba(255,92,92,.08); animation:shake .35s ease; }
    .cinput::placeholder { color:var(--ink3); }

    /* ── SEARCH ── */
    .sbox { display:flex; align-items:center; gap:10px; background:var(--white); border:2.5px solid rgba(0,0,0,.1); border-radius:18px; padding:0 14px; box-shadow:0 4px 0 rgba(0,0,0,.1), inset 0 2px 5px rgba(0,0,0,.05); transition:border-color .14s; }
    .sbox:focus-within { border-color:var(--blue); box-shadow:0 4px 0 #1A6FD4, inset 0 2px 5px rgba(77,159,255,.07); }
    .sbox input { flex:1; background:transparent; border:none; outline:none; padding:13px 0; font-family:'Nunito',sans-serif; font-size:14px; font-weight:700; color:var(--ink); }
    .sbox input::placeholder { color:var(--ink3); }

    /* ── MODAL ── */
    .overlay { position:fixed; inset:0; background:rgba(20,20,40,.45); z-index:200; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn .2s; }
    .sheet { width:100%; max-width:430px; background:var(--white); border-radius:28px 28px 0 0; padding:22px 20px max(20px,env(safe-area-inset-bottom)); animation:slideUp .34s cubic-bezier(.22,1,.36,1); max-height:90vh; overflow-y:auto; border-top:3px solid rgba(0,0,0,.07); box-shadow:0 -8px 40px rgba(0,0,0,.18); }
    .handle { width:40px; height:5px; background:rgba(0,0,0,.15); border-radius:3px; margin:0 auto 20px; }

    /* ── TOGGLE ── */
    .trow { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:2px solid rgba(0,0,0,.06); }
    .tgl { width:52px; height:30px; border-radius:15px; cursor:pointer; position:relative; border:2.5px solid rgba(0,0,0,.12); transition:background .22s; flex-shrink:0; }
    .tgl.on  { background:var(--green); border-color:var(--green-d); box-shadow:0 3px 0 var(--green-d), inset 0 1px 4px rgba(255,255,255,.4); }
    .tgl.off { background:#DDE2F0; box-shadow:0 3px 0 #B0BAD8, inset 0 2px 4px rgba(0,0,0,.08); }
    .tknob { width:22px; height:22px; background:#fff; border-radius:50%; position:absolute; top:1px; transition:left .22s cubic-bezier(.22,1,.36,1); box-shadow:0 2px 4px rgba(0,0,0,.2); }
    .tgl.on  .tknob { left:26px; }
    .tgl.off .tknob { left:3px; }

    /* ── XP POPUP ── */
    .xppop { position:fixed; top:40%; left:50%; font-family:'Fredoka',sans-serif; font-size:26px; font-weight:700; padding:14px 30px; border-radius:50px; z-index:999; animation:xpPop 1.2s ease forwards; pointer-events:none; white-space:nowrap; background:var(--yellow); color:#7A5500; border:3px solid #C49A00; box-shadow:var(--clay-yellow); }

    /* ── WORD ROW ── */
    .wrow { display:flex; align-items:center; gap:12px; padding:13px 16px; border-bottom:2px solid rgba(0,0,0,.06); cursor:pointer; transition:background .1s; touch-action:manipulation; }
    .wrow:active { background:var(--sky); }
    .wavt { width:44px; height:44px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; flex-shrink:0; font-family:'Fredoka',sans-serif; border:2.5px solid rgba(0,0,0,.1); box-shadow:0 3px 0 rgba(0,0,0,.12), inset 0 1px 3px rgba(255,255,255,.8); }

    /* ── STAT TILE ── */
    .stile { border-radius:22px; padding:16px 12px; display:flex; flex-direction:column; align-items:center; gap:5px; border:2.5px solid rgba(0,0,0,.08); box-shadow:0 5px 0 rgba(0,0,0,.1), inset 0 2px 5px rgba(255,255,255,.8); }

    /* ── ACHIEVEMENT ── */
    .ach { display:flex; align-items:center; gap:12px; padding:14px; border-radius:20px; border:2.5px solid rgba(0,0,0,.08); box-shadow:0 4px 0 rgba(0,0,0,.1), inset 0 2px 4px rgba(255,255,255,.8); background:var(--white); transition:all .15s; }
    .ach.on { background:var(--lemon); border-color:var(--yellow); box-shadow:0 4px 0 #C49A00, 0 8px 20px rgba(255,212,71,.3), inset 0 2px 4px rgba(255,255,255,.8); }

    /* ── LB ROW ── */
    .lbrow { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:16px; transition:background .12s; }
    .lbrow.me { background:var(--sky); border:2px solid rgba(77,159,255,.25); }

    /* ── SECTION TITLE ── */
    .stitle { font-family:'Fredoka',sans-serif; font-size:18px; font-weight:600; color:var(--ink); margin-bottom:12px; }

    .padded { padding: 14px 16px 90px; }
    .toppad { padding-top: 58px; }

    /* ── BG BLOBS ── */
    .blob {
      position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
      filter: blur(60px); opacity: .55;
    }
  `}</style>
);

/* ── WORDS ──────────────────────────────────────────────────────────────── */
const W=(id,word,pron,pos,level,def,ex,tr,cat)=>({id,word,pronunciation:pron,partOfSpeech:pos,level,definition:def,exampleSentence:ex,turkishMeaning:tr,category:cat,learned:false,reviewCount:0,lastSeen:null});
const WORDS=[
  W(1,"abundant","/əˈbʌndənt/","adjective","B1","existing in large quantities","The garden was abundant with vegetables.","bol, bereketli","general"),
  W(2,"achieve","/əˈtʃiːv/","verb","A2","to succeed after hard work","She worked hard to achieve her goals.","başarmak","personal development"),
  W(3,"adapt","/əˈdæpt/","verb","B1","to change to fit a new situation","Animals adapt to survive.","uyum sağlamak","general"),
  W(4,"admire","/ədˈmaɪər/","verb","A2","to respect and approve of someone","I admire her courage.","hayranlık duymak","emotion"),
  W(5,"adventure","/ədˈventʃər/","noun","A2","an exciting experience","The trip was a real adventure.","macera, serüven","daily life"),
  W(6,"afford","/əˈfɔːrd/","verb","A2","to have enough money","I can't afford a new car.","karşılayabilmek","business"),
  W(7,"aggressive","/əˈɡresɪv/","adjective","B1","behaving in an angry way","The dog became aggressive.","saldırgan","emotion"),
  W(8,"agreement","/əˈɡriːmənt/","noun","A2","a shared decision","They reached an agreement.","anlaşma","business"),
  W(9,"allow","/əˈlaʊ/","verb","A1","to give permission","The teacher allows phones.","izin vermek","daily life"),
  W(10,"although","/ɔːlˈðoʊ/","conjunction","A2","despite the fact that","Although it rained, we went.","her ne kadar","grammar"),
  W(11,"ambition","/æmˈbɪʃən/","noun","B1","a strong desire to achieve","Her ambition is to be a doctor.","hırs, hedef","personal development"),
  W(12,"ancient","/ˈeɪnʃənt/","adjective","A2","very old, from long ago","The ancient ruins are impressive.","antik, eski","history"),
  W(13,"angry","/ˈæŋɡri/","adjective","A1","feeling strong displeasure","She was angry when she failed.","kızgın, sinirli","emotion"),
  W(14,"announce","/əˈnaʊns/","verb","A2","to tell people officially","They announced the launch.","duyurmak","business"),
  W(15,"anxious","/ˈæŋkʃəs/","adjective","B1","worried and nervous","She felt anxious before the exam.","endişeli, kaygılı","emotion"),
  W(16,"approach","/əˈproʊtʃ/","verb","B1","to come near something","He slowly approached the deer.","yaklaşmak","general"),
  W(17,"appropriate","/əˈproʊpriɪt/","adjective","B1","suitable for a situation","Wear appropriate clothing.","uygun, yerinde","general"),
  W(18,"argue","/ˈɑːrɡjuː/","verb","A2","to disagree in words","They argue about money.","tartışmak","daily life"),
  W(19,"arrange","/əˈreɪndʒ/","verb","A2","to plan or organize","Can you arrange the meeting?","ayarlamak","business"),
  W(20,"attempt","/əˈtempt/","verb","B1","to try something difficult","He attempted to climb.","denemek, girişmek","general"),
  W(21,"avoid","/əˈvɔɪd/","verb","A2","to stay away from","Avoid too much sugar.","kaçınmak","daily life"),
  W(22,"aware","/əˈwer/","adjective","B1","knowing something exists","She was aware of the risks.","farkında","general"),
  W(23,"balance","/ˈbæləns/","noun","A2","a state where things are equal","Work-life balance matters.","denge","daily life"),
  W(24,"benefit","/ˈbenɪfɪt/","noun","B1","an advantage","Exercise has many benefits.","fayda, yarar","general"),
  W(25,"brave","/breɪv/","adjective","A1","not afraid of danger","The brave firefighter helped.","cesur","emotion"),
  W(26,"brilliant","/ˈbrɪliənt/","adjective","B1","very intelligent","She has a brilliant mind.","parlak, harika","general"),
  W(27,"budget","/ˈbʌdʒɪt/","noun","A2","a plan for spending","Stick to our budget.","bütçe","business"),
  W(28,"calm","/kɑːm/","adjective","A1","quiet and not worried","Stay calm in emergencies.","sakin, huzurlu","emotion"),
  W(29,"capable","/ˈkeɪpəbəl/","adjective","B1","having the ability","She is capable of great things.","yetenekli","personal development"),
  W(30,"careful","/ˈkerfəl/","adjective","A1","giving attention","Be careful on the road.","dikkatli","daily life"),
  W(31,"challenge","/ˈtʃælɪndʒ/","noun","A2","something difficult","Language is a great challenge.","zorluk","personal development"),
  W(32,"choose","/tʃuːz/","verb","A1","to select from options","Choose any colour.","seçmek","daily life"),
  W(33,"claim","/kleɪm/","verb","B1","to say without proof","He claimed to be innocent.","iddia etmek","general"),
  W(34,"comfortable","/ˈkʌmftəbəl/","adjective","A1","feeling at ease","The sofa is comfortable.","rahat","daily life"),
  W(35,"communicate","/kəˈmjuːnɪkeɪt/","verb","A2","to share information","Communicate clearly.","iletişim kurmak","business"),
  W(36,"compete","/kəmˈpiːt/","verb","A2","to try to win","Athletes from 50 countries compete.","rekabet etmek","sports"),
  W(37,"complex","/ˈkɒmpleks/","adjective","B2","having many parts","The problem is complex.","karmaşık","general"),
  W(38,"concern","/kənˈsɜːrn/","noun","B1","a feeling of worry","Pollution is a major concern.","endişe","general"),
  W(39,"confident","/ˈkɒnfɪdənt/","adjective","A2","sure about abilities","She felt confident.","kendinden emin","personal development"),
  W(40,"consider","/kənˈsɪdər/","verb","A2","to think carefully","Consider all options.","düşünmek","general"),
  W(41,"contribute","/kənˈtrɪbjuːt/","verb","B1","to give effort","Everyone can contribute.","katkıda bulunmak","general"),
  W(42,"creative","/kriˈeɪtɪv/","adjective","A2","able to make original things","She is creative.","yaratıcı","personal development"),
  W(43,"curious","/ˈkjʊəriəs/","adjective","A2","wanting to know","Children are curious.","meraklı","emotion"),
  W(44,"danger","/ˈdeɪndʒər/","noun","A1","possibility of harm","They were in danger.","tehlike","general"),
  W(45,"decide","/dɪˈsaɪd/","verb","A1","to make a choice","We need to decide.","karar vermek","daily life"),
  W(46,"dedicated","/ˈdedɪkeɪtɪd/","adjective","B1","giving a lot of effort","She is dedicated.","adanmış, kararlı","personal development"),
  W(47,"demand","/dɪˈmænd/","verb","B1","to ask firmly","Workers demanded better pay.","talep etmek","business"),
  W(48,"depend","/dɪˈpend/","verb","A2","to need support","Children depend on parents.","bağlı olmak","daily life"),
  W(49,"describe","/dɪˈskraɪb/","verb","A1","to say what something is like","Describe what you saw.","tanımlamak","general"),
  W(50,"determine","/dɪˈtɜːrmɪn/","verb","B1","to find out","Scientists determined the cause.","belirlemek","general"),
  W(51,"develop","/dɪˈveləp/","verb","A2","to grow or improve","The city developed fast.","geliştirmek","general"),
  W(52,"disappointed","/ˌdɪsəˈpɔɪntɪd/","adjective","A2","unhappy because of failed expectations","He was disappointed.","hayal kırıklığına uğramış","emotion"),
  W(53,"discover","/dɪˈskʌvər/","verb","A2","to find for the first time","They discovered a species.","keşfetmek","general"),
  W(54,"display","/dɪˈspleɪ/","verb","B1","to show visibly","The museum displays artifacts.","sergilemek","general"),
  W(55,"eager","/ˈiːɡər/","adjective","B1","very enthusiastic","Students were eager to learn.","istekli, hevesli","emotion"),
  W(56,"effective","/ɪˈfektɪv/","adjective","B1","producing results","Exercise is effective.","etkili","general"),
  W(57,"effort","/ˈefɪt/","noun","A2","energy to do something","The project took effort.","çaba, gayret","personal development"),
  W(58,"embarrassed","/ɪmˈbærəst/","adjective","A2","feeling ashamed","She was embarrassed.","utanmış","emotion"),
  W(59,"encourage","/ɪnˈkɜːrɪdʒ/","verb","A2","to give confidence","Parents encourage reading.","teşvik etmek","daily life"),
  W(60,"enormous","/ɪˈnɔːrməs/","adjective","A2","extremely large","The elephant was enormous.","devasa","general"),
  W(61,"establish","/ɪˈstæblɪʃ/","verb","B2","to create something lasting","It was established in 1990.","kurmak","business"),
  W(62,"evaluate","/ɪˈvæljueɪt/","verb","B2","to judge quality","We need to evaluate results.","değerlendirmek","education"),
  W(63,"eventually","/ɪˈventʃuəli/","adverb","A2","in the end","She eventually found the keys.","sonunda","general"),
  W(64,"exhausted","/ɪɡˈzɔːstɪd/","adjective","A2","extremely tired","She felt exhausted.","bitkin, yorgun","emotion"),
  W(65,"experience","/ɪkˈspɪəriəns/","noun","A1","knowledge from doing","She has five years of experience.","deneyim","personal development"),
  W(66,"explain","/ɪkˈspleɪn/","verb","A1","to make something clear","Explain how this works.","açıklamak","daily life"),
  W(67,"fail","/feɪl/","verb","A1","to not succeed","He failed the test.","başarısız olmak","daily life"),
  W(68,"familiar","/fəˈmɪliər/","adjective","B1","well known","The song sounded familiar.","aşina","general"),
  W(69,"flexible","/ˈfleksɪbəl/","adjective","B1","able to change","A flexible schedule helps.","esnek","business"),
  W(70,"focus","/ˈfoʊkəs/","verb","A2","to give attention","Focus on your studies.","odaklanmak","personal development"),
  W(71,"fortunate","/ˈfɔːrtʃənɪt/","adjective","B1","lucky","She was fortunate to survive.","şanslı","general"),
  W(72,"generous","/ˈdʒenərəs/","adjective","A2","willing to give","He was generous.","cömert","emotion"),
  W(73,"gradually","/ˈɡrædʒuəli/","adverb","B1","slowly over time","Her English gradually improved.","yavaş yavaş","general"),
  W(74,"grateful","/ˈɡreɪtfəl/","adjective","A2","feeling thankful","I am grateful.","minnettâr","emotion"),
  W(75,"handle","/ˈhændəl/","verb","A2","to deal with","She handles difficult situations.","başa çıkmak","business"),
  W(76,"hesitate","/ˈhezɪteɪt/","verb","B1","to pause because unsure","Don't hesitate to ask.","tereddüt etmek","general"),
  W(77,"honest","/ˈɒnɪst/","adjective","A1","telling the truth","Be honest with me.","dürüst","personal development"),
  W(78,"ignore","/ɪɡˈnɔːr/","verb","A2","to pay no attention","She ignored his comments.","görmezden gelmek","daily life"),
  W(79,"improve","/ɪmˈpruːv/","verb","A1","to become better","Practice to improve.","geliştirmek","personal development"),
  W(80,"include","/ɪnˈkluːd/","verb","A1","to have as part of a group","Price includes breakfast.","dahil etmek","general"),
  W(81,"increase","/ɪnˈkriːs/","verb","A1","to become larger","Sales increased by 20%.","artmak","business"),
  W(82,"individual","/ˌɪndɪˈvɪdʒuəl/","noun","B1","a single person","Each individual has strengths.","birey","general"),
  W(83,"influence","/ˈɪnfluəns/","noun","B1","the power to change","Music influences emotions.","etki","general"),
  W(84,"involve","/ɪnˈvɒlv/","verb","A2","to include as a part","The job involves travel.","içermek","general"),
  W(85,"jealous","/ˈdʒeləs/","adjective","A2","unhappy that others have more","He felt jealous.","kıskanç","emotion"),
  W(86,"knowledge","/ˈnɒlɪdʒ/","noun","A2","understanding from study","Knowledge is power.","bilgi","personal development"),
  W(87,"launch","/lɔːntʃ/","verb","B1","to start something new","They will launch the product.","başlatmak","business"),
  W(88,"limit","/ˈlɪmɪt/","noun","A2","the greatest amount allowed","There is a speed limit.","sınır","general"),
  W(89,"logical","/ˈlɒdʒɪkəl/","adjective","B2","using sensible reasoning","Her thinking was logical.","mantıklı","general"),
  W(90,"manage","/ˈmænɪdʒ/","verb","A2","to be in control","She manages a team.","yönetmek","business"),
  W(91,"mention","/ˈmenʃən/","verb","A2","to speak briefly about","Did you mention my name?","bahsetmek","daily life"),
  W(92,"necessary","/ˈnesəseri/","adjective","A2","needed","A seatbelt is necessary.","gerekli","general"),
  W(93,"obvious","/ˈɒbviəs/","adjective","B1","easy to understand","The answer is obvious.","açık, belirgin","general"),
  W(94,"patient","/ˈpeɪʃənt/","adjective","A2","able to wait calmly","Be patient.","sabırlı","emotion"),
  W(95,"prefer","/prɪˈfɜːr/","verb","A1","to like something better","I prefer tea.","tercih etmek","daily life"),
  W(96,"prevent","/prɪˈvent/","verb","A2","to stop something bad","Wash hands to prevent illness.","önlemek","daily life"),
  W(97,"realize","/ˈriːəlaɪz/","verb","A1","to become aware","I didn't realize it was late.","fark etmek","general"),
  W(98,"reduce","/rɪˈdjuːs/","verb","A2","to make smaller","Reduce emissions.","azaltmak","general"),
  W(99,"responsible","/rɪˈspɒnsɪbəl/","adjective","A2","having a duty","Parents are responsible.","sorumlu","daily life"),
  W(100,"struggle","/ˈstrʌɡəl/","verb","A2","to try hard","Many struggle with maths.","mücadele etmek","personal development"),
];

/* ── STATE ──────────────────────────────────────────────────────────────── */
const INIT = () => {
  try {
    const r = localStorage.getItem("engwords") || localStorage.getItem("wu5");
    if (r) { const p = JSON.parse(r); return { ...p, words: WORDS.map(w=>({...w,...(p.words?.find(x=>x.id===w.id)||{})})) }; }
  } catch {}
  return { words:[...WORDS], xp:0, streak:0, lastDate:null, dailyGoal:10, dailyDone:0, showTurkish:false, history:[], failedIds:[], achievements:[] };
};
function reducer(s,a) {
  switch(a.type) {
    case "LEARN": {
      const words=s.words.map(w=>w.id===a.id?{...w,learned:true,reviewCount:w.reviewCount+1,lastSeen:Date.now()}:w);
      const today=new Date().toDateString(); const h=[...s.history]; const ti=h.findIndex(x=>x.date===today);
      if(ti>=0) h[ti].count++; else h.push({date:today,count:1});
      return {...s,words,xp:s.xp+10,dailyDone:s.dailyDone+1,history:h};
    }
    case "SKIP":    return {...s,words:s.words.map(w=>w.id===a.id?{...w,reviewCount:w.reviewCount+1,lastSeen:Date.now()}:w),failedIds:s.failedIds.includes(a.id)?s.failedIds:[...s.failedIds,a.id]};
    case "QOK":     return {...s,xp:s.xp+5};
    case "QFAIL":   return {...s,failedIds:s.failedIds.includes(a.id)?s.failedIds:[...s.failedIds,a.id]};
    case "PERFECT": return {...s,xp:s.xp+20};
    case "STREAK":  { const t=new Date().toDateString(); if(s.lastDate===t) return s; const y=new Date(Date.now()-86400000).toDateString(); return {...s,streak:s.lastDate===y?s.streak+1:1,lastDate:t}; }
    case "GOAL":    return {...s,dailyGoal:a.v};
    case "TR":      return {...s,showTurkish:!s.showTurkish};
    case "RESET":   return {...INIT()};
    default:        return s;
  }
}

/* ── ICONS ──────────────────────────────────────────────────────────────── */
const P={
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z|M9 22V12h6v10",
  cards:"M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z|M7 10h10|M7 14h6",
  quiz:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10|M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3|M12 17h.01",
  book:"M4 19.5A2.5 2.5 0 016.5 17H20|M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  chart:"M18 20V10|M12 20V4|M6 20v-6",
  cog:"M12 15a3 3 0 100-6 3 3 0 000 6|M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  ok:"M20 6L9 17l-5-5",
  xx:"M18 6L6 18|M6 6l12 12",
  srch:"M21 21l-4.35-4.35|M17 11A6 6 0 115 11a6 6 0 0112 0z",
  redo:"M1 4v6h6|M23 20v-6h-6|M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
};
const Ico=({n,s=22,c="currentColor"})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    {(P[n]||"").split("|").map((d,i)=><path key={i} d={d}/>)}
  </svg>
);

/* ── HELPERS ─────────────────────────────────────────────────────────────── */
const Lv=({level})=><span className={`lv l${level?.toLowerCase()}`}>{level}</span>;

const XPPop=({n,onDone})=>{
  useEffect(()=>{const t=setTimeout(onDone,1200);return()=>clearTimeout(t);},[]);
  return <div className="xppop">+{n} XP ⚡</div>;
};

/* clay color palette per category */
const CAT_COLORS={
  emotion:     {bg:"#FFF0F4",border:"#FF6FA8",shadow:"#CC3E78",text:"#9F1239",ico:"💜"},
  business:    {bg:"#E8F4FF",border:"#4D9FFF",shadow:"#1A6FD4",text:"#1E3A8A",ico:"💼"},
  "daily life":{bg:"#E2FBF0",border:"#3DD68C",shadow:"#1A9E62",text:"#065F46",ico:"🌿"},
  general:     {bg:"#F3EEFF",border:"#A478FF",shadow:"#7040D0",text:"#4B2A8E",ico:"✨"},
  "personal development":{bg:"#FFF0E6",border:"#FF8C47",shadow:"#CC5F1A",text:"#7C2D12",ico:"🚀"},
  history:     {bg:"#FFFBE6",border:"#FFD447",shadow:"#C49A00",text:"#7A5500",ico:"🏛️"},
  science:     {bg:"#E2FBF0",border:"#2ECFCF",shadow:"#1A9898",text:"#134E4A",ico:"🔬"},
  education:   {bg:"#EFF6FF",border:"#4D9FFF",shadow:"#1A6FD4",text:"#1E3A8A",ico:"📚"},
  sports:      {bg:"#FFF0E6",border:"#FF8C47",shadow:"#CC5F1A",text:"#7C2D12",ico:"⚽"},
  grammar:     {bg:"#F3EEFF",border:"#A478FF",shadow:"#7040D0",text:"#4B2A8E",ico:"📝"},
};
const getCC=(cat)=>CAT_COLORS[cat]||CAT_COLORS.general;

/* ── FLASH CARD ─────────────────────────────────────────────────────────── */
const FlashCard=({word,onKnow,onSkip,idx,total,showTurkish})=>{
  const [flip,setFlip]=useState(false);
  const [dx,setDx]=useState(0);
  const [drag,setDrag]=useState(false);
  const [exit,setExit]=useState(null);
  const sx=useRef(null);
  const cc=getCC(word?.category);

  useEffect(()=>{setFlip(false);setDx(0);setExit(null);},[word?.id]);
  const onS=x=>{sx.current=x;};
  const onM=x=>{if(!sx.current)return;const d=x-sx.current;if(Math.abs(d)>5)setDrag(true);setDx(d);};
  const onE=()=>{
    if(dx>65){setExit("r");setTimeout(onKnow,300);}
    else if(dx<-65){setExit("l");setTimeout(onSkip,300);}
    else{setDx(0);setDrag(false);}
    sx.current=null;
  };
  const tap=()=>{if(!drag)setFlip(f=>!f);setDrag(false);};
  const rot=Math.min(Math.max(dx/18,-10),10);
  const lo=Math.min(Math.max(-dx/65,0),1), ro=Math.min(Math.max(dx/65,0),1);
  const cs=exit
    ?{animation:`${exit==="r"?"swipeR":"swipeL"} .3s ease forwards`}
    :{transform:`translateX(${dx}px) rotate(${rot}deg)${flip?" rotateY(180deg)":""}`,transition:drag?"none":"transform .6s cubic-bezier(.22,1,.36,1)"};

  return (
    <div>
      {/* step dots */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"0 2px"}}>
        <span style={{fontSize:13,color:"var(--ink3)",fontWeight:800,fontFamily:"'Fredoka',sans-serif"}}>{idx+1} / {total}</span>
        <div style={{display:"flex",gap:4}}>
          {Array.from({length:Math.min(total,10)}).map((_,i)=>(
            <div key={i} style={{width:20,height:6,borderRadius:3,background:i<=idx?"var(--blue)":"rgba(0,0,0,.1)",transition:"background .2s",boxShadow:i<=idx?"0 2px 0 var(--blue-d)":"none"}}/>
          ))}
        </div>
      </div>

      <div style={{position:"relative",userSelect:"none"}}
        onMouseDown={e=>onS(e.clientX)} onMouseMove={e=>sx.current&&onM(e.clientX)} onMouseUp={onE}
        onTouchStart={e=>onS(e.touches[0].clientX)} onTouchMove={e=>onM(e.touches[0].clientX)} onTouchEnd={onE}>
        <div className="sbadge L" style={{opacity:lo}}>ATLA ✕</div>
        <div className="sbadge R" style={{opacity:ro}}>BİLİYORUM ✓</div>

        <div className="fscene" onClick={tap} style={{cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}>
          <div className="finner" style={{...cs,position:"relative",minHeight:306}}>
            {/* FRONT */}
            <div className="fface clay" style={{minHeight:306,padding:26,display:"flex",flexDirection:"column",background:`linear-gradient(145deg, #fff, ${cc.bg})`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <Lv level={word.level}/>
                <div style={{fontSize:11,fontWeight:800,color:cc.text,background:cc.bg,padding:"4px 12px",borderRadius:50,border:`2px solid ${cc.border}`,fontFamily:"'Nunito',sans-serif"}}>
                  {cc.ico} {word.category}
                </div>
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"20px 0"}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:42,fontWeight:700,color:"var(--ink)",textAlign:"center",lineHeight:1.05,textShadow:"0 2px 0 rgba(0,0,0,.06)"}}>{word.word}</div>
                <div style={{fontSize:15,color:"var(--blue)",fontStyle:"italic",fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{word.pronunciation}</div>
                <div style={{background:cc.bg,color:cc.text,padding:"5px 14px",borderRadius:50,fontSize:12,fontWeight:800,border:`2px solid ${cc.border}`,boxShadow:`0 2px 0 ${cc.shadow}`,fontFamily:"'Nunito',sans-serif"}}>{word.partOfSpeech}</div>
                {showTurkish&&<div style={{marginTop:4,fontSize:20,fontWeight:800,color:cc.text,fontFamily:"'Fredoka',sans-serif"}}>{word.turkishMeaning}</div>}
              </div>
              <div style={{textAlign:"center",fontSize:12,color:"var(--ink3)",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                <span>👆</span> Çevirmek için dokun
              </div>
            </div>
            {/* BACK */}
            <div className="fface fback clay" style={{minHeight:306,padding:22,display:"flex",flexDirection:"column",gap:10,background:`linear-gradient(145deg, ${cc.bg}, #fff)`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>{word.word}</span>
                <Lv level={word.level}/>
              </div>
              {[
                {bg:"#FFFBE6",br:"#FFD447",sh:"#C49A00",lbl:"🇹🇷 Türkçe Anlamı",lc:"#7A5500",val:word.turkishMeaning,sz:18,fw:"800",ff:"'Fredoka',sans-serif"},
                {bg:"var(--sky)",br:"#93C5FD",sh:"#3B82F6",lbl:"📖 Tanım",lc:"#1E40AF",val:word.definition,sz:13,fw:"700",ff:"'Nunito',sans-serif"},
                {bg:"var(--mint)",br:"#6EE7B7",sh:"#10B981",lbl:"💬 Örnek",lc:"#065F46",val:`"${word.exampleSentence}"`,sz:12,fw:"600",ff:"'Nunito',sans-serif",it:true},
              ].map(({bg,br,sh,lbl,lc,val,sz,fw,ff,it})=>(
                <div key={lbl} style={{background:bg,border:`2.5px solid ${br}`,borderRadius:16,padding:"10px 14px",boxShadow:`0 3px 0 ${sh}`,inset:"0 1px 3px rgba(255,255,255,.8)"}}>
                  <div style={{fontSize:9,fontWeight:800,color:lc,textTransform:"uppercase",letterSpacing:".8px",marginBottom:3,fontFamily:"'Nunito',sans-serif"}}>{lbl}</div>
                  <div style={{fontSize:sz,fontWeight:fw,color:"var(--ink)",lineHeight:1.5,fontStyle:it?"italic":"normal",fontFamily:ff}}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:12,marginTop:18}}>
        <button className="cbtn cbtn-white" onClick={onSkip} style={{flex:1,borderColor:"var(--red)",color:"var(--red)"}}>
          <Ico n="xx" s={17} c="var(--red)"/> Bilmiyorum
        </button>
        <button className="cbtn cbtn-green" onClick={onKnow} style={{flex:1}}>
          <Ico n="ok" s={17} c="#fff"/> Biliyorum
        </button>
      </div>
    </div>
  );
};

/* ── QUIZ ENGINE ─────────────────────────────────────────────────────────── */
const QTYPES=["multiChoice","fillBlank","trToEn","spelling"];
const Quiz=({words,dispatch,onXP})=>{
  const [qs,setQs]=useState([]);
  const [cur,setCur]=useState(0);
  const [score,setScore]=useState(0);
  const [sel,setSel]=useState(null);
  const [inp,setInp]=useState("");
  const [done,setDone]=useState(false);
  const [stk,setStk]=useState(0);
  const [fb,setFb]=useState(null);
  const SZ=8;
  const build=useCallback(()=>words.sort(()=>Math.random()-.5).slice(0,SZ).map(w=>({word:w,type:QTYPES[Math.floor(Math.random()*4)],dists:words.filter(x=>x.id!==w.id).sort(()=>Math.random()-.5).slice(0,3)})),[words]);
  useEffect(()=>{setQs(build());},[]);
  const q=qs[cur]; if(!q) return null;
  const ans=ok=>{
    if(sel!==null)return;
    setSel(ok?"ok":"no"); setFb(ok?"ok":"no");
    if(ok){setScore(s=>s+1);setStk(s=>s+1);dispatch({type:"QOK"});onXP(5);}
    else{setStk(0);dispatch({type:"QFAIL",id:q.word.id});}
    setTimeout(()=>{setFb(null);setSel(null);setInp("");if(cur+1>=qs.length){setDone(true);if(score+(ok?1:0)===qs.length){dispatch({type:"PERFECT"});onXP(20);}}else setCur(c=>c+1);},1000);
  };
  const restart=()=>{setQs(build());setCur(0);setScore(0);setSel(null);setInp("");setDone(false);setStk(0);};

  if(done){
    const pct=Math.round(score/qs.length*100);
    return(
      <div style={{padding:"28px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:18}} className="bounce-in">
        <div style={{fontSize:72,animation:"wobble 1s ease infinite"}}>{pct===100?"🏆":pct>=70?"🎉":"📚"}</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,fontWeight:700,marginBottom:4,color:"var(--ink)"}}>{pct===100?"Mükemmel!":pct>=70?"Harika!":"Devam et!"}</div>
          <div style={{color:"var(--ink2)",fontSize:14,fontWeight:700}}>{score}/{qs.length} doğru • %{pct}</div>
        </div>
        {pct===100&&<div style={{background:"var(--lemon)",border:"2.5px solid var(--yellow)",borderRadius:18,padding:"14px 20px",width:"100%",textAlign:"center",color:"#7A5500",fontWeight:800,boxShadow:"var(--clay-yellow)",fontFamily:"'Fredoka',sans-serif",fontSize:16}}>🌟 Mükemmel skor! +20 XP kazandın!</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%"}}>
          <div className="stile" style={{background:"var(--mint)"}}><div style={{fontSize:28,fontWeight:900,color:"var(--green-d)",fontFamily:"'Fredoka',sans-serif"}}>{score}</div><div style={{fontSize:12,color:"var(--green-d)",fontWeight:800}}>Doğru ✓</div></div>
          <div className="stile" style={{background:"var(--rose)"}}><div style={{fontSize:28,fontWeight:900,color:"var(--red)",fontFamily:"'Fredoka',sans-serif"}}>{qs.length-score}</div><div style={{fontSize:12,color:"var(--red)",fontWeight:800}}>Yanlış ✗</div></div>
        </div>
        <div style={{width:"100%"}}><div className="pbar"><div className="pfill green" style={{width:`${pct}%`}}/></div></div>
        <button className="cbtn cbtn-blue" onClick={restart} style={{gap:8}}><Ico n="redo" s={17} c="#fff"/>Tekrar Oyna</button>
      </div>
    );
  }

  const opts=(q.type==="multiChoice"||q.type==="trToEn")?[q.word,...q.dists].sort(()=>Math.random()-.5):[];
  const LL=["A","B","C","D"];

  return(
    <div style={{padding:"8px 16px 28px"}} className="float-up">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:13,color:"var(--ink3)",fontWeight:800,fontFamily:"'Fredoka',sans-serif"}}>Soru {cur+1}/{qs.length}</span>
        <div style={{display:"flex",gap:8}}>
          {stk>1&&<div style={{fontSize:12,fontWeight:800,color:"#7C2D12",background:"var(--peach)",padding:"5px 12px",borderRadius:50,border:"2px solid var(--orange)",boxShadow:"0 2px 0 var(--orange-d)",fontFamily:"'Nunito',sans-serif"}}>🔥 {stk}x seri</div>}
          <div style={{fontSize:12,fontWeight:800,color:"var(--green-d)",background:"var(--mint)",padding:"5px 12px",borderRadius:50,border:"2px solid var(--green)",boxShadow:"0 2px 0 var(--green-d)",fontFamily:"'Nunito',sans-serif"}}>✓ {score}</div>
        </div>
      </div>
      <div className="pbar" style={{marginBottom:18}}><div className="pfill purple" style={{width:`${cur/qs.length*100}%`}}/></div>

      {fb&&<div style={{position:"fixed",inset:0,background:fb==="ok"?"rgba(61,214,140,.12)":"rgba(255,92,92,.12)",zIndex:50,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:72,animation:"popCheck .4s ease"}}>{fb==="ok"?"✅":"❌"}</div></div>}

      <div className="clay" style={{padding:"18px 16px",marginBottom:14,background:`linear-gradient(145deg,#fff,var(--lilac))`}}>
        <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:"var(--purple-d)",marginBottom:10,fontFamily:"'Nunito',sans-serif"}}>
          {q.type==="multiChoice"?"📝 Çoktan Seçmeli":q.type==="fillBlank"?"✏️ Boşluk Doldur":q.type==="trToEn"?"🇹🇷 → 🇬🇧 Türkçeden İngilizceye":"🔤 Yazım"}
        </div>
        {q.type==="multiChoice"&&<div style={{fontSize:17,fontWeight:800,color:"var(--ink)",fontFamily:"'Nunito',sans-serif"}}><span style={{color:"var(--blue-d)",fontFamily:"'Fredoka',sans-serif",fontSize:22}}>"{q.word.word}"</span> ne anlama gelir?</div>}
        {q.type==="fillBlank"&&<div style={{fontSize:15,fontWeight:700,lineHeight:1.65,color:"var(--ink)"}}>{q.word.exampleSentence.replace(new RegExp(q.word.word,"gi"),"__________")}</div>}
        {q.type==="trToEn"&&<div><div style={{fontSize:12,color:"var(--ink2)",marginBottom:5,fontWeight:700}}>Türkçesi:</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,fontWeight:700,color:"var(--orange)"}}>{q.word.turkishMeaning}</div></div>}
        {q.type==="spelling"&&<div><div style={{fontSize:14,color:"var(--ink2)",lineHeight:1.6,marginBottom:8,fontWeight:700}}>{q.word.definition}</div><div style={{fontSize:12,color:"var(--ink3)",fontStyle:"italic",fontWeight:600}}>"{q.word.exampleSentence.replace(new RegExp(q.word.word,"gi"),"___")}"</div></div>}
      </div>

      {(q.type==="multiChoice"||q.type==="trToEn")&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {opts.map((o,i)=>{const cor=o.id===q.word.id;return(
            <button key={i} className={`qopt ${sel!==null&&cor?"ok":""}`} style={sel!==null&&!cor?{opacity:.45}:{}} disabled={sel!==null} onClick={()=>ans(cor)}>
              <div style={{width:28,height:28,borderRadius:9,background:cor&&sel!==null?"var(--green)":"rgba(0,0,0,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:cor&&sel!==null?"#fff":"var(--ink3)",flexShrink:0,fontFamily:"'Fredoka',sans-serif",boxShadow:"0 2px 0 rgba(0,0,0,.12)"}}>{LL[i]}</div>
              <span>{q.type==="multiChoice"?o.turkishMeaning:o.word}</span>
            </button>
          );})}
        </div>
      )}
      {(q.type==="fillBlank"||q.type==="spelling")&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input className={`cinput ${sel==="ok"?"ok":sel==="no"?"no":""}`} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sel===null&&ans(inp.trim().toLowerCase()===q.word.word.toLowerCase())} placeholder="Cevabını yaz..." disabled={sel!==null} autoCapitalize="none" autoCorrect="off" spellCheck="false"/>
          {sel!==null&&<div style={{padding:"12px 16px",borderRadius:16,background:sel==="ok"?"var(--mint)":"var(--rose)",color:sel==="ok"?"var(--green-d)":"var(--red)",fontWeight:800,fontSize:14,border:`2.5px solid ${sel==="ok"?"var(--green)":"var(--red)"}`,boxShadow:`0 3px 0 ${sel==="ok"?"var(--green-d)":"#C42020"}`}}>{sel==="ok"?"✅ Doğru!":"❌ Cevap: "+q.word.word}</div>}
          {sel===null&&<button className="cbtn cbtn-blue" onClick={()=>ans(inp.trim().toLowerCase()===q.word.word.toLowerCase())}>Kontrol Et</button>}
        </div>
      )}
    </div>
  );
};

/* ── HOME ────────────────────────────────────────────────────────────────── */
const Home=({s,dispatch,go,onXP})=>{
  const learned=s.words.filter(w=>w.learned).length, total=s.words.length;
  const pct=Math.round(learned/total*100), gpct=Math.min(Math.round(s.dailyDone/s.dailyGoal*100),100);
  const xpLbl=s.xp<100?"🌱 Başlangıç":s.xp<500?"📖 Öğrenen":s.xp<1000?"⭐ Orta":s.xp<2000?"🔥 İleri":"👑 Uzman";
  const [lvl,setLvl]=useState("Tümü");
  const fW=lvl==="Tümü"?s.words:s.words.filter(w=>w.level===lvl);
  const fL=fW.filter(w=>w.learned).length;
  const last7=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(Date.now()-(6-i)*86400000);return{lbl:d.toLocaleDateString("tr",{weekday:"short"}),count:s.history.find(h=>h.date===d.toDateString())?.count||0};}),[s.history]);

  return(
    <div className="scr" style={{background:"var(--bg)"}}>
      {/* header */}
      <div style={{background:"linear-gradient(180deg,#E8F4FF 0%,var(--bg) 100%)",padding:"56px 16px 20px",borderBottom:"2.5px solid rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:12,color:"var(--ink3)",fontWeight:800,marginBottom:1,fontFamily:"'Nunito',sans-serif"}}>Hoş geldin! 👋</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 3px 0 #8B3A1A)"}}>
                {/* Body */}
                <rect x="12" y="30" width="76" height="62" rx="22" fill="#C1521E"/>
                {/* Left ear */}
                <ellipse cx="28" cy="20" rx="11" ry="16" fill="#C1521E"/>
                <ellipse cx="28" cy="22" rx="6" ry="10" fill="#E07040"/>
                {/* Right ear */}
                <ellipse cx="72" cy="20" rx="11" ry="16" fill="#C1521E"/>
                <ellipse cx="72" cy="22" rx="6" ry="10" fill="#E07040"/>
                {/* Fluffy hair */}
                <ellipse cx="50" cy="26" rx="14" ry="10" fill="#D46030"/>
                <ellipse cx="42" cy="24" rx="8" ry="7" fill="#D46030"/>
                <ellipse cx="58" cy="24" rx="8" ry="7" fill="#D46030"/>
                <ellipse cx="50" cy="22" rx="10" ry="8" fill="#D46030"/>
                {/* Face base highlight */}
                <ellipse cx="50" cy="55" rx="33" ry="30" fill="#C85A22"/>
                {/* Left eye white */}
                <ellipse cx="37" cy="50" rx="10" ry="12" fill="white" stroke="#5A2800" strokeWidth="2"/>
                {/* Left pupil */}
                <ellipse cx="37" cy="52" rx="6" ry="8" fill="#1A0A00"/>
                {/* Left eye shine */}
                <ellipse cx="40" cy="48" rx="2.5" ry="3" fill="white"/>
                {/* Right eye white */}
                <ellipse cx="63" cy="50" rx="10" ry="12" fill="white" stroke="#5A2800" strokeWidth="2"/>
                {/* Right pupil */}
                <ellipse cx="63" cy="52" rx="6" ry="8" fill="#1A0A00"/>
                {/* Right eye shine */}
                <ellipse cx="66" cy="48" rx="2.5" ry="3" fill="white"/>
                {/* Muzzle */}
                <ellipse cx="50" cy="72" rx="18" ry="14" fill="#D97040"/>
                {/* Nostrils */}
                <ellipse cx="44" cy="70" rx="3" ry="2.5" fill="#B04020"/>
                <ellipse cx="56" cy="70" rx="3" ry="2.5" fill="#B04020"/>
                {/* Smile */}
                <path d="M43 78 Q50 84 57 78" stroke="#B04020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:28,fontWeight:700,color:"var(--ink)",letterSpacing:".3px"}}>EngWords</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:"var(--peach)",border:"2.5px solid var(--orange)",borderRadius:50,padding:"7px 14px",boxShadow:"0 3px 0 var(--orange-d)"}}>
              <span style={{fontSize:17,animation:"streak 2s ease infinite"}}>🔥</span>
              <span style={{fontWeight:900,fontSize:15,color:"var(--orange-d)",fontFamily:"'Fredoka',sans-serif"}}>{s.streak}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,background:"var(--lemon)",border:"2.5px solid var(--yellow)",borderRadius:50,padding:"7px 14px",boxShadow:"0 3px 0 #C49A00"}}>
              <span style={{fontSize:15}}>⚡</span>
              <span style={{fontWeight:900,fontSize:15,color:"#7A5500",fontFamily:"'Fredoka',sans-serif"}}>{s.xp}</span>
            </div>
          </div>
        </div>

        {/* hero progress card */}
        <div className="clay" style={{padding:"20px",background:"linear-gradient(135deg,#4D9FFF,#A478FF)",border:"2.5px solid rgba(255,255,255,.3)",boxShadow:"0 6px 0 rgba(0,0,0,.2),0 14px 36px rgba(77,159,255,.4),inset 0 2px 6px rgba(255,255,255,.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(255,255,255,.2)",border:"3px solid rgba(255,255,255,.5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"inset 0 2px 8px rgba(0,0,0,.15)"}}>
              <span style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,color:"white"}}>{pct}%</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:700,color:"white",marginBottom:3}}>İngilizce Kelimeler</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.85)",fontWeight:700,marginBottom:10}}>{learned} / {total} öğrenildi</div>
              <div style={{height:10,background:"rgba(255,255,255,.25)",borderRadius:99,overflow:"hidden",border:"1.5px solid rgba(255,255,255,.3)"}}>
                <div style={{height:"100%",background:"white",borderRadius:99,width:`${pct}%`,transition:"width .6s ease",boxShadow:"0 0 8px rgba(255,255,255,.6)"}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="padded">
        {/* daily goal */}
        <div className="clay" style={{padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg,var(--lemon),var(--peach))",borderColor:"rgba(255,180,0,.3)"}}>
          <div style={{fontSize:28,animation:"pulse 2s ease infinite"}}>🎯</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontWeight:800,fontSize:14,fontFamily:"'Fredoka',sans-serif"}}>Günlük Hedef</span>
              <span style={{fontSize:13,color:"var(--ink2)",fontWeight:800}}>{s.dailyDone}/{s.dailyGoal}</span>
            </div>
            <div className="pbar" style={{height:10}}><div className="pfill orange" style={{width:`${gpct}%`}}/></div>
          </div>
          {gpct>=100&&<span style={{fontSize:24,animation:"popCheck .5s ease"}}>✅</span>}
        </div>

        {/* level chips */}
        <div className="chips" style={{marginBottom:12}}>
          {["Tümü","A1","A2","B1","B2","C1"].map(l=><button key={l} className={`chip ${lvl===l?"on":""}`} onClick={()=>setLvl(l)}>{l}</button>)}
        </div>
        {lvl!=="Tümü"&&(
          <div className="clay" style={{padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,background:"var(--sky)"}}>
            <Lv level={lvl}/><span style={{fontSize:13,fontWeight:800}}>{fL}/{fW.length} öğrenildi</span>
            <div style={{flex:1}}><div className="pbar" style={{height:6}}><div className="pfill" style={{width:`${fW.length>0?fL/fW.length*100:0}%`}}/></div></div>
          </div>
        )}

        {/* action buttons */}
        <div style={{display:"grid",gap:12,marginBottom:18}}>
          <button className="cbtn cbtn-blue" style={{fontSize:16,padding:"16px",gap:10}} onClick={()=>{dispatch({type:"STREAK"});go("cards");}}>
            <span style={{fontSize:22}}>📚</span> Öğrenmeye Devam Et
          </button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <button className="cbtn cbtn-purple" onClick={()=>go("quiz")} style={{gap:8}}><span style={{fontSize:18}}>🧠</span> Quiz Yap</button>
            <button className="cbtn cbtn-teal" style={{background:"var(--teal)",borderColor:"#1A9898",boxShadow:"0 4px 0 #1A9898,0 8px 20px rgba(46,207,207,.3),inset 0 2px 4px rgba(255,255,255,.5)"}} onClick={()=>go("dict")}><span style={{fontSize:18}}>🔍</span> Sözlük</button>
          </div>
        </div>

        {/* weak alert */}
        {s.failedIds.length>0&&(
          <div className="clay" style={{padding:"13px 15px",marginBottom:14,display:"flex",alignItems:"center",gap:10,background:"var(--rose)",borderColor:"rgba(255,92,92,.3)"}}>
            <span style={{fontSize:22,animation:"wobble 1.5s ease infinite"}}>⚠️</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:13,color:"var(--red)",fontFamily:"'Fredoka',sans-serif"}}>Tekrar Gereken Kelimeler</div>
              <div style={{fontSize:11,color:"var(--ink2)",fontWeight:700}}>{s.failedIds.length} kelime dikkat istiyor</div>
            </div>
            <button className="cbtn cbtn-red" style={{width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>go("cards")}>Gözden Geçir</button>
          </div>
        )}

        {/* weekly chart */}
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:12}}>📅 Bu Hafta</div>
        <div className="clay" style={{padding:"16px 12px",marginBottom:16,background:"linear-gradient(135deg,var(--sky),var(--lilac))"}}>
          <div style={{display:"flex",gap:5,alignItems:"flex-end",height:76}}>
            {last7.map((d,i)=>{
              const mx=Math.max(...last7.map(x=>x.count),1), h=Math.max(d.count/mx*60,5);
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  {d.count>0&&<span style={{fontSize:9,fontWeight:800,color:"var(--blue-d)"}}>{d.count}</span>}
                  <div style={{width:"100%",height:`${h}px`,background:d.count>0?"linear-gradient(180deg,var(--blue),#7B61FF)":"rgba(0,0,0,.08)",borderRadius:"6px 6px 0 0",transition:"height .5s ease",border:d.count>0?"2px solid var(--blue-d)":"none",boxShadow:d.count>0?"0 3px 0 var(--blue-d)":"none"}}/>
                  <span style={{fontSize:9,color:"var(--ink3)",fontWeight:800,fontFamily:"'Nunito',sans-serif"}}>{d.lbl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* xp level */}
        <div className="clay" style={{padding:"15px 16px",display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg,var(--lemon),#FFF0E6)"}}>
          <div style={{width:48,height:48,background:"linear-gradient(135deg,var(--yellow),var(--orange))",borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"2.5px solid var(--orange-d)",boxShadow:"var(--clay-orange)"}}>⚡</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,marginBottom:4,color:"var(--ink)"}}>{xpLbl}</div>
            <div className="pbar" style={{height:8}}><div className="pfill gold" style={{width:`${Math.min(s.xp%500/5,100)}%`}}/></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── CARDS SCREEN ────────────────────────────────────────────────────────── */
const Cards=({s,dispatch,onXP})=>{
  const [lvl,setLvl]=useState("Tümü");
  const [deck,setDeck]=useState(()=>s.words.filter(w=>!w.learned).sort(()=>Math.random()-.5).slice(0,20));
  const [idx,setIdx]=useState(0); const [kn,setKn]=useState(0); const [done,setDone]=useState(false);
  const rebuild=l=>{const p=s.words.filter(w=>!w.learned&&(l==="Tümü"||w.level===l));setDeck(p.sort(()=>Math.random()-.5).slice(0,20));setIdx(0);setKn(0);setDone(false);};
  useEffect(()=>{rebuild(lvl);},[lvl]);
  const cur=deck[idx];
  const onKnow=()=>{dispatch({type:"LEARN",id:cur.id});onXP(10);setKn(k=>k+1);if(idx+1>=deck.length)setDone(true);else setIdx(i=>i+1);};
  const onSkip=()=>{dispatch({type:"SKIP",id:cur.id});if(idx+1>=deck.length)setDone(true);else setIdx(i=>i+1);};

  if(deck.length===0) return(
    <div className="scr" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:14,background:"var(--bg)"}}>
      <div style={{fontSize:64,animation:"wobble 1s ease infinite"}}>🎉</div>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:24,fontWeight:700,textAlign:"center",color:"var(--ink)"}}>Bu seviyede tüm kartlar tamamlandı!</div>
      <div className="chips" style={{flexWrap:"wrap",justifyContent:"center"}}>{["Tümü","A1","A2","B1","B2","C1"].map(l=><button key={l} className={`chip ${lvl===l?"on":""}`} onClick={()=>setLvl(l)}>{l}</button>)}</div>
    </div>
  );

  if(done) return(
    <div className="scr" style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"42px 20px 90px",gap:14,background:"var(--bg)"}}>
      <div style={{fontSize:64,animation:"wobble 1s ease infinite"}}>{kn>=deck.length*.7?"🌟":"💪"}</div>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:24,fontWeight:700,textAlign:"center",color:"var(--ink)"}}>Seans Tamamlandı!</div>
      <div style={{color:"var(--ink2)",fontWeight:700}}>{deck.length} karttan {kn} tanesini bildin</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%"}}>
        <div className="stile" style={{background:"var(--mint)"}}><div style={{fontSize:28,fontWeight:900,color:"var(--green-d)",fontFamily:"'Fredoka',sans-serif"}}>{kn}</div><div style={{fontSize:12,color:"var(--green-d)",fontWeight:800}}>Öğrenildi ✅</div></div>
        <div className="stile" style={{background:"var(--rose)"}}><div style={{fontSize:28,fontWeight:900,color:"var(--red)",fontFamily:"'Fredoka',sans-serif"}}>{deck.length-kn}</div><div style={{fontSize:12,color:"var(--red)",fontWeight:800}}>Atlandı ❌</div></div>
      </div>
      <button className="cbtn cbtn-blue" onClick={()=>rebuild(lvl)} style={{gap:8}}><Ico n="redo" s={17} c="#fff"/>Yeni Seans</button>
    </div>
  );

  return(
    <div className="scr toppad" style={{padding:"0 16px 90px",background:"var(--bg)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Kartlar 🃏</div>
        <div className="chips" style={{gap:5}}>{["Tümü","A1","A2","B1","B2","C1"].map(l=><button key={l} className={`chip ${lvl===l?"on":""}`} style={{padding:"5px 9px",fontSize:11}} onClick={()=>setLvl(l)}>{l}</button>)}</div>
      </div>
      <FlashCard word={cur} onKnow={onKnow} onSkip={onSkip} idx={idx} total={deck.length} showTurkish={s.showTurkish}/>
    </div>
  );
};

/* ── DICTIONARY ──────────────────────────────────────────────────────────── */
const Dict=({s})=>{
  const [q,setQ]=useState(""); const [lvl,setLvl]=useState("Tümü"); const [status,setSt]=useState("Tümü"); const [sel,setSel]=useState(null);
  const COLORS=["#4D9FFF","#3DD68C","#FF8C47","#A478FF","#FF6FA8","#2ECFCF","#FFD447","#FF5C5C"];
  const filtered=useMemo(()=>s.words.filter(w=>{
    const mq=q===""||w.word.toLowerCase().includes(q.toLowerCase())||w.turkishMeaning.toLowerCase().includes(q.toLowerCase());
    const ml=lvl==="Tümü"||w.level===lvl;
    const ms=status==="Tümü"||(status==="Öğrenildi"&&w.learned)||(status==="Öğrenilmedi"&&!w.learned);
    return mq&&ml&&ms;
  }),[s.words,q,lvl,status]);

  return(
    <div className="scr" style={{background:"var(--bg)"}}>
      <div style={{background:"linear-gradient(180deg,#E8F4FF,var(--bg))",padding:"54px 16px 12px",borderBottom:"2.5px solid rgba(0,0,0,.06)"}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,marginBottom:12,color:"var(--ink)"}}>Sözlük 📖</div>
        <div className="sbox" style={{marginBottom:9}}>
          <Ico n="srch" s={17} c="var(--ink3)"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Kelime veya Türkçe ara..."/>
          {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",color:"var(--ink3)",cursor:"pointer",fontSize:16,fontWeight:800}}>✕</button>}
        </div>
        <div className="chips" style={{marginBottom:7}}>{["Tümü","A1","A2","B1","B2","C1"].map(l=><button key={l} className={`chip ${lvl===l?"on":""}`} onClick={()=>setLvl(l)}>{l}</button>)}</div>
        <div className="chips">{["Tümü","Öğrenildi","Öğrenilmedi"].map(st=><button key={st} className={`chip ${status===st?"on":""}`} onClick={()=>setSt(st)}>{st}</button>)}</div>
        <div style={{marginTop:8,fontSize:12,color:"var(--ink3)",fontWeight:800,fontFamily:"'Nunito',sans-serif"}}>{filtered.length} kelime</div>
      </div>

      <div style={{paddingBottom:80}}>
        {filtered.map((w,i)=>{
          const cc=getCC(w.category); const col=COLORS[w.id%COLORS.length];
          return(
            <div key={w.id} className="wrow" onClick={()=>setSel(w)}>
              <div className="wavt" style={{background:w.learned?"var(--green)":cc.bg,color:w.learned?"white":cc.text,borderColor:w.learned?"var(--green-d)":cc.border,boxShadow:`0 3px 0 ${w.learned?"var(--green-d)":cc.shadow}`}}>{w.word[0].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                  <span style={{fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,color:"var(--ink)"}}>{w.word}</span>
                  <Lv level={w.level}/>
                </div>
                <div style={{fontSize:12,color:"var(--ink3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:700}}>{w.turkishMeaning}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <span style={{fontSize:10,color:"var(--ink3)",fontWeight:700}}>{w.partOfSpeech}</span>
                {w.learned&&<span style={{color:"var(--green-d)",fontSize:14,fontWeight:800}}>✓</span>}
              </div>
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px",color:"var(--ink3)"}}>
            <div style={{fontSize:48,marginBottom:12,animation:"wobble 1s ease infinite"}}>🔍</div>
            <div style={{fontWeight:800,fontFamily:"'Fredoka',sans-serif",fontSize:16}}>Sonuç bulunamadı</div>
          </div>
        )}
      </div>

      {sel&&(
        <div className="overlay" onClick={()=>setSel(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="handle"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:32,fontWeight:700,marginBottom:3,color:"var(--ink)"}}>{sel.word}</div>
                <div style={{color:"var(--blue-d)",fontSize:15,fontStyle:"italic",fontWeight:700}}>{sel.pronunciation}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                <Lv level={sel.level}/>
                <div style={{fontSize:11,background:getCC(sel.category).bg,padding:"3px 10px",borderRadius:50,color:getCC(sel.category).text,fontWeight:800,border:`2px solid ${getCC(sel.category).border}`,boxShadow:`0 2px 0 ${getCC(sel.category).shadow}`}}>{sel.partOfSpeech}</div>
              </div>
            </div>
            {[
              {bg:"var(--lemon)",br:"var(--yellow)",sh:"#C49A00",lbl:"🇹🇷 Türkçe Anlamı",lc:"#7A5500",val:sel.turkishMeaning,sz:18,fw:"800",ff:"'Fredoka',sans-serif"},
              {bg:"var(--sky)",br:"#93C5FD",sh:"#3B82F6",lbl:"📖 Tanım",lc:"#1E40AF",val:sel.definition,sz:14,fw:"700",ff:"'Nunito',sans-serif"},
              {bg:"var(--mint)",br:"var(--green)",sh:"var(--green-d)",lbl:"💬 Örnek Cümle",lc:"var(--green-d)",val:`"${sel.exampleSentence}"`,sz:13,fw:"600",ff:"'Nunito',sans-serif",it:true},
              {bg:"var(--lilac)",br:"var(--purple)",sh:"var(--purple-d)",lbl:"🏷️ Kategori",lc:"var(--purple-d)",val:sel.category,sz:13,fw:"700",ff:"'Nunito',sans-serif"},
            ].map(({bg,br,sh,lbl,lc,val,sz,fw,ff,it})=>(
              <div key={lbl} style={{background:bg,border:`2.5px solid ${br}`,borderRadius:16,padding:"12px 15px",marginBottom:10,boxShadow:`0 3px 0 ${sh}`}}>
                <div style={{fontSize:9,fontWeight:800,color:lc,textTransform:"uppercase",letterSpacing:".8px",marginBottom:3,fontFamily:"'Nunito',sans-serif"}}>{lbl}</div>
                <div style={{fontSize:sz,fontWeight:fw,color:"var(--ink)",lineHeight:1.5,fontStyle:it?"italic":"normal",fontFamily:ff}}>{val}</div>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              <div className="stile" style={{background:"var(--sky)"}}><div style={{fontSize:22,fontWeight:900,color:"var(--blue-d)",fontFamily:"'Fredoka',sans-serif"}}>{sel.reviewCount}</div><div style={{fontSize:11,color:"var(--ink3)",fontWeight:800}}>Tekrar</div></div>
              <div className="stile" style={{background:sel.learned?"var(--mint)":"var(--rose)"}}><div style={{fontSize:22,fontWeight:900,color:sel.learned?"var(--green-d)":"var(--red)",fontFamily:"'Fredoka',sans-serif"}}>{sel.learned?"✓":"✗"}</div><div style={{fontSize:11,color:"var(--ink3)",fontWeight:800}}>Durum</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── STATS ────────────────────────────────────────────────────────────────── */
const Stats=({s})=>{
  const learned=s.words.filter(w=>w.learned).length;
  const xpLbl=s.xp<100?"🌱 Başlangıç":s.xp<500?"📖 Öğrenen":s.xp<1000?"⭐ Orta":s.xp<2000?"🔥 İleri":"👑 Uzman";
  const nxp=s.xp<100?100:s.xp<500?500:s.xp<1000?1000:s.xp<2000?2000:3000;
  const pxp=s.xp<100?0:s.xp<500?100:s.xp<1000?500:s.xp<2000?1000:2000;
  const xpPct=Math.round((s.xp-pxp)/(nxp-pxp)*100);
  const lvlS=["A1","A2","B1","B2","C1"].map(l=>({l,t:s.words.filter(w=>w.level===l).length,d:s.words.filter(w=>w.level===l&&w.learned).length}));
  const weak=s.words.filter(w=>s.failedIds.includes(w.id)).slice(0,5);
  const lb=[{name:"Ayşe K.",xp:520},{name:"Mert S.",xp:390},{name:"Zeynep A.",xp:315},{name:"Sen",xp:s.xp,me:true}].sort((a,b)=>b.xp-a.xp);

  return(
    <div className="scr toppad" style={{padding:"0 16px 90px",background:"var(--bg)"}}>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,marginBottom:18,color:"var(--ink)"}}>İstatistikler 📊</div>

      {/* XP hero */}
      <div className="clay" style={{padding:"20px",marginBottom:14,background:"linear-gradient(135deg,#FFD447,#FF8C47)",border:"2.5px solid var(--orange-d)",boxShadow:"0 6px 0 var(--orange-d),0 14px 36px rgba(255,140,71,.4),inset 0 2px 6px rgba(255,255,255,.35)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:800,marginBottom:3}}>SEVİYE</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:"white"}}>{xpLbl}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:800,marginBottom:3}}>TOPLAM XP</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:"white"}}>⚡ {s.xp}</div></div>
        </div>
        <div style={{height:10,background:"rgba(255,255,255,.3)",borderRadius:99,overflow:"hidden",border:"1.5px solid rgba(255,255,255,.3)"}}>
          <div style={{height:"100%",background:"white",borderRadius:99,width:`${xpPct}%`,boxShadow:"0 0 8px rgba(255,255,255,.6)",transition:"width .6s ease"}}/>
        </div>
        <div style={{marginTop:5,fontSize:11,color:"rgba(255,255,255,.78)",fontWeight:700}}>{s.xp} / {nxp} XP — sonraki seviye</div>
      </div>

      {/* stat tiles */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {v:learned,l:"Öğrenildi",c:"var(--green-d)",bg:"var(--mint)",br:"var(--green)",sh:"var(--green-d)",ico:"📚"},
          {v:s.streak,l:"Gün Serisi",c:"var(--orange-d)",bg:"var(--peach)",br:"var(--orange)",sh:"var(--orange-d)",ico:"🔥"},
          {v:s.failedIds.length,l:"Tekrar",c:"var(--red)",bg:"var(--rose)",br:"var(--red)",sh:"#C42020",ico:"⚠️"},
        ].map(({v,l,c,bg,br,sh,ico})=>(
          <div key={l} className="stile" style={{background:bg,borderColor:br,boxShadow:`0 5px 0 ${sh},0 10px 20px rgba(0,0,0,.08),inset 0 2px 5px rgba(255,255,255,.8)`}}>
            <div style={{fontSize:22}}>{ico}</div>
            <div style={{fontSize:26,fontWeight:700,color:c,fontFamily:"'Fredoka',sans-serif"}}>{v}</div>
            <div style={{fontSize:11,color:c,fontWeight:800}}>{l}</div>
          </div>
        ))}
      </div>

      {/* by level */}
      <div className="stitle">📊 Seviyeye Göre</div>
      <div className="clay" style={{padding:16,marginBottom:16,background:"linear-gradient(135deg,var(--sky),var(--lilac))"}}>
        {lvlS.map(({l,t,d})=>(
          <div key={l} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Lv level={l}/><span style={{fontSize:13,fontWeight:800}}>{l}</span></div>
              <span style={{fontSize:12,color:"var(--ink2)",fontWeight:800}}>{d}/{t}</span>
            </div>
            <div className="pbar" style={{height:8}}><div className="pfill" style={{width:`${t>0?(d/t)*100:0}%`}}/></div>
          </div>
        ))}
      </div>

      {/* weak words */}
      {weak.length>0&&<>
        <div className="stitle">🎯 Pratik Yapılacaklar</div>
        <div className="clay" style={{overflow:"hidden",marginBottom:16,background:"linear-gradient(135deg,var(--rose),var(--lemon))"}}>
          {weak.map((w,i)=>{const cc=getCC(w.category);return(
            <div key={w.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<weak.length-1?"2px solid rgba(0,0,0,.06)":"none"}}>
              <div className="wavt" style={{width:36,height:36,fontSize:13,background:cc.bg,color:cc.text,borderColor:cc.border,boxShadow:`0 3px 0 ${cc.shadow}`}}>{w.word[0].toUpperCase()}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,fontFamily:"'Fredoka',sans-serif"}}>{w.word}</div><div style={{fontSize:12,color:"var(--ink3)",fontWeight:700}}>{w.turkishMeaning}</div></div>
              <Lv level={w.level}/>
            </div>
          );})}
        </div>
      </>}

      {/* leaderboard */}
      <div className="stitle">🏆 Haftalık Sıralama</div>
      <div className="clay" style={{padding:"8px",marginBottom:16,background:"linear-gradient(135deg,var(--lemon),var(--sky))"}}>
        {lb.map((p,i)=>(
          <div key={p.name} className={`lbrow ${p.me?"me":""}`}>
            <div style={{fontSize:18,width:26,textAlign:"center",flexShrink:0}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</div>
            <div style={{width:34,height:34,borderRadius:50,background:p.me?"var(--blue)":"rgba(0,0,0,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:p.me?"white":"var(--ink2)",flexShrink:0,fontFamily:"'Fredoka',sans-serif",border:p.me?"2px solid var(--blue-d)":"none",boxShadow:p.me?"0 2px 0 var(--blue-d)":"none"}}>{p.name[0]}</div>
            <div style={{flex:1,fontWeight:p.me?900:700,fontSize:14,color:p.me?"var(--blue-d)":"var(--ink)",fontFamily:p.me?"'Fredoka',sans-serif":"'Nunito',sans-serif"}}>{p.name}{p.me?" (Sen)":""}</div>
            <div style={{fontSize:13,fontWeight:800,color:"#7A5500",background:"var(--lemon)",padding:"3px 10px",borderRadius:50,border:"2px solid var(--yellow)",boxShadow:"0 2px 0 #C49A00",fontFamily:"'Nunito',sans-serif"}}>⚡ {p.xp}</div>
          </div>
        ))}
      </div>

      {/* achievements */}
      <div className="stitle">🎖️ Rozetler</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {id:"f1",e:"🌱",n:"İlk Adım",d:"İlk kelimeni öğren",ok:learned>=1,bg:"var(--mint)",br:"var(--green)",sh:"var(--green-d)"},
          {id:"f2",e:"📖",n:"10 Kelime",d:"10 kelime öğren",ok:learned>=10,bg:"var(--sky)",br:"#93C5FD",sh:"#3B82F6"},
          {id:"f3",e:"⭐",n:"50 Kelime",d:"50 kelime öğren",ok:learned>=50,bg:"var(--lemon)",br:"var(--yellow)",sh:"#C49A00"},
          {id:"s3",e:"🔥",n:"3 Günlük Seri",d:"3 gün üst üste çalış",ok:s.streak>=3,bg:"var(--peach)",br:"var(--orange)",sh:"var(--orange-d)"},
          {id:"s7",e:"🔥🔥",n:"Haftalık Seri",d:"7 gün üst üste çalış",ok:s.streak>=7,bg:"var(--rose)",br:"var(--pink)",sh:"var(--pink-d)"},
          {id:"x500",e:"⚡",n:"500 XP",d:"500 XP kazan",ok:s.xp>=500,bg:"var(--lilac)",br:"var(--purple)",sh:"var(--purple-d)"},
        ].map(a=>(
          <div key={a.id} className={`ach ${a.ok?"on":""}`} style={a.ok?{background:a.bg,borderColor:a.br,boxShadow:`0 4px 0 ${a.sh},0 8px 20px rgba(0,0,0,.1),inset 0 2px 4px rgba(255,255,255,.8)`}:{}}>
            <div style={{width:48,height:48,borderRadius:14,background:a.ok?a.bg:"rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:a.ok?1:.35,border:a.ok?`2px solid ${a.br}`:"none",boxShadow:a.ok?`0 3px 0 ${a.sh}`:"none"}}>{a.e}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14,color:a.ok?"var(--ink)":"var(--ink3)",fontFamily:"'Fredoka',sans-serif"}}>{a.n}</div>
              <div style={{fontSize:12,color:"var(--ink3)",fontWeight:700}}>{a.d}</div>
            </div>
            {a.ok&&<span style={{color:"#C49A00",fontSize:20,animation:"pulse 2s ease infinite"}}>★</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── SETTINGS ─────────────────────────────────────────────────────────────── */
const Settings=({s,dispatch})=>{
  const [confirm,setConfirm]=useState(false);
  return(
    <div className="scr toppad" style={{padding:"0 16px 90px",background:"var(--bg)"}}>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,marginBottom:20,color:"var(--ink)"}}>Ayarlar ⚙️</div>

      <div className="clay" style={{padding:16,marginBottom:14,background:"linear-gradient(135deg,var(--sky),var(--lilac))"}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:15,marginBottom:13}}>🎯 Günlük Kelime Hedefi</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[5,10,20,50].map(g=>(
            <button key={g} onClick={()=>dispatch({type:"GOAL",v:g})} style={{padding:"12px 0",borderRadius:16,border:`2.5px solid ${s.dailyGoal===g?"var(--blue-d)":"rgba(0,0,0,.1)"}`,background:s.dailyGoal===g?"var(--blue)":"rgba(255,255,255,.8)",color:s.dailyGoal===g?"white":"var(--ink2)",fontWeight:800,fontSize:17,cursor:"pointer",fontFamily:"'Fredoka',sans-serif",transition:"all .14s",boxShadow:s.dailyGoal===g?"var(--clay-blue)":"0 3px 0 rgba(0,0,0,.1)"}}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="clay" style={{padding:"4px 16px",marginBottom:14,background:"linear-gradient(135deg,var(--mint),var(--sky))"}}>
        <div className="trow">
          <div>
            <div style={{fontWeight:800,fontSize:14,fontFamily:"'Fredoka',sans-serif"}}>🇹🇷 Ön Yüzde Türkçe Göster</div>
            <div style={{fontSize:12,color:"var(--ink3)",marginTop:2,fontWeight:700}}>Çevirmeden önce anlamı göster</div>
          </div>
          <div className={`tgl ${s.showTurkish?"on":"off"}`} onClick={()=>dispatch({type:"TR"})}><div className="tknob"/></div>
        </div>
      </div>

      <div className="clay" style={{padding:"4px 16px",marginBottom:14,background:"linear-gradient(135deg,var(--lemon),var(--peach))"}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontWeight:700,fontSize:14,padding:"13px 0 4px"}}>📱 Uygulama Bilgisi</div>
        {[["Sürüm","3.0 Clay 🎨"],["Kelime Sayısı","100 (örnek)"],["Tam Veri Seti","3.000 kelime"],["Toplam XP",`⚡ ${s.xp}`],["Gün Serisi",`🔥 ${s.streak} gün`]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"2px solid rgba(0,0,0,.06)",fontSize:14}}>
            <span style={{color:"var(--ink2)",fontWeight:700}}>{k}</span>
            <span style={{fontWeight:800,fontFamily:"'Fredoka',sans-serif"}}>{v}</span>
          </div>
        ))}
        <div style={{height:4}}/>
      </div>

      <div className="clay" style={{padding:16,borderColor:"rgba(255,92,92,.3)",background:"linear-gradient(135deg,var(--rose),var(--lemon))"}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontWeight:700,color:"var(--red)",marginBottom:12}}>⚠️ Tehlikeli Bölge</div>
        <button className="cbtn cbtn-white" style={{borderColor:"var(--red)",color:"var(--red)"}} onClick={()=>setConfirm(true)}>Tüm İlerlemeyi Sıfırla</button>
      </div>

      {confirm&&(
        <div className="overlay" onClick={()=>setConfirm(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="handle"/>
            <div style={{textAlign:"center",padding:"8px 0 20px"}}>
              <div style={{fontSize:56,marginBottom:12,animation:"wobble 1s ease infinite"}}>⚠️</div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:23,fontWeight:700,marginBottom:8,color:"var(--ink)"}}>Emin misin?</div>
              <div style={{color:"var(--ink2)",fontSize:14,lineHeight:1.6,fontWeight:700}}>Tüm öğrenilen kelimeler, XP ve seri silinecek. Bu geri alınamaz.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="cbtn cbtn-red" onClick={()=>{dispatch({type:"RESET"});setConfirm(false);}}>Evet, Sıfırla</button>
              <button className="cbtn cbtn-white" onClick={()=>setConfirm(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── APP ROOT ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [s,dispatch]=useReducer(reducer,null,INIT);
  const [screen,setScreen]=useState("home");
  const [xpPop,setXpPop]=useState(null);

  useEffect(()=>{try{localStorage.setItem("engwords",JSON.stringify(s));}catch{}},[s]);
  const onXP=useCallback(n=>setXpPop({n,k:Date.now()}),[]);

  const NAV=[
    {id:"home",  lbl:"Ana Sayfa",ico:"home"},
    {id:"cards", lbl:"Kartlar",  ico:"cards"},
    {id:"quiz",  lbl:"Quiz",     ico:"quiz"},
    {id:"dict",  lbl:"Sözlük",  ico:"book"},
    {id:"stats", lbl:"İstatistik",ico:"chart"},
    {id:"settings",lbl:"Ayarlar",ico:"cog"},
  ];

  return(
    <>
      <CSS/>
      <div className="app">
        {/* background blobs */}
        <div className="blob" style={{width:200,height:200,top:-60,right:-40,background:"radial-gradient(circle,#A478FF,#4D9FFF)"}}/>
        <div className="blob" style={{width:180,height:180,bottom:80,left:-50,background:"radial-gradient(circle,#3DD68C,#2ECFCF)"}}/>
        <div className="blob" style={{width:140,height:140,top:"45%",right:-30,background:"radial-gradient(circle,#FF8C47,#FFD447)"}}/>

        <div key={screen} className="float-up" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
          {screen==="home"     && <Home s={s} dispatch={dispatch} go={setScreen} onXP={onXP}/>}
          {screen==="cards"    && <Cards s={s} dispatch={dispatch} onXP={onXP}/>}
          {screen==="quiz"     && (
            <div className="scr" style={{background:"var(--bg)"}}>
              <div style={{padding:"56px 16px 14px",borderBottom:"2.5px solid rgba(0,0,0,.06)",background:"linear-gradient(180deg,var(--lilac),var(--bg))"}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Quiz Modu 🧠</div>
                <div style={{fontSize:13,color:"var(--ink3)",fontWeight:700,marginTop:2}}>Bilgini test et!</div>
              </div>
              <Quiz words={s.words} dispatch={dispatch} onXP={onXP}/>
            </div>
          )}
          {screen==="dict"     && <Dict s={s}/>}
          {screen==="stats"    && <Stats s={s}/>}
          {screen==="settings" && <Settings s={s} dispatch={dispatch}/>}
        </div>

        {/* clay nav bar */}
        <nav className="nav" style={{position:"relative",zIndex:2}}>
          {NAV.map(item=>(
            <div key={item.id} className={`ni ${screen===item.id?"on":""}`} onClick={()=>setScreen(item.id)}>
              <div className="ni-icon">
                <Ico n={item.ico} s={20} c={screen===item.id?"var(--blue-d)":"var(--ink3)"}/>
              </div>
              <span className="ni-lbl">{item.lbl}</span>
            </div>
          ))}
        </nav>

        {xpPop&&<XPPop key={xpPop.k} n={xpPop.n} onDone={()=>setXpPop(null)}/>}
      </div>
    </>
  );
}
