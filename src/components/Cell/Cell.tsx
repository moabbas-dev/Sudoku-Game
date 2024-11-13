import { ChangeEvent, FocusEvent } from 'react';
import '../../types/Board'
import './Cell.css'

interface CellProps {
	value: number | null;
	isEditable: boolean;
	colIndex: number;
	rowIndex: number;
	isHighlighted: boolean | null;
	isNumberHighlighted: boolean | null;
	isSelected: boolean;
	hasConflict: boolean;
	onChange: (newValue: number | null) => void;
	onClickCell: (rowIndex:number, colIndex:number, value: number | null) => void
}

const Cell: React.FC<CellProps> = ({
	value, 
	isEditable, 
	colIndex, 
	rowIndex, 
	isHighlighted, 
	isNumberHighlighted,
	isSelected, 
	hasConflict, 
	onChange, 
	onClickCell
	}) => {
	// console.log(colIndex + ', ' + rowIndex);
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		const lastChar = inputValue.slice(-1);
		const parsedValue = parseInt(lastChar);
		if (inputValue === '' || parsedValue === 0)
			onChange(null);
		else if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 9)
			onChange(parsedValue); 
		console.log(parsedValue);

	};

	const handleFocus = (event:FocusEvent<HTMLInputElement>) => {
		event.preventDefault();
	};

	return (
		<input
			type="text"
			value={value || ''}
			readOnly={!isEditable}
			inputMode='none'
			onChange={isEditable? handleInputChange : undefined}
			onClick={() => onClickCell(rowIndex, colIndex, value)}
			onFocus={handleFocus}
			className={`cell ${colIndex === 2 || colIndex === 5? "main-border-right " : ""}${rowIndex === 2 || rowIndex === 5 ? 'main-border-bottom ' : ''}${isSelected? 'selected ' : hasConflict? 'has-conflict ': isHighlighted? 'highlited ' :  isNumberHighlighted? 'num-highlite ' : ''}${(isSelected || hasConflict) && isEditable ? 'selected-conflict-editable ' : !isEditable? 'not-editable ' : 'common-editable'}`}
		/>
	);
};

export default Cell;