/* =========================================================
   CE EMPIRE — interactive sound bindings + mute toggle
   Wires hover/click cues to interactive elements and injects a
   sound on/off button into the top bar. Uses window.ceSound
   (from chime.js); everything is a no-op if audio is unavailable.
   ========================================================= */
(function () {
  'use strict';
  function S() { return window.ceSound; }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn, { passive: true }); }

  var SPK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"/></svg>';
  var MUTE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    /* ---- Mute toggle in the top bar ---- */
    var topRight = document.querySelector('.top-right');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sound-toggle';
    btn.id = 'soundToggle';
    btn.setAttribute('aria-label', 'เปิดหรือปิดเสียง');

    function render() {
      var m = S() && S().muted;
      btn.setAttribute('aria-pressed', m ? 'true' : 'false');
      btn.innerHTML = (m ? MUTE : SPK) + '<span>' + (m ? 'เสียง: ปิด' : 'เสียง: เปิด') + '</span>';
    }
    btn.addEventListener('click', function () { if (S()) S().toggle(); render(); });
    document.addEventListener('ce-sound-toggle', render);
    render();
    if (topRight) topRight.insertBefore(btn, topRight.firstChild);

    /* ---- Hover ticks on interactive controls ---- */
    var hoverEls = document.querySelectorAll('.cta, .mode-toggle, .sound-toggle, .btn, .see-all, .signin .x');
    Array.prototype.forEach.call(hoverEls, function (el) {
      on(el, 'pointerenter', function () { if (S()) S().hover(); });
    });

    /* ---- Click pops on links/buttons (the CTA opens the modal) ---- */
    var clickEls = document.querySelectorAll('.cta, .mode-toggle, .see-all');
    Array.prototype.forEach.call(clickEls, function (el) {
      on(el, 'click', function () { if (S()) S().click(); });
    });
  });
})();
