export function playUISound() {
  if (typeof document !== "undefined") {  // ✅ FIX: Patikrina, ar `document` egzistuoja
    const sound = new Audio('/sounds/click.mp3');
    sound.volume = 0.5;
    sound.play();
  }
}

if (typeof document !== "undefined") {  // ✅ FIX: Užtikrina, kad kodas neveiktų `server-side`
  document.querySelectorAll('.button, .navbar a').forEach((el) => {
    el.addEventListener('click', playUISound);
  });
}
