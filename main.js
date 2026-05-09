const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const retryButton = document.getElementById("retryButton");
const scoreEl = document.getElementById("score");
const onikuNameEl = document.getElementById("onikuName");
const onikuIconEl = document.getElementById("onikuIcon");
const coachCommentEl = document.getElementById("coachComment");
const nextIconEl = document.getElementById("nextIcon");
const nextNameEl = document.getElementById("nextName");
const gameOverPanel = document.getElementById("gameOverPanel");
const comboText = document.getElementById("comboText");
const stageTrackEl = document.getElementById("stageTrack");

const BASE_WIDTH = 420;
const BASE_HEIGHT = 620;
const DROP_Y = 42;
const GAME_OVER_LINE = 88;
const GRAVITY = 0.22;
const FRICTION = 0.992;
const BOUNCE = 0.18;
const SPECIAL_CHANCE = 0.11;

const normalIcons = [
  { id: "water", name: "水ボトル", emoji: "💧", radius: 22, color: "#79d9ff", outline: "#257aa8", score: 10 },
  { id: "towel", name: "タオル", emoji: "🧻", radius: 26, color: "#ffffff", outline: "#ff8fa8", score: 24 },
  { id: "shaker", name: "プロテインシェイカー", emoji: "🥤", radius: 30, color: "#ffd166", outline: "#d98600", score: 52 },
  { id: "dumbbell", name: "ダンベル", emoji: "🏋️", radius: 35, color: "#a7e8bd", outline: "#2f8f60", score: 110 },
  { id: "kettlebell", name: "ケトルベル", emoji: "🔔", radius: 40, color: "#c8b6ff", outline: "#6847b8", score: 230 },
  { id: "plate", name: "プレート", emoji: "⚙️", radius: 46, color: "#d7dce5", outline: "#5f6876", score: 480 },
  { id: "barbell", name: "バーベル", emoji: "🏋️‍♂️", radius: 52, color: "#ffb36c", outline: "#b14e1e", score: 990 },
  { id: "rack", name: "パワーラック", emoji: "▣", radius: 60, color: "#f15d5d", outline: "#263154", score: 2100 },
];

const specialIcons = [
  { id: "shiba", name: "柴犬アイコン", emoji: "🐕", radius: 30, color: "#f7943d", outline: "#b84e22", score: 120, kind: "special", effect: "upgradeNearby" },
  { id: "macho", name: "マッチョマンアイコン", emoji: "💪", radius: 34, color: "#d9a1ff", outline: "#9a3fc7", score: 150, kind: "special", effect: "bumpNearby" },
  { id: "lifter", name: "パワーリフターアイコン", emoji: "🏆", radius: 34, color: "#2d2f38", outline: "#e94d46", score: 180, kind: "special", effect: "pressDown" },
  { id: "coach", name: "ごすじんアイコン", emoji: "🏃‍♀️", radius: 30, color: "#ffb6d0", outline: "#263154", score: 130, kind: "special", effect: "rerollOrTidy" },
];

const onikuStages = [
  { name: "ふつうのおにく君", icon: "🐕", score: 0 },
  { name: "やる気おにく君", icon: "🐕‍🦺", score: 180 },
  { name: "フィットネスおにく君", icon: "🎽", score: 480 },
  { name: "マッスルおにく君", icon: "💪", score: 980 },
  { name: "パワーしば", icon: "🔥", score: 1700 },
  { name: "マッチョしば", icon: "🏋️", score: 2800 },
  { name: "リフターしば", icon: "🏆", score: 4300 },
  { name: "わんモア・ビースト", icon: "⚡", score: 6200 },
];

const comments = {
  normal: ["いい感じだよ、おにく！", "まだいけるよ！", "あともうわんレップ！", "その調子！", "しっぽ上がってるよ！"],
  merge: ["ナイス合体！", "今のいいリズム！", "おにく、成長してる！", "ワンモアレップ！"],
  pinch: ["あわてなくて大丈夫！", "まだ巻き返せるよ！", "落ち着いていこう！", "おにくならできる！"],
  evolve: ["えっ！？おにく、たくましくなってない！？", "すごいよ、おにく！", "どんどん変わっていくね！", "でも顔はいつものおにくだね！"],
};

const audioHooks = {
  drop: () => {},
  merge: () => {},
  special: () => {},
  gameOver: () => {},
};

