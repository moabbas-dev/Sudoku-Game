import { Cell as CellType, SelectedCell } from "../types/Board";

export const difficultyLevels = {
	'Very Easy': 45,
	'Easy': 40,
	'Medium': 35,
	'Hard': 30,
	'Expert': 25,
};

// check if a specific cell makes conflict or no
const isValidPlacement = (board: CellType[][], row: number, col: number, num: number): boolean => {
	for (let i = 0; i < 9; i++)
		if (board[row][i].value === num || board[i][col].value === num)
			return false;

	const startRow = Math.floor(row / 3) * 3;
	const startCol = Math.floor(col / 3) * 3;
	for (let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			if (board[startRow + i][startCol + j].value === num)
				return false;

	return true;
}

// Recursive function to fill the board with a valid Sudoku solution
// Backtracking function to fill the board
const fillBoard = (board: CellType[][]): boolean => {
	for (let row = 0; row < 9; row++) {
	  for (let col = 0; col < 9; col++) {
		if (board[row][col].value === null) { // Find an empty cell
		  const numbers = getRandomOrder(); // Try numbers in random order

		  for (const num of numbers) {
			if (isValidPlacement(board, row, col, num)) {
			  board[row][col].value = num; // Place num
  
			  if (fillBoard(board)) return true; // If successful, return true
  
			  board[row][col].value = null; // Backtrack if placing num fails
			}
		  }
		  return false; // Trigger backtracking if no valid num found
		}
	  }
	}
	return true; // Fully filled
  };
  
  // Function to get numbers 1-9 in random order
  const getRandomOrder = (): number[] => {
	const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	for (let i = numbers.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; // Swap for random order
	}
	return numbers;
  };
export const printBoard = (board: CellType[][]) => {
	console.log("Sudoku Board:");
	board.forEach(row => {
	  console.log(
		row.map(cell => cell.value).join(" ")
	  );
	});
  };

export const generateCompleteBoard = (): CellType[][] => {
	const board = Array.from({ length: 9 }, () =>
		Array.from({ length: 9 }, () => ({ value: null, isEditable: false }))
	);
	fillBoard(board);
	printBoard(board);
	return board;
};

export const removeCellsForPuzzle = (board: CellType[][], numPreFilled: number): CellType[][] => {
	const puzzle = board.map(row => row.map(cell => ({ ...cell })));
	const cellsToRemove = 81 - numPreFilled;
	let removed = 0;
	while (removed < cellsToRemove) {
		const row = Math.floor(Math.random() * 9);
		const col = Math.floor(Math.random() * 9);
		if (puzzle[row][col].value !== null) {
			puzzle[row][col].value = null;
			puzzle[row][col].isEditable = true;
			removed++;
		}
	}
	return puzzle;
};

// here we generate a completed board then remove some values from
// 81 - numPreFilled cells to complete it by user
export const generateNewGame = (difficulty: keyof typeof difficultyLevels) => {
	const numPreFilled = difficultyLevels[difficulty]
	const completeBoard = generateCompleteBoard()
	const puzzleBoard = removeCellsForPuzzle(completeBoard, numPreFilled)
	return puzzleBoard
};

export const solveBoard = (board: CellType[][]) => {
	fillBoard(board)
	return board
}

export const BoardWithHint = (board: CellType[][]) => {
	const cellResult: SelectedCell = { row: 0, col: 0, value: null };

	// Generate a fully solved board to use as a reference for hints
	const solvedBoard = JSON.parse(JSON.stringify(board)); // Deep copy to preserve the original
	fillBoard(solvedBoard);
  
	// Find a random empty cell on the user's current board
	do {
	  cellResult.row = Math.floor(Math.random() * 9);
	  cellResult.col = Math.floor(Math.random() * 9);
	} while (board[cellResult.row][cellResult.col].value !== null);
  
	// Set the hint value from the solved board
	cellResult.value = solvedBoard[cellResult.row][cellResult.col].value;
  
	// Update the board with the hint
	const updatedBoard = board.map((row, rIdx) =>
	  row.map((cell, cIdx) =>
		rIdx === cellResult.row && cIdx === cellResult.col ? { ...cell, value: cellResult.value } : cell
	  )
	);
  
	return updatedBoard;
}