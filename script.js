// 1. Constants & State Management

const FRAME_CONFIG = {
  WIDTH: 960,
  HEIGHT: 672,
  STAGE_W: 1600,
  STAGE_H: 900,
  PADDING: 48,
};

const photoState = {
  naturalW: 0,
  naturalH: 0,
  baseScale: 1,
  offsetX: 0,
  offsetY: 0,
  scalePct: 100,
};

const dragState = {
  active: false,
  startX: 0,
  startY: 0,
  offsetX0: 0,
  offsetY0: 0,
};

// Cached DOM Elements
const DOM = {
  scaleWrapper: document.getElementById("scaleWrapper"),
  viewport: document.querySelector(".viewport"),
  captureArea: document.getElementById("captureArea"),
  captureBtn: document.getElementById("captureBtn"),
  inputPair: document.getElementById("inputPair"),
  inputAnniversary: document.getElementById(
    "inputAnniversary",
  ),
  inputCenter: document.getElementById("inputCenter"),
  pairText: document.getElementById("pairText"),
  anniversaryText: document.getElementById(
    "anniversaryText",
  ),
  codeCenterText: document.getElementById("codeCenterText"),
  codeLeftText: document.getElementById("codeLeftText"),
  codeRightText: document.getElementById("codeRightText"),
  codeLeftText2: document.getElementById("codeLeftText2"),
  codeRightText2: document.getElementById("codeRightText2"),
  photoInput: document.getElementById("photoInput"),
  photoScale: document.getElementById("photoScale"),
  photoImgs: [
    document.getElementById("photoMain"),
    document.getElementById("photoLeft"),
    document.getElementById("photoRight"),
  ],
  filterInputs: {
    brightness: document.getElementById("filterBrightness"),
    contrast: document.getElementById("filterContrast"),
    saturate: document.getElementById("filterSaturate"),
    sepia: document.getElementById("filterSepia"),
  },
  filterNumInputs: {
    brightness: document.getElementById(
      "filterBrightnessNum",
    ),
    contrast: document.getElementById("filterContrastNum"),
    saturate: document.getElementById("filterSaturateNum"),
    sepia: document.getElementById("filterSepiaNum"),
  },
  noiseOpacity: document.getElementById("noiseOpacity"),
  noiseOpacityNum: document.getElementById(
    "noiseOpacityNum",
  ),
};

// 2. Film UI Rendering (Sprockets & Barcodes)

function renderSprockets(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const holeW = 48;
  const frameWidth = 960;
  const inset = 16;
  const holesPerFrame = 8;
  const frameLefts = [-692, 320, 1332];
  const usableSpan = frameWidth - inset * 2;
  const step = (usableSpan - holeW) / (holesPerFrame - 1);

  const html = frameLefts
    .flatMap((frameLeft) =>
      Array.from({ length: holesPerFrame }, (_, i) => {
        const left = frameLeft + inset + i * step;
        return `<span style="left:${left}px"></span>`;
      }),
    )
    .join("");

  container.innerHTML = html;
}

