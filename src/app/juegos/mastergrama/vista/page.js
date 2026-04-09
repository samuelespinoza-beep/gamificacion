"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import masterData from "@/components/Crucigrama/data.json";
import diseñoBase from "@/components/Crucigrama/mi-mastergrama.json";

export default function MastergramaVistaJugador() {
    const ROWS = 18;
    const COLS = 20;
    const CELL_SIZE = 50;
    const BOARD_WIDTH = COLS * CELL_SIZE;
    const BOARD_HEIGHT = ROWS * CELL_SIZE;

    const [pistasColocadas, setPistasColocadas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        setPistasColocadas(diseñoBase || []);
        const respuestasGuardadas = localStorage.getItem("mastergrama_respuestas_jugador");
        if (respuestasGuardadas) {
            setRespuestas(JSON.parse(respuestasGuardadas));
        }
    }, []);

    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("mastergrama_respuestas_jugador", JSON.stringify(respuestas));
        }
    }, [respuestas, hasMounted]);

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center font-sans select-none overflow-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { display: none; }
                .no-select-area { user-select: none !important; -webkit-user-select: none !important; }
            `}} />

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
                    {/* --- CAPA 1: LOS INPUTS (Van abajo) --- */}
                    {Array.from({ length: ROWS * COLS }).map((_, i) => {
                        const r = Math.floor(i / COLS); const c = i % COLS;
                        return (
                            <input
                                key={i}
                                className="absolute border border-transparent text-center font-bold text-xl uppercase outline-none focus:bg-yellow-50/50 text-blue-900 bg-transparent"
                                style={{
                                    left: c * CELL_SIZE,
                                    top: r * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    zIndex: 1 // Capa base
                                }}
                                maxLength={1}
                                value={respuestas[`${r}-${c}`] || ""}
                                onChange={(e) => setRespuestas({ ...respuestas, [`${r}-${c}`]: e.target.value.toUpperCase() })}
                            />
                        );
                    })}

                    {/* --- CAPA 2: LAS PISTAS E IMÁGENES (Van arriba, igual que en tu editor) --- */}
                    {pistasColocadas.map((pista) => (
                        <div key={pista.id}
                            className={`absolute flex items-center justify-center transition-all duration-75
                            ${pista.type === 'flecha' || pista.type === 'flecha_pista' || pista.type === 'pared' ? 'bg-transparent border-transparent' : 'border border-slate-400 bg-white shadow-sm'}
                            pointer-events-none`} // Esto hace que el clic pase al input de abajo
                            style={{
                                left: pista.x,
                                top: pista.y,
                                width: pista.w,
                                height: pista.h,
                                transform: pista.type === 'pared' ? 'none' : `rotate(${pista.rotate}deg)`,
                                transformOrigin: 'center center',
                                zIndex: 10 // Al estar en zIndex 10, tapan visualmente al input y su cursor
                            }}
                        >
                            {pista.type === 'pared' ? (
                                <div className="w-full h-full bg-black shadow-sm"></div>
                            ) : pista.type === 'imagen_vacia' ? (
                                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                                    {pista.src && (
                                        <img src={pista.src} className="w-full h-full object-cover" alt="pista" draggable={false} />
                                    )}
                                </div>
                            ) : pista.type === 'pista' ? (
                                <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
                                    <textarea
                                        className="w-full h-full bg-transparent border-none outline-none resize-none text-center text-black text-[6px] uppercase leading-tight no-scrollbar font-normal antialiased"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', wordBreak: 'break-word', whiteSpace: 'pre-wrap', height: '100%', padding: '0', margin: '0'
                                        }}
                                        value={pista.text}
                                        readOnly
                                    />
                                </div>
                            ) : (
                                <span className={`${pista.type === 'flecha_pista' ? 'text-black' : 'text-orange-500'} font-black`} style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px` }}>{pista.text}</span>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => { if (confirm("¿Reiniciar progreso?")) setRespuestas({}); }}
                    className="mt-8 px-6 py-2 bg-slate-200 text-slate-600 rounded-full font-bold text-[10px] hover:bg-red-100 transition-all uppercase tracking-widest"
                >
                    Reiniciar progreso
                </button>
            </div>
        </div>
    );
}