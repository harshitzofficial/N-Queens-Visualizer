

const toggleBtn = document.getElementById("toggle-btn");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

class NQueensVisualizer {
  constructor() {
    this.boardSize = 8;
    this.board = [];
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.animationSpeed = 500;
    this.solvingInProgress = false;
    this.timeoutId = null;

    this.initializeElements();
    this.initializeBoard();
    this.setupEventListeners();
    this.updateSpeedLabel();
  }

  initializeElements() {
    this.chessboard = document.getElementById('chessboard');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.boardSizeSelect = document.getElementById('boardSize');
    this.speedSlider = document.getElementById('speed');
    this.speedLabel = document.querySelector('.speed-label');
    this.currentSolutionSpan = document.getElementById('currentSolution');
    this.totalSolutionsSpan = document.getElementById('totalSolutions');
    this.statusSpan = document.getElementById('status');
    this.prevSolutionBtn = document.getElementById('prevSolution');
    this.nextSolutionBtn = document.getElementById('nextSolution');
  }

  initializeBoard() {
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.renderBoard();
    this.updateStats();
    this.updateStatus('Ready to start');
  }

  setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startSolving());
    this.pauseBtn.addEventListener('click', () => this.pauseSolving());
    this.resetBtn.addEventListener('click', () => this.resetBoard());
    this.boardSizeSelect.addEventListener('change', () => this.changeBoardSize());
    this.speedSlider.addEventListener('input', () => this.updateSpeed());
    this.prevSolutionBtn.addEventListener('click', () => this.showPreviousSolution());
    this.nextSolutionBtn.addEventListener('click', () => this.showNextSolution());
  }

  renderBoard() {
    this.chessboard.innerHTML = '';
    this.chessboard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.chessboard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

    const currentBoard = this.solutions[this.currentSolutionIndex] || this.board;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const square = document.createElement('div');
        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        if (currentBoard && currentBoard[row][col] === 1) {
          square.textContent = '♕';
          square.classList.add('queen');
        }
        this.chessboard.appendChild(square);
      }
    }
  }

  highlightAttacks(row, col) {
    this.clearHighlights();
    // Highlight current position
    const idx = row * this.boardSize + col;
    if (this.chessboard.children[idx]) {
      this.chessboard.children[idx].classList.add('current');
    }
    // Highlight attacked squares (simplified: just mark row, column, diagonals)
    for (let i = 0; i < this.boardSize; i++) {
      // Row
      if (i !== col && this.chessboard.children[row * this.boardSize + i]) {
        this.chessboard.children[row * this.boardSize + i].classList.add('attacking');
      }
      // Column
      if (i !== row && this.chessboard.children[i * this.boardSize + col]) {
        this.chessboard.children[i * this.boardSize + col].classList.add('attacking');
      }
    }
    // Diagonals
    for (let i = 1; i < this.boardSize; i++) {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
          const idx = r * this.boardSize + c;
          if (this.chessboard.children[idx]) {
            this.chessboard.children[idx].classList.add('attacking');
          }
        }
      }
    }
  }

  clearHighlights() {
    if (!this.chessboard.children) return;
    for (const square of this.chessboard.children) {
      square.classList.remove('current', 'attacking', 'backtrack');
    }
  }

  updateSquare(row, col, isQueen, extraClass = '') {
    const idx = row * this.boardSize + col;
    if (!this.chessboard.children[idx]) return;
    const square = this.chessboard.children[idx];
    square.textContent = isQueen ? '♕' : '';
    square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
    if (isQueen) square.classList.add('queen');
    if (extraClass) square.classList.add(extraClass);
  }

  isSafe(row, col) {
    // Check column above
    for (let i = 0; i < row; i++) {
      if (this.board[i][col] === 1) return false;
    }
    // Check upper left diagonal
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (this.board[i][j] === 1) return false;
    }
    // Check upper right diagonal
    for (let i = row - 1, j = col + 1; i >= 0 && j < this.boardSize; i--, j++) {
      if (this.board[i][j] === 1) return false;
    }
    return true;
  }

  async solveNQueens(row = 0) {
    if (!this.isRunning) return false;

    if (row === this.boardSize) {
      // Found a solution, save it
      this.solutions.push(this.board.map(r => [...r]));
      this.updateStats();
      this.updateStatus(`Solution ${this.solutions.length} found!`);
      // Render the solution for a moment
      this.renderBoard();
      await this.sleep(this.animationSpeed * 2);
      // Continue searching for more solutions
      return true;
    }

    for (let col = 0; col < this.boardSize; col++) {
      if (!this.isRunning) return false;

      // Show current attempt
      this.highlightAttacks(row, col);
      this.updateStatus(`Trying position (${row + 1}, ${col + 1})`);
      await this.sleep(this.animationSpeed);

      if (this.isSafe(row, col)) {
        // Place queen
        this.board[row][col] = 1;
        this.updateSquare(row, col, true);
        this.updateStatus(`Queen placed at (${row + 1}, ${col + 1})`);
        await this.sleep(this.animationSpeed);

        // Recursively solve for next row
        if (await this.solveNQueens(row + 1)) {
          // If we want to find all solutions, we just continue
          // (no return here, so it will try other columns too)
        }

        if (!this.isRunning) return false;

        // Backtrack
        this.board[row][col] = 0;
        this.updateSquare(row, col, false, 'backtrack');
        this.updateStatus(`Backtracking from (${row + 1}, ${col + 1})`);
        await this.sleep(this.animationSpeed);
        this.updateSquare(row, col, false);
      }
    }

    this.clearHighlights();
    return false;
  }

  sleep(ms) {
    return new Promise(resolve => {
      this.timeoutId = setTimeout(resolve, ms);
    });
  }

  updateStats() {
    this.currentSolutionSpan.textContent = this.currentSolutionIndex + 1;
    this.totalSolutionsSpan.textContent = this.solutions.length;
    this.prevSolutionBtn.disabled = this.currentSolutionIndex <= 0;
    this.nextSolutionBtn.disabled = this.currentSolutionIndex >= this.solutions.length - 1;
  }

  updateStatus(text) {
    this.statusSpan.textContent = text;
  }

  updateSpeedLabel() {
    const speedLabels = ['Slowest', 'Slow', 'Medium', 'Fast', 'Fastest'];
    const speed = parseInt(this.speedSlider.value);
    this.speedLabel.textContent = speedLabels[Math.floor((speed - 1) / 2)];
    this.animationSpeed = 1100 - (speed * 100);
  }

  startSolving() {
    if (this.solvingInProgress) return;
    this.solvingInProgress = true;
    this.isRunning = true;
    this.isPaused = false;
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    this.updateStatus('Solving...');
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.resetBtn.disabled = true;
    this.prevSolutionBtn.disabled = true;
    this.nextSolutionBtn.disabled = true;
    this.solveNQueens().then(() => {
      this.solvingInProgress = false;
      this.isRunning = false;
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.resetBtn.disabled = false;
      this.prevSolutionBtn.disabled = this.currentSolutionIndex <= 0;
      this.nextSolutionBtn.disabled = this.currentSolutionIndex >= this.solutions.length - 1;
      this.updateStatus(this.solutions.length ? 'All solutions found!' : 'No solutions found.');
      this.renderBoard();
    });
  }

  pauseSolving() {
    if (!this.solvingInProgress) return;
    if (this.isPaused) {
      this.isPaused = false;
      this.pauseBtn.textContent = 'Pause';
      this.solveNQueens();
    } else {
      this.isPaused = true;
      this.pauseBtn.textContent = 'Resume';
      clearTimeout(this.timeoutId);
    }
  }

  resetBoard() {
    clearTimeout(this.timeoutId);
    this.isRunning = false;
    this.isPaused = false;
    this.solvingInProgress = false;
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    this.renderBoard();
    this.updateStats();
    this.updateStatus('Ready to start');
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.resetBtn.disabled = false;
    this.prevSolutionBtn.disabled = true;
    this.nextSolutionBtn.disabled = true;
  }

  changeBoardSize() {
    this.boardSize = parseInt(this.boardSizeSelect.value);
    this.resetBoard();
  }

  updateSpeed() {
    this.updateSpeedLabel();
  }

  showPreviousSolution() {
    if (this.currentSolutionIndex > 0) {
      this.currentSolutionIndex--;
      this.renderBoard();
      this.updateStats();
    }
  }

  showNextSolution() {
    if (this.currentSolutionIndex < this.solutions.length - 1) {
      this.currentSolutionIndex++;
      this.renderBoard();
      this.updateStats();
    }
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const visualizer = new NQueensVisualizer();
});
