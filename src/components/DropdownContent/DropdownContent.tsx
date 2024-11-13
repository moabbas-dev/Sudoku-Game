import React from 'react'
import './DropdownContent.css'

interface DropdownContentProps {
	children: any;
	open: boolean;
	onContentClick: () => void;
}

const DropdownContent:React.FC<DropdownContentProps> = ({children, open, onContentClick}) => {
  return (
	<div onClick={onContentClick} className={`dropdown-content ${open? "content-open" : ''}`}>
		{children}
	</div>
  )
}

export default DropdownContent