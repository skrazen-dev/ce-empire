/* =========================================================
   CE EMPIRE — command center dashboard (static)
   Auth guard + mock data render + live counters + logout.
   No backend: figures are illustrative and animate locally.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Auth guard ---------- */
  var user = null;
  try { user = sessionStorage.getItem('ce_user'); } catch (e) {}
  if (!user) { window.location.href = 'index.html'; return; }

  function $(id) { return document.getElementById(id); }

  document.addEventListener('DOMContentLoaded', function () {
    var nameEl = $('userName'), avEl = $('userAv');
    if (nameEl) nameEl.textContent = user;
    if (avEl) avEl.textContent = (user[0] || 'B').toUpperCase();

    var out = $('logoutBtn');
    if (out) out.addEventListener('click', function () {
      if (window.ceSound) window.ceSound.click();
      try { sessionStorage.removeItem('ce_user'); } catch (e) {}
      window.location.href = 'index.html';
    });

    renderAccounts();
    renderTxns();
    renderAgents();
    startCounters();
  });

  /* ---------- Bank accounts (mock) ---------- */
  var ACCOUNTS = [
    { nm: 'SCB ไทยพาณิชย์',  no: 'xxx-x-x4821-x', bal: 18420500, cap: 22000000, col: '#4e2a84' },
    { nm: 'KBANK กสิกรไทย',  no: 'xxx-x-x1190-x', bal: 12880000, cap: 15000000, col: '#0a8a3a' },
    { nm: 'BBL กรุงเทพ',     no: 'xxx-x-x7733-x', bal:  9650000, cap: 12000000, col: '#1c3f99' },
    { nm: 'KTB กรุงไทย',     no: 'xxx-x-x2045-x', bal:  5210000, cap:  8000000, col: '#00a0e9' },
    { nm: 'BAY กรุงศรี',     no: 'xxx-x-x6610-x', bal:  2760000, cap:  5000000, col: '#b8860b' }
  ];
  function baht(n) { return Number(n).toLocaleString('en-US'); }
  function renderAccounts() {
    var box = $('accts'); if (!box) return;
    box.innerHTML = ACCOUNTS.map(function (a) {
      var pct = Math.min(100, Math.round(a.bal / a.cap * 100));
      var initials = a.nm.split(' ')[0].slice(0, 3).toUpperCase();
      return '<div class="acct">' +
        '<div class="badge" style="background:' + a.col + '">' + initials + '</div>' +
        '<div class="meta"><div class="nm">' + a.nm + '</div><div class="no">' + a.no + '</div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
        '<div class="amt"><div class="v">฿ ' + baht(a.bal) + '</div><div class="s">ใช้ ' + pct + '%</div></div>' +
        '</div>';
    }).join('');
  }

  /* ---------- Recent transactions (mock) ---------- */
  var TXNS = [
    { t: '09:41', d: 'รับโอน · ลูกค้า A',     b: 'SCB',   a:  185000, dir: 'in',  s: 'ok',   sl: 'สำเร็จ' },
    { t: '09:38', d: 'ถอน · กระเป๋า USDT',    b: 'KBANK', a: -420000, dir: 'out', s: 'ok',   sl: 'สำเร็จ' },
    { t: '09:33', d: 'รับโอน · ลูกค้า B',     b: 'BBL',   a:  92500,  dir: 'in',  s: 'wait', sl: 'รอตรวจ' },
    { t: '09:27', d: 'จ่าย · ค่าธรรมเนียม',   b: 'KTB',   a: -3200,   dir: 'out', s: 'ok',   sl: 'สำเร็จ' },
    { t: '09:19', d: 'รับโอน · ลูกค้า C',     b: 'SCB',   a:  640000, dir: 'in',  s: 'rev',  sl: 'ตรวจสอบ' },
    { t: '09:08', d: 'รับโอน · ลูกค้า D',     b: 'BAY',   a:  58000,  dir: 'in',  s: 'ok',   sl: 'สำเร็จ' }
  ];
  function renderTxns() {
    var body = $('txns'); if (!body) return;
    body.innerHTML = TXNS.map(function (x) {
      var cls = x.dir === 'in' ? 'in' : 'out';
      var sign = x.a >= 0 ? '+' : '−';
      return '<tr><td>' + x.t + '</td><td>' + x.d + '</td><td>' + x.b + '</td>' +
        '<td class="' + cls + '">' + sign + '฿ ' + baht(Math.abs(x.a)) + '</td>' +
        '<td><span class="pill ' + x.s + '">' + x.sl + '</span></td></tr>';
    }).join('');
  }

  /* ---------- AI agents (mock) ---------- */
  var AGENTS = [
    { nm: 'Reconciler', role: 'จับคู่สลิป/รายการ', st: '#34d399' },
    { nm: 'Risk Sentinel', role: 'เฝ้าระวังวงเงิน', st: '#34d399' },
    { nm: 'USDT Pricer', role: 'อัปเดตเรตเรียลไทม์', st: '#34d399' },
    { nm: 'Slip OCR', role: 'อ่านสลิปอัตโนมัติ', st: '#d4af37' },
    { nm: 'Report Bot', role: 'สรุปรายวัน', st: '#6b7076' }
  ];
  function renderAgents() {
    var box = $('agents'); if (!box) return;
    box.innerHTML = AGENTS.map(function (g) {
      var label = g.st === '#34d399' ? 'ทำงาน' : (g.st === '#d4af37' ? 'กำลังประมวลผล' : 'พัก');
      return '<div class="agent"><span class="st" style="background:' + g.st + '"></span>' +
        '<span class="nm">' + g.nm + ' <span class="role">· ' + g.role + '</span></span>' +
        '<span class="role">' + label + '</span></div>';
    }).join('');
  }

  /* ---------- Live KPI counters ---------- */
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function jitter(base, pct) { var x = base * (Math.random() * pct); return base + (Math.random() > 0.5 ? x : -x); }
  function animate(el, from, to, ms, d) {
    if (!el) return; var s = performance.now();
    function f(t) { var p = Math.min(1, (t - s) / ms); var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, d); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  function startCounters() {
    var bal = 48920500, profit = 185920, vol = 12582450, usdt = 42590;
    var elBal = $('kpiBalance'), elP = $('kpiProfit'), elV = $('kpiVolume'), elU = $('kpiUsdt');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    setInterval(function () {
      var nb = jitter(bal, 0.004); if (elBal) animate(elBal, bal, nb, 1000, 0); bal = nb;
      var np = jitter(profit, 0.03); if (elP) animate(elP, profit, np, 1000, 0); profit = np;
      var nv = jitter(vol, 0.015); if (elV) animate(elV, vol, nv, 1100, 0); vol = nv;
      var nu = jitter(usdt, 0.02); if (elU) animate(elU, usdt, nu, 1100, 2); usdt = nu;
    }, 4500);
  }
})();
