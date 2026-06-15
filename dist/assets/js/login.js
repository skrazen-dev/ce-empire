/* =========================================================
   CE EMPIRE — landing sign-in (single authorized user)
   Self-contained, client-side check for the static landing.
   Only one account may sign in:  username "BOSS".
   The password is never stored in plaintext — only its SHA-256
   digest is kept here and compared at submit time.
   All other usernames / passwords are rejected.
   ========================================================= */
(function () {
  'use strict';

  var ALLOWED_USER = 'BOSS';
  // SHA-256 digest of the authorized password (no plaintext in source).
  var PASSWORD_SHA256 = 'c7356f6e41312ae224620c0782081e501fd078e2b70e72140a28ad2b6dd137fa';

  function $(id) { return document.getElementById(id); }

  /* ---------- SHA-256 helper ---------- */
  async function sha256Hex(str) {
    if (!(window.crypto && window.crypto.subtle)) return null;
    var buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  async function isAuthorized(username, password) {
    if (username !== ALLOWED_USER) return false;
    var hex = await sha256Hex(password);
    return hex !== null && hex === PASSWORD_SHA256;
  }

  /* ---------- Sign-in modal ---------- */
  function initModal() {
    var modal = $('loginModal');
    var openBtn = $('enterCta');
    var closeBtn = $('loginClose');
    if (!modal) return;
    var lastFocus = null;

    function open(ev) {
      if (ev) ev.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      var u = $('username');
      if (u) setTimeout(function () { u.focus(); }, 50);
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      var err = $('loginError'); if (err) err.textContent = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('mousedown', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }

  /* ---------- Form submit ---------- */
  function initForm() {
    var form = $('loginForm');
    if (!form) return;
    var err = $('loginError');
    var submitBtn = $('loginSubmit');

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (err) err.textContent = '';

      var username = (($('username') || {}).value || '').trim();
      var password = ($('password') || {}).value || '';

      if (!username || !password) {
        if (err) err.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        if (await isAuthorized(username, password)) {
          sessionStorage.setItem('ce_user', ALLOWED_USER);
          window.location.href = form.getAttribute('data-success-url') || 'dashboard.html';
          return;
        }
        if (err) err.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      } catch (e) {
        if (err) err.textContent = 'ระบบเกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initModal();
    initForm();
  });
})();
