"use client";
import { useState, useEffect, useCallback } from "react";

const BANCO_GENERAL = [
  "REACT", "NEXTJS", "JAVASCRIPT", "TAILWIND", "HTML", "CSS", "NODE", "PRISMA",
  "VERCEL", "RETO", "PUNTOS", "IA", "FOCUS", "LOGICA", "WEB", "APP", "DATA",
  "GAMIFICACION", "DESARROLLO", "TECNOLOGIA", "ESTRATEGIA", "DIGITAL", "INNOVAR",
  "BENEFICIOS", "CUPONES", "PORTAL", "USUARIO", "CLIENTE", "SISTEMA", "MODULO"
];

export default function Pupiletras({ onWin }) {
  const [level, setLevel] = useState(10);
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameState, setGameState] = useState("playing");

  const getConfigNivel = (n) => {
    const size = 10 + Math.floor((n - 1) / 2); 
    const wordCount = 3 + Math.floor(n / 10); 
    const time = 60 + (n * 2); 
    return { size: Math.min(size, 50), count: wordCount, time };
  };

  const generarTablero = useCallback((nivelActual) => {
    const { size, count, time } = getConfigNivel(nivelActual);
    const listaPalabras = [...BANCO_GENERAL]
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .map(w => w.toUpperCase());

    let nuevoGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    
    listaPalabras.forEach(palabra => {
      let puesta = false;
      let intentos = 0;
      while (!puesta && intentos < 100) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * (horizontal ? size : size - palabra.length));
        const col = Math.floor(Math.random() * (horizontal ? size - palabra.length : size));
        
        let cabe = true;
        for (let i = 0; i < palabra.length; i++) {
          const r = horizontal ? row : row + i;
          const c = horizontal ? col + i : col;
          if (nuevoGrid[r][c] !== '' && nuevoGrid[r][c] !== palabra[i]) {
            cabe = false;
            break;
          }
        }

        if (cabe) {
          for (let i = 0; i < palabra.length; i++) {
            nuevoGrid[horizontal ? row : row + i][horizontal ? col + i : col] = palabra[i];
          }
          puesta = true;
        }
        intentos++;
      }
    });

    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (nuevoGrid[r][c] === '') {
          nuevoGrid[r][c] = letras[Math.floor(Math.random() * letras.length)];
        }
      }
    }

    setGrid(nuevoGrid);
    setWords(listaPalabras);
    setFoundWords([]);
    setSelectedLetters([]);
    setCorrectLetters([]);
    setTimeLeft(time);
    setGameState("playing");
  }, []);

  useEffect(() => {
    generarTablero(level);
  }, [level, generarTablero]);

  useEffect(() => {
    if (timeLeft <= 0 || gameState !== "playing") return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  if (timeLeft <= 0 && gameState === "playing") setGameState("lost");

  const handleLetterClick = (r, c) => {
    if (gameState !== "playing") return;
    const id = `${r}-${c}`;
    if (correctLetters.includes(id)) return;

    if (selectedLetters.find(l => l.id === id)) {
      setSelectedLetters(selectedLetters.filter(l => l.id !== id));
    } else {
      setSelectedLetters([...selectedLetters, { id, letra: grid[r][c] }]);
    }
  };

  const verificarSeleccion = () => {
    const palabra = selectedLetters.map(l => l.letra).join("");
    if (words.includes(palabra) && !foundWords.includes(palabra)) {
      const nuevosIds = selectedLetters.map(l => l.id);
      setCorrectLetters([...correctLetters, ...nuevosIds]);
      setFoundWords([...foundWords, palabra]);
      setSelectedLetters([]);
      
      if (foundWords.length + 1 === words.length) {
        if (level === 100) {
          onWin(5000);
          setGameState("finished");
        } else {
          setGameState("won");
        }
      }
    } else {
      setSelectedLetters([]);
    }
  };

  const currentConfig = getConfigNivel(level);

 return (
    <div className="bg-white p-4 flex flex-col items-center max-w-full">
      <div className="flex justify-between w-full mb-4 px-4 bg-slate-900 text-white py-2 rounded-xl shadow-lg shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase opacity-60 font-bold">Progreso</span>
          <span className="font-black">NIVEL {level} / 100</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase opacity-60 font-bold">Tiempo</span>
          <span className={`font-mono font-bold ${timeLeft < 15 ? 'text-red-400 animate-pulse' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="w-full overflow-auto border-2 border-slate-200 rounded-2xl p-0.5 bg-slate-50 mb-4 max-h-[60vh] flex justify-center shadow-inner">
        <div 
          className="grid gap-0 mx-auto border border-slate-200" 
          style={{ 
            gridTemplateColumns: `repeat(${currentConfig.size}, 1fr)`,
            width: `${currentConfig.size * (level > 20 ? 30 : 36)}px` 
          }}
        >
          {grid.map((row, r) => row.map((letra, c) => {
            const id = `${r}-${c}`;
            const isSelected = selectedLetters.some(l => l.id === id);
            const isCorrect = correctLetters.includes(id);

            return (
              <button
                key={id}
                onClick={() => handleLetterClick(r, c)}
                className={`flex items-center justify-center font-bold aspect-square w-full h-full transition-all border-[0.5px] border-slate-100 shrink-0 relative ${
                  level > 20 ? 'text-[10px]' : 'text-xs'
                } ${
                  isCorrect ? 'bg-green-500 text-white border-green-600 z-10' : 
                  isSelected ? 'bg-blue-600 text-white scale-110 z-20 shadow-xl border-blue-700' : 
                  'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {letra}
              </button>
            );
          }))}
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 shrink-0">
        <button onClick={verificarSeleccion} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform uppercase tracking-wider">
          Verificar Selección
        </button>

        <div className="flex flex-wrap gap-2 justify-center py-2 max-h-24 overflow-y-auto">
          {words.map(w => (
            <span key={w} className={`px-3 py-1 rounded-full text-[10px] font-black border-2 transition-all ${foundWords.includes(w) ? 'bg-green-100 border-green-500 text-green-700 line-through opacity-50' : 'bg-white border-slate-200 text-slate-400'}`}>
              {w}
            </span>
          ))}
        </div>
      </div>

      {gameState === "won" && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-slate-800">¡Nivel {level} Completado!</h2>
          <p className="text-slate-500 mb-8">El tablero está creciendo...</p>
          <button onClick={() => setLevel(level + 1)} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-blue-200 shadow-2xl">JUGAR NIVEL {level + 1}</button>
        </div>
      )}

      {gameState === "lost" && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 p-6 text-center text-white">
          <h2 className="text-4xl font-black mb-4">¡TIEMPO AGOTADO!</h2>
          <p className="mb-8 opacity-70">Te quedaste en el nivel {level}</p>
          <button onClick={() => generarTablero(level)} className="bg-red-500 text-white px-12 py-4 rounded-2xl font-black text-xl">REINTENTAR NIVEL {level}</button>
        </div>
      )}
    </div>
  );
}