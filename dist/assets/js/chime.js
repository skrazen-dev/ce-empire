// premium chime: plays once on first user gesture (pointerdown/click/touch)
// Place your audio file at: assets/sounds/premium-chime.mp3
(function(){
  const AUDIO_PATH = 'assets/sounds/premium-chime.mp3';
  let played = false;
  let chime = null;

  try {
    chime = new Audio(AUDIO_PATH);
    chime.preload = 'auto';
  } catch(e){
    console.warn('Chime: unable to create audio element', e);
  }

  function playOnce(){
    if (played) return;
    if (!chime) { played = true; return; }
    // attempt to play; some browsers may reject play without gesture — we attached to a gesture
    chime.play().then(()=>{
      // success
    }).catch((err)=>{
      // play may be blocked or file missing; surface a console warning for debugging
      console.warn('Chime: play failed', err);
    }).finally(()=>{
      played = true;
    });
    document.removeEventListener('pointerdown', playOnce);
  }

  // listen for errors (e.g., missing file)
  if (chime) {
    chime.addEventListener('error', function(ev){
      console.warn('Chime: audio failed to load or decode', ev);
    });
  }

  // Use passive + once to avoid blocking scroll and ensure single call
  document.addEventListener('pointerdown', playOnce, { once: true, passive: true });
})();
