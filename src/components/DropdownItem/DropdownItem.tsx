import React from 'react'
import './DropdownItem.css'

interface DropdownItemProps {
	children: any;
	onItemClick: () => void;
}

const DropdownItem:React.FC<DropdownItemProps> = ({children, onItemClick}) => {
  return (
	<div className='dropdown-item' onClick={onItemClick}>
		{children}
	</div>
  )
}

export default DropdownItem