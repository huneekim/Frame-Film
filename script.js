// 필름 구멍 생성

function fillSprockets(id) {
  const el = document.getElementById(id);
  const holeW = 48;
  const frameWidth = 960;
  const inset = 16;
  const holesPerFrame = 8;
  const frameLefts = [-692, 320, 1332];
  const usableSpan = frameWidth - inset * 2;
  const step = (usableSpan - holeW) / (holesPerFrame - 1);
  let html = "";
  frameLefts.forEach((frameLeft) => {
    for (let i = 0; i < holesPerFrame; i++) {
      const left = frameLeft + inset + i * step;
      html += `<span style="left:${left}px"></span>`;
    }
  });
  el.innerHTML = html;
}
fillSprockets("spTop");
fillSprockets("spBottom");

// 필름 바코드 생성

function fillBarcodes(id) {
  const el = document.getElementById(id);

  const anchorLeft = 62;
  const anchorCenter = 566;
  const anchorRight = 1074;

  const halfWidthWide = 62;
  const halfWidthNarrow = 30;

  const gap = 12;

  const midSegments = [
    [anchorLeft + halfWidthWide + gap, anchorCenter - halfWidthNarrow - gap],
    [anchorCenter + halfWidthNarrow + gap, anchorRight - halfWidthWide - gap],
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
  const srcW = 1600,
    srcH = 310;
  const bars = barRects
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
      `<svg viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg></div>`;
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
        html += `<svg style="left:${x}px;width:${tileWidth}px" viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg>`;
      }
    } else {
      for (let x = 0; x < marginWidth; x += tileWidth) {
        html += `<svg style="left:${x}px;width:${tileWidth}px" viewBox="0 0 ${srcW} ${srcH}" preserveAspectRatio="none">${bars}</svg>`;
      }
    }
    html += `</div>`;
  });
  el.innerHTML = html;
}
fillBarcodes("filmBarcodes");

// 입력창

function bindEditable(inputId, targetId) {
  const input = document.getElementById(inputId);
  const target = document.getElementById(targetId);
  input.addEventListener("input", () => {
    target.textContent = input.value;
  });
}
bindEditable("inputPair", "pairText");
bindEditable("inputAnniversary", "anniversaryText");

const inputCenter = document.getElementById("inputCenter");
const codeCenterText = document.getElementById("codeCenterText");
const codeLeftText = document.getElementById("codeLeftText");
const codeRightText = document.getElementById("codeRightText");
const codeLeftText2 = document.getElementById("codeLeftText2");
const codeRightText2 = document.getElementById("codeRightText2");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateFrameNumbers() {
  const digits = inputCenter.value.replace(/[^0-9]/g, "");
  const mm = digits === "" ? 0 : parseInt(digits, 10);
  codeCenterText.textContent = digits === "" ? "" : digits;
  const nnLeft = mm - 1 < 0 ? 0 : mm;
  const nnRight = mm + 1;
  codeLeftText.textContent = digits === "" ? "" : pad2(nnLeft);
  codeRightText.textContent = digits === "" ? "" : pad2(nnRight);
  codeLeftText2.textContent = digits === "" ? "" : `${pad2(nnLeft)}A`;
  codeRightText2.textContent = digits === "" ? "" : `${pad2(nnRight)}A`;
}

inputCenter.addEventListener("input", () => {
  const digits = inputCenter.value.replace(/[^0-9]/g, "");
  if (digits !== inputCenter.value) inputCenter.value = digits;
  updateFrameNumbers();
  fillBarcodes("filmBarcodes");
});
updateFrameNumbers();

