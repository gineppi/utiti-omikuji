/* ===== 定義済みおみくじ =====
   画像は未配置のため、仮データ（プレースホルダーSVG）を参照しています。
   実画像が配置されたら image のパスを差し替えてください。 */
const OMIKUJI_RESULTS = [
  { ritu:1,id: 'omikuji-00', sound:'assets/sounds/baku.mp3', image: 'assets/images/tyo-daikiti.gif', rank: 'スーパー超大吉', message: 'ワチャァー‼　アチャァー‼　オチャー‼' },
  { ritu:10,id: 'omikuji-01', sound:'assets/sounds/kin.mp3', image: 'assets/images/dai-kiti.gif', rank: '大吉', message: '万事順調、花開く兆しあり。今こそ願いに向かって進むべし。' },
  { ritu:30,id: 'omikuji-02', sound:'assets/sounds/news.mp3', image: 'assets/images/tyuu-kiti.gif', rank: '中吉', message: 'なんかいいことがあるかも！！今日が一番若い日、全力投球していこう！' },
  { ritu:50,id: 'omikuji-03', sound:'assets/sounds/spot.mp3', image: 'assets/images/tyuu-utiti.png', rank: '小吉', message: '「小吉は吉より良いのか否か」って話、そろそろ飽きたよね！その話を振られたら大きな声で威嚇しちゃえ！ラッキーカラーはこげ茶。' },
  { ritu:60,id: 'omikuji-04', sound:'assets/sounds/horor.mp3', image: 'assets/images/tyuu-kiti.png', rank: '吉',   message: '特別なこの機会いい見せ場を作るべし'},
  { ritu:65,id: 'omikuji-05', sound:'assets/sounds/shock.mp3', image: 'assets/images/kyou.gif', rank: '凶',   message: '凶！大凶があるかないかで心の持ちようが変わってくるよね！そしてこのおみくじに大凶はない！つまり待ち人はもちろん来ないよ！今日のアンラッキーアイテムは靴！視界に入っただけで即死するかも…！気を付けてね！' }
];

const DRAW_DURATION_MS = 2000;

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

const sound = new Audio();

/* ===== ロジック ===== */
function drawOmikuji() {
  let t=OMIKUJI_RESULTS[OMIKUJI_RESULTS.length-1].ritu;
  let n = Math.random() * t;
  
  let index = -1;
  for(var i=0;i<OMIKUJI_RESULTS.length;i++)
  {
    if(n <= OMIKUJI_RESULTS[i].ritu) break;
  }
  index = i;
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

  sound.src = entry.sound;
  sound.play();
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