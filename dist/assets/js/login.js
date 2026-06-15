// Client-side login handler adapted to use server-side authentication.
// Sends credentials to POST /api/login and relies on an httpOnly session cookie set by the server.
// This file no longer validates credentials in the client — it defers to the server.

(function(){
  const formSelector = '#loginForm';
  const ALLOWED_USER = 'BOSS'; // still used for UX guidance only

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(formSelector);
    if (!form) return;
    const err = document.getElementById('loginError');

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (err) err.textContent = '';

      const u = (document.getElementById('username') || {}).value || '';
      const p = (document.getElementById('password') || {}).value || '';

      // Basic client-side checks to avoid empty submissions
      if (!u || !p) {
        if (err) err.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
        return;
      }

      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // include httpOnly cookie
          body: JSON.stringify({ username: u, password: p })
        });

        if (resp.ok) {
          // login success — server sets cookie; redirect to dashboard
          const data = await resp.json();
          // optional: store a safe display name in sessionStorage
          if (data && data.user) sessionStorage.setItem('ce_user', data.user);
          const redirect = form.getAttribute('data-success-url') || 'dashboard.html';
          window.location.href = redirect;
        } else if (resp.status === 401) {
          if (err) err.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        } else if (resp.status === 429) {
          if (err) err.textContent = 'Too many attempts. Please wait and try again.';
        } else {
          if (err) err.textContent = 'ระบบเกิดข้อผิดพลาด โปรดลองใหม่ภายหลัง';
          console.warn('Login error', resp.status, await resp.text());
        }
      } catch (e) {
        console.error('Login request failed', e);
        if (err) err.textContent = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }
    });
  });
})();
