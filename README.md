# ♛ N-Queens Visualizer

An interactive visualizer for solving the classic **N-Queens Problem** using backtracking. Watch how the algorithm places queens and backtracks to find all valid configurations.

---

## 🚀 Features

- **👑 Visualize Queen Placement:** See queens placed and removed on the chessboard.
- **🔁 Step-by-Step Backtracking:** Follow how the algorithm tries positions and backtracks.
- **🎨 Clean, Responsive UI:** Simple design that works on any device.
- **🌙 Simple Dark Mode:** Toggle light/dark mode for better viewing[2].
- **⚙️ Adjustable Board Size:** Choose from 4×4 to 10×10.
- **🔄 Multiple Solutions:** Find and navigate through all valid solutions.

---

## 📸 Screenshots

| Light Mode | Dark Mode |
|------------|-----------|
| ![light mode](https://github.com/user-attachments/assets/7efc62e0-35c6-4933-b1cc-2d8d59df3441) | ![dark mode](https://github.com/user-attachments/assets/ca22d12d-1a19-4798-9771-e6cfeb76056b) |

---

## 🧠 What is the N-Queens Problem?

Place **N** queens on an **N×N** chessboard so that no two queens threaten each other.  
This means no two queens share the same row, column, or diagonal.

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript (ES6)**[1]

---

## 🔧 How to Use

1. **Clone the repository**
   ```
   git clone https://github.com/harshitzofficial/N-Queens-Visualize.git
   cd N-Queens-Visualize
   ```

2. **Open `index.html`** in your browser.

3. **Use the controls to:**
   - Set the board size
   - Start or pause the visualization
   - Reset the board
   - Navigate through all found solutions
   - Toggle dark mode

---

## 💡 How It Works

This project uses **recursive backtracking** to try placing queens row-by-row. If a valid position is found, it proceeds. If not, it backtracks and tries a new position.

You can explore the source code in `app.js` to learn how backtracking algorithms work in real time.

## Properties
- `boardSize: number`
- `board: Array[][]`
- `solutions: Array[][][]`
- `currentSolutionIndex: number`
- `isRunning: boolean`
- `isPaused: boolean`
- `animationSpeed: number`
- `solvingInProgress: boolean`
- `timeoutId: number`
- `chessboard: HTMLElement`
- `startBtn: HTMLElement`
- `pauseBtn: HTMLElement`
- `resetBtn: HTMLElement`

---

## Initialization
- `+ constructor()`
- `+ initializeElements()`
- `+ initializeBoard()`
- `+ setupEventListeners()`

---

## UI Rendering
- `+ renderBoard()`
- `+ updateSquare(row, col, isQueen, extraClass)`
- `+ highlightAttacks(row, col)`
- `+ clearHighlights()`

---

## Algorithm
- `+ solveNQueens(row)`
- `+ isSafe(row, col)`
- `+ sleep(ms)`

---

## Controls
- `+ startSolving()`
- `+ pauseSolving()`
- `+ resetBoard()`
- `+ changeBoardSize()`
- `+ updateSpeed()`
- `+ showPreviousSolution()`
- `+ showNextSolution()`

---

## Utility
- `+ updateStats()`
- `+ updateStatus(text)`
- `+ updateSpeedLabel()`


---

## 📁 Folder Structure

```
📦 n-queens-visualizer
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┣ 📄 app.js
```

---
## 🙌 Acknowledgements

Inspired by the classic N-Queens problem and visual algorithm projects from [LeetCode](https://leetcode.com/problems/n-queens/) and educational content[3].

---

## 🔗 Links

- **[Live Demo](https://n-queens-visualizer-two.vercel.app/)**
- **[Learn about N-Queens](https://en.wikipedia.org/wiki/Eight_queens_puzzle)**

