export function playUISound() {
  const sound = new Audio('/sounds/click.mp3');
  sound.volume = 0.5;
  sound.play();
}

document.querySelectorAll('.button, .navbar a').forEach((el) => {
  el.addEventListener('click', playUISound);
});