let pieces = [];
let currentDrop = null;
let nextIcon = null;
let dropX = BASE_WIDTH / 2;
let canDrop = true;
let isGameOver = false;
let score = 0;
let currentStageIndex = 0;
let comboCount = 0;
let pieceId = 0;
let animationId = null;
let normalCommentTimer = null;
let lastTime = 0;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickNextIcon() {
  if (Math.random() < SPECIAL_CHANCE) return { ...pickRandom(specialIcons) };
  const poolSize = Math.min(5, 2 + Math.floor(score / 800));
  return { ...pickRandom(normalIcons.slice(0, poolSize)) };
}

function createPiece(icon, x, y, held = false) {
  return {
    id: pieceId++,
    icon,
    x,
    y,
    vx: 0,
    vy: held ? 0 : 1,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.03,
    held,
    merging: false,
    usedSpecial: false,
    bornAt: performance.now(),
  };
}

function setCoachComment(type) {
  coachCommentEl.textContent = pickRandom(comments[type] || comments.normal);
}

function updateNextUI() {
  nextIconEl.textContent = nextIcon.emoji;
  nextIconEl.style.borderColor = nextIcon.outline;
  nextIconEl.style.background = nextIcon.color;
  nextNameEl.textContent = nextIcon.name;
}

function updateScore(points) {
  score += points;
  scoreEl.textContent = score.toLocaleString("ja-JP");
  updateOnikuStage();
}

function updateOnikuStage() {
  let newIndex = currentStageIndex;
  for (let i = onikuStages.length - 1; i >= 0; i -= 1) {
    if (score >= onikuStages[i].score) {
      newIndex = i;
      break;
    }
  }

  if (newIndex !== currentStageIndex) {
    currentStageIndex = newIndex;
    setCoachComment("evolve");
    onikuNameEl.classList.remove("stage-pop");
    void onikuNameEl.offsetWidth;
    onikuNameEl.classList.add("stage-pop");
  }

  onikuNameEl.textContent = onikuStages[currentStageIndex].name;
  onikuIconEl.textContent = onikuStages[currentStageIndex].icon;
  updateStageTrack();
}

function initializeStageTrack() {
  stageTrackEl.innerHTML = onikuStages
    .map(
      (stage, index) => `
        <div class="stage-node" data-stage="${index}">
          <b>${stage.icon}</b>
          <small>${stage.name.replace("おにく君", "")}</small>
        </div>
      `,
    )
    .join("");
  updateStageTrack();
}

function updateStageTrack() {
  if (!stageTrackEl) return;
  stageTrackEl.querySelectorAll(".stage-node").forEach((node, index) => {
    node.classList.toggle("is-current", index === currentStageIndex);
    node.classList.toggle("is-cleared", index < currentStageIndex);
  });
}

function prepareDrop() {
  currentDrop = createPiece(nextIcon, dropX, DROP_Y, true);
  pieces.push(currentDrop);
  nextIcon = pickNextIcon();
  updateNextUI();
}

function dropCurrentIcon() {
  if (!canDrop || isGameOver || !currentDrop) return;
  currentDrop.held = false;
  currentDrop.vy = 1.4;
  currentDrop = null;
  canDrop = false;
  audioHooks.drop();
  setTimeout(() => {
    if (!isGameOver) {
      canDrop = true;
      prepareDrop();
    }
  }, 520);
}

