// Client-side login handler that accepts ONLY username: BOSS password: Qw114477
// WARNING: This is client-side auth for demo only. Do NOT use plaintext passwords in production.
(function(){
  const ALLOWED_USER = 'BOSS';
  const ALLOWED_PASS = 'Qw114477';

  // Basic brute-force guard for demo: allow 5 attempts then disable for 15s
  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15000;
  let lockedUntil = 0;

  try {
    if (window.demoUsers) window.demoUsers = [{username:ALLOWED_USER}];
    if (window.defaultUsers) window.defaultUsers = [{username:ALLOWED_USER}];
  } catch(e){ /* ignore */ }

  function validateCredentials(u,p){
    if (Date.now() < lockedUntil) return false;
    return String(u).trim() === ALLOWED_USER && String(p).trim() === ALLOWED_PASS;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
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
        sessionStorage.setItem('ce_user','BOSS');
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
          if (err) err.textContent = 'Invalid username or password';
        }
      }
    });
  });
})();
