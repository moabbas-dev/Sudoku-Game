import React, { useState, useEffect } from "react";
import Cell from "../Cell/Cell";
import SubWindow from "../SubWindow/SubWindow";
import Buttons from "../Buttons/Buttons";
import { Cell as CellType, SelectedCell, Move } from "../../types/Board";
import { getConflictsCells, checkSolution } from "../../utils/validator";
import { generateNewGame, difficultyLevels, solveBoard, BoardWithHint } from "../../utils/generator";
import { FaCheck, FaCheckCircle, FaEdit, FaGamepad, FaMehBlank, FaPlayCircle, FaQuestionCircle, FaSpaceShuttle, FaUndo, FaUpload } from "react-icons/fa";
import { MdCelebration } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Board.css";
import Tesseract from "tesseract.js";

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
  const [isDisabledHint, setDisableHint] = useState<boolean>(false)
  const defaultTries = 5
  const [tries, setTries] = useState<number>(defaultTries)

  // Handlers
  const handleCellClick = (row: number, col: number, value: number | null) => {
    setSelectedCell({ row, col, value });
    // console.log(row +', '+col)
  };

  const handleNumberClick = (number: number) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (board[row][col].isEditable) {
        setUndoStack(prevStack => [...prevStack, { row, col, previousValue:selectedCell.value }]);
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
      toast.error("Please Fill the entire board and try again", {className:"toast-error"});
    else if (!solved)
      toast.error("The solution is incorrect. Please try again.", {className:"toast-error"});
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
    setBoard(updatedBoard)
  };

  const handleNewGameClick = () => {
    const newBoard = generateNewGame(difficulty);
    setBoard(newBoard);
    if (isEditMode) {
      toast.info("You are in Play Mode", {className:"toast-info"})
      setEditMode(false)
    }
    setSubmitMode(false)
    setTries(defaultTries)
    setDisableHint(false)
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
    setTries(defaultTries)
    setDisableHint(false)
  }, [difficulty]);

  const handleEnterBoardMode = () => {
    setBoard(initialBoard)
    setEditMode(true)
    setSubmitMode(false)
    toast.info("You are in Edit Mode", {className:"toast-info"})
    setDisableHint(true)
  }

  const handleSubmitBoard = () => {
    const isEmptyBoard = board.every(row => row.every(cell => cell.value === null))
    if (isEmptyBoard) {
      toast.error("Your Board is Empty", {className:"toast-error"})
      return ;
    }
    let hasConflict = board.some((row, rowIndex) =>
      row.some((_, colIndex) =>
        getConflictsCells(board).has(`${rowIndex}-${colIndex}`) 
    ))
    if (hasConflict) {
      toast.error("Your Board is Invalid", {className:"toast-error"})
      return;
    } 
    const updatedBoard = board.map((row) => 
      row.map((cell) => 
        cell.value !== null ? { ...cell, isEditable: false } : cell
      )
    )
    setBoard(updatedBoard)
    setEditMode(false)
    setSubmitMode(true)
    toast.info("You are in Play Mode", {className:"toast-info"})
    setTries(defaultTries)
    setDisableHint(false)
  }

  const handleHints = ()=> {
    if (checkSolution(board))
      return ;
    const HintedBoard = BoardWithHint(board)
    if (tries - 1 === 0)
    {
      setBoard(HintedBoard)
      setTries(tries - 1)
      setDisableHint(true)
      return ;
    }
    else if (tries > 0)
      setTries(tries - 1)
    setBoard(HintedBoard)
  }

  const handleSolveBtn = () => {
    setSubmitMode(false)
    const updatedBoard = solveBoard(board)
    setBoard(updatedBoard)
    setTries(defaultTries)
  }
  // =====================================================================================
  const parseOcrToGrid = (ocrText: string): (number | null)[][] => {
      const rows = ocrText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .slice(0, 9);
    const grid = rows.map((row) =>
      row
        .split("") // Split the row into individual characters
        .map((char) =>
          /[1-9]/.test(char) ? parseInt(char) : null // Convert numbers to integers, others to null
        )
    );
  
    return grid;
  };
  const validateSudokuGrid = (grid: (number | null)[][]): boolean => {
    if (grid.length !== 9) return false; // Ensure 9 rows
    return grid.every((row) => row.length === 9); // Ensure 9 columns in every row
  };

  const updateBoardState = (grid: (number | null)[][]) => {
    setBoard(grid.map((row) => 
      row.map((value) => ({
        value: value,
        isEditable: value === null, // Editable if the cell is empty
      }))
    ));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File; // Explicitly cast to File
    if (!file) {
      toast.error("Error when uploading the file! Try again");
      return;
    }
  
    try {
      // Notify the user that OCR is starting
      toast.info("Processing the image, please wait...");
      
      // Use Tesseract.js to perform OCR on the uploaded image
      const { data } = await Tesseract.recognize(file, "eng");
  
      // Extract the text from the OCR result
      const ocrText = data.text;
      console.log("OCR Text:", ocrText);
  
      // Parse the OCR text into a Sudoku grid
      const sudokuGrid = parseOcrToGrid(ocrText);
      
      sudokuGrid.forEach(row => 
        console.log(row)
      )
        
      // Validate the Sudoku grid
      if (!validateSudokuGrid(sudokuGrid)) {
        toast.error("The extracted grid is invalid. Please upload a clearer image.");
        return;
      }
  
      // Update the board state with the recognized Sudoku grid
      updateBoardState(sudokuGrid);
  
      toast.success("Image processed successfully!");
    } catch (error) {
      console.error("Error during OCR processing:", error);
      toast.error("Failed to process the image. Please try again.");
    }
  };
  
  return (
    <div className="container">
      <SubWindow
        isSolved={isSolved}
        onCloseWindow={handleCloseWin}
        title={<>Congratulations <MdCelebration className="congrat-icon"/></>}
        text={`You beat ${difficulty} level`}
      />
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex}>
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
          <FaUndo style={{position: 'relative', bottom: '-2px'}}/> Undo
        </button>
        <button className="button check-but" disabled={isEditMode || isSubmitMode} onClick={handleCheckSolution}>
          <FaCheck style={{position: 'relative', bottom: '-2px'}}/> Check Solution
        </button>
        <button className="button newgame-btn" onClick={handleNewGameClick}>
          {" "}
          <FaGamepad style={{position: 'relative', bottom: '-2px'}}/> New Game
        </button>
        {!isEditMode?
          <button className="button edit-btn" onClick={handleEnterBoardMode}>
          <FaEdit style={{ position: 'relative', bottom: '-1px' }} /> Enter Board
          </button>
          : <button className="button submit-btn" onClick={handleSubmitBoard} title="Enter a board to start play it">
          <FaCheckCircle style={{ position: 'relative', bottom: '-1px' }} /> Submit
          </button>
        }

        <button className="button hint-btn" onClick={handleHints} disabled={isDisabledHint} prefix={tries.toString()}>
          {" "}
          <FaQuestionCircle style={{position: 'relative', bottom: '-2px'}}/> hint
        </button>
        {!isSubmitMode?
        <>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="photo"
            name="photo"
            type="file"
            multiple={false}
            onChange={handleImageChange} />
          <label htmlFor="photo" className="button upload-btn" > 
            <FaUpload style={{position: 'relative', bottom: '1px', marginRight: '3px'}}/> Upload photo
          </label>
        </>
          :<button className='button solve-btn' onClick={handleSolveBtn} title="Enter a board to solve it">
            {" "}
            <FaPlayCircle style={{position: 'relative', bottom: '-2px'}} /> Solve
          </button>
        }
      </div>
      <ToastContainer />
    </div>
  );
};

export default Board;
