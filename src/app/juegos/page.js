"use client";
import { useState, useEffect } from "react";
import { getValidPoints, savePoints } from "@/lib/pointsStore";
import Pupiletras from "@/components/Pupiletras";
import DinoGame from "@/components/DinoGame";
import Crucigrama from "@/components/Crucigrama";
import Sudoku from "@/components/Sodoku";

export default function DashboardJuegos() {
  const [points, setPoints] = useState(0);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    setPoints(getValidPoints());
  }, []);

  const handleWin = (winPoints) => {
    savePoints(winPoints, activeGame);
    setPoints(getValidPoints());
    setActiveGame(null);
  };

  return (
    // bg-slate-100 es el fondo gris para que no se vea todo blanco
    <main className="min-h-screen bg-slate-100 p-8">
      
      {/* HEADER CON COLOR */}
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-md mb-10 border border-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bienvenido a los Retos IA</h2>
          <p className="text-blue-600 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span> 
            Usuario LR Focus
          </p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-orange-500">{points}</p>
          <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg mt-1 inline-block">
            Puntos caducan en 7 días
          </p>
        </div>
      </header>

      {/* GRID DE JUEGOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {['Sudoku', 'Crucigrama', 'Pupiletras', 'Solitario', 'Dinosaurio'].map((juego) => (
          <div key={juego} className="bg-white p-8 rounded-3xl shadow-lg border-b-8 border-blue-600 hover:-translate-y-2 transition-all">
            <div className="text-4xl mb-4">
               {juego === 'Sudoku' ? '🔢' : juego === 'Crucigrama' ? '✏️' : juego === 'Pupiletras' ? '🔍' : juego === 'Solitario' ? '🃏' : '🦖'}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{juego}</h3>
            <p className="text-slate-500 text-sm mb-6">Resuelve este reto generado por IA y suma puntos.</p>
            <button 
              onClick={() => setActiveGame(juego.toLowerCase())}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
            >
              Jugar ahora
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DEL JUEGO */}
      {activeGame === 'pupiletras' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
            <button 
              onClick={() => setActiveGame(null)} 
              className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full"
            >
              X
            </button>
            <Pupiletras onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'dinosaurio' && (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-3xl shadow-2xl">
      <button 
        onClick={() => setActiveGame(null)} 
        className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full"
      >
        X
      </button>
      <DinoGame onWin={handleWin} />
    </div>
  </div>
)}
{activeGame === 'crucigrama' && (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
    <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] relative w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
      <button 
        onClick={() => setActiveGame(null)} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white font-black bg-red-500 hover:bg-red-600 w-10 h-10 rounded-full z-50 shadow-md transition-transform hover:scale-110 flex items-center justify-center"
      >
        X
      </button>
      {/* Pasamos handleWin tal como lo tienes */}
      <Crucigrama onWin={handleWin} />
    </div>
  </div>
)}
{activeGame === 'sudoku' && (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
      <button 
        onClick={() => setActiveGame(null)} 
        className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full"
      >
        X
      </button>
      <Sudoku onWin={handleWin} />
    </div>
  </div>
)}
    </main>
  );
}