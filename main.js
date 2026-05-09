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
const boardWrapEl = document.querySelector(".board-wrap");
const coachFaceEl = document.querySelector(".coach-face");
const gameLogoEl = document.querySelector(".game-logo");
const titleLogoImageEl = document.getElementById("titleLogoImage");
const onikuLiveArtEl = document.getElementById("onikuLiveArt");
const onikuLiveNameEl = document.getElementById("onikuLiveName");
const miniStageTrackEl = document.getElementById("miniStageTrack");

const DESKTOP_BASE_WIDTH = 420;
const MOBILE_BASE_WIDTH = 360;
const DESKTOP_BASE_HEIGHT = 620;
const MOBILE_BASE_HEIGHT = 500;
const DROP_Y = 42;
const DESKTOP_GAME_OVER_LINE = 88;
const MOBILE_GAME_OVER_LINE = 118;
const GRAVITY = 0.22;
const FRICTION = 0.992;
const BOUNCE = 0.18;
const SPECIAL_CHANCE = 0.11;
const ASSET_VERSION = "20260509-12";
const USE_TITLE_IMAGE_LOGO = false;
const imageCache = new Map();
const failedAssets = new Set();
let loadedAssetCount = 0;

const normalIcons = [
  { id: "water", name: "\u{6c34}\u{30dc}\u{30c8}\u{30eb}", shortName: "\u{6c34}", imageKey: "icon-water", assetPath: "assets/icons/icon_water.png", emoji: "\u{1f4a7}", radius: 22, color: "#79d9ff", outline: "#257aa8", score: 10 },
  { id: "towel", name: "\u{30bf}\u{30aa}\u{30eb}", shortName: "\u{30bf}\u{30aa}\u{30eb}", imageKey: "icon-towel", assetPath: "assets/icons/icon_towel.png", emoji: "\u{1f9fb}", radius: 26, color: "#ffffff", outline: "#ff8fa8", score: 24 },
  { id: "shaker", name: "\u{30d7}\u{30ed}\u{30c6}\u{30a4}\u{30f3}\u{30b7}\u{30a7}\u{30a4}\u{30ab}\u{30fc}", shortName: "\u{30b7}\u{30a7}\u{30a4}\u{30ab}\u{30fc}", imageKey: "icon-shaker", assetPath: "assets/icons/icon_shaker.png", emoji: "\u{1f964}", radius: 30, color: "#ffd166", outline: "#d98600", score: 52 },
  { id: "dumbbell", name: "\u{30c0}\u{30f3}\u{30d9}\u{30eb}", shortName: "DB", imageKey: "icon-dumbbell", assetPath: "assets/icons/icon_dumbbell.png", emoji: "\u{1f3cb}\u{fe0f}", radius: 35, color: "#a7e8bd", outline: "#2f8f60", score: 110 },
  { id: "kettlebell", name: "\u{30b1}\u{30c8}\u{30eb}\u{30d9}\u{30eb}", shortName: "KB", imageKey: "icon-kettlebell", assetPath: "assets/icons/icon_kettlebell.png", emoji: "\u{1f514}", radius: 40, color: "#c8b6ff", outline: "#6847b8", score: 230 },
  { id: "plate", name: "\u{30d7}\u{30ec}\u{30fc}\u{30c8}", shortName: "\u{76bf}", imageKey: "icon-plate", assetPath: "assets/icons/icon_plate.png", emoji: "\u{2699}\u{fe0f}", radius: 46, color: "#d7dce5", outline: "#5f6876", score: 480 },
  { id: "barbell", name: "\u{30d0}\u{30fc}\u{30d9}\u{30eb}", shortName: "\u{30d0}\u{30fc}", imageKey: "icon-barbell", assetPath: "assets/icons/icon_barbell.png", emoji: "\u{1f3cb}\u{fe0f}\u{200d}\u{2642}\u{fe0f}", radius: 52, color: "#ffb36c", outline: "#b14e1e", score: 990 },
  { id: "rack", name: "\u{30d1}\u{30ef}\u{30fc}\u{30e9}\u{30c3}\u{30af}", shortName: "\u{30e9}\u{30c3}\u{30af}", imageKey: "icon-rack", assetPath: "assets/icons/icon_rack.png", emoji: "\u{25a3}", radius: 60, color: "#f15d5d", outline: "#263154", score: 2100 },
];

