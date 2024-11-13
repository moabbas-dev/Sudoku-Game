import React from 'react'
import { FaCheck} from 'react-icons/fa'
import { GrGrid } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import './SubWindow.css'

interface SubWindowProps {
	isSolved: boolean | null;
	onCloseWindow: () => void;
	title: any;
	text: any;
}

const SubWindow:React.FC<SubWindowProps> = ({isSolved,
		onCloseWindow, title, text}) => {
  return (
	<>
		<div className={`${!isSolved? 'not-solved' : 'overlay'}`}></div>
		<div className={`${!isSolved? 'not-solved' : 'sub-window'}`}>
		<div className="title">
			<h1>{title}</h1>
			<IoMdClose className="close-icon" onClick={onCloseWindow}/>
		</div>
		<GrGrid className='grid-icon'/>
		<FaCheck className='check-icon'/>
		<p>{text}</p>
		</div>
	</>
  )
}

export default SubWindow