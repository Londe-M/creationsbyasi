const canvas = document.getElementById("coastal-film");
const context = canvas.getContext("2d");
const sceneElements = [...document.querySelectorAll(".scene")];
const filmCounter = document.getElementById("film-counter");
const captionNumber = document.getElementById("film-caption-number");
const captionTitle = document.getElementById("film-caption-title");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const palette = {
  rust: "#b85530",
  ink: "#371e13",
  sand: "#e1d3a9",
  camel: "#c0aa8a",
  bark: "#734f31",
  cream: "#f6eddf",
};

const labels = ["First light", "Made to be remembered", "More recognisable", "A digital space"];
let activeScene = 0;
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
let canvasWidth = 1;
let canvasHeight = 1;
let time = 0;

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = Math.max(1, Math.round(rect.width * pixelRatio));
  canvasHeight = Math.max(1, Math.round(rect.height * pixelRatio));
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createGradient(top, bottom) {
  const gradient = context.createLinearGradient(0, 0, 0, canvasHeight / pixelRatio);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  return gradient;
}

function drawStar(x, y, radius, color, points = 8) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  for (let point = 0; point < points * 2; point += 1) {
    const angle = (Math.PI * point) / points;
    const length = point % 2 === 0 ? radius : radius * 0.13;
    const xPosition = Math.cos(angle - Math.PI / 2) * length;
    const yPosition = Math.sin(angle - Math.PI / 2) * length;
    if (point === 0) context.moveTo(xPosition, yPosition);
    else context.lineTo(xPosition, yPosition);
  }
  context.closePath();
  context.fill();
  context.restore();
}

function drawGrain(width, height) {
  context.save();
  context.globalAlpha = 0.085;
  context.fillStyle = palette.ink;
  for (let index = 0; index < 560; index += 1) {
    const x = (index * 71 + time * 0.04) % width;
    const y = (index * 37 + time * 0.02) % height;
    context.fillRect(x, y, 0.7, 0.7);
  }
  context.restore();
}

function drawWave(y, amplitude, frequency, color, alpha = 1) {
  const width = canvasWidth / pixelRatio;
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = alpha;
  context.lineWidth = 1;
  context.beginPath();
  for (let x = -10; x <= width + 10; x += 5) {
    const pointY = y + Math.sin(x * frequency + time * 0.0014) * amplitude;
    if (x === -10) context.moveTo(x, pointY);
    else context.lineTo(x, pointY);
  }
  context.stroke();
  context.restore();
}

function drawMonogram(x, y, size, color, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.font = `italic ${size}px Georgia`;
  context.textBaseline = "middle";
  context.fillText("c", x, y);
  context.fillText("a.", x + size * 0.56, y);
  drawStar(x + size * 0.58, y - size * 0.06, size * 0.1, color);
  context.restore();
}

function drawSceneOne(width, height) {
  context.fillStyle = createGradient("#d3bc96", "#a56a45");
  context.fillRect(0, 0, width, height);

  const sunSize = Math.min(width, height) * 0.33;
  const sunX = width * 0.5;
  const sunY = height * 0.45;
  const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 1.7);
  glow.addColorStop(0, "rgba(255, 244, 211, .64)");
  glow.addColorStop(1, "rgba(255, 244, 211, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.fillStyle = palette.rust;
  context.beginPath();
  context.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(55, 30, 19, .20)";
  context.fillRect(0, height * 0.57, width, 1);
  for (let line = 0; line < 6; line += 1) {
    drawWave(height * (0.61 + line * 0.055), 2 + line * 1.2, 0.026, palette.cream, 0.32 - line * 0.03);
  }
  drawStar(width * 0.7, height * 0.3, width * 0.08, palette.cream);
  drawMonogram(width * 0.12, height * 0.78, width * 0.26, palette.ink, 0.78);
}

function poster(x, y, width, height, rotation, background, headline, subline) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = "rgba(0, 0, 0, .16)";
  context.fillRect(7, 8, width, height);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(246, 237, 223, .55)";
  context.lineWidth = 1;
  context.strokeRect(8, 8, width - 16, height - 16);
  drawStar(width * 0.65, height * 0.32, width * 0.12, palette.cream);
  context.fillStyle = palette.cream;
  context.font = `${Math.max(10, width * 0.08)}px Georgia`;
  context.fillText(headline, width * 0.13, height * 0.63);
  context.font = `${Math.max(6, width * 0.035)}px monospace`;
  context.fillText(subline.toUpperCase(), width * 0.13, height * 0.76);
  context.restore();
}

