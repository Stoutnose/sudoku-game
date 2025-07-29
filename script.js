let baseSolution = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

let sudokuBoard = [], solutionBoard = [], fixedCells = [];
let difficulty = 'Medium';
let timer, elapsed = 0, gamePaused = false, selectedCellIndex = null;

function newGame() {
  sudokuBoard = baseSolution.map(r => [...r]);
  solutionBoard = baseSolution.map(r => [...r]);
  fixedCells = [];
  let count = {Easy:30, Medium:40, Hard:50}[difficulty];
  for (let i = 0; i < count; i++) {
    let r = Math.floor(Math.random()*9), c = Math.floor(Math.random()*9);
    sudokuBoard[r][c] = 0;
  }
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (sudokuBoard[r][c] !== 0) fixedCells.push(r*9+c);

  renderBoard(); stopTimer(); elapsed = 0; startTimer();
  gamePaused = false;
  document.getElementById('pauseBtn').innerText = "Pause Game";
}

function renderBoard() {
  const board = document.getElementById('sudoku-board');
  board.innerHTML = '';
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      let cell = document.createElement('input');
      cell.type = 'text'; cell.maxLength = 1;
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.index = r*9 + c;
      if (sudokuBoard[r][c] !== 0) {
        cell.value = sudokuBoard[r][c]; cell.disabled = true;
      } else if (!gamePaused) {
        cell.addEventListener('click', () => highlightRowColumn(cell));
        cell.addEventListener('input', () =>
          insertNumber(parseInt(cell.value), r, c)
        );
      } else { cell.disabled = true; }
      board.appendChild(cell);
    }
  restoreHighlight();
}

function insertNumber(num, r = null, c = null) {
  if (gamePaused || selectedCellIndex === null) return;
  const allCells = document.querySelectorAll('.cell');
  const cell = allCells[selectedCellIndex];
  const row = r ?? parseInt(cell.dataset.row);
  const col = c ?? parseInt(cell.dataset.col);
  if (!cell.disabled) {
    cell.value = num;
    sudokuBoard[row][col] = num;
    cell.classList.remove('mistake');
    cell.style.color = num !== solutionBoard[row][col] ? 'red' : 'blue';
    if (num === solutionBoard[row][col]) checkWin();
  }
}

function deleteNumber() {
  if (gamePaused || selectedCellIndex === null) return;
  const cell = document.querySelectorAll('.cell')[selectedCellIndex];
  const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
  if (!cell.disabled) {
    cell.value = ''; sudokuBoard[r][c] = 0;
    cell.classList.remove('mistake'); cell.style.color = 'black';
  }
}

function resetPuzzle() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    if (!fixedCells.includes(i)) {
      cell.value = ''; cell.style.color = 'black';
      cell.classList.remove('mistake');
      sudokuBoard[Math.floor(i/9)][i%9] = 0;
    }
  });
}

function highlightRowColumn(cell) {
  document.querySelectorAll('.cell').forEach(c =>
    c.classList.remove('highlight', 'selected')
  );
  const row = parseInt(cell.dataset.row), col = parseInt(cell.dataset.col);
  document.querySelectorAll('.cell').forEach(c => {
    if (+c.dataset.row === row || +c.dataset.col === col)
      c.classList.add('highlight');
  });
  cell.classList.add('selected');
  selectedCellIndex = +cell.dataset.index;
}

function restoreHighlight() {
  if (selectedCellIndex !== null)
    highlightRowColumn(document.querySelectorAll('.cell')[selectedCellIndex]);
}

function checkMistakes() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const r = Math.floor(i/9), c = i%9;
    if (!cell.disabled && cell.value)
      cell.classList.toggle('mistake', +cell.value !== solutionBoard[r][c]);
  });
}

function validatePuzzle() {
  let valid = true;
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const r = Math.floor(i/9), c = i%9;
    if (!cell.disabled && cell.value && +cell.value !== solutionBoard[r][c])
      valid = false;
  });
  alert(valid ? "All your current entries are correct!" : "There are mistakes in the puzzle.");
}

function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (sudokuBoard[r][c] !== solutionBoard[r][c]) return false;
  stopTimer(); alert(`You Won! Time: ${formatTime(elapsed)}`); return true;
}

function hint() {
  if (gamePaused) return;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (sudokuBoard[r][c] === 0) {
        sudokuBoard[r][c] = solutionBoard[r][c];
        renderBoard(); checkWin(); return;
      }
}

function pauseResumeGame() {
  gamePaused = !gamePaused;
  document.getElementById('pauseBtn').innerText = gamePaused ? "Resume Game" : "Pause Game";
  gamePaused ? stopTimer() : startTimer();
  renderBoard();
}

function setDifficulty(level) {
  difficulty = level; newGame();
}

function startTimer() {
  if (gamePaused) return;
  stopTimer();
  timer = setInterval(() => {
    elapsed++; document.getElementById('timer').innerText = `Time: ${formatTime(elapsed)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function formatTime(seconds) {
  let h = Math.floor(seconds / 3600),
      m = Math.floor((seconds % 3600) / 60),
      s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function createNumberPad() {
  const pad = document.getElementById('number-buttons');
  pad.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    let btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => insertNumber(i);
    pad.appendChild(btn);
  }
}

createNumberPad();
newGame();
