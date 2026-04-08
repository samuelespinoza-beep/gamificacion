"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getValidPoints, savePoints } from "@/lib/pointsStore";
import Pupiletras from "@/components/Pupiletras";
import DinoGame from "@/components/DinoGame";
import Crucigrama from "@/components/Crucigrama";
import Sudoku from "@/components/Sodoku";
import Solitario from "@/components/Solitario";
import Bomberman from "@/components/Bomberman";

// Componente auxiliar para las estrellas de dificultad
function DificultadStars({ nivel }) {
  const numEstrellas = nivel === "Fácil" ? 1 : nivel === "Medio" ? 2 : 3;
  return (
    <div className="text-xl flex gap-1">
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={i < numEstrellas ? "text-slate-800" : "text-slate-300"}>★</span>
      ))}
    </div>
  );
}

function EspacioPublicitario({ size = "leaderboard", className = "" }) {
  const sizes = { leaderboard: "w-full h-24", banner: "w-full h-16", skyscraper: "w-40 h-full" };
  return (
    <div className={`bg-slate-200 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm ${sizes[size]} ${className}`}>
      Publicidad [{size.toUpperCase()}]
    </div>
  );
}

const retosClasicos = [
  { id: "sudoku", nombre: "Sudoku", icono: <img src="/imgs/sudokuu-Photoroom.png" alt="Sudoku" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-teal-400" },
  { id: "crucigrama", nombre: "Crucigrama", icono: <img src="/imgs/crucigrama-Photoroom.png" alt="Crossword" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-blue-400" },
  { id: "pupiletras", nombre: "Pupiletras", icono: <img src="/imgs/pupiletras-Photoroom.png" alt="Word Search" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-purple-400" },
  { id: "solitario", nombre: "Solitario", icono: <img src="/imgs/solitario-Photoroom.png" alt="Solitaire" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-violet-600" },
  { id: "mastergrama", nombre: "Mastergrama", icono: <img src="/imgs/crucigrama-Photoroom.png" alt="Mastergrama" className="w-16 h-16 mx-auto mb-4 shadow-sm" />, descripcion: "El clásico de La República digital.", dificultad: "Difícil", tiempo: "10 min", borderColor: "border-indigo-600" },
];

const retosEspeciales = [
  { id: "dinosaurio", nombre: "Dinosaurio", icono: <img src="/imgs/dinosarurio-Photoroom.png" alt="Dino" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-green-400" },
  { id: "bomberman", nombre: "Bomberman", icono: <img src="/imgs/bomberman-Photoroom.png" alt="Bomberman" className="w-16 h-16 mx-auto mb-4" />, descripcion: "Resuelve este reto generado por IA.", dificultad: "Medio", tiempo: "5 min", borderColor: "border-red-400" },
];

export default function DashboardJuegos() {
  const [points, setPoints] = useState(0);
  const [activeGame, setActiveGame] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setPoints(getValidPoints());
  }, []);

  const handleWin = (winPoints) => {
    savePoints(winPoints, activeGame);
    setPoints(getValidPoints());
    setActiveGame(null);
  };

  const handleGameClick = (gameId) => {
    if (gameId === "mastergrama") {
      router.push("/juegos/mastergrama"); // Navega a src/app/juegos/mastergrama/page.js
    } else {
      setActiveGame(gameId);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48ZyBmaWxsPSIjZTZlN2ViIiBmaWxsLW9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTAgMGgwdiA4MGgwVjB6TTAgMmg4MHYgMTBoODBCMnpNNDAgMTJoMzB2IDEwaDcwQjEyek0wIDMwaDcwdiAxMGg3MEIzMHoiLz48L2c+PC9zdmc+')" }}>

      {/* HEADER */}
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-md mb-8 border border-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bienvenido a los Retos IA</h2>
          <p className="text-blue-600 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Usuario LR Focus
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-3xl font-black text-orange-600">Puntos</p>
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-xl">{points}</div>
            </div>
          </div>
        </div>
      </header>

      {/* SECCIÓN CANJE */}
      <section className="bg-white p-10 rounded-3xl shadow-xl border border-blue-100 flex items-center justify-between gap-8 mb-8">
        <div className="flex items-center gap-6">
          <img src="/imgs/retosia-Photoroom.png" alt="Canje" className="w-60 h-40" />
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-2">¡Canjea tus puntos!</h3>
            <p className="text-slate-600 text-lg">Juega y obtén descuentos en <strong className="text-orange-600">Cuponidad</strong>.</p>
          </div>
        </div>
        <button className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-700 shadow-lg flex items-center gap-3">
          Explorar Cuponidad <img src="/imgs/cuponidad.png" alt="Logo" className="w-20 h-10" />
        </button>
      </section>

      <EspacioPublicitario size="leaderboard" className="mb-8" />

      {/* RENDERIZADO DE JUEGOS CLÁSICOS */}
      <h3 className="text-xl font-bold text-teal-800 mb-6 uppercase tracking-wider">RETOS CLÁSICOS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {retosClasicos.map((juego) => (
          <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all`}>
            {juego.icono}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
            <p className="text-slate-500 text-sm mb-3">{juego.descripcion}</p>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
              <DificultadStars nivel={juego.dificultad} />
              <span>Nivel: {juego.dificultad}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-6">Tiempo: {juego.tiempo}</p>
            <button
              onClick={() => handleGameClick(juego.id)}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Jugar ahora <span>▶</span>
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-blue-800 mb-6 uppercase tracking-wider">RETOS ESPECIALES</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {retosEspeciales.map((juego) => (
          <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all`}>
            {juego.icono}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
            <button
              onClick={() => handleGameClick(juego.id)}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg mt-4"
            >
              Jugar ahora <span>▶</span>
            </button>
          </div>
        ))}
      </div>

      {/* MODALES DE JUEGOS (Solo los que no son Mastergrama) */}
      {activeGame === 'pupiletras' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <Pupiletras onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'dinosaurio' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-3xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <DinoGame onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'crucigrama' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] relative w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 text-white font-black bg-red-500 w-10 h-10 rounded-full flex items-center justify-center">X</button>
            <Crucigrama onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'sudoku' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <Sudoku onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'solitario' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <Solitario onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'bomberman' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <Bomberman onWin={handleWin} />
          </div>
        </div>
      )}
    </main>
  );
}