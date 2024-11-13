import { Cell as CellType } from '../types/Board'

export const getConflictsCells = (board: CellType[][]): Set<String> => {
	const conflicts = new Set<String>();
	// check conflicting rows
	for (let row = 0; row < 9; row++) {
		const seen = new Map<number, number>();
		for (let col = 0; col < 9; col++) {
			const cellValue = board[row][col].value;
			if (cellValue !== null) {
				if (seen.has(cellValue)) {
					conflicts.add(`${row}-${col}`);
					conflicts.add(`${row}-${seen.get(cellValue)}`);
				} else
					seen.set(cellValue, col);
			}
		}
	};

	// check conflicting columns
	for (let col = 0; col < 9; col++) {
		const seen = new Map<number, number>();
		for (let row = 0; row < 9; row++) {
			const cellValue = board[row][col].value;
			if (cellValue !== null) {
				if (seen.has(cellValue)) {
					conflicts.add(`${row}-${col}`);
					conflicts.add(`${seen.get(cellValue)}-${col}`);
				} else 
					seen.set(cellValue, row);
			}
		}
	}

	// Check conflicting 3x3 sub-grids
	for (let startRow = 0; startRow <= 6; startRow += 3) {
		for (let startCol = 0; startCol <= 6; startCol += 3) {
			const seen = new Map<number, [number, number]>();
			for (let row = startRow; row < startRow + 3; row++) {
				for (let col = startCol; col < startCol + 3; col++) {
					const cellValue = board[row][col].value;
					if (cellValue !== null) {
						if (seen.has(cellValue)) {
							conflicts.add(`${row}-${col}`);
							const [conflictRow, conflictCol] = seen.get(cellValue)!;
							conflicts.add(`${conflictRow}-${conflictCol}`);
						} else 
							seen.set(cellValue, [row, col]);
					}
				}
			}
		}
	}
	return conflicts;
}

const validateRow = (board: CellType[][], row: number): boolean => {
	const seen = new Set();
	for (const cell of board[row]) {
		if (cell.value !== null) {
			if (seen.has(cell.value))
				return false;
			seen.add(cell.value);
		} else
			return false;
	}
	return true;
};

const validateColumn = (board: CellType[][], col: number): boolean => {
	const seen = new Set();
	for (let row = 0; row < 9; row++) {
		const cellValue = board[row][col].value;
		if (cellValue !== null) {
			if (seen.has(cellValue))
				return false;
			seen.add(cellValue);
		} else
			return false;
	}
	return true;
};

const validateSubGrid = (board: CellType[][], startRow: number, startCol: number): boolean => {
	const seen = new Set();
	for (let row = startRow; row < startRow + 3; row++) {
		for (let col = startCol; col < startCol + 3; col++) {
			const cellValue = board[row][col]?.value;
			if (cellValue !== null) {
				if (seen.has(cellValue))
					return false;
				seen.add(cellValue);
			} else 
				return false;
		}
	}
	return true;
};

export const checkSolution = (board: CellType[][]): boolean => {
	for (let row = 0; row < 9; row++) 
		if (!validateRow(board, row)) 
			return false;

	for (let col = 0; col < 9; col++) 
		if (!validateColumn(board, col))
			return false;

	for (let i = 0; i <= 6; i += 3) 
		for (let j = 0; j <= 6; j += 3) 
			if (!validateSubGrid(board, i, j)) 
				return false;
	return true;
}