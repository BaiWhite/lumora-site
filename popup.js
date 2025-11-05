/* ===== Lumora Seasonal Gifting Popup (standalone JS) ===== */
(function(){
  const ID          = 'lumora_sg_seen_v1';   // localStorage key
  const DAYS_HOLD   = 7;                     // re-show after X days
  const SHOW_DELAY  = 8000;                  // ms after load
  const SCROLL_PCT  = 0.40;                  // scroll trigger (0–1)
  const START       = '2025-11-01';          // campaign start (yyyy-mm-dd)
  const END         = '2025-12-31';          // campaign end (inclusive)

  const backdrop = document.getElementById('sgBackdrop');
  const btnClose = document.getElementById('sgClose');
  const btnLater = document.getElementById('sgLater');
  const btnShop  = document.getElementById('sgShop');

  // ----- campaign window check -----
  function inWindow(){
    const now = new Date();
    const s = new Date(START + 'T00:00:00');
    const e = new Date(END   + 'T23:59:59');
    return now >= s && now <= e;
  }

  // ----- frequency control -----
  function seenWithin(days){
    try{
      const raw = localStorage.getItem(ID);
      if(!raw) return false;
      return (Date.now() - parseInt(raw,10)) < days*24*60*60*1000;
    }catch(_){ return false; }
  }
  function markSeen(){
    try{ localStorage.setItem(ID, String(Date.now())); }catch(_){}
  }

  // ----- open / close handlers -----
  let lastFocus = null;
  function open(){
    if(!backdrop) return;
    lastFocus = document.activeElement;
    backdrop.classList.add('show');
    backdrop.setAttribute('aria-hidden','false');
    btnClose && btnClose.focus();
    document.addEventListener('keydown', escHandler);
  }
  function close(){
    if(!backdrop) return;
    backdrop.classList.remove('show');
    backdrop.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', escHandler);
    lastFocus && lastFocus.focus();
  }
  function escHandler(e){ if(e.key === 'Escape'){ close(); markSeen(); } }

  // ----- trigger logic -----
  let fired = false;
  function tryFire(){
    if(fired) return;
    fired = true;
    open();
  }

  // delay trigger
  const t = setTimeout(()=>{ tryFire(); }, SHOW_DELAY);

  // scroll trigger
  function onScroll(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight);
    if(scrolled >= SCROLL_PCT){ tryFire(); window.removeEventListener('scroll', onScroll); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });

  // buttons
  btnClose && btnClose.addEventListener('click', ()=>{ close(); markSeen(); });
  btnLater && btnLater.addEventListener('click', ()=>{ close(); markSeen(); });
  btnShop  && btnShop .addEventListener('click', ()=>{ markSeen(); });

  // only run if within window and not recently shown
  if(!(inWindow() && !seenWithin(DAYS_HOLD))){
    clearTimeout(t);
    window.removeEventListener('scroll', onScroll);
  }
})();
