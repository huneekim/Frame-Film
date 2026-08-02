// ==========================================
// 1. Constants & State
// ==========================================

const CONFIG = {
  SPROCKET: {
    HOLE_W: 48,
    FRAME_W: 960,
    INSET: 16,
    HOLES_PER_FRAME: 8,
    FRAME_LEFTS: [-692, 320, 1332],
  },
  BARCODE: {
    ANCHOR_LEFT: 62,
    ANCHOR_CENTER: 566,
    ANCHOR_RIGHT: 1074,
    HALF_W_WIDE: 62,
    HALF_W_NARROW: 30,
    GAP: 12,
    SRC_W: 1600,
    SRC_H: 310,
  },
  PHOTO: {
    FRAME_W: 960,
    FRAME_H: 672,
  },
};

const photoState = {
  naturalW: 0,
  naturalH: 0,
  baseScale: 1,
  offsetX: 0,
  offsetY: 0,
  scalePct: 100,
};

let fontsReadyPromise = null;

// ==========================================
// 2. Film Sprockets & Barcodes
// ==========================================

function fillSprockets(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const { HOLE_W, FRAME_W, INSET, HOLES_PER_FRAME, FRAME_LEFTS } =
    CONFIG.SPROCKET;
  const usableSpan = FRAME_W - INSET * 2;
  const step = (usableSpan - HOLE_W) / (HOLES_PER_FRAME - 1);

  let html = "";
  FRAME_LEFTS.forEach((frameLeft) => {
    for (let i = 0; i < HOLES_PER_FRAME; i++) {
      const left = frameLeft + INSET + i * step;
      html += `<span style="left:${left}px"></span>`;
    }
  });
  el.innerHTML = html;
}

