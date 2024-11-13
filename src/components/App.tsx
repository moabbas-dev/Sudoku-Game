import Board from './Board/Board'
import Dropdown from './Dropdown/Dropdown';
import DropdownItem from './DropdownItem/DropdownItem';
import { useState } from 'react';
import { FaCheck} from 'react-icons/fa'
import { difficultyLevels } from '../utils/generator';

export default function App() {
	const difficulty:(keyof typeof difficultyLevels)[] = Object.keys(difficultyLevels) as (keyof typeof difficultyLevels)[]
	const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty[0]);

	const colors = ["blueviolet", "green", "blue", "crimson"]
	const [selectedColor, setSelectedColor] = useState(colors[0]);

	const handleColorClick = (color:string) => {
		document.documentElement.style.setProperty('--main-color', color);
		setSelectedColor(color);
	}

	const handleItemClick = (diff: keyof typeof difficultyLevels) => {
		setSelectedDifficulty(diff);
	};
	return (
		<>
		<div className="header">
			<Dropdown buttonText={selectedColor} className="choose-color" content={
				<>{
					colors.map(color => 
						<DropdownItem key={color} onItemClick={() => handleColorClick(color)}>
							{color}  {(selectedColor === color)? <FaCheck/> : null} 
						</DropdownItem>)
				}</>
			}></Dropdown>
			<h1 className='page-title'>Sudoku Game</h1>
			<Dropdown className='difficulty' buttonText={selectedDifficulty}
			content={
				<>{
					difficulty.map(diff =>
						<DropdownItem key={diff} onItemClick={() => handleItemClick(diff)}> 
							{diff}  {(selectedDifficulty === diff)? <FaCheck/> : null} 
						</DropdownItem>)
					}</>
				}></Dropdown>
		</div>
		<Board difficulty={selectedDifficulty}/>
		</>
	);
}