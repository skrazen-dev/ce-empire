/* =========================================================
   CE EMPIRE — live counters
   Animates Volume, Profit, and USDT figures for a "live" feel.
   ========================================================= */
(function () {
  'use strict';

  function animate(el, from, to, ms, decimals) {
    if (!el) return;
    var start = performance.now();
    function frame(t) {
      var p = Math.min(1, (t - start) / ms);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      var val = from + (to - from) * eased;
      el.textContent = format(val, decimals);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function format(n, decimals) {
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    });
  }

  function jitter(base, pct) {
    var delta = base * (Math.random() * pct);
    return base + (Math.random() > 0.5 ? delta : -delta);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var volEl = document.getElementById('liveVolume');
    var profitEl = document.getElementById('liveProfit');
    var usdtEl = document.getElementById('liveUsdt');

    var vol = 12582450, profit = 185920, usdt = 42590;

    if (volEl) volEl.textContent = format(vol, 0);
    if (profitEl) profitEl.textContent = format(profit, 0);
    if (usdtEl) usdtEl.textContent = format(usdt, 2);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    setInterval(function () {
      if (volEl) { var nv = jitter(vol, 0.015); animate(volEl, vol, nv, 1200, 0); vol = nv; }
      if (profitEl) { var np = jitter(profit, 0.03); animate(profitEl, profit, np, 1000, 0); profit = np; }
      if (usdtEl) { var nu = jitter(usdt, 0.02); animate(usdtEl, usdt, nu, 1100, 2); usdt = nu; }
    }, 4500);
  });
})();
