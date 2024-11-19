# **Sudoku Game in React and TypeScript**

## **Overview**
This is a fully functional and interactive Sudoku game built using **React** and **TypeScript**. The application allows users to:
- Play Sudoku with various difficulty levels (Very Easy to Expert).
- Solve a manually entered board using an algorithm.
- Upload an image of a Sudoku board to recognize the grid and solve it.
- Get hints for specific cells while playing.

This project showcases:
- State management with React.
- Image preprocessing and OCR using **Tesseract.js**.
- Clean and responsive UI design

---

## **Features**
1. **Play Mode**: Play Sudoku with difficulty levels ranging from `Very Easy` to `Expert`.
2. **Manual Solver**: Enter a custom Sudoku board and solve it.
3. **Image-Based Solver**: **Note that this feature won't work properly so if you can help me in it i'll apreciate it :)**
   - Upload an image of a Sudoku board.
   - Process and recognize the grid using OCR.
   - Solve the recognized grid.
4. **Hints**: Get hints for cells to aid in solving.
5. **Undo Moves**: Undo previous actions for better playability.
6. **Responsive Design**: Fully responsive layout for mobile, tablet, and desktop.

---

## **Getting Started**

### **Prerequisites**
Ensure you have the following installed on your machine:
1. [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
2. [npm](https://www.npmjs.com/) (comes with Node.js)

---

### **How to Clone the Repository**
1. Open a terminal and navigate to the directory where you want to clone the project.
2. Run the following command:
   ```bash
   git clone https://github.com/moabbas-dev/Sudoku-Game.git
   cd Sudoku-Game
   npm install
3. If you encounter dependency resolution errors, use:
    ```bash
    npm install --legacy-peer-deps
4. Run the project:
    ```bash
    npm start