function moveDrop(clientX) {
  if (!currentDrop || isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * BASE_WIDTH;
  dropX = Math.max(30, Math.min(BASE_WIDTH - 30, x));
  currentDrop.x = dropX;
}

function physicsStep() {
  for (const piece of pieces) {
    if (piece.held || piece.merging) continue;
    piece.vy += GRAVITY;
    piece.vx *= FRICTION;
    piece.vy *= FRICTION;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.angle += piece.spin + piece.vx * 0.001;
    resolveWalls(piece);
  }

  for (let pass = 0; pass < 5; pass += 1) {
    for (let i = 0; i < pieces.length; i += 1) {
      for (let j = i + 1; j < pieces.length; j += 1) {
        resolvePieceCollision(pieces[i], pieces[j]);
      }
    }
  }
}

function resolveWalls(piece) {
  const r = piece.icon.radius;
  if (piece.x - r < 0) {
    piece.x = r;
    piece.vx = Math.abs(piece.vx) * BOUNCE;
  }
  if (piece.x + r > BASE_WIDTH) {
    piece.x = BASE_WIDTH - r;
    piece.vx = -Math.abs(piece.vx) * BOUNCE;
  }
  if (piece.y + r > BASE_HEIGHT) {
    piece.y = BASE_HEIGHT - r;
    piece.vy = -Math.abs(piece.vy) * BOUNCE;
    piece.vx *= 0.94;
    piece.spin *= 0.86;
  }
}

function resolvePieceCollision(a, b) {
  if (a.merging || b.merging) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 0.001;
  const minDistance = a.icon.radius + b.icon.radius;
  if (distance >= minDistance) return;

  if (!a.held && !b.held && canMerge(a, b)) {
    mergePieces(a, b);
    return;
  }

  if (!a.held && !b.held && (a.icon.kind === "special" || b.icon.kind === "special")) {
    triggerSpecial(a.icon.kind === "special" ? a : b);
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;
  const aMove = a.held ? 0 : 0.5;
  const bMove = b.held ? 0 : 0.5;
  a.x -= nx * overlap * aMove;
  a.y -= ny * overlap * aMove;
  b.x += nx * overlap * bMove;
  b.y += ny * overlap * bMove;

  const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  const impulse = Math.min(1.6, Math.max(-1.6, relativeVelocity * -0.45));
  if (!a.held) {
    a.vx -= nx * impulse;
    a.vy -= ny * impulse;
  }
  if (!b.held) {
    b.vx += nx * impulse;
    b.vy += ny * impulse;
  }
}

function canMerge(a, b) {
  return a.icon.kind !== "special" && b.icon.kind !== "special" && a.icon.id === b.icon.id;
}

function mergePieces(a, b) {
  a.merging = true;
  b.merging = true;
  const level = normalIcons.findIndex((icon) => icon.id === a.icon.id);
  const nextLevel = Math.min(level + 1, normalIcons.length - 1);
  const icon = normalIcons[nextLevel];
  const merged = createPiece(icon, (a.x + b.x) / 2, (a.y + b.y) / 2);
  merged.vx = (a.vx + b.vx) * 0.25;
  merged.vy = -3.2;

  pieces = pieces.filter((piece) => piece !== a && piece !== b);
  pieces.push(merged);
  comboCount += 1;
  updateScore(icon.score);
  showCombo(comboCount > 1 ? `${comboCount} COMBO!` : "合体！");
  setCoachComment("merge");
  audioHooks.merge();
  setTimeout(() => {
    comboCount = Math.max(0, comboCount - 1);
  }, 1000);
}

function triggerSpecial(piece) {
  if (piece.usedSpecial) return;
  piece.usedSpecial = true;
  updateScore(piece.icon.score);
  showCombo("SPECIAL!");
  setCoachComment("merge");
  audioHooks.special();

  if (piece.icon.effect === "bumpNearby") {
    affectNearby(piece, 125, (target, distance) => {
      const dx = target.x - piece.x;
      const dy = target.y - piece.y;
      const len = Math.hypot(dx, dy) || 1;
      const power = 8 * (1 - distance / 125);
      target.vx += (dx / len) * power;
      target.vy += (dy / len) * power - 1.5;
    });
  }

  if (piece.icon.effect === "pressDown") {
    affectNearby(piece, 145, (target) => {
      target.vy += 5.5;
      target.vx *= 0.45;
    });
  }

  if (piece.icon.effect === "upgradeNearby") {
    upgradeNearby(piece);
  }

  if (piece.icon.effect === "rerollOrTidy") {
    nextIcon = pickNextIcon();
    updateNextUI();
    affectNearby(piece, 110, (target) => {
      target.vx *= 0.25;
      target.vy *= 0.25;
    });
  }

  pieces = pieces.filter((target) => target !== piece);
}

function affectNearby(source, radius, callback) {
  for (const target of pieces) {
    if (target === source || target.held || target.icon.kind === "special") continue;
    const distance = Math.hypot(target.x - source.x, target.y - source.y);
    if (distance <= radius) callback(target, distance);
  }
}

function upgradeNearby(source) {
  const targets = pieces
    .filter((piece) => piece !== source && !piece.held && piece.icon.kind !== "special")
    .sort((a, b) => Math.hypot(a.x - source.x, a.y - source.y) - Math.hypot(b.x - source.x, b.y - source.y))
    .slice(0, 3);

  for (const target of targets) {
    const level = normalIcons.findIndex((icon) => icon.id === target.icon.id);
    if (level < 0 || level >= normalIcons.length - 1) continue;
    target.icon = normalIcons[level + 1];
    target.vy = -2;
    updateScore(Math.floor(target.icon.score * 0.5));
  }
}

function showCombo(text) {
  comboText.textContent = text;
  comboText.classList.remove("is-active");
  void comboText.offsetWidth;
  comboText.classList.add("is-active");
}

function checkGameOver() {
  if (isGameOver) return;
  const now = performance.now();
  const danger = pieces.some((piece) => {
    if (piece.held || piece.merging) return false;
    return now - piece.bornAt > 2400 && piece.y - piece.icon.radius < GAME_OVER_LINE && Math.abs(piece.vy) < 0.45;
  });
  if (danger) {
    setCoachComment("pinch");
    endGame();
  }
}

function endGame() {
  isGameOver = true;
  canDrop = false;
  gameOverPanel.classList.remove("is-hidden");
  audioHooks.gameOver();
}

function draw() {
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
  drawDropGuide();
  for (const piece of pieces) drawIcon(piece);
}

function drawDropGuide() {
  if (!currentDrop || isGameOver) return;
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 8]);
  ctx.moveTo(currentDrop.x, DROP_Y + 28);
  ctx.lineTo(currentDrop.x, BASE_HEIGHT - 10);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(38, 49, 84, 0.22)";
  ctx.stroke();
  ctx.restore();
}

