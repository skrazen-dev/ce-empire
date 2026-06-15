// Simple demo animation for Live Volume and Live Profit
(function(){
  function animateCounter(elOrSelector, from, to, ms){
    const el = (typeof elOrSelector === 'string') ? document.querySelector(elOrSelector) : elOrSelector;
    if (!el) return;
    const start = performance.now();
    function frame(t){
      const p = Math.min(1, (t-start)/ms);
      const val = Math.floor(from + (to-from)*p);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function randomDelta(base, pct){
    const delta = Math.round(base * (Math.random()*pct));
    return base + (Math.random() > .5 ? delta : -delta);
  }

  document.addEventListener('DOMContentLoaded', () =>{
    const volEl = document.querySelector('#liveVolume .value');
    const profitEl = document.querySelector('#liveProfit .value');
    if (!volEl || !profitEl) return;

    // initial values that match your spec sample
    let vol = 12582450;
    let profit = 185920;
    volEl.textContent = vol.toLocaleString();
    profitEl.textContent = profit.toLocaleString();

    // every few seconds animate to a nearby value for "live" feeling
    setInterval(() =>{
      const newVol = randomDelta(vol, 0.02);
      animateCounter(volEl, vol, newVol, 1200);
      vol = newVol;
      const newProfit = randomDelta(profit, 0.04);
      animateCounter(profitEl, profit, newProfit, 900);
      profit = newProfit;
    }, 4000);
  });
})();