const specialIcons = [
  { id: "shiba", name: "\u{67f4}\u{72ac}\u{30a2}\u{30a4}\u{30b3}\u{30f3}", shortName: "\u{304a}\u{306b}\u{304f}", imageKey: "icon-shiba", assetPath: "assets/icons/icon_shiba.png", emoji: "\u{1f415}", radius: 30, color: "#f7943d", outline: "#b84e22", score: 120, kind: "special", effect: "upgradeNearby" },
  { id: "macho", name: "\u{30de}\u{30c3}\u{30c1}\u{30e7}\u{30de}\u{30f3}\u{30a2}\u{30a4}\u{30b3}\u{30f3}", shortName: "\u{30de}\u{30c3}\u{30c1}\u{30e7}", imageKey: "icon-macho", assetPath: "assets/icons/icon_macho.png", emoji: "\u{1f4aa}", radius: 34, color: "#d9a1ff", outline: "#9a3fc7", score: 150, kind: "special", effect: "bumpNearby" },
  { id: "lifter", name: "\u{30d1}\u{30ef}\u{30fc}\u{30ea}\u{30d5}\u{30bf}\u{30fc}\u{30a2}\u{30a4}\u{30b3}\u{30f3}", shortName: "\u{30ea}\u{30d5}\u{30bf}\u{30fc}", imageKey: "icon-lifter", assetPath: "assets/icons/icon_lifter.png", emoji: "\u{1f3c6}", radius: 34, color: "#2d2f38", outline: "#e94d46", score: 180, kind: "special", effect: "pressDown" },
  { id: "coach", name: "\u{3054}\u{3059}\u{3058}\u{3093}\u{30a2}\u{30a4}\u{30b3}\u{30f3}", shortName: "\u{3054}\u{3059}\u{3058}\u{3093}", imageKey: "icon-coach", assetPath: "assets/icons/icon_coach.png", emoji: "\u{1f3c3}\u{200d}\u{2640}\u{fe0f}", radius: 30, color: "#ffb6d0", outline: "#263154", score: 130, kind: "special", effect: "rerollOrTidy" },
];

const onikuStages = [
  { name: "\u{3075}\u{3064}\u{3046}\u{306e}\u{304a}\u{306b}\u{304f}\u{541b}", shortName: "\u{3075}\u{3064}\u{3046}", imageKey: "oniku-stage-01", assetPath: "assets/characters/oniku/oniku_stage_01_normal.png", icon: "\u{1f415}", score: 0 },
  { name: "\u{3084}\u{308b}\u{6c17}\u{304a}\u{306b}\u{304f}\u{541b}", shortName: "\u{3084}\u{308b}\u{6c17}", imageKey: "oniku-stage-02", assetPath: "assets/characters/oniku/oniku_stage_02_motivated.png", icon: "\u{1f415}\u{200d}\u{1f9ba}", score: 600 },
  { name: "\u{30d5}\u{30a3}\u{30c3}\u{30c8}\u{30cd}\u{30b9}\u{304a}\u{306b}\u{304f}\u{541b}", shortName: "\u{30d5}\u{30a3}\u{30c3}\u{30c8}\u{30cd}\u{30b9}", imageKey: "oniku-stage-03", assetPath: "assets/characters/oniku/oniku_stage_03_fitness.png", icon: "\u{1f3bd}", score: 1400 },
  { name: "\u{30de}\u{30c3}\u{30b9}\u{30eb}\u{304a}\u{306b}\u{304f}\u{541b}", shortName: "\u{30de}\u{30c3}\u{30b9}\u{30eb}", imageKey: "oniku-stage-04", assetPath: "assets/characters/oniku/oniku_stage_04_muscle.png", icon: "\u{1f4aa}", score: 2600 },
  { name: "\u{30d1}\u{30ef}\u{30fc}\u{3057}\u{3070}", shortName: "\u{30d1}\u{30ef}\u{30fc}", imageKey: "oniku-stage-05", assetPath: "assets/characters/oniku/oniku_stage_05_power_shiba.png", icon: "\u{1f525}", score: 4200 },
  { name: "\u{30de}\u{30c3}\u{30c1}\u{30e7}\u{3057}\u{3070}", shortName: "\u{30de}\u{30c3}\u{30c1}\u{30e7}", imageKey: "oniku-stage-06", assetPath: "assets/characters/oniku/oniku_stage_06_macho_shiba.png", icon: "\u{1f3cb}\u{fe0f}", score: 6500 },
  { name: "\u{30ea}\u{30d5}\u{30bf}\u{30fc}\u{3057}\u{3070}", shortName: "\u{30ea}\u{30d5}\u{30bf}\u{30fc}", imageKey: "oniku-stage-07", assetPath: "assets/characters/oniku/oniku_stage_07_lifter_shiba.png", icon: "\u{1f3c6}", score: 9500 },
  { name: "\u{308f}\u{3093}\u{30e2}\u{30a2}\u{30fb}\u{30d3}\u{30fc}\u{30b9}\u{30c8}", shortName: "\u{30d3}\u{30fc}\u{30b9}\u{30c8}", imageKey: "oniku-stage-08", assetPath: "assets/characters/oniku/oniku_stage_08_one_more_beast.png", icon: "\u{26a1}", score: 13500 },
];