function getBarRects() {
  return [
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
}

function fillBarcodes(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const {
    ANCHOR_LEFT,
    ANCHOR_CENTER,
    ANCHOR_RIGHT,
    HALF_W_WIDE,
    HALF_W_NARROW,
    GAP,
    SRC_W,
    SRC_H,
  } = CONFIG.BARCODE;

  const midSegments = [
    [ANCHOR_LEFT + HALF_W_WIDE + GAP, ANCHOR_CENTER - HALF_W_NARROW - GAP],
    [ANCHOR_CENTER + HALF_W_NARROW + GAP, ANCHOR_RIGHT - HALF_W_WIDE - GAP],
  ];

  const tileWidth = midSegments[0][1] - midSegments[0][0];
  const margins = [
    [-320, ANCHOR_LEFT - HALF_W_WIDE - GAP],
    [ANCHOR_RIGHT + HALF_W_WIDE + GAP, 1280],
  ];

  const bars = getBarRects()
    .map(
      ([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" />`,
    )
    .join("");

  let html = "";

  midSegments.forEach(([left, right]) => {
    const width = right - left;
    if (width <= 0) return;
    html +=
      `<div class="barcode-mark" style="left:${left}px;width:${width}px">` +
      `<svg viewBox="0 0 ${SRC_W} ${SRC_H}" preserveAspectRatio="none">${bars}</svg></div>`;
  });

  margins.forEach(([left, right], idx) => {
    const marginWidth = right - left;
    if (marginWidth <= 0) return;
    html += `<div class="barcode-mark" style="left:${left}px;width:${marginWidth}px;overflow:hidden;">`;

    if (idx === 0) {
      const tileCount = Math.ceil(marginWidth / tileWidth);
      const startX = marginWidth - tileCount * tileWidth;
      for (let i = 0; i < tileCount; i++) {
        const x = startX + i * tileWidth;
        html += `<svg style="left:${x}px;width:${tileWidth}px" viewBox="0 0 ${SRC_W} ${SRC_H}" preserveAspectRatio="none">${bars}</svg>`;
      }
    } else {
      for (let x = 0; x < marginWidth; x += tileWidth) {
        html += `<svg style="left:${x}px;width:${tileWidth}px" viewBox="0 0 ${SRC_W} ${SRC_H}" preserveAspectRatio="none">${bars}</svg>`;
      }
    }
    html += `</div>`;
  });

  el.innerHTML = html;
}

// ==========================================
// 3. Text Binding & Frame Numbers
// ==========================================

function bindEditable(inputId, targetId) {
  const input = document.getElementById(inputId);
  const target = document.getElementById(targetId);
  if (!input || !target) return;

  input.addEventListener("input", () => {
    target.textContent = input.value;
  });
}

const pad2 = (n) => String(n).padStart(2, "0");

function updateFrameNumbers() {
  const inputCenter = document.getElementById("inputCenter");
  if (!inputCenter) return;

  const digits = inputCenter.value.replace(/[^0-9]/g, "");
  const mm = digits === "" ? 0 : parseInt(digits, 10);

  document.getElementById("codeCenterText").textContent =
    digits === "" ? "" : digits;

  const nnLeft = Math.max(0, mm - 1);
  const nnRight = mm + 1;

  document.getElementById("codeLeftText").textContent =
    digits === "" ? "" : pad2(nnLeft);
  document.getElementById("codeRightText").textContent =
    digits === "" ? "" : pad2(nnRight);
  document.getElementById("codeLeftText2").textContent =
    digits === "" ? "" : `${pad2(nnLeft)}A`;
  document.getElementById("codeRightText2").textContent =
    digits === "" ? "" : `${pad2(nnRight)}A`;
}

// ==========================================
// 4. Photo Manipulation & Dragging
// ==========================================

const photoImgs = [
  document.getElementById("photoMain"),
  document.getElementById("photoLeft"),
  document.getElementById("photoRight"),
].filter(Boolean);

function renderPhoto() {
  if (!photoState.naturalW) return;
  const { FRAME_W, FRAME_H } = CONFIG.PHOTO;
  const scale = photoState.baseScale * (photoState.scalePct / 100);
  const w = photoState.naturalW * scale;
  const h = photoState.naturalH * scale;

  const maxOffsetX = Math.max(0, (w - FRAME_W) / 2);
  const maxOffsetY = Math.max(0, (h - FRAME_H) / 2);

  photoState.offsetX = Math.min(
    maxOffsetX,
    Math.max(-maxOffsetX, photoState.offsetX),
  );
  photoState.offsetY = Math.min(
    maxOffsetY,
    Math.max(-maxOffsetY, photoState.offsetY),
  );

  const left = FRAME_W / 2 - w / 2 + photoState.offsetX;
  const top = FRAME_H / 2 - h / 2 + photoState.offsetY;

  photoImgs.forEach((img) => {
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.style.left = `${left}px`;
    img.style.top = `${top}px`;
  });
}

// ==========================================
// 5. Filters & UI Controls
// ==========================================

function initFilters() {
  const filterTypes = ["brightness", "contrast", "saturate", "sepia"];

  filterTypes.forEach((type) => {
    const slider = document.getElementById(`filter${capitalize(type)}`);
    const num = document.getElementById(`filter${capitalize(type)}Num`);
    if (!slider || !num) return;

    slider.addEventListener("input", () => {
      num.value = slider.value;
      applyPhotoFilter();
    });

    num.addEventListener("input", () => {
      let v = Number(num.value);
      if (Number.isNaN(v)) return;
      v = Math.min(Number(slider.max), Math.max(Number(slider.min), v));
      slider.value = v;
      applyPhotoFilter();
    });
  });
}

function applyPhotoFilter() {
  const getVal = (id) => document.getElementById(id)?.value || 100;
  const value = `brightness(${getVal("filterBrightness")}%) contrast(${getVal("filterContrast")}%) saturate(${getVal("filterSaturate")}%) sepia(${getVal("filterSepia")}%)`;
  document.documentElement.style.setProperty("--photo-filter", value);
}

function initNoiseControl() {
  const noiseOpacity = document.getElementById("noiseOpacity");
  const noiseOpacityNum = document.getElementById("noiseOpacityNum");
  if (!noiseOpacity || !noiseOpacityNum) return;

  const updateNoise = (val) => {
    const v = Math.min(100, Math.max(0, Number(val) || 0));
    noiseOpacity.value = v;
    noiseOpacityNum.value = v;
    document.documentElement.style.setProperty("--noise-opacity", v / 100);
  };

  noiseOpacity.addEventListener("input", (e) => updateNoise(e.target.value));
  noiseOpacityNum.addEventListener("input", (e) => updateNoise(e.target.value));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================
// 6. Capture & Export
// ==========================================

async function waitForHtmlToImage(timeoutMs = 5000) {
  const start = Date.now();
  while (!window.htmlToImage) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        "html-to-image 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.",
      );
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

function ensureCaptureFontsLoaded() {
  if (fontsReadyPromise) return fontsReadyPromise;
  const weights = [300, 400, 500, 600, 700, 800];
  fontsReadyPromise = Promise.all(
    weights.map((w) =>
      document.fonts.load(`${w} 32px "PyeojinGothic"`).catch(() => {}),
    ),
  ).then(() => document.fonts.ready);
  return fontsReadyPromise;
}

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

async function captureViewport() {
  await waitForHtmlToImage();
  await ensureCaptureFontsLoaded();

  const target = document.getElementById("captureArea");
  const srcW = target.offsetWidth;
  const srcH = target.offsetHeight;
  const pixelRatio = 1920 / srcW;

  const swapped = [];
  const activePhotoImgs = target.querySelectorAll("img.frame-photo.is-active");

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
        console.warn("사진 blob→data URL 변환 실패:", e);
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
    document.getElementById("pairText")?.textContent || "",
  );
  const anniversary = sanitizeFilenamePart(
    document.getElementById("anniversaryText")?.textContent || "",
  );
  const parts = ["Film", pair, anniversary].filter(Boolean);
  return `${parts.join(" ")}.png`;
}

// ==========================================
// 7. Initialization & Event Listeners
// ==========================================

function fitStage() {
  const wrapper = document.getElementById("scaleWrapper");
  const vp = document.querySelector(".viewport");
  if (!wrapper || !vp) return;

  const pad = 48;
  const scale = Math.min(
    (vp.clientWidth - pad) / 1600,
    (vp.clientHeight - pad) / 900,
    1,
  );
  wrapper.style.transform = `scale(${scale})`;
  wrapper.style.width = `${1600 * scale}px`;
  wrapper.style.height = `${900 * scale}px`;
}

function initEventListeners() {
  // Sprockets & Barcodes Init
  fillSprockets("spTop");
  fillSprockets("spBottom");
  fillBarcodes("filmBarcodes");

  // Editable Bindings
  bindEditable("inputPair", "pairText");
  bindEditable("inputAnniversary", "anniversaryText");

  // Frame Numbers Input
  const inputCenter = document.getElementById("inputCenter");
  if (inputCenter) {
    inputCenter.addEventListener("input", () => {
      const digits = inputCenter.value.replace(/[^0-9]/g, "");
      if (digits !== inputCenter.value) inputCenter.value = digits;
      updateFrameNumbers();
      fillBarcodes("filmBarcodes");
    });
  }
  updateFrameNumbers();

  // Window Resize

  window.addEventListener("resize", () => {
    fitStage();
    fillBarcodes("filmBarcodes");
  });

  // Photo Input Change

  const photoInput = document.getElementById("photoInput");
  const photoScale = document.getElementById("photoScale");

  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        photoState.naturalW = probe.naturalWidth;
        photoState.naturalH = probe.naturalHeight;
        photoState.baseScale = Math.max(
          CONFIG.PHOTO.FRAME_W / probe.naturalWidth,
          CONFIG.PHOTO.FRAME_H / probe.naturalHeight,
        );
        photoState.offsetX = 0;
        photoState.offsetY = 0;
        photoState.scalePct = 100;
        if (photoScale) photoScale.value = 100;

        photoImgs.forEach((img) => {
          img.src = url;
          img.classList.add("is-active");
        });
        renderPhoto();
      };
      probe.src = url;
    });
  }

  if (photoScale) {
    photoScale.addEventListener("input", () => {
      photoState.scalePct = Number(photoScale.value);
      renderPhoto();
    });
  }

  // Drag Events for Photos

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX0 = 0;
  let dragOffsetY0 = 0;

  photoImgs.forEach((img) => {
    img.addEventListener("mousedown", (e) => {
      if (!photoState.naturalW) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOffsetX0 = photoState.offsetX;
      dragOffsetY0 = photoState.offsetY;
      photoImgs.forEach((el) => el.classList.add("is-dragging"));
      e.preventDefault();
    });
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    photoState.offsetX = dragOffsetX0 + (e.clientX - dragStartX);
    photoState.offsetY = dragOffsetY0 + (e.clientY - dragStartY);
    renderPhoto();
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    photoImgs.forEach((img) => img.classList.remove("is-dragging"));
  });

  // Filters & Noise Setup

  initFilters();
  initNoiseControl();

  // Capture Button Handler

  const captureBtn = document.getElementById("captureBtn");
  if (captureBtn) {
    captureBtn.addEventListener("click", async () => {
      captureBtn.classList.add("is-busy");
      try {
        const dataUrl = await captureViewport();
        const link = document.createElement("a");
        link.download = buildCaptureFilename();
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Capture failed:", err);
        alert(
          `이미지 저장에 실패했습니다: ${err?.message || "알 수 없는 오류"}\n콘솔 로그를 확인해주세요.`,
        );
      } finally {
        captureBtn.classList.remove("is-busy");
      }
    });
  }

  // Initial Stage Fit

  fitStage();
}

// Run Application

document.addEventListener("DOMContentLoaded", initEventListeners);
