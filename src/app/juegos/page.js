"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getValidPoints, savePoints } from "@/lib/pointsStore";
import DinoGame from "@/components/DinoGame";



const retosClasicos = [
  { id: "mastergrama", nombre: "Mastergrama", icono: <img src="/imgs/crucigrama-Photoroom.png" alt="Mastergrama" className="w-16 h-16 mx-auto mb-4 shadow-sm" />, borderColor: "border-indigo-600" },
];

const retosEspeciales = [
  { id: "dinosaurio", nombre: "Dinosaurio", icono: <img src="/imgs/dinosarurio-Photoroom.png" alt="Dino" className="w-16 h-16 mx-auto mb-4" />, borderColor: "border-green-400" },
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
      router.push("/juegos/mastergrama");
    } else {
      setActiveGame(gameId);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      {/* RENDERIZADO DE JUEGOS CLÁSICOS */}
      <h3 className="text-xl font-bold text-teal-800 mb-6 uppercase tracking-wider text-center">RETOS CLÁSICOS</h3>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
        {retosClasicos.map((juego) => (
          <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all w-full max-w-sm`}>
            {juego.icono}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
            <button
              onClick={() => handleGameClick(juego.id)}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Jugar ahora <span>▶</span>
            </button>
          </div>
        ))}
        {retosEspeciales.map((juego) => (
          <div key={juego.id} className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${juego.borderColor} hover:-translate-y-2 transition-all w-full max-w-sm`}>
            {juego.icono}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{juego.nombre}</h3>
            <button
              onClick={() => handleGameClick(juego.id)}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              Jugar ahora <span>▶</span>
            </button>
          </div>
        ))}
      </div>

      {activeGame === 'dinosaurio' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] relative w-full max-w-3xl shadow-2xl">
            <button onClick={() => setActiveGame(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 w-10 h-10 rounded-full">X</button>
            <DinoGame onWin={handleWin} />
          </div>
        </div>
      )}
    </main>
  );
}