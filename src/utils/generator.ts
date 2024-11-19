import { Cell as CellType, SelectedCell } from "../types/Board";
import { getConflictsCells, checkSolution } from './validator'

export const difficultyLevels = {
	'Very Easy': 45,
	'Easy': 40,
	'Medium': 35,
	'Hard': 30,
	'Expert': 25,
};


// check if a specific cell makes conflict or no
const isValidPlacement = (board: CellType[][], row: number, col: number, num: number): boolean => {
	// check cell's row and column
	for (let i = 0; i < 9; i++)
		if (board[row][i].value === num || board[i][col].value === num)
			return false;

	// check cell's subgrid
	const startRow = Math.floor(row / 3) * 3;
	const startCol = Math.floor(col / 3) * 3;
	for (let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			if (board[startRow + i][startCol + j].value === num)
				return false;
	return true;
}

// Recursive function to fill the board with a valid Sudoku solution Using Backtracking
// Return true if finds a solution
const solve = (board:CellType[][], row:number, col:number):boolean => {
	if (row === 9)
		return true
	else if (col === 9)
		return solve(board, row + 1, 0)
	else if (board[row][col].value !== null)
		return solve(board, row, col + 1)
	else {
		const numbers = getRandomOrder();
		for (const num of numbers) {
			if (isValidPlacement(board, row, col, num)) {
				board[row][col].value = num
				if (solve(board, row, col + 1))
					return true
				board[row][col].value = null
			}
		}
		return false
	}
}

const fillBoard = (board: CellType[][]): boolean => {
	return solve(board, 0, 0)
};

// Function to get numbers 1-9 in random order
const getRandomOrder = (): number[] => {
	const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	for (let i = numbers.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
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

export const cleanBoard = (board: CellType[][]) => {
	return board.map(row =>
		row.map(cell =>
			cell.isEditable && cell.value !== null ? { ...cell, value: null } : cell
		)
	);
};

export const BoardWithHint = (board: CellType[][]) => {
	if (checkSolution(board))
		return board
	const cellResult: SelectedCell = { row: 0, col: 0, value: null };
	const solvedBoard = cleanBoard(JSON.parse(JSON.stringify(board)))	
	fillBoard(solvedBoard);
	do {
		cellResult.row = Math.floor(Math.random() * 9);
		cellResult.col = Math.floor(Math.random() * 9);
		if (board[cellResult.row][cellResult.col].value === null)
			break;
	} while (!(getConflictsCells(board).has(`${cellResult.row}-${cellResult.col}`)
			&& board[cellResult.row][cellResult.col].isEditable));
	cellResult.value = solvedBoard[cellResult.row][cellResult.col].value;
	// console.log(`(${cellResult.col}, ${cellResult.row}): ${cellResult.value}`);
	
	const updatedBoard = board.map((row, rIdx) =>
		row.map((cell, cIdx) =>
			rIdx === cellResult.row && cIdx === cellResult.col ? { ...cell, value: cellResult.value } : cell
		)
	);
	return updatedBoard;
}