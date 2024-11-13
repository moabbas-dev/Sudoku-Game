import React from "react";
import './Toast.css'

interface ToastProps {
	text: string;
	className: string;
}

const Toast: React.FC<ToastProps> = ({text, className}) => {
	className = 'toast' + className
	return (
		<>
			<div className={className}>{text}</div>
		</>
	)
}
export default Toast;