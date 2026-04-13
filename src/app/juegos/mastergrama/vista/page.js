"use client";
import React, { useState, useEffect } from "react";
import diseñoBase from "@/components/Crucigrama/mi-mastergrama.json";

export default function MastergramaVistaJugador() {
    const ROWS = 18;
    const COLS = 20;
    const CELL_SIZE = 50;
    const BOARD_WIDTH = COLS * CELL_SIZE;
    const BOARD_HEIGHT = ROWS * CELL_SIZE;

    const [pistasColocadas, setPistasColocadas] = useState([]);
    const [respuestasUsuario, setRespuestasUsuario] = useState({});
    const [solucionMaestra, setSolucionMaestra] = useState({});
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);

        // 1. Cargamos el diseño (pistas) y la solución del JSON
        if (diseñoBase.diseno) {
            setPistasColocadas(diseñoBase.diseno);
            setSolucionMaestra(diseñoBase.respuestas || {});
        } else {
            // Soporte para formato antiguo (solo arreglo)
            setPistasColocadas(diseñoBase || []);
        }

        // 2. Cargamos el progreso del jugador desde LocalStorage
        const guardado = localStorage.getItem("mastergrama_respuestas_jugador");
        if (guardado) {
            setRespuestasUsuario(JSON.parse(guardado));
        }
    }, []);

    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("mastergrama_respuestas_jugador", JSON.stringify(respuestasUsuario));
        }
    }, [respuestasUsuario, hasMounted]);

    // Función para mover el foco con las flechas del teclado
    const manejarNavegacion = (e, r, c) => {
        let nR = r, nC = c;
        if (e.key === "ArrowUp") nR--;
        else if (e.key === "ArrowDown") nR++;
        else if (e.key === "ArrowLeft") nC--;
        else if (e.key === "ArrowRight") nC++;
        else if (e.key === "Backspace" && !respuestasUsuario[`${r}-${c}`]) nC--;
        else return;

        e.preventDefault();
        const nextInput = document.querySelector(`input[data-pos="${nR}-${nC}"]`);
        if (nextInput) nextInput.focus();
    };

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center font-sans select-none overflow-auto">
            <h1 className="text-3xl font-black text-slate-700 uppercase italic mb-8 tracking-tighter">
                Mastergrama
            </h1>

            <div className="flex flex-col items-center no-select-area">
                <div
                    className="relative bg-white shadow-2xl border-2 border-slate-800"
                    style={{
                        width: BOARD_WIDTH,
                        height: BOARD_HEIGHT,
                        backgroundImage: `linear-gradient(#6c6e72ff 1px, transparent 1px), linear-gradient(90deg, #6c6e72ff 1px, transparent 1px)`,
                        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                    }}
                >
                    {/* --- CAPA 1: INPUTS CON VALIDACIÓN --- */}
                    {Array.from({ length: ROWS * COLS }).map((_, i) => {
                        const r = Math.floor(i / COLS);
                        const c = i % COLS;
                        const key = `${r}-${c}`;
                        const letra = respuestasUsuario[key] || "";
                        const correcta = solucionMaestra[key];

                        // Lógica de colores: Solo pintar si hay una letra escrita
                        let bgClass = "bg-transparent";
                        if (letra !== "") {
                            bgClass = letra === correcta ? "bg-green-100/60" : "bg-red-100/60";
                        }

                        return (
                            <input
                                key={i}
                                data-pos={key}
                                className={`absolute text-center font-bold text-xl uppercase outline-none focus:bg-yellow-50/50 transition-colors ${bgClass} text-blue-900`}
                                style={{
                                    left: c * CELL_SIZE,
                                    top: r * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    zIndex: 1
                                }}
                                maxLength={1}
                                value={letra}
                                onKeyDown={(e) => manejarNavegacion(e, r, c)}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setRespuestasUsuario(prev => ({ ...prev, [key]: val }));
                                    // Salto automático a la derecha
                                    if (val !== "") {
                                        const next = document.querySelector(`input[data-pos="${r}-${c + 1}"]`);
                                        if (next) next.focus();
                                    }
                                }}
                            />
                        );
                    })}

                    {/* --- CAPA 2: PISTAS --- */}
                    {pistasColocadas.map((pista) => (
                        <div key={pista.id}
                            className={`absolute flex items-center justify-center pointer-events-none 
                            ${pista.type === 'flecha' || pista.type === 'flecha_pista' || pista.type === 'pared' ? 'bg-transparent border-transparent' : 'border border-slate-400 bg-white shadow-sm'}`}
                            style={{
                                left: pista.x, top: pista.y, width: pista.w, height: pista.h,
                                transform: pista.type === 'pared' ? 'none' : `rotate(${pista.rotate}deg)`,
                                zIndex: 10
                            }}
                        >
                            {pista.type === 'pared' ? (
                                <div className="w-full h-full bg-black"></div>
                            ) : pista.type === 'imagen_vacia' ? (
                                <div className="w-full h-full overflow-hidden">
                                    {pista.src && <img src={pista.src} className="w-full h-full object-cover" />}
                                </div>
                            ) : pista.type === 'pista' ? (
                                <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
                                    <span className="text-black text-[6px] uppercase leading-tight text-center break-words font-normal antialiased">
                                        {pista.text}
                                    </span>
                                </div>
                            ) : (
                                <span className={`${pista.type === 'flecha_pista' ? 'text-black' : 'text-orange-500'} font-black`} style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px` }}>{pista.text}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => { if (confirm("¿Reiniciar progreso?")) setRespuestasUsuario({}); }}
                        className="px-6 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-[10px] hover:bg-red-50 transition-all uppercase tracking-widest"
                    >
                        🗑️ Reiniciar Juego
                    </button>
                    <button
                        onClick={() => setRespuestasUsuario(solucionMaestra)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-[10px] hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg"
                    >
                        👁️ Ver Solución
                    </button>
                </div>
            </div>
        </div>
    );
}