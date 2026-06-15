// Demo-only client-side login handler. NOTE: this file intentionally does NOT contain any plaintext passwords.
// For local demo purposes this accepts username 'BOSS' and any non-empty password, but
// this is not secure and must NOT be used in production. Move auth to the server for real use.

(function(){
  const ALLOWED_USER = 'BOSS';

  // Basic brute-force guard for demo: allow 5 attempts then disable for 15s
  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15000;
  let lockedUntil = 0;

  try {
    // expose demo user info (no password) for integrations/tests if present
    if (window.demoUsers) window.demoUsers = [{username:ALLOWED_USER}];
    if (window.defaultUsers) window.defaultUsers = [{username:ALLOWED_USER}];
  } catch(e){ /* ignore */ }

  function validateCredentials(u,p){
    // lockedOut check
    if (Date.now() < lockedUntil) return false;
    // Demo mode: only verify the username matches the demo account and that
    // a non-empty password was provided. DO NOT keep any real passwords here.
    return String(u).trim() === ALLOWED_USER && String(p).trim().length > 0;
  }

  document.addEventListener('DOMContentLoaded', () =>{
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const u = (document.getElementById('username')||{}).value || '';
      const p = (document.getElementById('password')||{}).value || '';
      const err = document.getElementById('loginError');

      if (Date.now() < lockedUntil) {
        if (err) err.textContent = 'Too many attempts. Please wait a moment and try again.';
        return;
      }

      if (validateCredentials(u,p)){
        // set session flag (do NOT store password)
        sessionStorage.setItem('ce_user', ALLOWED_USER);
        // redirect to dashboard (use data-success-url if present)
        const redirect = form.getAttribute('data-success-url') || 'dashboard.html';
        window.location.href = redirect;
      } else {
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          lockedUntil = Date.now() + LOCKOUT_MS;
          if (err) err.textContent = 'Too many attempts. Please wait a moment and try again.';
          attempts = 0; // reset after lockout
        } else {
          if (err) err.textContent = 'Invalid username or password (demo mode: use username BOSS and any non-empty password).';
        }
      }
    });
  });
})();
