// タイトル画面とゲーム画面
const titleScreen = document.getElementById("title-screen");
const gameContainer = document.getElementById("game-container");

// 盤と地雷数
let boardSize = 8;
let mineCount = 10;

// 難易度ボタン
const difficultyButtons = document.querySelectorAll(".difficulty");
difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    boardSize = parseInt(button.dataset.size);
    mineCount = parseInt(button.dataset.mines);

    // タイトルを非表示、ゲームを表示
    titleScreen.style.display = "none";
    gameContainer.style.display = "block";

    // ゲーム開始
    resetGame();
  });
});

const backButton = document.getElementById("back-button");
backButton.addEventListener("click", backToTitle);

function backToTitle() {
  // ゲーム画面を非表示
  gameContainer.style.display = "none";
  // タイトル画面を表示
  titleScreen.style.display = "block";

  // ゲーム状態をリセット
  clearInterval(timerInterval);
  document.getElementById("time").textContent = "0";
  gameBoard.innerHTML = "";
  flagsPlaced = 0;
  updateMineCount();
}



const gameBoard = document.getElementById("game-board");

let firstClick = true;

let startTime = null;
let timerInterval = null;


let flagsPlaced = 0;
const mineCountDisplay = document.getElementById("mine-count");

function updateMineCount() {
  mineCountDisplay.textContent = mineCount - flagsPlaced;
}



const cells = [];  // 全マスのデータを保持
let mines = new Set(); // 最初は空の地雷セットにしておく

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    document.getElementById("time").textContent = elapsed;
  }, 1000);
}


function countAdjacentMines(index) {
  const x = index % boardSize;
  const y = Math.floor(index / boardSize);
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // 自分自身は除く
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        const neighborIndex = ny * boardSize + nx;
        if (mines.has(neighborIndex)) {
          count++;
        }
      }
    }
  }

  return count;
}


// マスを作成
for (let i = 0; i < boardSize * boardSize; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;  // どのマスか記録

  
  cell.addEventListener("click", (e) => {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
     if (e.currentTarget.textContent === "🚩") return; // フラグがあれば無視
   // ⭐ 初手クリックなら地雷を配置してからスタート
  if (firstClick) {
    placeMines(idx);        // 地雷を配置（初クリックの周囲以外に）
    firstClick = false;     // 初手フラグを下ろす
    startTimer(); // ⭐ タイマー開始
  }

  if (mines.has(idx)) {
    e.currentTarget.textContent = "💣";
    e.currentTarget.style.backgroundColor = "red";
    clearInterval(timerInterval); // ⭐ タイマー止める
    alert("ゲームオーバー！");
  } else {
    revealCell(idx);
  }
});

 cell.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (cell.classList.contains("revealed")) return;

  if (cell.textContent === "🚩") {
  cell.textContent = "";
  flagsPlaced--;
} else {
  if (flagsPlaced < mineCount) {
    cell.textContent = "🚩";
    flagsPlaced++;
  }
  // 上限を超えてたら何もしない（無言でスルー）
}

updateMineCount();


  updateMineCount(); // ← 忘れずに！
});


  gameBoard.appendChild(cell);
  cells.push(cell);
}

function revealCell(index) {
  const cell = document.querySelector(`.cell[data-index='${index}']`);
  if (!cell || cell.classList.contains("revealed")) return;

  cell.classList.add("revealed");
  cell.style.backgroundColor = "#ddd";

  const count = countAdjacentMines(index);
  if (count > 0) {
    cell.textContent = count;
  } else {
    cell.textContent = "";

    const x = index % boardSize;
    const y = Math.floor(index / boardSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
          const neighborIndex = ny * boardSize + nx;
          revealCell(neighborIndex);
        }
      }
    }
  }

  checkClear(); // 👈 最後に追加！
}


function checkClear() {
  const revealed = document.querySelectorAll(".cell.revealed").length;
  const totalSafeCells = boardSize * boardSize - mines.size;

  if (revealed === totalSafeCells) {
    clearInterval(timerInterval); // ⭐ タイマー止める
    setTimeout(() => {
      alert("🎉 ゲームクリア！おめでとう！");
    }, 100); // 少し遅らせて開いたのが見えるように
  }
}

function placeMines(safeIndex) {
  while (mines.size < mineCount) {
    const index = Math.floor(Math.random() * boardSize * boardSize);

    // 安全マスとその周囲8マスには置かない
    const x = safeIndex % boardSize;
    const y = Math.floor(safeIndex / boardSize);
    const ix = index % boardSize;
    const iy = Math.floor(index / boardSize);

    if (Math.abs(ix - x) <= 1 && Math.abs(iy - y) <= 1) {
      continue; // 周囲マスならスキップ
    }

    mines.add(index);
  }
}


function resetGame() {
  // ゲーム盤を空に
  gameBoard.innerHTML = "";

  // スタイルをセット
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;

  // 状態初期化
  firstClick = true;
  mines = new Set();
  cells.length = 0;
  flagsPlaced = 0;
  updateMineCount();
  clearInterval(timerInterval);
  document.getElementById("time").textContent = "0";

  // 新しい盤面作成
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    cell.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      if (e.currentTarget.textContent === "🚩") return;

      if (firstClick) {
        placeMines(idx);
        firstClick = false;
        startTimer();
      }

      if (mines.has(idx)) {
        e.currentTarget.textContent = "💣";
        e.currentTarget.style.backgroundColor = "red";
        clearInterval(timerInterval);
        alert("ゲームオーバー！");
      } else {
        revealCell(idx);
      }
    });

    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (cell.classList.contains("revealed")) return;

      if (cell.textContent === "🚩") {
        cell.textContent = "";
        flagsPlaced--;
      } else {
        if (flagsPlaced < mineCount) {
          cell.textContent = "🚩";
          flagsPlaced++;
        }
      }
      updateMineCount();
    });

    gameBoard.appendChild(cell);
    cells.push(cell);
  }
}


const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetGame);

