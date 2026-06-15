/* =========================================================
   CE EMPIRE — premium wealth chime
   Plays ONCE, after the user's first gesture (required by browser
   autoplay policies). Synthesized with the Web Audio API so no binary
   asset is needed; if a custom file exists at
   assets/sounds/premium-chime.mp3 it is used instead.
   ========================================================= */
(function () {
  'use strict';
  var played = false;

  function playFile() {
    try {
      var audio = new Audio('assets/sounds/premium-chime.mp3');
      audio.preload = 'auto';
      return audio.play().then(function () { return true; }).catch(function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function playSynth() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      var ctx = new AC();
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();

      var now = ctx.currentTime;
      var master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);

      // gentle ascending arpeggio — warm, bell-like "wealth" chime
      var notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
      notes.forEach(function (freq, i) {
        var t = now + i * 0.12;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // subtle shimmer with a detuned partial
        var osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2.001;
        var gain2 = ctx.createGain();
        gain2.gain.value = 0.18;

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

        osc.connect(gain); osc2.connect(gain2); gain2.connect(gain);
        gain.connect(master);
        osc.start(t); osc2.start(t);
        osc.stop(t + 1.5); osc2.stop(t + 1.5);
      });

      // master swell + long tail
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.6, now + 0.05);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 2600);
      return true;
    } catch (e) {
      return false;
    }
  }

  function playOnce() {
    if (played) return;
    played = true;
    document.removeEventListener('pointerdown', playOnce);
    document.removeEventListener('keydown', playOnce);

    // Prefer a curated file if present, else synthesize.
    playFile().then(function (ok) {
      if (!ok) playSynth();
    });
  }

  document.addEventListener('pointerdown', playOnce, { once: true, passive: true });
  document.addEventListener('keydown', playOnce, { once: true });
})();
