"use client";
import { useState, useEffect, useRef } from "react";

const SUITS = [
  { symbol: "♠", color: "text-slate-900", type: "black", name: "spades" },
  { symbol: "♥", color: "text-red-500", type: "red", name: "hearts" },
  { symbol: "♣", color: "text-slate-900", type: "black", name: "clubs" },
  { symbol: "♦", color: "text-red-500", type: "red", name: "diamonds" },
];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function Solitario({ onWin }) {
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState(Array(4).fill([]));
  const [columns, setColumns] = useState(Array(7).fill([]));
  
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { initGame(); }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const initGame = () => {
    let deck = [];
    SUITS.forEach((suit) => {
      VALUES.forEach((val, idx) => {
        deck.push({ id: `${suit.symbol}-${val}-${Math.random()}`, value: val, rank: idx + 1, suit: suit.symbol, color: suit.color, type: suit.type, visible: false });
      });
    });
    deck = deck.sort(() => Math.random() - 0.5);

    const newCols = [];
    let idx = 0;
    for (let i = 0; i < 7; i++) {
      const col = deck.slice(idx, idx + i + 1);
      col[col.length - 1].visible = true;
      newCols.push(col);
      idx += i + 1;
    }
    setColumns(newCols);
    setStock(deck.slice(idx));
    setWaste([]);
    setFoundations(Array(4).fill([]));
    setMoves(0);
    setSeconds(0);
    setIsActive(true);
  };

  // --- LÓGICA DE MOVIMIENTO ---

  const checkMoveValidity = (movingCards, targetBase, toType) => {
    const targetLast = targetBase[targetBase.length - 1];
    if (toType === 'foundation') {
      if (movingCards.length !== 1) return false;
      const card = movingCards[0];
      if (!targetLast) return card.rank === 1;
      return card.suit === targetLast.suit && card.rank === targetLast.rank + 1;
    } else {
      const card = movingCards[0];
      if (!targetLast) return card.value === "K";
      return card.type !== targetLast.type && card.rank === targetLast.rank - 1;
    }
  };

  const executeMove = (selected, toType, toIdx) => {
    let movingCards = [];
    if (selected.source === 'waste') movingCards = [waste[waste.length - 1]];
    else if (selected.source === 'column') movingCards = columns[selected.colIdx].slice(selected.cardIdx);

    const targetBase = toType === 'foundation' ? foundations[toIdx] : columns[toIdx];
    
    if (checkMoveValidity(movingCards, targetBase, toType)) {
      setMoves(m => m + 1);
      // Quitar
      if (selected.source === 'waste') setWaste(waste.slice(0, -1));
      else {
        const newCols = [...columns];
        newCols[selected.colIdx] = newCols[selected.colIdx].slice(0, selected.cardIdx);
        if (newCols[selected.colIdx].length > 0) newCols[selected.colIdx][newCols[selected.colIdx].length - 1].visible = true;
        setColumns(newCols);
      }
      // Poner
      if (toType === 'foundation') {
        const newF = [...foundations];
        newF[toIdx] = [...newF[toIdx], ...movingCards];
        setFoundations(newF);
        if (newF.every(f => f.length === 13)) { setIsActive(false); onWin?.(2000); }
      } else {
        const newC = [...columns];
        newC[toIdx] = [...newC[toIdx], ...movingCards];
        setColumns(newC);
      }
      return true;
    }
    return false;
  };

  // --- AUTO-MOVE (DOBLE CLIC) ---

  const handleDoubleClick = (source, colIdx = null, cardIdx = null) => {
    const card = source === 'waste' ? waste[waste.length - 1] : columns[colIdx][cardIdx];
    if (!card || (source === 'column' && cardIdx !== columns[colIdx].length - 1)) return;

    for (let i = 0; i < 4; i++) {
      if (executeMove({ source, colIdx, cardIdx }, 'foundation', i)) break;
    }
  };

  // --- DRAG & DROP HANDLERS ---

  const onDragStart = (e, source, colIdx, cardIdx) => {
    e.dataTransfer.setData("solitaire", JSON.stringify({ source, colIdx, cardIdx }));
  };

  const onDrop = (e, toType, toIdx) => {
    e.preventDefault();
    try {
      const selected = JSON.parse(e.dataTransfer.getData("solitaire"));
      executeMove(selected, toType, toIdx);
    } catch (err) {}
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-[2.5rem] shadow-2xl min-h-[850px] w-full max-w-6xl border border-slate-200 select-none font-sans">
      
      {/* Header Stats */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-10">
        <div className="flex gap-6">
          <StatBox label="Tiempo" value={formatTime(seconds)} />
          <StatBox label="Movimientos" value={moves} />
        </div>
        <button onClick={initGame} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
          Reiniciar
        </button>
      </div>

      {/* Top Section: Stock & Foundations */}
      <div className="flex justify-between w-full mb-12 px-4">
        <div className="flex gap-4">
          <div onClick={() => { setMoves(m => m + 1); if(stock.length > 0) { const newS = [...stock]; const c = {...newS.pop(), visible: true}; setWaste([...waste, c]); setStock(newS); } else { setStock(waste.map(c => ({...c, visible: false})).reverse()); setWaste([]); } }} 
               className={`w-20 h-28 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${stock.length > 0 ? 'bg-indigo-600 border-indigo-700 shadow-xl' : 'border-dashed border-slate-200 bg-slate-50'}`}>
            {stock.length === 0 && <span className="text-slate-300 text-[10px] font-bold">RELOAD</span>}
          </div>
          <div onDragOver={e => e.preventDefault()} 
               className="w-20 h-28 rounded-2xl bg-white border-2 border-slate-100 shadow-sm relative">
            {waste.length > 0 && (
              <div draggable onDragStart={e => onDragStart(e, 'waste')} onDoubleClick={() => handleDoubleClick('waste')} className="h-full w-full cursor-grab">
                <Card card={waste[waste.length - 1]} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {foundations.map((f, i) => (
            <div key={i} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, 'foundation', i)}
                 className="w-20 h-28 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center relative shadow-inner">
              <span className="text-slate-300 text-3xl ">{SUITS[i].symbol}</span>
              {f.length > 0 && <div className="absolute inset-0"><Card card={f[f.length - 1]} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-7 gap-4 w-full px-2">
        {columns.map((col, cIdx) => (
          <div key={cIdx} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, 'column', cIdx)}
               className="flex flex-col min-h-[400px] rounded-3xl border-2 border-dashed border-transparent hover:border-slate-100 transition-colors">
            {col.length === 0 && <div className="w-full h-28 rounded-2xl bg-slate-100 opacity-20" />}
            {col.map((card, cardIdx) => (
              <div key={card.id} draggable={card.visible}
                   onDragStart={e => card.visible && onDragStart(e, 'column', cIdx, cardIdx)}
                   onDoubleClick={() => card.visible && handleDoubleClick('column', cIdx, cardIdx)}
                   className={`relative w-full aspect-[2/3] rounded-2xl shadow-md transition-transform duration-200 
                   ${card.visible ? 'bg-white cursor-grab active:cursor-grabbing border border-slate-100' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'} 
                   ${cardIdx !== 0 ? '-mt-[5.5rem] md:-mt-[6rem]' : ''}`}>
                {card.visible && <Card card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[120px]">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-800 font-mono">{value}</p>
    </div>
  );
}

function Card({ card }) {
  return (
    <div className={`p-3 flex flex-col h-full justify-between ${card.color}`}>
      <div className="flex flex-col items-start leading-none font-black text-sm">
        <span>{card.value}</span>
        <span className="text-[10px] mt-0.5">{card.suit}</span>
      </div>
      <span className="text-3xl self-center select-none">{card.suit}</span>
      <div className="flex flex-col items-end leading-none font-black text-sm rotate-180">
        <span>{card.value}</span>
        <span className="text-[10px] mt-0.5">{card.suit}</span>
      </div>
    </div>
  );
}