function drawSceneTwo(width, height) {
  context.fillStyle = createGradient("#371e13", "#734f31");
  context.fillRect(0, 0, width, height);
  const halo = context.createRadialGradient(width * 0.55, height * 0.45, 0, width * 0.55, height * 0.45, width * 0.75);
  halo.addColorStop(0, "rgba(184, 85, 48, .86)");
  halo.addColorStop(1, "rgba(184, 85, 48, 0)");
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);
  poster(width * 0.1, height * 0.2, width * 0.55, height * 0.48, -0.13, palette.rust, "A moment", "made to keep");
  poster(width * 0.48, height * 0.42, width * 0.43, height * 0.37, 0.11, palette.camel, "in bloom", "with cba");
  drawStar(width * 0.18, height * 0.78, width * 0.05, palette.sand);
  drawWave(height * 0.85, 4, 0.028, palette.sand, 0.3);
}

function drawSceneThree(width, height) {
  context.fillStyle = createGradient("#e1d3a9", "#c0aa8a");
  context.fillRect(0, 0, width, height);
  context.save();
  context.strokeStyle = "rgba(55, 30, 19, .42)";
  context.lineWidth = 1;
  for (let ring = 0; ring < 5; ring += 1) {
    context.beginPath();
    context.ellipse(width * 0.48, height * 0.52, width * (0.42 - ring * 0.065), height * (0.35 - ring * 0.052), -0.4, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
  context.fillStyle = palette.ink;
  context.beginPath();
  context.arc(width * 0.49, height * 0.52, width * 0.17, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = palette.sand;
  context.beginPath();
  context.arc(width * 0.57, height * 0.45, width * 0.16, 0, Math.PI * 2);
  context.fill();
  drawStar(width * 0.49, height * 0.52, width * 0.08, palette.rust);
  context.fillStyle = palette.ink;
  context.font = `${Math.max(10, width * 0.034)}px monospace`;
  context.fillText("MAKE IT YOURS", width * 0.09, height * 0.15);
  context.fillText("CBA / IDENTITY STUDY", width * 0.09, height * 0.87);
}

function drawSceneFour(width, height) {
  context.fillStyle = createGradient("#bc6038", "#371e13");
  context.fillRect(0, 0, width, height);
  const sunY = height * 0.38;
  const sun = context.createRadialGradient(width * 0.54, sunY, 0, width * 0.54, sunY, width * 0.34);
  sun.addColorStop(0, "rgba(246, 237, 223, .97)");
  sun.addColorStop(0.48, "rgba(225, 211, 169, .65)");
  sun.addColorStop(1, "rgba(225, 211, 169, 0)");
  context.fillStyle = sun;
  context.fillRect(0, 0, width, height);
  for (let line = 0; line < 12; line += 1) {
    drawWave(height * (0.53 + line * 0.036), 1 + line * 1.6, 0.024, palette.cream, 0.28 - line * 0.011);
  }
  context.strokeStyle = "rgba(246, 237, 223, .7)";
  context.strokeRect(width * 0.11, height * 0.13, width * 0.78, height * 0.68);
  context.fillStyle = palette.cream;
  context.font = `${Math.max(27, width * 0.085)}px Georgia`;
  context.fillText("Your space,", width * 0.18, height * 0.36);
  context.fillText("in motion.", width * 0.18, height * 0.45);
  context.font = `${Math.max(7, width * 0.024)}px monospace`;
  context.fillText("DIGITAL EXPERIENCES / CBA", width * 0.18, height * 0.68);
  drawStar(width * 0.78, height * 0.25, width * 0.045, palette.sand);
}

function drawFilm() {
  const width = canvasWidth / pixelRatio;
  const height = canvasHeight / pixelRatio;
  context.clearRect(0, 0, width, height);
  if (activeScene === 0) drawSceneOne(width, height);
  if (activeScene === 1) drawSceneTwo(width, height);
  if (activeScene === 2) drawSceneThree(width, height);
  if (activeScene === 3) drawSceneFour(width, height);
  drawGrain(width, height);
}

function setScene(index) {
  const nextScene = Math.max(0, Math.min(index, labels.length - 1));
  if (nextScene === activeScene && document.querySelector(".scene.is-active")) return;
  activeScene = nextScene;
  sceneElements.forEach((scene, sceneIndex) => {
    scene.classList.toggle("is-active", sceneIndex === activeScene);
  });
  const label = String(activeScene + 1).padStart(2, "0");
  filmCounter.textContent = `${label} / 04`;
  captionNumber.textContent = label;
  captionTitle.textContent = labels[activeScene];
  drawFilm();
}

function updateSceneFromScroll() {
  const viewportTarget = window.innerHeight * 0.47;
  let closestIndex = activeScene;
  let closestDistance = Number.POSITIVE_INFINITY;
  sceneElements.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const distance = Math.abs(middle - viewportTarget);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  setScene(closestIndex);
}

function animate(timestamp) {
  time = timestamp;
  drawFilm();
  if (!reducedMotion) requestAnimationFrame(animate);
}

fitCanvas();
drawFilm();
window.addEventListener("resize", () => {
  fitCanvas();
  drawFilm();
});
window.addEventListener("scroll", updateSceneFromScroll, { passive: true });
updateSceneFromScroll();
document.getElementById("year").textContent = new Date().getFullYear();

if (!reducedMotion) requestAnimationFrame(animate);
