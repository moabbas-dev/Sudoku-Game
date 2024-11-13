export interface Cell {
	value: number | null;
	isEditable: boolean;
}

export interface SelectedCell {
	row: number;
	col: number;
	value: number | null;
}

export interface Move {
	row: number;
	col: number;
	previousValue: number | null;
}

export type Board = Cell[][];