function renderBarcodes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const anchorLeft = 62;
  const anchorCenter = 566;
  const anchorRight = 1074;
  const halfWidthWide = 62;
  const halfWidthNarrow = 30;
  const gap = 12;

  const midSegments = [
    [
      anchorLeft + halfWidthWide + gap,
      anchorCenter - halfWidthNarrow - gap,
    ],
    [
      anchorCenter + halfWidthNarrow + gap,
      anchorRight - halfWidthWide - gap,
    ],
  ];

  const tileWidth = midSegments[0][1] - midSegments[0][0];
  const margins = [
    [-320, anchorLeft - halfWidthWide - gap],
    [anchorRight + halfWidthWide + gap, 1280],
  ];

  const barRects = [
    [0, 0, 52, 310],
    [52, 0, 52, 155],
    [103, 0, 52, 310],
    [155, 0, 52, 155],
    [206, 0, 52, 310],
    [310, 0, 52, 310],
    [413, 0, 52, 310],
    [516, 0, 52, 155],
    [568, 155, 52, 155],
    [619, 0, 52, 155],
    [723, 0, 52, 155],
    [826, 0, 52, 310],
    [877, 155, 52, 155],
    [929, 0, 52, 155],
    [981, 0, 52, 52],
    [1032, 0, 52, 155],
    [1084, 0, 52, 52],
    [1084, 155, 52, 155],
    [1135, 0, 52, 310],
    [1187, 155, 52, 155],
    [1239, 0, 52, 155],
    [1342, 0, 52, 155],
    [1445, 0, 52, 310],
    [1497, 0, 52, 155],
    [1548, 0, 52, 310],
  ];

  const srcW = 1600;
  const srcH = 310;
  const bars = barRects
    .map(
      ([x, y, w, h]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" />`,
    )
    .join("");

  let html = "";

  midSegments.forEach(([left, right]) => {
    const width = right - left;
    if (width > 0) {
      html += `<div class="barcode-mark" style="left:${left}px;width:${width}px"><svg viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg></div>`;
    }
  });

  margins.forEach(([left, right], idx) => {
    const marginWidth = right - left;
    if (marginWidth <= 0) return;

    html += `<div class="barcode-mark" style="left:${left}px;width:${marginWidth}px;overflow:hidden;">`;
    if (idx === 0) {
      const tileCount = Math.ceil(marginWidth / tileWidth);
      const startX = marginWidth - tileCount * tileWidth;
      for (let i = 0; i < tileCount; i++) {
        html += `<svg style="left:${startX + i * tileWidth}px;width:${tileWidth}px" viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg>`;
      }
    } else {
      for (let x = 0; x < marginWidth; x += tileWidth) {
        html += `<svg style="left:${x}px;width:${tileWidth}px" viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg>`;
      }
    }
    html += `</div>`;
  });

  container.innerHTML = html;
}

// 3. Text & Frame Number Binding

function bindInputToText(inputEl, targetEl) {
  inputEl.addEventListener("input", () => {
    targetEl.textContent = inputEl.value;
  });
}

function padZero(num) {
  return String(num).padStart(2, "0");
}

function updateFrameNumbers() {
  const digits = DOM.inputCenter.value.replace(
    /[^0-9]/g,
    "",
  );
  const mm = digits === "" ? 0 : parseInt(digits, 10);

  DOM.codeCenterText.textContent =
    digits === "" ? "" : digits;

  const nnLeft = mm - 1 < 0 ? 0 : mm;
  const nnRight = mm + 1;

  DOM.codeLeftText.textContent =
    digits === "" ? "" : padZero(nnLeft);
  DOM.codeRightText.textContent =
    digits === "" ? "" : padZero(nnRight);
  DOM.codeLeftText2.textContent =
    digits === "" ? "" : `${padZero(nnLeft)}A`;
  DOM.codeRightText2.textContent =
    digits === "" ? "" : `${padZero(nnRight)}A`;
}

function initTextBindings() {
  bindInputToText(DOM.inputPair, DOM.pairText);
  bindInputToText(
    DOM.inputAnniversary,
    DOM.anniversaryText,
  );

  DOM.inputCenter.addEventListener("input", () => {
    const digits = DOM.inputCenter.value.replace(
      /[^0-9]/g,
      "",
    );
    if (digits !== DOM.inputCenter.value) {
      DOM.inputCenter.value = digits;
    }
    updateFrameNumbers();
    renderBarcodes("filmBarcodes");
  });

  updateFrameNumbers();
}

// 4. Viewport Auto Fit

function fitStageToViewport() {
  const scale = Math.min(
    (DOM.viewport.clientWidth - FRAME_CONFIG.PADDING) /
      FRAME_CONFIG.STAGE_W,
    (DOM.viewport.clientHeight - FRAME_CONFIG.PADDING) /
      FRAME_CONFIG.STAGE_H,
    1,
  );

  DOM.scaleWrapper.style.transform = `scale(${scale})`;
  DOM.scaleWrapper.style.width = `${FRAME_CONFIG.STAGE_W * scale}px`;
  DOM.scaleWrapper.style.height = `${FRAME_CONFIG.STAGE_H * scale}px`;
}

// 5. Photo Operations (Upload, Render, Drag & Scale)

