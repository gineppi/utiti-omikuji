/* ===== 定義済みおみくじ =====
   画像は未配置のため、仮データ（プレースホルダーSVG）を参照しています。
   実画像が配置されたら image のパスを差し替えてください。 */
const OMIKUJI_RESULTS = [
  { id: 'omikuji-01', image: 'assets/images/omikuji-01.svg', rank: '大吉', message: 'すべてが良い方向へ進みます。自信を持って進みましょう。' },
  { id: 'omikuji-02', image: 'assets/images/omikuji-02.svg', rank: '中吉', message: '穏やかな一日です。小さな感謝が運を呼び込みます。' },
  { id: 'omikuji-03', image: 'assets/images/omikuji-03.svg', rank: '小吉', message: '無理をしなければ順調です。無理のない計画を。' },
  { id: 'omikuji-04', image: 'assets/images/omikuji-04.svg', rank: '吉',   message: 'まずまずの運気です。平常心を心がけましょう。' },
  { id: 'omikuji-05', image: 'assets/images/omikuji-05.svg', rank: '凶',   message: '慎重な一日です。焦らず、安全を最優先に。' }
];

const DRAW_DURATION_MS = 1200;

/* ===== DOM ===== */
const titleScreen = document.getElementById('title-screen');
const stage = document.getElementById('stage');
const drawing = document.getElementById('drawing');
const resultBox = document.getElementById('result');
const resultRank = document.getElementById('result-rank');
const resultMessage = document.getElementById('result-message');
const resultImg = document.getElementById('result-img');
const resultImageFallback = document.getElementById('result-image-fallback');
const drawButton = document.getElementById('draw-button');
const againButton = document.getElementById('again-button');
const copyButton = document.getElementById('copy-button');
const copyStatus = document.getElementById('copy-status');

/* ===== ロジック ===== */
function drawOmikuji() {
  const index = Math.floor(Math.random() * OMIKUJI_RESULTS.length);
  return OMIKUJI_RESULTS[index];
}

function showImageFallback() {
  resultImg.hidden = true;
  resultImageFallback.hidden = false;
}

function renderImage(entry) {
  if (entry.image) {
    resultImg.alt = `${entry.rank}の画像`;
    resultImg.src = entry.image;
    resultImg.hidden = false;
    resultImageFallback.hidden = true;
  } else {
    showImageFallback();
  }
}

function showResult(entry) {
  if (!entry) {
    resultRank.textContent = '結果データがありません';
    resultMessage.textContent = 'おみくじの画像と文章が設定されていません。';
    resultBox.dataset.rank = '';
    showImageFallback();
    resultBox.hidden = false;
    return;
  }

  resultRank.textContent = entry.rank;
  resultMessage.textContent = entry.message;
  resultBox.dataset.rank = entry.rank;
  renderImage(entry);
  resultBox.hidden = false;
}

function startDraw() {
  titleScreen.hidden = true;
  stage.hidden = false;

  resultBox.hidden = true;
  againButton.hidden = true;
  drawing.hidden = false;
  drawButton.disabled = true;

  const entry = drawOmikuji();

  setTimeout(() => {
    drawing.hidden = true;
    showResult(entry);
    againButton.hidden = false;
    drawButton.disabled = false;
  }, DRAW_DURATION_MS);
}

/* ===== 初期化 ===== */
async function copyResult() {
  const text = `うちちみくじ結果
${resultRank.textContent.trim()}
${resultMessage.textContent.trim()}`;

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'コピーしました';
  } catch {
    copyStatus.textContent = 'コピーに失敗しました';
  }
}

drawButton.addEventListener('click', startDraw);
againButton.addEventListener('click', startDraw);
copyButton.addEventListener('click', copyResult);

/* テストから定義済み一覧を読むための公開（ブラウザ外で実行されても安全） */
if (typeof window !== 'undefined') {
  window.omikuji = {
    results: OMIKUJI_RESULTS,
    draw: drawOmikuji
  };
}