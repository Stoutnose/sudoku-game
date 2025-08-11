// script.js
const baseSolution = [
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

let sudokuBoard=[], solutionBoard=[], fixedCells=[];
let difficulty='Medium';
let timer, elapsed=0, gamePaused=false, selectedCellIndex=null;

function newGame(){
  sudokuBoard = baseSolution.map(r=>[...r]);
  solutionBoard = baseSolution.map(r=>[...r]);
  fixedCells = [];
  const count={Easy:30, Medium:40, Hard:50}[difficulty];
  for(let i=0;i<count;i++){ const r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9); sudokuBoard[r][c]=0; }
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(sudokuBoard[r][c]!==0) fixedCells.push(r*9+c);
  renderBoard(); stopTimer(); elapsed=0; startTimer(); gamePaused=false;
  document.getElementById('pauseBtn').innerText="Pause Game";
}

function renderBoard(){
  const board=document.getElementById('sudoku-board');
  board.innerHTML='';
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell=document.createElement('input');
      cell.type='text'; cell.maxLength=1; cell.className='cell';
      cell.dataset.row=r; cell.dataset.col=c; cell.dataset.index=r*9+c;

      /* thick black separators for 3×3 boxes + outer frame */
      cell.style.border='1.5px solid #000';
      if(c%3===0) cell.style.borderLeftWidth='3px';
      if(r%3===0) cell.style.borderTopWidth='3px';
      if(c===8)   cell.style.borderRightWidth='3px';
      if(r===8)   cell.style.borderBottomWidth='3px';

      if(sudokuBoard[r][c]!==0){
        cell.value=sudokuBoard[r][c]; cell.readOnly=true; cell.classList.add('fixed');
      }else if(!gamePaused){
        cell.readOnly=false;
        cell.addEventListener('click', ()=>highlightRowColumn(cell));
        cell.addEventListener('focus', ()=>highlightRowColumn(cell));
        cell.addEventListener('input', ()=>{
          const v=parseInt(cell.value,10);
          if(!Number.isInteger(v)||v<1||v>9){ cell.value=''; return; }
          insertNumber(v,r,c);
        });
      }else{ cell.readOnly=true; }

      board.appendChild(cell);
    }
  }
  restoreHighlight();
}

function highlightRowColumn(cell){
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('focus','selected'));
  const r=+cell.dataset.row, c=+cell.dataset.col;
  const boxR=Math.floor(r/3), boxC=Math.floor(c/3);

  document.querySelectorAll('.cell').forEach(cel=>{
    const rr=+cel.dataset.row, cc=+cel.dataset.col;
    const sameRow=rr===r, sameCol=cc===c;
    const sameBox=(Math.floor(rr/3)===boxR && Math.floor(cc/3)===boxC);
    if(sameRow || sameCol || sameBox) cel.classList.add('focus');
  });

  cell.classList.add('selected');
  selectedCellIndex=+cell.dataset.index;
}

function restoreHighlight(){
  if(selectedCellIndex!==null){
    const cell=document.querySelectorAll('.cell')[selectedCellIndex];
    if(cell) highlightRowColumn(cell);
  }
}

function insertNumber(num,r=null,c=null){
  if(gamePaused) return;
  if(r===null||c===null){
    if(selectedCellIndex===null) return;
    const cell=document.querySelectorAll('.cell')[selectedCellIndex];
    r=+cell.dataset.row; c=+cell.dataset.col;
  }
  if(!(num>=1&&num<=9)) return;
  const cell=document.querySelectorAll('.cell')[r*9+c];
  if(cell.readOnly) return;
  sudokuBoard[r][c]=num; cell.value=num; cell.classList.remove('mistake');
  cell.style.color=(num!==solutionBoard[r][c])?'#c62828':'#000';
  if(num===solutionBoard[r][c]) checkWin();
}

function deleteNumber(){
  if(gamePaused||selectedCellIndex===null) return;
  const cell=document.querySelectorAll('.cell')[selectedCellIndex];
  const r=+cell.dataset.row, c=+cell.dataset.col;
  if(cell.readOnly) return;
  cell.value=''; sudokuBoard[r][c]=0; cell.classList.remove('mistake'); cell.style.color='#000';
}

function resetPuzzle(){
  document.querySelectorAll('.cell').forEach((cell,i)=>{
    if(!fixedCells.includes(i)){
      cell.value=''; cell.style.color='#000'; cell.classList.remove('mistake');
      sudokuBoard[Math.floor(i/9)][i%9]=0;
    }
  });
}

function checkMistakes(){
  document.querySelectorAll('.cell').forEach((cell,i)=>{
    const r=Math.floor(i/9), c=i%9;
    if(!cell.readOnly && cell.value) cell.classList.toggle('mistake', +cell.value!==solutionBoard[r][c]);
  });
}
function validatePuzzle(){
  let valid=true;
  document.querySelectorAll('.cell').forEach((cell,i)=>{
    const r=Math.floor(i/9), c=i%9;
    if(!cell.readOnly && cell.value && +cell.value!==solutionBoard[r][c]) valid=false;
  });
  alert(valid?"All your current entries are correct!":"There are mistakes in the puzzle.");
}
function checkWin(){
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(sudokuBoard[r][c]!==solutionBoard[r][c]) return false;
  stopTimer(); alert(`You Won! Time: ${formatTime(elapsed)}`); return true;
}
function hint(){
  if(gamePaused) return;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(sudokuBoard[r][c]===0){ sudokuBoard[r][c]=solutionBoard[r][c]; renderBoard(); checkWin(); return; }
}
function pauseResumeGame(){
  gamePaused=!gamePaused;
  document.getElementById('pauseBtn').innerText=gamePaused?"Resume Game":"Pause Game";
  gamePaused?stopTimer():startTimer(); renderBoard();
}
function setDifficulty(level){ difficulty=level; newGame(); }

function startTimer(){ if(gamePaused) return; stopTimer(); timer=setInterval(()=>{ elapsed++; document.getElementById('timer').innerText=`Time: ${formatTime(elapsed)}`; },1000); }
function stopTimer(){ clearInterval(timer); }
function formatTime(s){ const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

function createNumberPad(){
  const pad=document.getElementById('number-buttons'); pad.innerHTML='';
  for(let i=1;i<=9;i++){ const btn=document.createElement('button'); btn.textContent=i; btn.onclick=()=>insertNumber(i); pad.appendChild(btn); }
}

createNumberPad();
newGame();
