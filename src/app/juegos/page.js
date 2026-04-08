"use client";
import { useState, useEffect } from "react";
import { getValidPoints, savePoints } from "@/lib/pointsStore";
import Pupiletras from "@/components/Pupiletras";
import DinoGame from "@/components/DinoGame";
import Crucigrama from "@/components/Crucigrama";
import Sudoku from "@/components/Sodoku";
import Solitario from "@/components/Solitario";
import Bomberman from "@/components/Bomberman";
import Mastergrama from "@/components/Crucigrama/Mastergrama"; // <--- Nueva importación

// Componente auxiliar para las estrellas de dificultad
function DificultadStars({ nivel }) {
  const numEstrellas = nivel === "Fácil" ? 1 : nivel === "Medio" ? 2 : 3;
  const stars = Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={i < numEstrellas ? "text-slate-800" : "text-slate-300"}>
      ★
    </span>
  ));
  return <div className="text-xl flex gap-1">{stars}</div>;
}

// Componente para los espacios publicitarios
function EspacioPublicitario({ size = "leaderboard", className = "" }) {
  const sizes = {
    leaderboard: "w-full h-24", // Banner horizontal ancho
    banner: "w-full h-16",       // Banner horizontal más bajo
    skyscraper: "w-40 h-full",   // Banner vertical alto
  };

  return (
    <div className={`bg-slate-200 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm ${sizes[size]} ${className}`}>
      Publicidad [{size.toUpperCase()}]
    </div>
  );
}

