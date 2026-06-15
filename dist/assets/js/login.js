// Client-side login handler that accepts ONLY username: BOSS password: Qw114477
// WARNING: This is client-side auth for demo only. Do NOT use plaintext passwords in production.
(function(){
  const ALLOWED_USER = 'BOSS';
  // keep password string local only in this closure; still visible in built JS — this is insecure by design for client-only approach
  const ALLOWED_PASS = 'Qw114477';

  // If project has any demo user arrays on window, override them to prevent other demo users from working
  try {
    if (window.demoUsers) window.demoUsers = [{username:ALLOWED_USER}];
    if (window.defaultUsers) window.defaultUsers = [{username:ALLOWED_USER}];
  } catch(e){ /* ignore */ }

  function validateCredentials(u,p){
    return String(u).trim() === ALLOWED_USER && String(p) === ALLOWED_PASS;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const u = (document.getElementById('username')||{}).value || '';
      const p = (document.getElementById('password')||{}).value || '';
      const err = document.getElementById('loginError');
      if (validateCredentials(u,p)){
        // set session flag (do NOT store password)
        sessionStorage.setItem('ce_user','BOSS');
        // redirect to dashboard (use data-success-url if present)
        const redirect = form.getAttribute('data-success-url') || 'dashboard.html';
        window.location.href = redirect;
      } else {
        if (err) err.textContent = 'Invalid username or password';
      }
    });
  });
})();