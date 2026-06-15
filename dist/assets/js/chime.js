/* =========================================================
   CE EMPIRE — audio engine + premium wealth chime
   - One shared AudioContext, created/resumed on the first user gesture
     (required by browser autoplay policies).
   - Exposes window.ceSound: { chime, hover, click, open, close,
     success, error, toggle, muted } so other scripts can play cues.
   - The entrance chime plays ONCE after the first gesture (unless muted).
   - All sounds are synthesized (no binary assets). Mute state persists
     in localStorage('ce_muted'); honoured everywhere.
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'ce_muted';
  var ctx = null, master = null;
  var muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) {}
  var chimePlayed = false;

  function ensureCtx() {
    if (ctx) {
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return ctx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    return ctx;
  }

  /* A single shaped tone (with optional pitch glide). */
  function tone(o) {
    if (muted) return;
    var c = ensureCtx(); if (!c) return;
    var t0 = c.currentTime + (o.delay || 0);
    var dur = o.dur || 0.2;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    var peak = (o.gain == null) ? 0.2 : o.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  function chord(freqs, o) {
    freqs.forEach(function (f, i) {
      tone({ freq: f, type: o.type, dur: o.dur, gain: o.gain, delay: (o.stagger || 0) * i });
    });
  }

  var API = {
    get muted() { return muted; },

    /* Richer ascending arpeggio with shimmer partials + a soft bass bed. */
    chime: function () {
      if (muted) return;
      var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 E5 G5 C6 E6
      notes.forEach(function (f, i) {
        tone({ freq: f, type: 'sine', dur: 1.6, gain: 0.22, delay: i * 0.11 });
        tone({ freq: f * 2.001, type: 'triangle', dur: 1.15, gain: 0.05, delay: i * 0.11 });
      });
      tone({ freq: 130.81, type: 'sine', dur: 1.9, gain: 0.12 }); // C3 bed
    },

    hover:   function () { tone({ freq: 880,  to: 1320, type: 'sine',     dur: 0.09, gain: 0.045 }); },
    click:   function () { tone({ freq: 660,  to: 990,  type: 'triangle', dur: 0.12, gain: 0.11  }); },
    open:    function () { chord([392, 523.25, 659.25],          { type: 'sine', dur: 0.5, gain: 0.11, stagger: 0.05 }); },
    close:   function () { tone({ freq: 440, to: 220, type: 'sine', dur: 0.22, gain: 0.09 }); },
    success: function () { chord([523.25, 659.25, 783.99, 1046.50], { type: 'sine', dur: 0.7, gain: 0.16, stagger: 0.07 }); },
    error:   function () {
      tone({ freq: 220, to: 150, type: 'sawtooth', dur: 0.30, gain: 0.10 });
      tone({ freq: 160, type: 'square', dur: 0.16, gain: 0.045, delay: 0.07 });
    },

    toggle: function () {
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
      if (!muted) { ensureCtx(); API.click(); }
      document.dispatchEvent(new CustomEvent('ce-sound-toggle', { detail: { muted: muted } }));
      return muted;
    }
  };
  window.ceSound = API;

  function firstGesture() {
    ensureCtx();
    if (!chimePlayed) { chimePlayed = true; API.chime(); }
    document.removeEventListener('pointerdown', firstGesture);
    document.removeEventListener('keydown', firstGesture);
  }
  document.addEventListener('pointerdown', firstGesture, { once: true, passive: true });
  document.addEventListener('keydown', firstGesture, { once: true });
})();
