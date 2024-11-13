import React from 'react'
import {FaChevronDown, FaChevronUp} from 'react-icons/fa'
import './DropdownButton.css'

interface DropdownButtonProps {
	children: string;
	open: boolean;
	toggle: () => void;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({children, open, toggle}) => {
  return (
	<div className={`dropdown-btn ${open? "button-open" : ''}`} onClick={toggle}>
		{children}
		<span className='toggle-icon'>{open? <FaChevronUp/>:<FaChevronDown/>}</span>
	</div>
  )
}

export default DropdownButton