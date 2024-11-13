import React, { useState } from 'react'
import DropdownButton from '../DropdownButton/DropdownButton'
import DropdownContent from '../DropdownContent/DropdownContent'
import './Dropdown.css'

interface DropdownProps {
	buttonText: string;
	content: any;
	className: string;
}

const Dropdown: React.FC<DropdownProps> = ({buttonText, content, className}) => {

	const [open, setOpen] = useState<boolean>(false);

	const toggleDropdown = () => setOpen(!open)
	className = 'dropdown ' + className
	return (
	<div className={className}>
		<DropdownButton toggle={toggleDropdown} open={open}>{buttonText}</DropdownButton>
		<DropdownContent onContentClick={toggleDropdown} open={open}>{content}</DropdownContent>
	</div>
	)
}

export default Dropdown