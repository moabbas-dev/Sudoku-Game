import React, { useState, useEffect } from "react";
import Cell from "../Cell/Cell";
import SubWindow from "../SubWindow/SubWindow";
import Buttons from "../Buttons/Buttons";
import { Cell as CellType, SelectedCell, Move } from "../../types/Board";
import { getConflictsCells, checkSolution } from "../../utils/validator";
import { generateNewGame, difficultyLevels, solveBoard, BoardWithHint, printBoard } from "../../utils/generator";
import { FaCheckCircle, FaEdit, FaGamepad, FaPlayCircle, FaQuestionCircle } from "react-icons/fa";
import { MdCelebration } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Board.css";

interface BoardProps {
  difficulty: keyof typeof difficultyLevels;
}

const Board: React.FC<BoardProps> = ({ difficulty }) => {
  const initialBoard: CellType[][] = Array.from({ length: 9 }, () =>
  Array.from({ length: 9 }, () => ({ value: null, isEditable: true }))
  );

  // Use States
  const [board, setBoard] = useState<CellType[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>({row:4, col:4, value: null});
  const [isSolved, setIsSolved] = useState<boolean | null>(null);
  const [isEditMode, setEditMode] = useState<boolean>(false)
  const [isSubmitMode, setSubmitMode] = useState<boolean>(false)
  const [undoStack, setUndoStack] = useState<Move[]>([])
  // Handlers
  const handleCellClick = (row: number, col: number, value: number | null) => {
    setSelectedCell({ row, col, value });
    // console.log(row +', '+col)
  };

  const handleNumberClick = (number: number) => {
    // setSelectedNumber(number);
    // console.log(number);
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (board[row][col].isEditable) {
        const updatedBoard = board.map((r, rIdx) =>
          r.map((cell, cIdx) =>
            rIdx === row && cIdx === col ? { ...cell, value: number } : cell
          )
        );
        setBoard(updatedBoard);
      }
    }
  };

  const handleChange = (rowIndex: number,colIndex: number,newValue: number | null) => {
    const previousValue = board[rowIndex][colIndex].value;
    setUndoStack(prevStack => [...prevStack, { row: rowIndex, col: colIndex, previousValue }]);
    const updatedBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex? { ...cell, value: newValue } : cell
      )
    );
    setBoard(updatedBoard);
  };

  const handleCheckSolution = () => {
    const solved = checkSolution(board);
    setIsSolved(solved);
    let notComplete = false;
    board.forEach((row) => {
      row.forEach((col) => {
        if (col.isEditable && col.value === null) notComplete = true;
      });
    });
    if (!solved && notComplete)
      toast.error("Please Fill the entire board and try again");
    else if (!solved)
      toast.error("The solution is incorrect. Please try again.");
  };

  const handleUndoButton = () => {
    if (undoStack.length === 0)
      return;
    const lastMove = undoStack[undoStack.length - 1];
    setUndoStack(prevStack => prevStack.slice(0, -1));
    const updatedBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === lastMove?.row && cIdx === lastMove.col && cell.isEditable ? { ...cell, value: lastMove.previousValue } : cell
      )
    );
    printBoard(updatedBoard)
    setBoard(updatedBoard)
  };

  const handleNewGameClick = () => {
    const newBoard = generateNewGame(difficulty);
    setBoard(newBoard);
    if (isEditMode) {
      toast.info("You are in Play Mode")
      setEditMode(false)
    }
    setSubmitMode(false)
  };

  const handleCloseWin = () => {
    setIsSolved(false);
    setBoard(generateNewGame(difficulty));
    setSubmitMode(false)
  };

  //  Call this function when difficulty changes

  useEffect(() => {
    const newBoard = generateNewGame(difficulty);
    setBoard(newBoard);
    setSubmitMode(false)
    setEditMode(false)
  }, [difficulty]);

  const handleEnterBoardMode = () => {
    setBoard(initialBoard)
    setEditMode(true)
    setSubmitMode(false)
    toast.info("You are in Edit Mode")
  }

  const handleSubmitBoard = () => {
    const isEmptyBoard = board.every(row => row.every(cell => cell.value === null))
    if (isEmptyBoard) {
      toast.error("Your Board is Empty")
      return ;
    }
    let hasConflict = board.some((row, rowIndex) =>
      row.some((_, colIndex) =>
        getConflictsCells(board).has(`${rowIndex}-${colIndex}`) 
    ))
    if (hasConflict) {
      toast.error("Your Board is Invalid")
      return;
    } 
    const updatedBoard = board.map((row, rIdx) => 
      row.map((cell, cIdx) => 
        cell.value !== null ? { ...cell, isEditable: false } : cell
      )
    )
    setBoard(updatedBoard)
    setEditMode(false)
    setSubmitMode(true)
    toast.info("You are in Play Mode")
  }

  const handleHints = ()=> {
    const hintsBtn = document.querySelector('.hint-btn')
    let num:number = Number(hintsBtn?.getAttribute("prefix"))
    if (num - 1 === 0)
    {
      hintsBtn?.setAttribute("prefix", (num - 1).toString())
      hintsBtn?.setAttribute("disabled", "true")
      const HintedBoard = BoardWithHint(board)
      setBoard(HintedBoard)
    }
    else if (num-- > 0)
    {
      hintsBtn?.setAttribute("prefix", num.toString())
      const HintedBoard = BoardWithHint(board)
      setBoard(HintedBoard)
    }
  }

  const handleSolveBtn = () => {
    setSubmitMode(false)
    const updatedBoard = solveBoard(board)
    setBoard(updatedBoard)
    const hintsBtn = document.querySelector('.hint-btn')
    hintsBtn?.setAttribute("prefix", "5")
  }

  return (
    <div className="container">
      <SubWindow
        isSolved={isSolved}
        onCloseWindow={handleCloseWin}
        title={<>Congratulations <MdCelebration /></>}
        text={`You beat ${difficulty} level`}
      />
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                value={cell.value}
                isEditable={cell.isEditable}
                onChange={(newValue) => handleChange(rowIndex, colIndex, newValue)}
                onClickCell={handleCellClick}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isHighlighted={
                  selectedCell !== null &&
                  (selectedCell.row === rowIndex || selectedCell.col === colIndex
                    || (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3)
                    && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)))
                }
                isNumberHighlighted={
                  selectedCell !== null &&
                  selectedCell.value !== null &&
                  selectedCell.value === cell.value
                }
                isSelected={
                  selectedCell !== null &&
                  selectedCell.row === rowIndex &&
                  selectedCell.col === colIndex
                }
                hasConflict={getConflictsCells(board).has(`${rowIndex}-${colIndex}`)}
              />
            ))}
          </div>
        ))}
      </div>
      <Buttons onNumberClick={handleNumberClick} />
      <div className="board-tools">
        <button className="button undo-btn" onClick={handleUndoButton}>
          <i className="fas fa-undo"></i> Undo
        </button>
        <button className="button check-but" disabled={isEditMode || isSubmitMode} onClick={handleCheckSolution}>
          <i className="fas fa-check"></i> Check Solution
        </button>
        <button className="button newgame-btn" onClick={handleNewGameClick}>
          {" "}
          <FaGamepad style={{position: 'relative', bottom: '-2px'}}/> New Game
        </button>
        {!isEditMode?
          <button className="button edit-btn" onClick={handleEnterBoardMode}>
          <FaEdit style={{ position: 'relative', bottom: '-1px' }} /> Enter a Board
          </button>
          : <button className="button submit-btn" onClick={handleSubmitBoard} title="Enter a board to start play it">
          <FaCheckCircle style={{ position: 'relative', bottom: '-1px' }} /> Submit
          </button>
        }
        <button className="button solve-btn" onClick={handleSolveBtn} disabled={!isSubmitMode} title="Enter a board to solve it">
          {" "}
          <FaPlayCircle style={{position: 'relative', bottom: '-2px'}} /> Solve
        </button>
        <button className="button hint-btn" onClick={handleHints} disabled={!isSubmitMode} prefix="5">
          {" "}
          <FaQuestionCircle style={{position: 'relative', bottom: '-2px'}}/> hint
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Board;