function drawIcon(piece) {
  const { icon } = piece;
  const r = icon.radius;
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.angle);

  ctx.save();
  ctx.translate(4, 8);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(32, 34, 56, 0.18)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = icon.color;
  ctx.fill();
  ctx.lineWidth = Math.max(5, r * 0.14);
  ctx.strokeStyle = icon.outline;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.54)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fill();

  ctx.font = `${Math.floor(r * 0.86)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#202238";
  ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 3;
  ctx.fillText(icon.emoji, 0, 2);
  ctx.shadowBlur = 0;

  if (r >= 38) {
    ctx.rotate(-piece.angle);
    ctx.font = "700 9px Hiragino Sans, Yu Gothic, Meiryo, sans-serif";
    ctx.fillStyle = "rgba(32, 34, 56, 0.82)";
    ctx.fillText(icon.name.replace("プロテイン", "").replace("アイコン", ""), 0, r * 0.55);
  }
  ctx.restore();
}

function loop(time) {
  const delta = Math.min(32, time - lastTime || 16);
  lastTime = time;
  if (!isGameOver) {
    const steps = Math.max(1, Math.round(delta / 16));
    for (let i = 0; i < steps; i += 1) physicsStep();
    checkGameOver();
  }
  draw();
  animationId = requestAnimationFrame(loop);
}

function resetGame() {
  if (animationId) cancelAnimationFrame(animationId);
  pieces = [];
  currentDrop = null;
  dropX = BASE_WIDTH / 2;
  canDrop = true;
  isGameOver = false;
  score = 0;
  comboCount = 0;
  currentStageIndex = 0;
  pieceId = 0;
  scoreEl.textContent = "0";
  gameOverPanel.classList.add("is-hidden");
  setCoachComment("normal");
  updateOnikuStage();
  nextIcon = pickNextIcon();
  prepareDrop();
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

function startGame() {
  titleScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  resetGame();
  clearInterval(normalCommentTimer);
  normalCommentTimer = setInterval(() => {
    if (!isGameOver) setCoachComment("normal");
  }, 9000);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);
retryButton.addEventListener("click", resetGame);

canvas.addEventListener("pointermove", (event) => moveDrop(event.clientX));
canvas.addEventListener("pointerdown", (event) => {
  moveDrop(event.clientX);
  dropCurrentIcon();
});

window.addEventListener("keydown", (event) => {
  if (gameScreen.classList.contains("is-hidden")) return;
  if (event.key === "ArrowLeft") {
    dropX = Math.max(30, dropX - 22);
    if (currentDrop) currentDrop.x = dropX;
  }
  if (event.key === "ArrowRight") {
    dropX = Math.min(BASE_WIDTH - 30, dropX + 22);
    if (currentDrop) currentDrop.x = dropX;
  }
  if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
    event.preventDefault();
    dropCurrentIcon();
  }
});

nextIcon = pickNextIcon();
updateNextUI();
updateOnikuStage();
initializeStageTrack();
setCoachComment("normal");
