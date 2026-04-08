"use client";
import { useEffect, useState } from "react";

const SIZE = 13;
const EMPTY = 0;
const WALL = 1;
const BRICK = 2;

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0]
];

const inBounds = (r, c) => r >= 0 && c >= 0 && r < SIZE && c < SIZE;

function createBoard() {
  const board = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      if (
        r === 0 || c === 0 || r === SIZE - 1 || c === SIZE - 1 ||
        (r % 2 === 0 && c % 2 === 0)
      ) {
        row.push(WALL);
      } else if (Math.random() < 0.45 && !(r <= 2 && c <= 2)) {
        row.push(BRICK);
      } else {
        row.push(EMPTY);
      }
    }
    board.push(row);
  }
  return board;
}

export default function Bomberman({ onWin }) {
  const [board, setBoard] = useState(createBoard);
  const [player, setPlayer] = useState({ r: 1, c: 1, lives: 3, power: 1 });
  const [invulnerable, setInvulnerable] = useState(false);
  const [bombs, setBombs] = useState([]);
  const [fires, setFires] = useState([]);
  const [enemies, setEnemies] = useState([
    { r: SIZE - 2, c: SIZE - 2 },
    { r: SIZE - 2, c: 1 }
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const movePlayer = (dr, dc) => {
    if (gameOver) return;
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (board[nr][nc] === EMPTY) {
      setPlayer(p => ({ ...p, r: nr, c: nc }));
    }
  };

  const placeBomb = () => {
    if (gameOver) return;
    const exists = bombs.find(b => b.r === player.r && b.c === player.c);
    if (exists) return;

    const bomb = { r: player.r, c: player.c, power: player.power };
    setBombs(b => [...b, bomb]);

    setTimeout(() => explode(bomb), 1800);
  };

  const hitPlayer = () => {
    if (invulnerable) return;

    setInvulnerable(true);

    setPlayer(p => {
      const lives = p.lives - 1;
      if (lives <= 0) setGameOver(true);
      return { ...p, lives, r: 1, c: 1 };
    });

    setTimeout(() => setInvulnerable(false), 1000);
  };

  const explode = (bomb) => {
    let newBoard = board.map(r => [...r]);
    const newFires = [];
    const hitCells = [];

    const applyFire = (r, c) => {
      if (!inBounds(r, c) || newBoard[r][c] === WALL) return false;

      hitCells.push(`${r}-${c}`);

      if (newBoard[r][c] === BRICK) {
        newBoard[r][c] = EMPTY;
        setScore(s => s + 50);
      }

      newFires.push({ r, c });
      return newBoard[r][c] !== BRICK;
    };

    applyFire(bomb.r, bomb.c);

    DIRS.forEach(([dr, dc]) => {
      for (let i = 1; i <= bomb.power; i++) {
        const r = bomb.r + dr * i;
        const c = bomb.c + dc * i;
        const cont = applyFire(r, c);
        if (!cont) break;
      }
    });

    if (hitCells.includes(`${player.r}-${player.c}`)) {
      hitPlayer();
    }

    setEnemies(prev => prev.filter(e => !hitCells.includes(`${e.r}-${e.c}`)));

    setBoard(newBoard);
    setFires(newFires);
    setBombs(prev => prev.filter(b => b !== bomb));

    setTimeout(() => setFires([]), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies(prev => prev.map(e => {
        const dirs = [...DIRS].sort(() => Math.random() - 0.5);
        for (let [dr, dc] of dirs) {
          const nr = e.r + dr;
          const nc = e.c + dc;
          if (board[nr][nc] === EMPTY) {
            if (player.r === nr && player.c === nc) hitPlayer();
            return { r: nr, c: nc };
          }
        }
        return e;
      }));
    }, 600);

    return () => clearInterval(interval);
  }, [board, player, invulnerable]);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp": movePlayer(-1, 0); break;
        case "ArrowDown": movePlayer(1, 0); break;
        case "ArrowLeft": movePlayer(0, -1); break;
        case "ArrowRight": movePlayer(0, 1); break;
        case " ": placeBomb(); break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, board, bombs, gameOver]);

  useEffect(() => {
    if (enemies.length === 0 && !gameOver) {
      setTimeout(() => {
        alert("🏆 ¡Ganaste!");
        onWin?.(1000);
      }, 300);
    }
  }, [enemies, gameOver]);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-xl">
      <h2 className="text-3xl font-black mb-4 text-slate-800">Bomberman 💣</h2>

      <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 32px)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            let bg = "bg-green-100";
            if (cell === WALL) bg = "bg-gray-800";
            if (cell === BRICK) bg = "bg-yellow-700";

            const fire = fires.find(f => f.r === r && f.c === c);
            const enemy = enemies.find(e => e.r === r && e.c === c);
            const bomb = bombs.find(b => b.r === r && b.c === c);
            const isPlayer = player.r === r && player.c === c;

            return (
              <div key={`${r}-${c}`} className={`w-8 h-8 flex items-center justify-center ${bg} border border-black`}>
                {fire && "🔥"}
                {bomb && "💣"}
                {enemy && "👾"}
                {isPlayer && (
                  <span className={invulnerable ? "animate-pulse opacity-50" : ""}>
                    🧍
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md text-center">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-800">Vidas</p>
          <p className="font-bold text-slate-800">❤️ {player.lives}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-800">Score</p>
          <p className="font-bold text-indigo-600">{score}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-800">Enemigos</p>
          <p className="font-bold text-slate-800">{enemies.length}</p>
        </div>
      </div>

      {gameOver && <div className="mt-4 text-red-500 font-bold">Game Over 💀</div>}

      <p className="mt-2 text-xs text-slate-800">Flechas para moverte | Espacio para bomba</p>
    </div>
  );
}
