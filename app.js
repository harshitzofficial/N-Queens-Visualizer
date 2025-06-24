const toggleBtn = document.getElementById("toggle-btn");

// Toggle between light and dark mode on button click
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

class NQueensVisualizer {
  constructor() {
    // Initialize all required properties for the visualizer
    this.boardSize = 8;
    this.board = [];
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.animationSpeed = 500;
    this.solvingInProgress = false;
    this.timeoutId = null;

    // Set up DOM elements, board, event listeners, and speed label
    this.initializeElements();
    this.initializeBoard();
    this.setupEventListeners();
    this.updateSpeedLabel();
  }

  // Get and store all relevant DOM elements for later use
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

  // Set up the chessboard data and UI to initial state
  initializeBoard() {
    this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    this.solutions = [];
    this.currentSolutionIndex = 0;
    this.renderBoard();
    this.updateStats();
    this.updateStatus('Ready to start');
  }

  // Add all necessary event listeners for buttons and controls
  setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startSolving());
    this.pauseBtn.addEventListener('click', () => this.pauseSolving());
    this.resetBtn.addEventListener('click', () => this.resetBoard());
    this.boardSizeSelect.addEventListener('change', () => this.changeBoardSize());
    this.speedSlider.addEventListener('input', () => this.updateSpeed());
    this.prevSolutionBtn.addEventListener('click', () => this.showPreviousSolution());
    this.nextSolutionBtn.addEventListener('click', () => this.showNextSolution());
  }

  // Render the board in the UI, drawing queens and squares
  renderBoard() {
    this.clearHighlights();
    this.chessboard.innerHTML = '';
    this.chessboard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.chessboard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

    // Use either the currently selected solution or the live board
    const currentBoard = this.solutions[this.currentSolutionIndex] || this.board;

    // Create the grid squares and add queen symbols if present
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

  // Highlight the current square and all attacked squares for a given queen position
  highlightAttacks(row, col) {
    this.clearHighlights();
    const idx = row * this.boardSize + col;
    if (this.chessboard.children[idx]) {
      this.chessboard.children[idx].classList.add('current');
    }
    // Highlight row and column
    for (let i = 0; i < this.boardSize; i++) {
      if (i !== col && this.chessboard.children[row * this.boardSize + i]) {
        this.chessboard.children[row * this.boardSize + i].classList.add('attacking');
      }
      if (i !== row && this.chessboard.children[i * this.boardSize + col]) {
        this.chessboard.children[i * this.boardSize + col].classList.add('attacking');
      }
    }
    // Highlight diagonals
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

  // Remove all visual highlights from the board
  clearHighlights() {
    if (!this.chessboard.children) return;
    for (const square of this.chessboard.children) {
      square.classList.remove('current', 'attacking', 'backtrack');
    }
  }

  // Update a single square's appearance and content (queen, highlight etc.)
  updateSquare(row, col, isQueen, extraClass = '') {
    const idx = row * this.boardSize + col;
    if (!this.chessboard.children[idx]) return;
    const square = this.chessboard.children[idx];
    square.textContent = isQueen ? '♕' : '';
    square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
    if (isQueen) square.classList.add('queen');
    if (extraClass) square.classList.add(extraClass);
  }

  // Check if a queen can be safely placed at `row`, `col`
  isSafe(row, col) {
    // Check column (no other queen in the same column above this row)
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

  // Solve the N-Queens problem using backtracking and display each step
  async solveNQueens(row = 0) {
    if (!this.isRunning) return false;

    // If we've reached the end, store the current solution
    if (row === this.boardSize) {
      this.solutions.push(this.board.map(r => [...r]));
      this.updateStats();
      this.updateStatus(`Solution ${this.solutions.length} found!`);
      this.currentSolutionIndex = this.solutions.length - 1; // update to latest solution
      this.renderBoard();
      await this.sleep(this.animationSpeed * 2);
      return true; // Continue searching for more
    }

    // Try placing a queen at every column in the current row
    for (let col = 0; col < this.boardSize; col++) {
      if (!this.isRunning) return false;

      // Visually highlight the current attempt
      this.highlightAttacks(row, col);
      this.updateStatus(`Trying position (${row + 1}, ${col + 1})`);
      await this.sleep(this.animationSpeed);

      if (this.isSafe(row, col)) {
        // Place queen and update UI
        this.board[row][col] = 1;
        this.updateSquare(row, col, true);
        this.updateStatus(`Queen placed at (${row + 1}, ${col + 1})`);
        await this.sleep(this.animationSpeed);

        // Recursively try to solve next row
        if (await this.solveNQueens(row + 1)) {
          // Continue finding all solutions
        }

        if (!this.isRunning) return false;

        // Remove queen (backtrack) and update UI
        this.board[row][col] = 0;
        this.updateSquare(row, col, false, 'backtrack');
        this.updateStatus(`Backtracking from (${row + 1}, ${col + 1})`);
        await this.sleep(this.animationSpeed);
        this.updateSquare(row, col, false);
      }
    }

    // Remove highlights at the end of this row's search
    this.clearHighlights();
    return false;
  }

  // Utility function to pause execution for animation
  sleep(ms) {
    return new Promise(resolve => {
      this.timeoutId = setTimeout(resolve, ms);
    });
  }

  // Update displayed solution stats and navigation button states
  updateStats() {
    this.currentSolutionSpan.textContent = this.solutions.length
      ? this.currentSolutionIndex + 1
      : 0;
    this.totalSolutionsSpan.textContent = this.solutions.length;
    this.prevSolutionBtn.disabled = this.currentSolutionIndex <= 0 || !this.solutions.length;
    this.nextSolutionBtn.disabled = this.currentSolutionIndex >= this.solutions.length - 1;
  }

  // Update the status text in the UI
  updateStatus(text) {
    this.statusSpan.textContent = text;
  }

  // Update speed label and adjust animation speed according to slider
  updateSpeedLabel() {
    const speedLabels = ['Slowest', 'Slow', 'Medium', 'Fast', 'Fastest'];
    const speed = parseInt(this.speedSlider.value);
    this.speedLabel.textContent = speedLabels[Math.floor((speed - 1) / 2)];
    this.animationSpeed = 1100 - (speed * 100);
  }

  // Start the solving process and manage button states
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
    this.renderBoard();
    this.solveNQueens().then(() => {
      // After solving, update state and UI
      this.solvingInProgress = false;
      this.isRunning = false;
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.resetBtn.disabled = false;
      if (this.solutions.length) {
        this.currentSolutionIndex = this.solutions.length - 1;
        this.renderBoard();
      } else {
        this.renderBoard();
      }
      this.updateStats();
      this.prevSolutionBtn.disabled = this.currentSolutionIndex <= 0 || !this.solutions.length;
      this.nextSolutionBtn.disabled = this.currentSolutionIndex >= this.solutions.length - 1;
      this.updateStatus(this.solutions.length ? 'All solutions found!' : 'No solutions found.');
    });
  }

  // Pause or resume the solving process
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

  // Reset the board and all state to the initial setup
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

  // Change the size of the board and reset everything
  changeBoardSize() {
    this.boardSize = parseInt(this.boardSizeSelect.value);
    this.resetBoard();
  }

  // Update the animation speed based on the UI slider
  updateSpeed() {
    this.updateSpeedLabel();
  }

  // Show the previous solution (if available)
  showPreviousSolution() {
    if (this.currentSolutionIndex > 0) {
      this.currentSolutionIndex--;
      this.renderBoard();
      this.updateStats();
    }
  }

  // Show the next solution (if available)
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
