"use client";
import { useState, useRef, useEffect } from "react";

// ==========================================
// 1. BASE DE DATOS DE NIVELES (JSON)
// ==========================================
const NIVELES = [
  {
    id: 1,
    filas: 6,
    columnas: 6,
    grid: [
      [{ num: 1, char: "P" }, { num: 2, char: "A" }, { num: 3, char: "N" }, null, { num: 4, char: "S" }, { num: 5, char: "O" }],
      [{ char: "E" }, null, { char: "U" }, null, { char: "A" }, null],
      [{ num: 6, char: "R" }, { char: "O" }, { char: "S" }, { char: "A" }, { char: "L" }, null],
      [{ char: "R" }, null, { char: "E" }, null, null, null],
      [{ num: 7, char: "O" }, { char: "S" }, { char: "O" }, null, { num: 8, char: "L" }, { char: "A" }],
      [null, null, null, null, null, null]
    ],
    pistas: {
      horizontales: [
        { num: 1, texto: "Alimento horneado a base de harina (3)" },
        { num: 4, texto: "Prefijo que significa 'sobre' (2)" },
        { num: 6, texto: "Planta que da rosas (5)" },
        { num: 7, texto: "Animal plantígrado que hiberna (3)" },
        { num: 8, texto: "Artículo femenino plural (2)" }
      ],
      verticales: [
        { num: 1, texto: "Mejor amigo del hombre (5)" },
        { num: 3, texto: "Que pertenece a nosotros (5)" },
        { num: 4, texto: "Cloruro de sodio (3)" }
      ]
    }
  },
  {
    id: 2,
    filas: 5,
    columnas: 5,
    grid: [
      [{ num: 1, char: "M" }, { num: 2, char: "A" }, { num: 3, char: "R" }, null, null],
      [{ char: "I" }, null, { char: "I" }, null, { num: 4, char: "P" }],
      [{ num: 5, char: "L" }, { char: "U" }, { char: "O" }, { char: "G" }, { char: "O" }],
      [{ char: "O" }, null, null, null, { char: "L" }],
      [null, null, { num: 6, char: "S" }, { char: "O" }, { char: "L" }]
    ],
    pistas: {
      horizontales: [
        { num: 1, texto: "Cuerpo de agua salada (3)" },
        { num: 5, texto: "Sitio web o juego popular (Luogo) (5)" },
        { num: 6, texto: "Estrella luminosa (3)" }
      ],
      verticales: [
        { num: 1, texto: "Medio de transporte (Milo) (4)" },
        { num: 3, texto: "Corriente de agua (3)" },
        { num: 4, texto: "Extremo opuesto del norte (3)" }
      ]
    }
  }
];

