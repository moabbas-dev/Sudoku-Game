import React, { useState, useEffect } from "react";
import Cell from "../Cell/Cell";
import SubWindow from "../SubWindow/SubWindow";
import Buttons from "../Buttons/Buttons";
import { Cell as CellType, SelectedCell, Move } from "../../types/Board";
import { getConflictsCells, checkSolution } from "../../utils/validator";
import { generateNewGame, difficultyLevels, solveBoard, BoardWithHint, cleanBoard } from "../../utils/generator";
import { FaCheck, FaCheckCircle, FaEdit, FaGamepad, FaPlayCircle, FaQuestionCircle, FaUndo, FaUpload } from "react-icons/fa";
import { MdCelebration } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Board.css";
import Tesseract from "tesseract.js";
import {Jimp, JimpMime} from 'jimp';

interface BoardProps {
  difficulty: keyof typeof difficultyLevels;
}

const Board: React.FC<BoardProps> = ({ difficulty }) => {
  const initialBoard: CellType[][] = Array.from({ length: 9 }, () =>
  Array.from({ length: 9 }, () => ({ value: null, isEditable: true }))
  );

  // Use States
  const [board, setBoard] = useState<CellType[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [isSolved, setIsSolved] = useState<boolean | null>(null);
  const [isEditMode, setEditMode] = useState<boolean>(false)
  const [isSubmitMode, setSubmitMode] = useState<boolean>(false)
  const [undoStack, setUndoStack] = useState<Move[]>([])
  const [isDisabledHint, setDisableHint] = useState<boolean>(false)
  const defaultTries = 3
  const [tries, setTries] = useState<number>(defaultTries)
  const [time, setTime] = useState<string>("00:00")
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Handle Game Timer
  useEffect(() => {
    let timer: NodeJS.Timer | null = null;
    if (isGameActive) 
      timer = setInterval(() => { setElapsedSeconds((prev) => prev + 1)}, 1000);
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isGameActive]);

  useEffect(() => {
    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    setTime(`${minutes}:${seconds}`);
  }, [elapsedSeconds]);

  const GameTimerStart = () => {
    setIsGameActive(true);
    setElapsedSeconds(0);
  };

  const GameTimerEnd = () => {
    setIsGameActive(false);
  };

  // repetitve code
  const setDefaultActions = () => {
    setSubmitMode(false)
    setEditMode(false)
    setDisableHint(false)
    setTries(defaultTries)
    GameTimerStart()
  }

  // [Handler]: click on a cell
  const handleCellClick = (row: number, col: number, value: number | null) => {
    setSelectedCell({ row, col, value });
    // console.log(row +', '+col)
  };

  // [Handler]: click on a number from 1 to 9
  const handleNumberClick = (number: number) => {
    if (selectedCell && board[selectedCell.row][selectedCell.col].isEditable) {
      setUndoStack(prevStack => 
        [...prevStack,  { row: selectedCell.row, col: selectedCell.col, previousValue:selectedCell.value }])
      const updatedBoard = board.map((r, rIdx) =>
        r.map((cell, cIdx) =>
          rIdx === selectedCell.row && cIdx === selectedCell.col ? { ...cell, value: number } : cell
        )
      );
      setBoard(updatedBoard);
    }
  };

  // [Handler]: when the input cell change
  const handleChange = (rowIndex: number,colIndex: number,newValue: number | null) => {
    const previousValue = board[rowIndex][colIndex].value;
    setUndoStack(prevStack => [...prevStack, { row: rowIndex, col: colIndex, previousValue }]);
    const updatedBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex? { ...cell, value: newValue } : cell
      )
    );
    if (selectedCell)
      setSelectedCell({...selectedCell, value: newValue})
    setBoard(updatedBoard);
  };

  // [Handler]: click on the 'Check Solution' button
  const handleCheckSolution = () => {
    const solved = checkSolution(board);
    setIsSolved(solved);
    let notCompleted = false;
    board.forEach((row) => {
      row.forEach((col) => {
        if (col.isEditable && col.value === null) notCompleted = true;
      });
    });
    if (!solved && notCompleted)
      toast.error("Please Fill the entire board and try again", {className:"toast-error"});
    else if (!solved)
      toast.error("The solution is incorrect. Please try again.", {className:"toast-error"});
    else if (solved)
      GameTimerEnd()
  };

  // [Handler]: click on the 'Undo' button
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

  // [Handler]: click on the 'New Game' button
  const handleNewGameClick = () => {
    const newBoard = generateNewGame(difficulty);
    setBoard(newBoard);
    if (isEditMode) {
      toast.info("You are in Play Mode", {className:"toast-info"})
    }
    setDefaultActions()
  };

  // [Handler]: click on the 'close the sub-window when user win'
  const handleCloseWin = () => {
    setIsSolved(false);
    setBoard(generateNewGame(difficulty));
    setSubmitMode(false)
    GameTimerStart()
  };

  // when difficulty changes
  useEffect(() => {
    const newBoard = generateNewGame(difficulty);
    setBoard(newBoard);
    setDefaultActions()
  }, [difficulty]);

  // [Handler]: click on the 'Enter Board' button
  const handleEnterBoardMode = () => {
    setBoard(initialBoard)
    setEditMode(true)
    setSubmitMode(false)
    setDisableHint(true)
    GameTimerEnd()
    setTime("00:00")
    setUndoStack((prevStack) => prevStack.slice(0, 0))
    toast.info("You are in Edit Mode", {className:"toast-info"})
  }

  // [Handler]: click on the 'Submit' button
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
    setDefaultActions()
    setSubmitMode(true)
    toast.info("You are in Play Mode", {className:"toast-info"})
  }

  // [Handler]: click on the 'hint' button
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

  // [Handler]: click on the 'solve' button
  const handleSolveBtn = () => {
    setSubmitMode(false)
    const updatedBoard = solveBoard(cleanBoard(board))
    setBoard(updatedBoard)
    setTries(defaultTries)
    GameTimerEnd()
  }

  // =============================== Stretch Goal ==============================
  const extractGridFromOCR = (data: any, gridWidth: number, gridHeight: number): (number | null)[][] => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(null));
  
    // Calculate cell dimensions
    const cellWidth = gridWidth / 9;
    const cellHeight = gridHeight / 9;
  
    // Iterate through recognized symbols
    data.symbols.forEach((symbol: any) => {
      const char = symbol.text.trim();
      const bbox = symbol.bbox
  
      if (/^[1-9]$/.test(char)) {
        // Calculate row and column based on the bounding box center
        const centerX = (bbox.x0 + bbox.x1) / 2;
        const centerY = (bbox.y0 + bbox.y1) / 2;
  
        const row = Math.floor(centerY / cellHeight);
        const col = Math.floor(centerX / cellWidth);
  
        if (row >= 0 && row < 9 && col >= 0 && col < 9) 
          grid[row][col] = parseInt(char, 10);
      }
    });
  
    return grid;
  };

  const validateSudokuGrid = (grid: (number | null)[][]): boolean => {
    if (grid.length !== 9)
      return false;
    return grid.every((row) => row.length === 9);
  };

  const updateBoardState = (grid: (number | null)[][]) => {
    setBoard(grid.map((row) => 
      row.map((value) => ({
        value: value,
        isEditable: value === null,
      }))
    ));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Error when uploading the file! Try again");
      return;
    }
  
    try {
      toast.info("Processing the image, please wait...");
  
      // Perform OCR
      const preprocessImage = async (file: File): Promise<Buffer> => {
        const image = await Jimp.read(await file.arrayBuffer());

        // Preprocessing steps
        image
          .greyscale()
          .contrast(1)
          .normalize()
        return (image.getBuffer(JimpMime.png))
      };
      const enhancedImage = await preprocessImage(file);
      const { data } = await Tesseract.recognize(enhancedImage);
      console.log(data.text);

      // Parse and clean the OCR text
      const image = await Jimp.read(await file.arrayBuffer())
      const sudokuGrid = extractGridFromOCR(data, image.width, image.height);
  
      if (!validateSudokuGrid(sudokuGrid)) {
        toast.error("The extracted grid is invalid. Please upload a clearer image.");
        return;
      }

      updateBoardState(sudokuGrid);
      setDefaultActions()
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
        text={`You solved it in ${time}`}
      />
      <div className="board">
        <span className="time">Time: {time}</span>
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
        <button className={`button check-but`} disabled={isEditMode || isSubmitMode} onClick={handleCheckSolution}>
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

        <button className={`button hint-btn`} onClick={handleHints} disabled={isDisabledHint} prefix={tries.toString()}>
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
