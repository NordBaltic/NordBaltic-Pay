export function playUISound(soundFile = "/sounds/click.mp3", volume = 0.5) {
  if (typeof window !== "undefined") {  // ✅ FIX: Užtikrina, kad kodas neveiktų `server-side`
    let sound = new Audio(soundFile);
    sound.volume = volume;
    sound.play().catch((e) => console.warn("Audio playback failed:", e)); // ✅ FIX: Gaudomas klaidų pranešimas
  }
}

// ✅ 🔥 PATOBULINTA: Garsų "pool" mechanizmas greitesniam atkūrimui
const soundPool = {
  click: new Audio("/sounds/click.mp3"),
  hover: new Audio("/sounds/hover.mp3"),
  success: new Audio("/sounds/success.mp3"),
  error: new Audio("/sounds/error.mp3"),
};

function playFromPool(type = "click", volume = 0.5) {
  if (typeof window !== "undefined" && soundPool[type]) {
    soundPool[type].volume = volume;
    soundPool[type].currentTime = 0;  // ✅ FIX: Perkrauna garsą be `lag`
    soundPool[type].play().catch((e) => console.warn("Audio playback failed:", e));
  }
}

// ✅ **Automatinis garsų pritaikymas UI mygtukams**
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".button, .navbar a").forEach((el) => {
      el.addEventListener("click", () => playFromPool("click"));
    });

    document.querySelectorAll(".button, .navbar a").forEach((el) => {
      el.addEventListener("mouseenter", () => playFromPool("hover", 0.3));  // ✅ Patobulintas hover efektas
    });

    document.querySelectorAll(".success-action").forEach((el) => {
      el.addEventListener("click", () => playFromPool("success", 0.7));  // ✅ `success` garsas
    });

    document.querySelectorAll(".error-action").forEach((el) => {
      el.addEventListener("click", () => playFromPool("error", 0.7));  // ✅ `error` garsas
    });
  });
}