// Datos de los juegos para automatizar la renderización de tarjetas
const retosClasicos = [
  {
    id: "sudoku",
    nombre: "Sudoku",
    icono: (
      <img src="/imgs/sudokuu-Photoroom.png" alt="Sudoku Icon" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-teal-400"
  },
  {
    id: "crucigrama",
    nombre: "Crucigrama",
    icono: (
      <img src="/imgs/crucigrama-Photoroom.png" alt="Crossword Icon" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-blue-400"
  },
  {
    id: "pupiletras",
    nombre: "Pupiletras",
    icono: (
      <img src="/imgs/pupiletras-Photoroom.png" alt="Word Search Icon" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-purple-400"
  },
  {
    id: "solitario",
    nombre: "Solitario",
    icono: (
      <img src="/imgs/solitario-Photoroom.png" alt="Solitaire Cards Icon" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-violet-600"
  },
  {
    id: "mastergrama", // ID para el estado activeGame
    nombre: "Mastergrama",
    icono: (
      <img src="/imgs/crucigrama-Photoroom.png" alt="Mastergrama Icon" className="w-16 h-16 mx-auto mb-4 shadow-sm" />
    ),
    descripcion: "El clásico de La República ahora en versión digital e interactiva.",
    dificultad: "Difícil",
    tiempo: "10 min",
    borderColor: "border-indigo-600"
  },
];

const retosEspeciales = [
  {
    id: "dinosaurio",
    nombre: "Dinosaurio",
    icono: (
      <img src="/imgs/dinosarurio-Photoroom.png" alt="Dino Character" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-green-400"
  },
  {
    id: "bomberman",
    nombre: "Bomberman",
    icono: (
      <img src="/imgs/bomberman-Photoroom.png" alt="Bomberman Icon" className="w-16 h-16 mx-auto mb-4" />
    ),
    descripcion: "Resuelve este reto generado por IA y suma puntos.",
    dificultad: "Medio",
    tiempo: "5 min",
    borderColor: "border-red-400"
  },
];

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
    // bg-slate-100 es el fondo gris, min-h-screen, p-8. Además un patrón digital sutil.
    <main className="min-h-screen bg-slate-100 p-8" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48ZyBmaWxsPSIjZTZlN2ViIiBmaWxsLW9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTAgMGgwdiA4MGgwVjB6TTAgMmg4MHYgMTBoODBCMnpNNDAgMTJoMzB2IDEwaDcwQjEyek0wIDMwaDcwdiAxMGg3MEIzMHoiLz48L2c+PC9zdmc+')" }}>

      {/* HEADER DETALLADO */}
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-md mb-8 border border-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bienvenido a los Retos IA</h2>
          <p className="text-blue-600 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Usuario LR Focus
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-3xl font-black text-orange-600">Puntos</p>
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-xl">
                {points}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                Puntos caducan en 7 días
              </span>
              {/* <img src="https://i.ibb.co/Vv6M3M4/gift-box.png" alt="Gift Icon" className="w-6 h-6" /> */}

            </div>
          </div>
          <div className="w-48 text-center">
            <p className="text-sm font-bold text-slate-800">7 / 10 days</p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1 border border-slate-200">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1">Calendario personal semanal</p>
          </div>
        </div>
      </header>

      {/* SECCIÓN DE CANJE EN CUPONIDAD */}
      <section className="bg-white p-10 rounded-3xl shadow-xl border border-blue-100 flex items-center justify-between gap-8 mb-8">
        <div className="flex items-center gap-6">
          <img src="/imgs/retosia-Photoroom.png" alt="Gift Icon" className="w-60 h-40" />
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-2">¡Canjea tus puntos!</h3>
            <p className="text-slate-600 text-lg max-w-2xl">
              Juega, diviertete y utiliza tus puntos acumulados para obtener increíbles descuentos y experiencias en <strong className="text-orange-600">Cuponidad</strong>. ¡Descubre todas las ofertas disponibles para ti!
            </p>
          </div>
        </div>
        <button className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition-colors shadow-lg flex items-center gap-3">
          Explorar Cuponidad <img src="/imgs/cuponidad.png" alt="Cuponidad Logo" className="w-20 h-10" />
        </button>
      </section>

      {/* BANNER PUBLICITARIO PRINCIPAL */}
      <EspacioPublicitario size="leaderboard" className="mb-8" />

      {/* SECCIÓN: RETOS CLÁSICOS */}
      <h3 className="text-xl font-bold text-teal-800 mb-6 uppercase tracking-wider">RETOS CLÁSICOS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {retosClasicos.map((juego) => (
          <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all`}>
            {juego.icono}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
            <p className="text-slate-500 text-sm mb-3">{juego.descripcion}</p>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
              <DificultadStars nivel={juego.dificultad} />
              <span>Nivel de Dificultad: Medio</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-6">Tiempo Estimado: {juego.tiempo}</p>
            <button
              onClick={() => setActiveGame(juego.id.toLowerCase())}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Jugar ahora <span>▶</span>
            </button>
          </div>
        ))}
      </div>

      {/* BANNER PUBLICITARIO INTERMEDIO */}
      <EspacioPublicitario size="banner" className="mb-12" />

      {/* SECCIÓN: RETOS ESPECIALES */}
      <div className="grid grid-cols-[1fr,auto] gap-8 mb-12">
        <div>
          <h3 className="text-xl font-bold text-blue-800 mb-6 uppercase tracking-wider">RETOS ESPECIALES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {retosEspeciales.map((juego) => (
              <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all`}>
                {juego.icono}
                <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
                <p className="text-slate-500 text-sm mb-3">{juego.descripcion}</p>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <DificultadStars nivel={juego.dificultad} />
                  <span>Nivel de Dificultad: Medio</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-6">Tiempo Estimado: {juego.tiempo}</p>
                <button
                  onClick={() => setActiveGame(juego.id.toLowerCase())}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  Jugar ahora <span>▶</span>
                </button>
              </div>
            ))}
            {/* Tarjeta vacía de "Nuevo Reto Próximamente" */}
            <div className="bg-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center opacity-70 border-2 border-dashed border-slate-400">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full mb-3 shadow-inner">Nuevo Reto Próximamente</span>
            </div>
          </div>
        </div>
        {/* PUBLICIDAD VERTICAL (Skyscraper) */}
        <EspacioPublicitario size="skyscraper" />
      </div>



      {/* FOOTER PUBLICITARIO FINAL */}
      <EspacioPublicitario size="leaderboard" />

      {/* MODAL DEL JUEGO (sin cambios) */}
      {/* ... (resto del código del modal) ... */}

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
      {activeGame === 'solitario' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl espacio">
            <button
              onClick={() => setActiveGame(null)}
              className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full"
            >
              X
            </button>
            <Solitario onWin={handleWin} />
          </div>
        </div>
      )}
      {activeGame === 'bomberman' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-xl shadow-2xl espacio">
            <button
              onClick={() => setActiveGame(null)}
              className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full"
            >
              X
            </button>
            <Bomberman onWin={handleWin} />
          </div>
        </div>
      )},
      {activeGame === 'mastergrama' && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-8 rounded-[2rem] relative w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4 px-4">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mastergrama La República</h2>
              <button
                onClick={() => setActiveGame(null)}
                className="text-white font-black bg-red-500 hover:bg-red-600 w-10 h-10 rounded-full shadow-md transition-transform hover:scale-110 flex items-center justify-center"
              >
                X
              </button>
            </div>

            {/* Contenedor con scroll para el lienzo de InDesign */}
            <div className="flex-1 overflow-auto border-2 border-slate-100 rounded-xl bg-slate-50">
              <Mastergrama onWin={handleWin} />
            </div>
          </div>
        </div>
      )}

    </main>
  );
}