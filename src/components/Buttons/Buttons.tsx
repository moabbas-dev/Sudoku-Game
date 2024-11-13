import React from "react";
import './Buttons.css'

interface ButtonsProps {
  onNumberClick: (number: number) => void; // Function to handle button clicks
}

const Buttons: React.FC<ButtonsProps> = ({ onNumberClick }) => {
  // Generate buttons from 1 to 9
  const buttons = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="buttons">
      {buttons.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
		  className="button">
          {num}
        </button>
      ))}
    </div>
  );
};

export default Buttons;