function fitStage() {
  const wrapper = document.getElementById("scaleWrapper");
  const vp = document.querySelector(".viewport");
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
fitStage();
window.addEventListener("resize", () => {
  fitStage();
  fillBarcodes("filmBarcodes");
});

// 사진 삽입 · 드래그 이동 · 크기 조절

const FRAME_W = 960,
  FRAME_H = 672;
const photoImgs = [
  document.getElementById("photoMain"),
  document.getElementById("photoLeft"),
  document.getElementById("photoRight"),
];
const photoInput = document.getElementById("photoInput");
const photoScale = document.getElementById("photoScale");

const photoState = {
  naturalW: 0,
  naturalH: 0,
  baseScale: 1,
  offsetX: 0,
  offsetY: 0,
  scalePct: 100,
};

function renderPhoto() {
  if (!photoState.naturalW) return;
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

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const probe = new Image();
  probe.onload = () => {
    photoState.naturalW = probe.naturalWidth;
    photoState.naturalH = probe.naturalHeight;
    photoState.baseScale = Math.max(
      FRAME_W / probe.naturalWidth,
      FRAME_H / probe.naturalHeight,
    );
    photoState.offsetX = 0;
    photoState.offsetY = 0;
    photoState.scalePct = 100;
    photoScale.value = 100;
    photoImgs.forEach((img) => {
      img.src = url;
      img.classList.add("is-active");
    });
    renderPhoto();
  };
  probe.src = url;
});

photoScale.addEventListener("input", () => {
  photoState.scalePct = Number(photoScale.value);
  renderPhoto();
});

let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX0 = 0;
let dragOffsetY0 = 0;

function onPhotoPointerDown(e) {
  if (!photoState.naturalW) return;
  dragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOffsetX0 = photoState.offsetX;
  dragOffsetY0 = photoState.offsetY;
  photoImgs.forEach((img) => img.classList.add("is-dragging"));
  e.preventDefault();
}

function onPhotoPointerMove(e) {
  if (!dragging) return;
  photoState.offsetX = dragOffsetX0 + (e.clientX - dragStartX);
  photoState.offsetY = dragOffsetY0 + (e.clientY - dragStartY);
  renderPhoto();
}

function onPhotoPointerUp() {
  if (!dragging) return;
  dragging = false;
  photoImgs.forEach((img) => img.classList.remove("is-dragging"));
}

photoImgs.forEach((img) =>
  img.addEventListener("mousedown", onPhotoPointerDown),
);
window.addEventListener("mousemove", onPhotoPointerMove);
window.addEventListener("mouseup", onPhotoPointerUp);

// 필터 - 밝기 · 대비 · 채도 · 세피아

const filterInputs = {
  brightness: document.getElementById("filterBrightness"),
  contrast: document.getElementById("filterContrast"),
  saturate: document.getElementById("filterSaturate"),
  sepia: document.getElementById("filterSepia"),
};
const filterNumInputs = {
  brightness: document.getElementById("filterBrightnessNum"),
  contrast: document.getElementById("filterContrastNum"),
  saturate: document.getElementById("filterSaturateNum"),
  sepia: document.getElementById("filterSepiaNum"),
};

