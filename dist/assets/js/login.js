/* =========================================================
   CE EMPIRE — authentication (single authorized user)
   Only one account may sign in:  username "BOSS".

   Strategy:
   1. Try the server session endpoint  POST /api/login  (source of
      truth: bcrypt-hashed credentials in the database). Used when the
      site is served by the CE Empire Express server.
   2. If that endpoint is unreachable (pure-static hosting), fall back to
      a self-contained check: username must be exactly "BOSS" and the
      SHA-256 of the password must match the stored digest below. The
      plaintext password is never stored in this repo.

   All other usernames / passwords are rejected.
   ========================================================= */
(function () {
  'use strict';

  var ALLOWED_USER = 'BOSS';
  // SHA-256 digest of the authorized password (no plaintext in source).
  var PASSWORD_SHA256 = 'c7356f6e41312ae224620c0782081e501fd078e2b70e72140a28ad2b6dd137fa';

  function $(id) { return document.getElementById(id); }

  /* ---------- SHA-256 helper (used only by the static fallback) ---------- */
  async function sha256Hex(str) {
    if (!(window.crypto && window.crypto.subtle)) return null;
    var buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  /* ---------- Modal wiring ---------- */
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

  /* ---------- Static fallback check ---------- */
  async function fallbackCheck(username, password) {
    if (username !== ALLOWED_USER) return false;
    var hex = await sha256Hex(password);
    return hex !== null && hex === PASSWORD_SHA256;
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

      var username = ($('username') || {}).value || '';
      var password = ($('password') || {}).value || '';
      username = username.trim();

      if (!username || !password) {
        if (err) err.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
        return;
      }

      var redirect = form.getAttribute('data-success-url') || 'dashboard.html';
      if (submitBtn) { submitBtn.disabled = true; }

      // 1) Try server-side session auth (source of truth).
      try {
        var resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: username, password: password })
        });

        if (resp.ok) {
          var data = await resp.json().catch(function () { return {}; });
          if (data && data.user) sessionStorage.setItem('ce_user', data.user);
          window.location.href = redirect;
          return;
        }
        if (resp.status === 401) {
          if (err) err.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
          if (submitBtn) submitBtn.disabled = false;
          return;
        }
        if (resp.status === 429) {
          if (err) err.textContent = 'พยายามเข้าสู่ระบบบ่อยเกินไป โปรดรอสักครู่';
          if (submitBtn) submitBtn.disabled = false;
          return;
        }
        // Other server errors fall through to the static check below.
      } catch (e) {
        // Network error / no backend (static hosting) → use fallback.
      }

      // 2) Static fallback (single authorized account).
      try {
        var ok = await fallbackCheck(username, password);
        if (ok) {
          sessionStorage.setItem('ce_user', ALLOWED_USER);
          window.location.href = redirect;
          return;
        }
        if (err) err.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      } catch (e2) {
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