// ==========================================
// 2. COMPONENTE DEL TABLERO CLÁSICO
// ==========================================
function CrucigramaTablero({ config, onWin }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [direction, setDirection] = useState("horizontal"); 
  const [activeCell, setActiveCell] = useState(null); 
  const [showErrors, setShowErrors] = useState(false);
  const [won, setWon] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  
  const inputsRef = useRef({});

  const focusCell = (r, c) => {
    const key = `${r}-${c}`;
    if (inputsRef.current[key]) {
      inputsRef.current[key].focus();
      setActiveCell({ r, c });
    }
  };

  const getNextValidCell = (r, c, moveR, moveC) => {
    let nextR = r + moveR;
    let nextC = c + moveC;
    if (nextR >= 0 && nextR < config.filas && nextC >= 0 && nextC < config.columnas) {
      if (config.grid[nextR][nextC] !== null) return { r: nextR, c: nextC };
    }
    return null;
  };

  const handleKeyDown = (e, r, c) => {
    if (won) return;
    setShowErrors(false); 
    const isHorizontal = direction === "horizontal";

    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        setUserAnswers(prev => ({ ...prev, [`${r}-${c}`]: "" }));
        const prev = getNextValidCell(r, c, isHorizontal ? 0 : -1, isHorizontal ? -1 : 0);
        if (prev) focusCell(prev.r, prev.c);
        break;
      case "ArrowRight":
        e.preventDefault();
        setDirection("horizontal");
        const right = getNextValidCell(r, c, 0, 1);
        if (right) focusCell(right.r, right.c);
        break;
      case "ArrowLeft":
        e.preventDefault();
        setDirection("horizontal");
        const left = getNextValidCell(r, c, 0, -1);
        if (left) focusCell(left.r, left.c);
        break;
      case "ArrowDown":
        e.preventDefault();
        setDirection("vertical");
        const down = getNextValidCell(r, c, 1, 0);
        if (down) focusCell(down.r, down.c);
        break;
      case "ArrowUp":
        e.preventDefault();
        setDirection("vertical");
        const up = getNextValidCell(r, c, -1, 0);
        if (up) focusCell(up.r, up.c);
        break;
      default:
        if (/^[a-zA-ZñÑ]$/.test(e.key)) {
          e.preventDefault();
          const val = e.key.toUpperCase();
          setUserAnswers(prev => ({ ...prev, [`${r}-${c}`]: val }));
          const next = getNextValidCell(r, c, isHorizontal ? 0 : 1, isHorizontal ? 1 : 0);
          if (next) focusCell(next.r, next.c);
        }
        break;
    }
  };

  const verificarVictoria = () => {
    let completo = true;
    let correcto = true;

    config.grid.forEach((fila, r) => {
      fila.forEach((celda, c) => {
        if (celda !== null) {
          const resp = userAnswers[`${r}-${c}`];
          if (!resp) completo = false;
          if (resp !== celda.char) correcto = false;
        }
      });
    });

    if (completo && correcto) {
      setWon(true);
      setShowErrors(false);
      setShowVictoryModal(true);
    } else {
      setShowErrors(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      
      {/* SECCIÓN IZQUIERDA: EL TABLERO */}
      <div className="flex flex-col items-center w-full lg:w-auto">
        <div className="w-full flex justify-between items-center mb-6">
           <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
             Crucigrama <span className="text-blue-600">#{config.id}</span>
           </h2>
           {!won ? (
             <button 
               onClick={verificarVictoria}
               className="px-5 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 active:scale-95 transition-all text-sm shadow-md"
             >
               Verificar
             </button>
           ) : (
             <button 
               onClick={() => onWin(500)}
               className="px-5 py-2 bg-green-500 text-white font-black rounded-lg hover:bg-green-600 active:scale-95 transition-all text-sm shadow-md animate-pulse"
             >
               Cobrar Puntos ➡️
             </button>
           )}
        </div>

        <div className="relative inline-block w-full overflow-x-auto pb-4">
          <div 
            className="grid bg-black border-2 border-black p-[1px] min-w-max mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${config.columnas}, minmax(35px, 45px))`, 
              gridTemplateRows: `repeat(${config.filas}, minmax(35px, 45px))`,
              gap: '1px' 
            }}
          >
            {config.grid.map((fila, r) => fila.map((celda, c) => {
              const isActive = activeCell?.r === r && activeCell?.c === c;
              const currentVal = userAnswers[`${r}-${c}`];
              const isError = showErrors && currentVal && currentVal !== celda?.char;
              
              if (celda === null) return <div key={`${r}-${c}`} className="bg-black w-full h-full"></div>;

              return (
                <div key={`${r}-${c}`} className="relative w-full h-full bg-white flex items-center justify-center aspect-square">
                  {celda.num && (
                    <span className="absolute top-0.5 left-0.5 text-[9px] md:text-[11px] font-bold text-slate-800 leading-none select-none">
                      {celda.num}
                    </span>
                  )}
                  <input
                    ref={el => inputsRef.current[`${r}-${c}`] = el}
                    maxLength={1}
                    readOnly 
                    onClick={() => {
                      if (activeCell?.r === r && activeCell?.c === c) setDirection(prev => prev === "horizontal" ? "vertical" : "horizontal");
                      else setActiveCell({r, c});
                    }}
                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                    className={`w-full h-full text-center font-bold text-lg md:text-xl uppercase outline-none cursor-pointer transition-colors
                      ${isActive ? "bg-yellow-200" : "bg-transparent"}
                      ${isError ? "text-red-600 bg-red-100" : "text-slate-900"} 
                      ${won ? "text-green-700 font-black" : ""}
                    `}
                    value={currentVal || ""}
                  />
                </div>
              );
            }))}
          </div>

          {/* OVERLAY DE VICTORIA */}
          {showVictoryModal && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300 rounded-sm border-2 border-slate-200 p-4">
              <button 
                onClick={() => setShowVictoryModal(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 font-black text-lg h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
              <span className="text-5xl mb-3">🏆</span>
              <p className="text-green-600 font-black text-2xl mb-6 text-center">¡Perfecto!</p>
              <button 
                onClick={() => onWin(500)} 
                className="px-6 py-3 mb-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm md:text-base rounded-full shadow-lg hover:-translate-y-1 transition-all w-full max-w-[200px]"
              >
                Cobrar +500 pts
              </button>
              <button 
                onClick={() => setShowVictoryModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline uppercase tracking-wider"
              >
                Ver tablero
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA/ABAJO: LAS PISTAS */}
      <div className="flex-1 flex flex-col sm:flex-row lg:flex-col gap-6 lg:h-[400px] lg:overflow-y-auto pr-2 lg:pl-6 lg:border-l border-slate-200 pt-6 lg:pt-0">
        <div className="flex-1">
          <h3 className="font-black text-lg text-slate-800 mb-3 border-b-2 border-slate-800 pb-1 flex items-center gap-2">
            <span>➡️</span> Horizontales
          </h3>
          <ul className="space-y-3">
            {config.pistas.horizontales.map((pista) => (
              <li key={`h-${pista.num}`} className="text-sm flex gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent transition-all">
                <span className="font-black text-blue-600 min-w-[1.2rem]">{pista.num}</span>
                <span className="text-slate-700 font-medium">{pista.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-lg text-slate-800 mb-3 border-b-2 border-slate-800 pb-1 flex items-center gap-2">
            <span>⬇️</span> Verticales
          </h3>
          <ul className="space-y-3">
            {config.pistas.verticales.map((pista) => (
              <li key={`v-${pista.num}`} className="text-sm flex gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent transition-all">
                <span className="font-black text-blue-600 min-w-[1.2rem]">{pista.num}</span>
                <span className="text-slate-700 font-medium">{pista.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. COMPONENTE PADRE EXPORTADO (WIDGET LIMPIO)
// ==========================================
export default function Crucigrama({ onWin }) {
  // El Dashboard de page.js ya controla el "Nivel", así que inicializamos desde el primero.
  const nivelActual = NIVELES[0];

  return (
    <div className="w-full flex flex-col font-sans pt-8 md:pt-4">
      
      {/* HUD HEADER INTERNO */}
      <div className="flex justify-between items-center w-full bg-slate-800 px-6 py-4 rounded-2xl mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 text-white p-2 md:p-3 rounded-xl font-black text-xl shadow-inner leading-none">
            {nivelActual.id}
          </div>
          <div>
            <span className="text-[10px] md:text-xs text-blue-200 font-bold tracking-widest uppercase block">DESAFÍO</span>
            <span className="text-sm md:text-base font-bold text-white">Diario</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] md:text-xs text-green-300 font-bold tracking-widest uppercase block">RECOMPENSA</span>
          <span className="text-xl md:text-2xl font-black text-white">+500 pts</span>
        </div>
      </div>

      <div className="w-full">
        {/* Aquí pasamos el prop onWin directo desde tu page.js hacia el tablero */}
        <CrucigramaTablero config={nivelActual} onWin={onWin} />
      </div>
    </div>
  );
}