function updatePhotoFilter() {
  const b = filterInputs.brightness.value;
  const c = filterInputs.contrast.value;
  const s = filterInputs.saturate.value;
  const se = filterInputs.sepia.value;
  const value = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${se}%)`;
  document.documentElement.style.setProperty("--photo-filter", value);
}

Object.keys(filterInputs).forEach((key) => {
  const slider = filterInputs[key];
  const num = filterNumInputs[key];
  slider.addEventListener("input", () => {
    num.value = slider.value;
    updatePhotoFilter();
  });
  num.addEventListener("input", () => {
    let v = Number(num.value);
    if (Number.isNaN(v)) return;
    const min = Number(slider.min);
    const max = Number(slider.max);
    v = Math.min(max, Math.max(min, v));
    slider.value = v;
    updatePhotoFilter();
  });
});
updatePhotoFilter();

// 노이즈 불투명도

const noiseOpacity = document.getElementById("noiseOpacity");
const noiseOpacityNum = document.getElementById("noiseOpacityNum");

function updateNoiseOpacity() {
  document.documentElement.style.setProperty(
    "--noise-opacity",
    noiseOpacity.value / 100,
  );
}

noiseOpacity.addEventListener("input", () => {
  noiseOpacityNum.value = noiseOpacity.value;
  updateNoiseOpacity();
});
noiseOpacityNum.addEventListener("input", () => {
  let v = Number(noiseOpacityNum.value);
  if (Number.isNaN(v)) return;
  v = Math.min(100, Math.max(0, v));
  noiseOpacity.value = v;
  updateNoiseOpacity();
});
updateNoiseOpacity();

// 캡처 (html-to-image 라이브러리 사용)
//
// 자체 구현한 foreignObject+XMLSerializer 방식은 DOM 내용과 무관하게
// (완전 빈 div로도 재현됨) 브라우저가 canvas를 오염 처리해 실패했다.
// html-to-image는 폰트/이미지 임베딩과 렌더링 타이밍을 훨씬 정교하게
// 다루는 검증된 라이브러리라 이를 대신 사용한다.

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

// html-to-image가 document.styleSheets를 순회하며 @font-face를 자체
// 재수집(fetch)하려다 실패하는 경우가 있어(로컬 서버 재요청 이슈 등),
// 이를 아예 끄고(skipFonts) 폰트는 document.fonts로 직접 미리
// 로드해둔다. 이러면 canvas에 그려질 때 이미 사용 가능한 폰트라
// html-to-image가 추가로 손댈 필요가 없다.
let fontsReadyPromise = null;
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

  const target = document.getElementById("captureArea");
  const srcW = target.offsetWidth;
  const srcH = target.offsetHeight;

  // 1920x1080 업스케일링 배율
  const outW = 1920;
  const pixelRatio = outW / srcW;

  // 사진 <img>의 src가 blob: URL이면, html-to-image가 리소스를
  // 재수집(fetch)하는 과정에서 실패할 수 있다. 캡처 직전에만
  // 안정적인 data URL로 임시 교체하고, 끝나면 원래 blob URL로
  // 되돌려 메모리 사용을 늘리지 않는다.
  const swapped = [];
  const activePhotoImgs = target.querySelectorAll(
    "img.frame-photo.is-active",
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
        console.warn("사진 blob→data URL 변환 실패, blob URL 그대로 사용", e);
      }
    }
  }

  try {
    const dataUrl = await window.htmlToImage.toPng(target, {
      width: srcW,
      height: srcH,
      pixelRatio,
      skipFonts: true,
      backgroundColor: "#22151f",
      filter: (node) => node.tagName !== "SCRIPT",
    });
    return dataUrl;
  } finally {
    swapped.forEach(({ img, original }) => {
      img.src = original;
    });
  }
}

function sanitizeFilenamePart(text) {
  // 파일명에 쓸 수 없는 문자(\/:*?"<>|)와 개행 등을 제거하고 앞뒤 공백 정리
  return text.replace(/[\\/:*?"<>|\r\n]+/g, "").trim();
}

function buildCaptureFilename() {
  const pair = sanitizeFilenamePart(
    document.getElementById("pairText").textContent || "",
  );
  const anniversary = sanitizeFilenamePart(
    document.getElementById("anniversaryText").textContent || "",
  );
  const parts = ["Film", pair, anniversary].filter((p) => p !== "");
  return `${parts.join(" ")}.png`;
}

document.getElementById("captureBtn").addEventListener("click", async () => {
  const btn = document.getElementById("captureBtn");
  btn.classList.add("is-busy");
  try {
    const dataUrl = await captureViewport();
    const link = document.createElement("a");
    link.download = buildCaptureFilename();
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("capture failed:", err && err.message ? err.message : err);
    console.error("전체 에러 객체:", err);
    alert(
      `이미지 저장에 실패했습니다: ${err && err.message ? err.message : "알 수 없는 오류"}\n콘솔 로그를 확인해주세요.`,
    );
  } finally {
    btn.classList.remove("is-busy");
  }
});