function renderPhotoTransform() {
  if (!photoState.naturalW) return;

  const scale =
    photoState.baseScale * (photoState.scalePct / 100);
  const width = photoState.naturalW * scale;
  const height = photoState.naturalH * scale;

  const maxOffsetX = Math.max(
    0,
    (width - FRAME_CONFIG.WIDTH) / 2,
  );
  const maxOffsetY = Math.max(
    0,
    (height - FRAME_CONFIG.HEIGHT) / 2,
  );

  photoState.offsetX = Math.min(
    maxOffsetX,
    Math.max(-maxOffsetX, photoState.offsetX),
  );
  photoState.offsetY = Math.min(
    maxOffsetY,
    Math.max(-maxOffsetY, photoState.offsetY),
  );

  const left =
    FRAME_CONFIG.WIDTH / 2 - width / 2 + photoState.offsetX;
  const top =
    FRAME_CONFIG.HEIGHT / 2 -
    height / 2 +
    photoState.offsetY;

  DOM.photoImgs.forEach((img) => {
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.left = `${left}px`;
    img.style.top = `${top}px`;
  });
}

function handlePhotoUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  const probe = new Image();

  probe.onload = () => {
    photoState.naturalW = probe.naturalWidth;
    photoState.naturalH = probe.naturalHeight;
    photoState.baseScale = Math.max(
      FRAME_CONFIG.WIDTH / probe.naturalWidth,
      FRAME_CONFIG.HEIGHT / probe.naturalHeight,
    );
    photoState.offsetX = 0;
    photoState.offsetY = 0;
    photoState.scalePct = 100;
    DOM.photoScale.value = 100;

    DOM.photoImgs.forEach((img) => {
      img.src = objectUrl;
      img.classList.add("is-active");
    });

    renderPhotoTransform();
  };

  probe.src = objectUrl;
}

function onPointerDown(e) {
  if (!photoState.naturalW) return;

  dragState.active = true;
  dragState.startX = e.clientX;
  dragState.startY = e.clientY;
  dragState.offsetX0 = photoState.offsetX;
  dragState.offsetY0 = photoState.offsetY;

  DOM.photoImgs.forEach((img) =>
    img.classList.add("is-dragging"),
  );
  e.preventDefault();
}

function onPointerMove(e) {
  if (!dragState.active) return;

  photoState.offsetX =
    dragState.offsetX0 + (e.clientX - dragState.startX);
  photoState.offsetY =
    dragState.offsetY0 + (e.clientY - dragState.startY);

  renderPhotoTransform();
}

function onPointerUp() {
  if (!dragState.active) return;

  dragState.active = false;
  DOM.photoImgs.forEach((img) =>
    img.classList.remove("is-dragging"),
  );
}

function initPhotoControls() {
  DOM.photoInput.addEventListener(
    "change",
    handlePhotoUpload,
  );
  DOM.photoScale.addEventListener("input", () => {
    photoState.scalePct = Number(DOM.photoScale.value);
    renderPhotoTransform();
  });

  DOM.photoImgs.forEach((img) =>
    img.addEventListener("mousedown", onPointerDown),
  );
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
}

// 6. Filter Controls

function updatePhotoFilter() {
  const b = DOM.filterInputs.brightness.value;
  const c = DOM.filterInputs.contrast.value;
  const s = DOM.filterInputs.saturate.value;
  const se = DOM.filterInputs.sepia.value;

  document.documentElement.style.setProperty(
    "--photo-filter",
    `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${se}%)`,
  );
}

function updateNoiseOpacity() {
  document.documentElement.style.setProperty(
    "--noise-opacity",
    DOM.noiseOpacity.value / 100,
  );
}

function initFilterControls() {
  Object.keys(DOM.filterInputs).forEach((key) => {
    const slider = DOM.filterInputs[key];
    const numInput = DOM.filterNumInputs[key];

    slider.addEventListener("input", () => {
      numInput.value = slider.value;
      updatePhotoFilter();
    });

    numInput.addEventListener("input", () => {
      let val = Number(numInput.value);
      if (Number.isNaN(val)) return;

      val = Math.min(
        Number(slider.max),
        Math.max(Number(slider.min), val),
      );
      slider.value = val;
      updatePhotoFilter();
    });
  });

  DOM.noiseOpacity.addEventListener("input", () => {
    DOM.noiseOpacityNum.value = DOM.noiseOpacity.value;
    updateNoiseOpacity();
  });

  DOM.noiseOpacityNum.addEventListener("input", () => {
    let val = Number(DOM.noiseOpacityNum.value);
    if (Number.isNaN(val)) return;

    val = Math.min(100, Math.max(0, val));
    DOM.noiseOpacity.value = val;
    updateNoiseOpacity();
  });

  updatePhotoFilter();
  updateNoiseOpacity();
}