const CHARACTER_ASSETS = {
  coach: {
    idle: "assets/characters/coach/char_coach_idle.png",
    cheer: "assets/characters/coach/char_coach_cheer.png",
    surprise: "assets/characters/coach/char_coach_surprise.png",
    worry: "assets/characters/coach/char_coach_worry.png",
    happy: "assets/characters/coach/char_coach_happy.png",
  },
  macho: {
    flex: "assets/characters/macho/char_macho_flex.png",
    excited: "assets/characters/macho/char_macho_excited.png",
  },
  lifter: {
    focus: "assets/characters/lifter/char_lifter_focus.png",
    approve: "assets/characters/lifter/char_lifter_approve.png",
  },
};

const UI_ASSETS = {
  logo: "assets/ui/logo_wanwan_one_more_rep.png",
};

const BACKGROUND_ASSETS = {
  title: "assets/backgrounds/bg_title_gym_outside.png",
  game: "assets/backgrounds/bg_game_mystery_gym.png",
  evolution: "assets/backgrounds/bg_evolution_burst.png",
};

const comments = {
  normal: ["\u{3044}\u{3044}\u{611f}\u{3058}\u{3060}\u{3088}\u{3001}\u{304a}\u{306b}\u{304f}\u{ff01}", "\u{307e}\u{3060}\u{3044}\u{3051}\u{308b}\u{3088}\u{ff01}", "\u{3042}\u{3068}\u{3082}\u{3046}\u{308f}\u{3093}\u{30ec}\u{30c3}\u{30d7}\u{ff01}", "\u{305d}\u{306e}\u{8abf}\u{5b50}\u{ff01}", "\u{3057}\u{3063}\u{307d}\u{4e0a}\u{304c}\u{3063}\u{3066}\u{308b}\u{3088}\u{ff01}"],
  merge: ["\u{30ca}\u{30a4}\u{30b9}\u{5408}\u{4f53}\u{ff01}", "\u{4eca}\u{306e}\u{3044}\u{3044}\u{30ea}\u{30ba}\u{30e0}\u{ff01}", "\u{304a}\u{306b}\u{304f}\u{3001}\u{6210}\u{9577}\u{3057}\u{3066}\u{308b}\u{ff01}", "\u{30ef}\u{30f3}\u{30e2}\u{30a2}\u{30ec}\u{30c3}\u{30d7}\u{ff01}"],
  pinch: ["\u{3042}\u{308f}\u{3066}\u{306a}\u{304f}\u{3066}\u{5927}\u{4e08}\u{592b}\u{ff01}", "\u{307e}\u{3060}\u{5dfb}\u{304d}\u{8fd4}\u{305b}\u{308b}\u{3088}\u{ff01}", "\u{843d}\u{3061}\u{7740}\u{3044}\u{3066}\u{3044}\u{3053}\u{3046}\u{ff01}", "\u{304a}\u{306b}\u{304f}\u{306a}\u{3089}\u{3067}\u{304d}\u{308b}\u{ff01}"],
  evolve: ["\u{3048}\u{3063}\u{ff01}\u{ff1f}\u{304a}\u{306b}\u{304f}\u{3001}\u{305f}\u{304f}\u{307e}\u{3057}\u{304f}\u{306a}\u{3063}\u{3066}\u{306a}\u{3044}\u{ff01}\u{ff1f}", "\u{3059}\u{3054}\u{3044}\u{3088}\u{3001}\u{304a}\u{306b}\u{304f}\u{ff01}", "\u{3069}\u{3093}\u{3069}\u{3093}\u{5909}\u{308f}\u{3063}\u{3066}\u{3044}\u{304f}\u{306d}\u{ff01}", "\u{3067}\u{3082}\u{9854}\u{306f}\u{3044}\u{3064}\u{3082}\u{306e}\u{304a}\u{306b}\u{304f}\u{3060}\u{306d}\u{ff01}"],
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
let dropX = DESKTOP_BASE_WIDTH / 2;
let canDrop = true;
let isGameOver = false;
let score = 0;
let evolutionPoints = 0;
let currentStageIndex = 0;
let comboCount = 0;
let pieceId = 0;
let animationId = null;
let normalCommentTimer = null;
let lastTime = 0;
let baseWidth = getBaseWidth();
let baseHeight = getBaseHeight();
let titleLogoNoticeShown = false;

function isMobileViewport() {
  return window.matchMedia("(max-width: 520px)").matches;
}

function getBaseWidth() {
  return isMobileViewport() ? MOBILE_BASE_WIDTH : DESKTOP_BASE_WIDTH;
}

function getBaseHeight() {
  return isMobileViewport() ? MOBILE_BASE_HEIGHT : DESKTOP_BASE_HEIGHT;
}

function getGameOverLine() {
  return isMobileViewport() ? MOBILE_GAME_OVER_LINE : DESKTOP_GAME_OVER_LINE;
}

function setupCanvasDpr() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  baseWidth = getBaseWidth();
  baseHeight = getBaseHeight();
  canvas.width = baseWidth * dpr;
  canvas.height = baseHeight * dpr;
  canvas.style.aspectRatio = `${baseWidth} / ${baseHeight}`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function versionAssetPath(src) {
  if (!src) return null;
  return `${src}${src.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}

function getFlatAssetPath(src) {
  if (!src || !src.includes("/")) return null;
  return src.split("/").pop();
}

function preloadImage(key, src, fallbackSources = []) {
  if (!key || !src || imageCache.has(key) || failedAssets.has(key)) return;
  const sources = [src, ...fallbackSources].filter(Boolean);
  let sourceIndex = 0;

  const loadSource = () => {
    const currentSrc = sources[sourceIndex];
    const image = new Image();
    image.onload = () => {
      imageCache.set(key, image);
      loadedAssetCount += 1;
      console.info("Loaded asset:", key, currentSrc);
      updateAssetDrivenUI();
    };
    image.onerror = () => {
      console.warn("Asset failed to load:", currentSrc);
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        loadSource();
        return;
      }
      failedAssets.add(key);
    };
    image.src = versionAssetPath(currentSrc);
  };

  loadSource();
}

function preloadAssetWithFlatFallback(key, src) {
  preloadImage(key, src, [getFlatAssetPath(src)]);
}

function preloadAssetGroup(prefix, assetMap) {
  Object.entries(assetMap).forEach(([state, src]) => preloadAssetWithFlatFallback(`${prefix}-${state}`, src));
}

function getCachedImage(key) {
  return imageCache.get(key) || null;
}

function preloadGameAssets() {
  [...normalIcons, ...specialIcons].forEach((icon) => preloadAssetWithFlatFallback(icon.imageKey, icon.assetPath));
  onikuStages.forEach((stage) => preloadAssetWithFlatFallback(stage.imageKey, stage.assetPath));
  preloadAssetGroup("coach", CHARACTER_ASSETS.coach);
  preloadAssetGroup("macho", CHARACTER_ASSETS.macho);
  preloadAssetGroup("lifter", CHARACTER_ASSETS.lifter);
  if (USE_TITLE_IMAGE_LOGO) {
    Object.entries(UI_ASSETS).forEach(([key, src]) => preloadAssetWithFlatFallback(`ui-${key}`, src));
  }
  Object.entries(BACKGROUND_ASSETS).forEach(([key, src]) => preloadAssetWithFlatFallback(`bg-${key}`, src));
}

function updateAssetDrivenUI() {
  updateNextUI();
  updateOnikuStageVisual();
  updateCoachVisual();
  updateStageTrack();
  updateTitleLogo();
  updateBackgroundAssets();
  console.info(`Assets ready: ${loadedAssetCount} loaded, ${failedAssets.size} failed`);
}

function getCoachAssetState(type = "normal") {
  const stateByType = {
    normal: "idle",
    merge: "cheer",
    cheer: "cheer",
    evolve: "surprise",
    pinch: "worry",
    danger: "worry",
    success: "happy",
  };
  return stateByType[type] || "idle";
}

function updateCoachVisual(type = "normal") {
  if (!coachFaceEl) return;
  const state = getCoachAssetState(type);
  const image = getCachedImage(`coach-${state}`);
  coachFaceEl.innerHTML = image ? `<img src="${image.src}" alt="\u{3054}\u{3059}\u{3058}\u{3093}">` : "\u{1f3c3}\u{200d}\u{2640}\u{fe0f}";
}

function updateTitleLogo() {
  if (!titleLogoImageEl || !gameLogoEl) return;
  if (!USE_TITLE_IMAGE_LOGO) {
    titleLogoImageEl.classList.remove("is-loaded");
    gameLogoEl.classList.remove("is-replaced");
    titleLogoImageEl.removeAttribute("src");
    if (!titleLogoNoticeShown) {
      console.info("Title logo image disabled; using CSS logo.");
      titleLogoNoticeShown = true;
    }
    return;
  }
  const image = getCachedImage("ui-logo");
  console.info("Title logo image src:", image ? image.src : "fallback CSS logo");
  titleLogoImageEl.classList.toggle("is-loaded", Boolean(image));
  gameLogoEl.classList.toggle("is-replaced", Boolean(image));
  if (image && titleLogoImageEl.src !== image.src) {
    titleLogoImageEl.src = image.src;
  }
}

function applyAssetBackground(element, key) {
  if (!element) return;
  const image = getCachedImage(`bg-${key}`);
  element.classList.toggle("has-asset-bg", Boolean(image));
  if (image) {
    element.style.setProperty("--asset-bg", `url("${image.src}")`);
  } else {
    element.style.removeProperty("--asset-bg");
  }
}

function updateBackgroundAssets() {
  applyAssetBackground(titleScreen, "title");
  applyAssetBackground(gameScreen, "game");
  const evolutionImage = getCachedImage("bg-evolution");
  boardWrapEl.classList.toggle("has-evolution-bg", Boolean(evolutionImage));
  if (evolutionImage) {
    boardWrapEl.style.setProperty("--evolution-bg", `url("${evolutionImage.src}")`);
  } else {
    boardWrapEl.style.removeProperty("--evolution-bg");
  }
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
  updateCoachVisual(type);
}

function updateNextUI() {
  if (!nextIcon) return;
  const image = getCachedImage(nextIcon.imageKey);
  const assetTitle = `${nextIcon.imageKey} / ${nextIcon.name}`;
  nextIconEl.dataset.key = nextIcon.imageKey;
  nextIconEl.title = assetTitle;
  nextIconEl.classList.toggle("has-image", Boolean(image));
  nextIconEl.innerHTML = image
    ? `<img class="next-art" src="${image.src}" alt="" data-key="${nextIcon.imageKey}" title="${assetTitle}"><span class="next-short">${nextIcon.shortName}</span>`
    : `<span class="next-short">${nextIcon.shortName}</span>`;
  nextIconEl.style.borderColor = nextIcon.outline;
  nextIconEl.style.background = nextIcon.color;
  nextNameEl.textContent = nextIcon.name;
}

function updateScore(points, evolutionGain = Math.floor(points * 0.35)) {
  score += points;
  evolutionPoints += evolutionGain;
  scoreEl.textContent = score.toLocaleString("ja-JP");
  updateOnikuStage();
}

function updateOnikuStage() {
  let newIndex = currentStageIndex;
  for (let i = onikuStages.length - 1; i >= 0; i -= 1) {
    if (evolutionPoints >= onikuStages[i].score) {
      newIndex = i;
      break;
    }
  }

  if (newIndex !== currentStageIndex) {
    currentStageIndex = newIndex;
    setCoachComment("evolve");
    showEvolutionEffect(onikuStages[currentStageIndex].name);
    onikuNameEl.classList.remove("stage-pop");
    void onikuNameEl.offsetWidth;
    onikuNameEl.classList.add("stage-pop");
  }

  onikuNameEl.textContent = onikuStages[currentStageIndex].name;
  updateOnikuStageVisual();
  updateStageTrack();
}

function updateOnikuStageVisual() {
  const stage = onikuStages[currentStageIndex];
  if (!stage) return;
  const image = getCachedImage(stage.imageKey);
  onikuIconEl.dataset.key = stage.imageKey;
  onikuIconEl.title = `${stage.imageKey} / ${stage.name}`;
  onikuIconEl.innerHTML = image ? `<img src="${image.src}" alt="" data-key="${stage.imageKey}" title="${stage.imageKey} / ${stage.name}">` : stage.icon;
  updateOnikuLiveCard(stage, image);
}

function initializeStageTrack() {
  stageTrackEl.innerHTML = onikuStages
    .map(
      (stage, index) => `
        <div class="stage-node" data-stage="${index}" data-key="${stage.imageKey}" title="${stage.imageKey} / ${stage.name}">
          <img class="stage-thumb" alt="" data-key="${stage.imageKey}" title="${stage.imageKey} / ${stage.name}">
          <b>${stage.icon}</b>
          <small>${stage.shortName}</small>
        </div>
      `,
    )
    .join("");
  if (miniStageTrackEl) {
    miniStageTrackEl.innerHTML = onikuStages
      .map((stage, index) => `<span data-stage="${index}" data-key="${stage.imageKey}" title="${stage.imageKey} / ${stage.name}"></span>`)
      .join("");
  }
  updateStageTrack();
}

function updateStageTrack() {
  if (!stageTrackEl) return;
  stageTrackEl.querySelectorAll(".stage-node").forEach((node, index) => {
    const stage = onikuStages[index];
    const image = getCachedImage(stage.imageKey);
    const thumb = node.querySelector(".stage-thumb");
    node.dataset.key = stage.imageKey;
    node.title = `${stage.imageKey} / ${stage.name}`;
    if (thumb) {
      thumb.dataset.key = stage.imageKey;
      thumb.title = `${stage.imageKey} / ${stage.name}`;
      if (image) thumb.src = image.src;
    }
    node.classList.toggle("has-image", Boolean(image));
    node.classList.toggle("is-current", index === currentStageIndex);
    node.classList.toggle("is-cleared", index < currentStageIndex);
  });
  if (miniStageTrackEl) {
    miniStageTrackEl.querySelectorAll("span").forEach((node, index) => {
      node.classList.toggle("is-current", index === currentStageIndex);
      node.classList.toggle("is-cleared", index < currentStageIndex);
    });
  }
}

function updateOnikuLiveCard(stage, image) {
  if (!onikuLiveArtEl || !onikuLiveNameEl || !stage) return;
  onikuLiveArtEl.dataset.key = stage.imageKey;
  onikuLiveArtEl.title = `${stage.imageKey} / ${stage.name}`;
  onikuLiveArtEl.innerHTML = image ? `<img src="${image.src}" alt="" data-key="${stage.imageKey}" title="${stage.imageKey} / ${stage.name}">` : stage.icon;
  onikuLiveNameEl.textContent = stage.name;
  onikuLiveArtEl.classList.remove("stage-pop");
  void onikuLiveArtEl.offsetWidth;
  onikuLiveArtEl.classList.add("stage-pop");
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
  const x = ((clientX - rect.left) / rect.width) * baseWidth;
  dropX = Math.max(30, Math.min(baseWidth - 30, x));
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
  if (piece.x + r > baseWidth) {
    piece.x = baseWidth - r;
    piece.vx = -Math.abs(piece.vx) * BOUNCE;
  }
  if (piece.y + r > baseHeight) {
    piece.y = baseHeight - r;
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
  showCombo(comboCount > 1 ? `${comboCount} COMBO!` : "\u{5408}\u{4f53}\u{ff01}");
  setCoachComment("merge");
  audioHooks.merge();
  setTimeout(() => {
    comboCount = Math.max(0, comboCount - 1);
  }, 1000);
}

function triggerSpecial(piece) {
  if (piece.usedSpecial) return;
  piece.usedSpecial = true;
  updateScore(piece.icon.score, 0);
  showCombo(getSpecialMessage(piece.icon));
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

function getSpecialMessage(icon) {
  const messages = {
    shiba: "\u{304a}\u{306b}\u{304f}\u{30d1}\u{30ef}\u{30fc}\u{ff01}\u{8fd1}\u{304f}\u{306e}\u{30a2}\u{30a4}\u{30b3}\u{30f3}\u{304c}\u{6210}\u{9577}\u{ff01}",
    macho: "\u{30de}\u{30c3}\u{30c1}\u{30e7}\u{30d6}\u{30fc}\u{30b9}\u{30c8}\u{ff01}\u{76e4}\u{9762}\u{3092}\u{62bc}\u{3057}\u{51fa}\u{3059}\u{ff01}",
    lifter: "\u{30ea}\u{30d5}\u{30bf}\u{30fc}\u{30d7}\u{30ec}\u{30b9}\u{ff01}\u{76e4}\u{9762}\u{3092}\u{5b89}\u{5b9a}\u{ff01}",
    coach: "\u{3054}\u{3059}\u{3058}\u{3093}\u{5fdc}\u{63f4}\u{ff01}NEXT\u{66f4}\u{65b0}\u{ff01}",
  };
  return messages[icon.id] || "SPECIAL!";
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
    updateScore(Math.floor(target.icon.score * 0.5), Math.floor(target.icon.score * 0.12));
  }
}

function showCombo(text) {
  comboText.textContent = text;
  comboText.classList.remove("is-active");
  void comboText.offsetWidth;
  comboText.classList.add("is-active");
}

function getEvolutionMessage(stageName) {
  const previewMessages = {
    "\u{3084}\u{308b}\u{6c17}\u{304a}\u{306b}\u{304f}\u{541b}": "\u{9032}\u{5316}\u{ff01}\n\u{3084}\u{308b}\u{6c17}\u{304a}\u{306b}\u{304f}\u{541b}\u{3078}\u{ff01}",
  };
  return previewMessages[stageName] || `\u{9032}\u{5316}\u{ff01}\n${stageName}\u{3078}\u{ff01}`;
}

function showEvolutionEffect(stageName) {
  showCombo(getEvolutionMessage(stageName));
  boardWrapEl.classList.remove("is-evolving");
  void boardWrapEl.offsetWidth;
  boardWrapEl.classList.add("is-evolving");
}

function checkGameOver() {
  if (isGameOver) return;
  const now = performance.now();
  const danger = pieces.some((piece) => {
    if (piece.held || piece.merging) return false;
    const settleTime = isMobileViewport() ? 1700 : 2400;
    const velocityLimit = isMobileViewport() ? 0.62 : 0.45;
    return now - piece.bornAt > settleTime && piece.y - piece.icon.radius < getGameOverLine() && Math.abs(piece.vy) < velocityLimit;
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
  ctx.clearRect(0, 0, baseWidth, baseHeight);
  drawDropGuide();
  for (const piece of pieces) drawIcon(piece);
}

function drawDropGuide() {
  if (!currentDrop || isGameOver) return;
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 8]);
  ctx.moveTo(currentDrop.x, DROP_Y + 28);
  ctx.lineTo(currentDrop.x, baseHeight - 10);
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

  drawIconBase(ctx, icon, r);
  if (!drawIconImage(ctx, icon, r)) {
    drawIconSymbol(ctx, icon, r);
  }

  if (r >= 38) {
    ctx.rotate(-piece.angle);
    ctx.font = "900 10px Hiragino Sans, Yu Gothic, Meiryo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(32, 34, 56, 0.82)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    ctx.lineWidth = 3;
    ctx.strokeText(icon.shortName, 0, r * 0.58);
    ctx.fillText(icon.shortName, 0, r * 0.58);
  }
  ctx.restore();
}

function drawIconBase(ctx, icon, r) {
  ctx.save();
  ctx.translate(4, 8);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(32, 34, 56, 0.2)";
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
  ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-r * 0.26, -r * 0.32, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fill();
}

function drawIconImage(ctx, icon, r) {
  const image = getCachedImage(icon.imageKey);
  if (!image) return false;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.clip();
  const imageScale = (icon.kind === "special" ? 1.66 : 1.72) + (isMobileViewport() ? 0.08 : 0);
  const size = r * imageScale;
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function drawIconSymbol(ctx, icon, r) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (icon.id) {
    case "water":
      drawWaterIcon(ctx, r);
      break;
    case "towel":
      drawTowelIcon(ctx, r);
      break;
    case "shaker":
      drawShakerIcon(ctx, r);
      break;
    case "dumbbell":
      drawDumbbellIcon(ctx, r);
      break;
    case "kettlebell":
      drawKettlebellIcon(ctx, r);
      break;
    case "plate":
      drawPlateIcon(ctx, r);
      break;
    case "barbell":
      drawBarbellIcon(ctx, r);
      break;
    case "rack":
      drawRackIcon(ctx, r);
      break;
    case "shiba":
      drawShibaIcon(ctx, r);
      break;
    case "macho":
      drawMachoIcon(ctx, r);
      break;
    case "lifter":
      drawLifterIcon(ctx, r);
      break;
    case "coach":
      drawCoachIcon(ctx, r);
      break;
    default:
      drawTextFallback(ctx, icon.shortName || icon.name, r);
      break;
  }
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, radius) {
  const rr = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
}

function drawWaterIcon(ctx, r) {
  const w = r * 0.52;
  const h = r * 1.08;
  roundedRect(ctx, -w / 2, -h / 2 + r * 0.06, w, h, r * 0.14);
  ctx.fillStyle = "#dff8ff";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#116c9d";
  ctx.stroke();
  roundedRect(ctx, -w * 0.28, -h / 2 - r * 0.13, w * 0.56, r * 0.24, r * 0.06);
  ctx.fillStyle = "#2f9bd0";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5ccdf4";
  ctx.fillRect(-w * 0.36, -r * 0.08, w * 0.72, r * 0.44);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -r * 0.34);
  ctx.lineTo(-w * 0.18, r * 0.34);
  ctx.stroke();
}

function drawTowelIcon(ctx, r) {
  const w = r * 1.18;
  const h = r * 0.72;
  roundedRect(ctx, -w / 2, -h / 2, w, h, r * 0.16);
  ctx.fillStyle = "#ffd0dc";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#c94b72";
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.07;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, i * h * 0.18);
    ctx.lineTo(w * 0.35, i * h * 0.18);
    ctx.stroke();
  }
  ctx.fillStyle = "#ff8fa8";
  roundedRect(ctx, -w * 0.45, -h * 0.45, w * 0.18, h * 0.9, r * 0.08);
  ctx.fill();
}

function drawShakerIcon(ctx, r) {
  const top = r * 0.68;
  const bottom = r * 0.48;
  const h = r * 1.12;
  ctx.beginPath();
  ctx.moveTo(-top / 2, -h / 2 + r * 0.1);
  ctx.lineTo(top / 2, -h / 2 + r * 0.1);
  ctx.lineTo(bottom / 2, h / 2);
  ctx.lineTo(-bottom / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = "#fff3b0";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#9b6300";
  ctx.stroke();
  roundedRect(ctx, -top * 0.62, -h / 2 - r * 0.12, top * 1.24, r * 0.24, r * 0.08);
  ctx.fillStyle = "#f08e1d";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${r * 0.36}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, r * 0.1);
}

function drawDumbbellIcon(ctx, r) {
  ctx.strokeStyle = "#1d5f43";
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.moveTo(-r * 0.54, 0);
  ctx.lineTo(r * 0.54, 0);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  for (const side of [-1, 1]) {
    roundedRect(ctx, side * r * 0.45 - side * r * 0.18, -r * 0.3, r * 0.26, r * 0.6, r * 0.08);
    ctx.fill();
    ctx.stroke();
    roundedRect(ctx, side * r * 0.68 - side * r * 0.18, -r * 0.36, r * 0.24, r * 0.72, r * 0.08);
    ctx.fill();
    ctx.stroke();
  }
}

function drawKettlebellIcon(ctx, r) {
  ctx.strokeStyle = "#442889";
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.48, 0, Math.PI * 2);
  ctx.fillStyle = "#7352d6";
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -r * 0.26, r * 0.38, Math.PI, 0);
  ctx.strokeStyle = "#2f205e";
  ctx.lineWidth = r * 0.16;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -r * 0.24, r * 0.22, Math.PI, 0);
  ctx.strokeStyle = "#cbbcff";
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
}

function drawPlateIcon(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#87909d";
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = "#3f4754";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f7fb";
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#cfd4dc";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBarbellIcon(ctx, r) {
  ctx.strokeStyle = "#263154";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.moveTo(-r * 0.68, 0);
  ctx.lineTo(r * 0.68, 0);
  ctx.stroke();
  ctx.fillStyle = "#5f6876";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      roundedRect(ctx, side * (r * (0.4 + i * 0.12)) - side * r * 0.08, -r * 0.34, r * 0.12, r * 0.68, r * 0.04);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function drawRackIcon(ctx, r) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.09;
  roundedRect(ctx, -r * 0.52, -r * 0.48, r * 1.04, r * 0.96, r * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.32, -r * 0.48);
  ctx.lineTo(-r * 0.32, r * 0.48);
  ctx.moveTo(r * 0.32, -r * 0.48);
  ctx.lineTo(r * 0.32, r * 0.48);
  ctx.moveTo(-r * 0.52, -r * 0.08);
  ctx.lineTo(r * 0.52, -r * 0.08);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  ctx.fillRect(-r * 0.42, r * 0.25, r * 0.84, r * 0.12);
}

function drawShibaIcon(ctx, r) {
  ctx.fillStyle = "#fff3df";
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a3d1a";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.fillStyle = "#f7943d";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.18, -r * 0.32);
    ctx.lineTo(side * r * 0.48, -r * 0.62);
    ctx.lineTo(side * r * 0.42, -r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#202238";
  ctx.beginPath();
  ctx.arc(-r * 0.17, -r * 0.02, r * 0.05, 0, Math.PI * 2);
  ctx.arc(r * 0.17, -r * 0.02, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, r * 0.13, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#202238";
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.arc(0, r * 0.18, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawMachoIcon(ctx, r) {
  ctx.fillStyle = "#ffd2ad";
  ctx.beginPath();
  ctx.arc(-r * 0.2, r * 0.05, r * 0.28, 0, Math.PI * 2);
  ctx.arc(r * 0.24, -r * 0.05, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a3f1c";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.strokeStyle = "#7a3f1c";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.moveTo(-r * 0.52, r * 0.28);
  ctx.quadraticCurveTo(-r * 0.22, -r * 0.28, r * 0.1, r * 0.16);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(r * 0.12, -r * 0.08, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function drawLifterIcon(ctx, r) {
  ctx.fillStyle = "#10131b";
  roundedRect(ctx, -r * 0.46, -r * 0.34, r * 0.92, r * 0.75, r * 0.12);
  ctx.fill();
  ctx.strokeStyle = "#e94d46";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.fillStyle = "#e94d46";
  roundedRect(ctx, -r * 0.44, r * 0.08, r * 0.88, r * 0.2, r * 0.04);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.moveTo(-r * 0.18, -r * 0.08);
  ctx.lineTo(-r * 0.04, -r * 0.08);
  ctx.moveTo(r * 0.04, -r * 0.08);
  ctx.lineTo(r * 0.18, -r * 0.08);
  ctx.moveTo(-r * 0.16, -r * 0.22);
  ctx.lineTo(r * 0.16, -r * 0.22);
  ctx.stroke();
}

function drawCoachIcon(ctx, r) {
  ctx.fillStyle = "#ffe2d0";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#263154";
  ctx.lineWidth = r * 0.07;
  ctx.stroke();
  ctx.strokeStyle = "#6a3b2a";
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.42, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  ctx.beginPath();
  ctx.arc(-r * 0.14, 0, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.14, 0, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e94d7d";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(0, r * 0.1, r * 0.16, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#ff7ba7";
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, r * 0.5);
  ctx.lineTo(0, r * 0.22);
  ctx.lineTo(r * 0.5, r * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawTextFallback(ctx, text, r) {
  ctx.font = `900 ${Math.max(10, r * 0.34)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#202238";
  ctx.fillText(text, 0, 0);
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
  baseWidth = getBaseWidth();
  baseHeight = getBaseHeight();
  dropX = baseWidth / 2;
  canDrop = true;
  isGameOver = false;
  score = 0;
  evolutionPoints = 0;
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
  document.body.classList.add("is-playing");
  titleScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  setupCanvasDpr();
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
    dropX = Math.min(baseWidth - 30, dropX + 22);
    if (currentDrop) currentDrop.x = dropX;
  }
  if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
    event.preventDefault();
    dropCurrentIcon();
  }
});

window.addEventListener("resize", setupCanvasDpr);

setupCanvasDpr();
preloadGameAssets();
nextIcon = pickNextIcon();
updateNextUI();
updateOnikuStage();
initializeStageTrack();
setCoachComment("normal");
updateTitleLogo();
updateBackgroundAssets();
