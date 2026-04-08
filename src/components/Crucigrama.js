"use client";
import { useState, useEffect } from "react";

export default function MastergramaDiario() {
  const [tablero, setTablero] = useState(null);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    // Reconstrucción de la cuadrícula basada en el PDF y Story XMLs
    const datosProcesados = {
      columnas: 15,
      filas: 18,
      fecha: "MIÉRCOLES 25 MARZO 2026",
      seccion: "PASATIEMPOS - PÁG 24",
      celdas: [
        // --- SECCIÓN SUPERIOR IZQUIERDA ---
        { r: 0, c: 0, tipo: "pista", txt: "INSTRUMENTO DE FLORENCIO CORONADO", dir: "v" },
        { r: 0, c: 1, tipo: "pista", txt: "AL MÁXIMO, A REBOSAR", dir: "h" },
        { r: 0, c: 2, tipo: "letra", solucion: "L" },
        { r: 0, c: 3, tipo: "letra", solucion: "L" },
        { r: 0, c: 4, tipo: "letra", solucion: "E" },
        { r: 0, c: 5, tipo: "letra", solucion: "N" },
        { r: 0, c: 6, tipo: "letra", solucion: "O" },
        { r: 0, c: 7, tipo: "bloque" },
        { r: 0, c: 8, tipo: "pista", txt: "CUNA DE ABRAHAM", dir: "v" },
        { r: 0, c: 9, tipo: "letra", solucion: "U" },
        { r: 0, c: 10, tipo: "letra", solucion: "R" },

        { r: 1, c: 0, tipo: "letra", solucion: "A" },
        { r: 1, c: 1, tipo: "pista", txt: "LETRAS ORDEN REGRESIVO", dir: "h" },
        { r: 1, c: 2, tipo: "letra", solucion: "Z" },
        { r: 1, c: 3, tipo: "letra", solucion: "Y" },
        { r: 1, c: 4, tipo: "letra", solucion: "X" },
        { r: 1, c: 5, tipo: "letra", solucion: "W" },
        { r: 1, c: 8, tipo: "letra", solucion: "R" },

        { r: 2, c: 0, tipo: "letra", solucion: "R" },
        { r: 2, c: 1, tipo: "bloque" },
        { r: 2, c: 2, tipo: "pista", txt: "TEMA DE GIPSY KINGS", dir: "h" },
        { r: 2, c: 3, tipo: "letra", solucion: "B" },
        { r: 2, c: 4, tipo: "letra", solucion: "A" },
        { r: 2, c: 5, tipo: "letra", solucion: "M" },
        { r: 2, c: 6, tipo: "letra", solucion: "B" },
        { r: 2, c: 7, tipo: "letra", solucion: "O" },
        { r: 2, c: 8, tipo: "bloque" },

        { r: 3, c: 0, tipo: "letra", solucion: "P" },
        { r: 3, c: 1, tipo: "pista", txt: "CANTA FATHER AND SON", dir: "h" },
        { r: 3, c: 2, tipo: "letra", solucion: "C" },
        { r: 3, c: 3, tipo: "letra", solucion: "A" },
        { r: 3, c: 4, tipo: "letra", solucion: "T" },
        { r: 3, c: 5, tipo: "bloque" },
        { r: 3, c: 6, tipo: "pista", txt: "SIMBOLO DEL OSMIO", dir: "h" },
        { r: 3, c: 7, tipo: "letra", solucion: "O" },
        { r: 3, c: 8, tipo: "letra", solucion: "S" },

        // --- SECCIÓN MEDIA (Extraída de tus XML) ---
        { r: 5, c: 0, tipo: "pista", txt: "UNO EN INGLÉS", dir: "h" },
        { r: 5, c: 1, tipo: "letra", solucion: "O" },
        { r: 5, c: 2, tipo: "letra", solucion: "N" },
        { r: 5, c: 3, tipo: "letra", solucion: "E" },
        { r: 5, c: 4, tipo: "bloque" },
        { r: 5, c: 5, tipo: "pista", txt: "ACTOR 'EL PADRINO'", dir: "v" },
        { r: 5, c: 10, tipo: "pista", txt: "LITIO", dir: "v" },

        { r: 6, c: 5, tipo: "letra", solucion: "A" },
        { r: 6, c: 6, tipo: "pista", txt: "AUMENTATIVO", dir: "h" },
        { r: 6, c: 7, tipo: "letra", solucion: "O" },
        { r: 6, c: 8, tipo: "letra", solucion: "N" },

        // --- SECCIÓN CHAPLA (Story_u5fc) ---
        { r: 10, c: 0, tipo: "pista", txt: "PAN TRADICIONAL AYACUCHO", dir: "h" },
        { r: 10, c: 1, tipo: "letra", solucion: "C" },
        { r: 10, c: 2, tipo: "letra", solucion: "H" },
        { r: 10, c: 3, tipo: "letra", solucion: "A" },
        { r: 10, c: 4, tipo: "letra", solucion: "P" },
        { r: 10, c: 5, tipo: "letra", solucion: "L" },
        { r: 10, c: 6, tipo: "letra", solucion: "A" },

        // --- SECCIÓN ALOE ---
        { r: 12, c: 0, tipo: "pista", txt: "PLANTA MEDICINAL VERA", dir: "h" },
        { r: 12, c: 1, tipo: "letra", solucion: "A" },
        { r: 12, c: 2, tipo: "letra", solucion: "L" },
        { r: 12, c: 3, tipo: "letra", solucion: "O" },
        { r: 12, c: 4, tipo: "letra", solucion: "E" },

        // --- PISTAS SUELTAS DEL XML ---
        { r: 14, c: 8, tipo: "pista", txt: "CIUDAD DE CALDEA", dir: "h" },
        { r: 14, c: 9, tipo: "letra", solucion: "U" },
        { r: 14, c: 10, tipo: "letra", solucion: "R" },

        { r: 15, c: 2, tipo: "pista", txt: "SÍMBOLO DEL SODIO", dir: "h" },
        { r: 15, c: 3, tipo: "letra", solucion: "N" },
        { r: 15, c: 4, tipo: "letra", solucion: "A" },
      ]
    };
    setTablero(datosProcesados);
  }, []);

  const comprobarSolucion = () => {
    let aciertos = 0;
    let total = 0;
    tablero.celdas.forEach(celda => {
      if (celda.tipo === "letra") {
        total++;
        const respondido = respuestas[`${celda.r}-${celda.c}`]?.toUpperCase();
        if (respondido === celda.solucion) aciertos++;
      }
    });
    alert(`Resultado: ${aciertos} de ${total} correctas.`);
  };

  if (!tablero) return <div className="p-20 text-center font-serif text-2xl">Generando Edición Digital...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-[#f0f0f0] min-h-screen text-black font-sans">
      {/* HEADER TIPO PRENSA */}
      <header className="border-b-4 border-black mb-6 flex justify-between items-end pb-2">
        <div>
          <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Interactiva</span>
          <h1 className="text-7xl font-black italic tracking-tighter leading-none mt-1">MASTERGRAMA</h1>
        </div>
        <div className="text-right border-l-2 border-gray-300 pl-4 h-16 flex flex-col justify-center">
          <p className="text-sm font-bold leading-tight">{tablero.fecha}</p>
          <p className="text-xs text-red-600 font-bold uppercase tracking-widest">La República</p>
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        {/* AREA DEL JUEGO */}
        <div className="bg-white p-6 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] border border-gray-200 overflow-auto">
          <div
            className="grid bg-gray-300 p-[1px] mx-auto"
            style={{
              gridTemplateColumns: `repeat(${tablero.columnas}, 48px)`,
              width: "fit-content"
            }}
          >
            {/* Relleno Dinámico: Generamos todas las celdas del 15x18 */}
            {Array.from({ length: tablero.columnas * tablero.filas }).map((_, index) => {
              const r = Math.floor(index / tablero.columnas);
              const c = index % tablero.columnas;
              const celda = tablero.celdas.find(cel => cel.r === r && cel.c === c);

              return (
                <div key={index} className="w-[48px] h-[48px] bg-white border-[0.5px] border-gray-400 relative">
                  {celda?.tipo === "pista" && (
                    <div className="absolute inset-0 bg-yellow-50 p-1 flex flex-col justify-between items-center overflow-hidden border-2 border-yellow-200">
                      <span className="text-[7.5px] leading-[8px] font-bold uppercase text-center text-gray-700 h-full flex items-center">
                        {celda.txt}
                      </span>
                      <span className="text-red-600 font-black text-xs leading-none">
                        {celda.dir === "v" ? "↓" : "→"}
                      </span>
                    </div>
                  )}

                  {celda?.tipo === "letra" && (
                    <input
                      maxLength={1}
                      className="w-full h-full text-center font-bold text-2xl uppercase focus:bg-blue-50 outline-none transition-all focus:ring-2 focus:ring-blue-400 z-10 relative bg-transparent"
                      onChange={(e) => setRespuestas({ ...respuestas, [`${r}-${c}`]: e.target.value })}
                    />
                  )}

                  {(celda?.tipo === "bloque" || !celda) && (
                    <div className={`w-full h-full ${!celda ? 'bg-gray-100' : 'bg-black'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR DE INFO Y PUBLICIDAD */}
        <aside className="space-y-6">
          <div className="bg-red-600 text-white p-5 transform -rotate-1 shadow-lg">
            <h2 className="font-black text-xl mb-2">¡EL RETO DE HOY!</h2>
            <p className="text-sm italic">Completa el Mastergrama y pon a prueba tu cultura general. Basado en la edición impresa de La República.</p>
          </div>

          {/* Bloque de Publicidad recreado del PDF */}
          <div className="border-4 border-double border-gray-400 p-4 bg-white shadow-inner">
            <h3 className="text-xs font-black text-gray-500 mb-3 border-b pb-1 uppercase tracking-tighter">Promociones Práktika</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="w-12 h-12 bg-gray-200 rounded shrink-0"></div>
                <div>
                  <p className="text-[10px] font-bold leading-tight">OLLA A PRESIÓN 6 LTS + CUCHILLO ACERO</p>
                  <p className="text-red-600 font-black text-sm">S/ 210.00</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-12 h-12 bg-gray-200 rounded shrink-0"></div>
                <div>
                  <p className="text-[10px] font-bold leading-tight">MINI LICUADORA SHAKE TO GO</p>
                  <p className="text-gray-400 text-[9px] italic font-serif">El diario de verdad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-4 flex flex-col gap-3">
            <button
              onClick={comprobarSolucion}
              className="w-full bg-black text-white py-4 font-black text-2xl hover:bg-red-600 transition-colors shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] uppercase italic tracking-tighter"
            >
              Comprobar
            </button>
            <button
              onClick={() => window.print()}
              className="w-full border-2 border-black py-2 font-bold hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <span>🖨️</span> VERSIÓN IMPRESA
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}