// 7. Image Capture & Export Engine

let fontsReadyPromise = null;

function waitForHtmlToImage(timeoutMs = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.htmlToImage) {
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        reject(
          new Error(
            "html-to-image 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.",
          ),
        );
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function ensureCaptureFontsLoaded() {
  if (fontsReadyPromise) return fontsReadyPromise;

  const weights = [300, 400, 500, 600, 700, 800];
  fontsReadyPromise = Promise.all(
    weights.map((w) =>
      document.fonts
        .load(`${w} 32px "PyeojinGothic"`)
        .catch(() => {}),
    ),
  ).then(() => document.fonts.ready);

  return fontsReadyPromise;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function captureViewport() {
  await waitForHtmlToImage();
  await ensureCaptureFontsLoaded();

  const target = DOM.captureArea;
  const srcW = target.offsetWidth;
  const srcH = target.offsetHeight;
  const pixelRatio = 1920 / srcW;

  const swapped = [];
  const activePhotoImgs = target.querySelectorAll(
    "img.film-frame__photo.is-active",
  );

  for (const img of activePhotoImgs) {
    const src = img.getAttribute("src");
    if (src && src.startsWith("blob:")) {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        swapped.push({ img, original: src });
        img.src = dataUrl;
      } catch (e) {
        console.warn(
          "사진 blob→data URL 변환 실패, blob URL 그대로 사용",
          e,
        );
      }
    }
  }

  try {
    return await window.htmlToImage.toPng(target, {
      width: srcW,
      height: srcH,
      pixelRatio,
      skipFonts: true,
      backgroundColor: "#22151f",
      filter: (node) => node.tagName !== "SCRIPT",
    });
  } finally {
    swapped.forEach(({ img, original }) => {
      img.src = original;
    });
  }
}

function sanitizeFilenamePart(text) {
  return text.replace(/[\\/:*?"<>|\r\n]+/g, "").trim();
}

function buildCaptureFilename() {
  const pair = sanitizeFilenamePart(
    DOM.pairText.textContent || "",
  );
  const anniversary = sanitizeFilenamePart(
    DOM.anniversaryText.textContent || "",
  );
  const parts = ["Film", pair, anniversary].filter(Boolean);

  return `${parts.join(" ")}.png`;
}

function initCaptureBtn() {
  DOM.captureBtn.addEventListener("click", async () => {
    DOM.captureBtn.classList.add("is-busy");
    try {
      const dataUrl = await captureViewport();
      const link = document.createElement("a");
      link.download = buildCaptureFilename();
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("capture failed:", err);
      alert(
        `이미지 저장에 실패했습니다: ${err?.message || "알 수 없는 오류"}\n콘솔 로그를 확인해주세요.`,
      );
    } finally {
      DOM.captureBtn.classList.remove("is-busy");
    }
  });
}

// 8. Initialization

function init() {
  renderSprockets("spTop");
  renderSprockets("spBottom");
  renderBarcodes("filmBarcodes");

  initTextBindings();
  fitStageToViewport();
  initPhotoControls();
  initFilterControls();
  initCaptureBtn();

  window.addEventListener("resize", () => {
    fitStageToViewport();
    renderBarcodes("filmBarcodes");
  });
}

document.addEventListener("DOMContentLoaded", init);

// 9. sidebar tab navigation
function switchTab(tabName) {
  document.querySelectorAll(".tabBtn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.tab === tabName,
    );
  });
  document
    .querySelectorAll(".tab-panel")
    .forEach((panel) => {
      panel.classList.toggle(
        "active",
        panel.id === `panel-${tabName}`,
      );
    });
}
