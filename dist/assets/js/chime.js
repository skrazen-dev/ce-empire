// premium chime: plays once on first user gesture (pointerdown/click/touch)
// Place your audio file at: assets/sounds/premium-chime.mp3
(function(){
  const AUDIO_PATH = 'assets/sounds/premium-chime.mp3';
  let played = false;
  const chime = new Audio(AUDIO_PATH);
  chime.preload = 'auto';
  function playOnce() {
    if (played) return;
    chime.play().catch(()=>{/* play may be blocked if removed gesture, ignore */});
    played = true;
    document.removeEventListener('pointerdown', playOnce);
  }
  // Use passive listener to avoid blocking scroll
  document.addEventListener('pointerdown', playOnce, { once: true, passive: true });
})();