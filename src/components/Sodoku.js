"use client";
import { useState, useEffect } from "react";

export default function Sudoku({ onWin }) {
  // Tablero inicial (0 representa celda vacía)
  // He preparado un nivel "fácil" para que sea divertido
  const initialGrid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const [grid, setGrid] = useState(initialGrid);
  const [userErrors, setUserErrors] = useState([]);

  const handleChange = (r, c, val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 1 || num > 9) {
      const newGrid = [...grid];
      newGrid[r][c] = 0;
      setGrid(newGrid);
      return;
    }

    const newGrid = [...grid];
    newGrid[r][c] = num;
    setGrid(newGrid);

    // Validar si el número es correcto según la solución
    if (num !== solution[r][c]) {
      setUserErrors([...userErrors, `${r}-${c}`]);
    } else {
      setUserErrors(userErrors.filter(err => err !== `${r}-${c}`));
      checkWin(newGrid);
    }
  };

  const checkWin = (currentGrid) => {
    const isComplete = currentGrid.every((row, r) => 
      row.every((cell, c) => cell === solution[r][c])
    );
    if (isComplete) {
      setTimeout(() => {
        alert("¡Sudoku Perfecto!");
        onWin?.(500);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Sudoku <span className="text-indigo-600">Zen</span></h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Completa los números del 1 al 9</p>
      </div>

      <div className="grid grid-cols-9 border-4 border-slate-900 bg-slate-900 gap-[1px] shadow-2xl">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isOriginal = initialGrid[r][c] !== 0;
            const hasError = userErrors.includes(`${r}-${c}`);
            
            // Lógica para bordes gruesos de cuadrantes 3x3
            const borderClasses = `${c === 2 || c === 5 ? 'border-r-4 border-r-slate-900' : ''} ${r === 2 || r === 5 ? 'border-b-4 border-b-slate-900' : ''}`;

            return (
              <div 
                key={`${r}-${c}`} 
                className={`w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center ${borderClasses}`}
              >
                {isOriginal ? (
                  <span className="font-black text-slate-900 text-xl">{cell}</span>
                ) : (
                  <input
                    type="text"
                    maxLength="1"
                    className={`w-full h-full text-center text-xl font-bold outline-none transition-colors ${
                      hasError ? 'text-red-500 bg-red-50' : 'text-indigo-600 focus:bg-indigo-50'
                    }`}
                    value={cell === 0 ? "" : cell}
                    onChange={(e) => handleChange(r, c, e.target.value)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center w-full max-w-md">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Dificultad</p>
          <p className="font-bold text-slate-700">Media</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Tiempo</p>
          <p className="font-bold text-slate-700">Libre</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Puntos</p>
          <p className="font-bold text-indigo-600">+500</p>
        </div>
      </div>
    </div>
  );
}