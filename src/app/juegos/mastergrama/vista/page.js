"use client";
import React, { useState, useEffect, useCallback } from "react";
import diseñoBase from "@/components/Crucigrama/mi-mastergrama.json";

export default function MastergramaVistaJugador() {
    const ROWS = 24;
    const COLS = 20;
    const CELL_SIZE = 50;
    const BOARD_WIDTH = COLS * CELL_SIZE;
    const BOARD_HEIGHT = ROWS * CELL_SIZE;

    const [pistasColocadas, setPistasColocadas] = useState([]);
    const [respuestasUsuario, setRespuestasUsuario] = useState({});
    const [solucionMaestra, setSolucionMaestra] = useState({});
    const [hasMounted, setHasMounted] = useState(false);

    // --- NUEVOS ESTADOS PARA GAMIFICACIÓN ---
    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [tiempo, setTiempo] = useState(0);

    useEffect(() => {
        setHasMounted(true);
        if (diseñoBase.diseno) {
            setPistasColocadas(diseñoBase.diseno);
            setSolucionMaestra(diseñoBase.respuestas || {});
        } else {
            setPistasColocadas(diseñoBase || []);
        }

        const guardado = localStorage.getItem("mastergrama_respuestas_jugador");
        if (guardado) {
            setRespuestasUsuario(JSON.parse(guardado));
        }
    }, []);

    // Lógica del Cronómetro
    useEffect(() => {
        let intervalo;
        if (juegoIniciado) {
            intervalo = setInterval(() => {
                setTiempo((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(intervalo);
    }, [juegoIniciado]);

    useEffect(() => {
        if (hasMounted) {
            localStorage.setItem("mastergrama_respuestas_jugador", JSON.stringify(respuestasUsuario));
        }
    }, [respuestasUsuario, hasMounted]);

    // Formateador de tiempo
    const formatearTiempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const manejarNavegacion = (e, r, c) => {
        if (!juegoIniciado) return;
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
            
            {/* ENCABEZADO CON CRONÓMETRO */}
            <div className="w-full max-w-4xl flex justify-between items-end mb-8 border-b-4 border-slate-800 pb-2">
                <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
                    Mastergrama
                </h1>
                
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempo de Juego</span>
                    <span className="text-3xl font-mono font-black text-indigo-600 bg-white px-4 py-1 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
                        {formatearTiempo(tiempo)}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center no-select-area relative">
                
                {/* OVERLAY DE "EMPEZAR A JUGAR" */}
                {!juegoIniciado && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-sm transition-all">
                        <button 
                            onClick={() => setJuegoIniciado(true)}
                            className="group relative px-12 py-6 bg-indigo-600 text-white text-2xl font-black uppercase italic rounded-xl shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            🚀 Empezar a Jugar
                        </button>
                    </div>
                )}

                <div
                    className="relative bg-white shadow-2xl border-2 border-slate-800"
                    style={{
                        width: BOARD_WIDTH,
                        height: BOARD_HEIGHT,
                        backgroundImage: `linear-gradient(#6c6e72ff 1px, transparent 1px), linear-gradient(90deg, #6c6e72ff 1px, transparent 1px)`,
                        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                    }}
                >
                    {/* CAPA 1: INPUTS */}
                    {Array.from({ length: ROWS * COLS }).map((_, i) => {
                        const r = Math.floor(i / COLS);
                        const c = i % COLS;
                        const key = `${r}-${c}`;
                        const letra = respuestasUsuario[key] || "";
                        const correcta = solucionMaestra[key];

                        let bgClass = "bg-transparent";
                        if (letra !== "") {
                            bgClass = letra === correcta ? "bg-green-100/60" : "bg-red-100/60";
                        }

                        return (
                            <input
                                key={i}
                                data-pos={key}
                                disabled={!juegoIniciado}
                                className={`absolute text-center font-bold text-3xl uppercase outline-none focus:bg-yellow-50/50 transition-colors ${bgClass} text-blue-900 z-10 ${!juegoIniciado ? 'cursor-not-allowed' : ''}`}
                                style={{
                                    left: c * CELL_SIZE,
                                    top: r * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                }}
                                maxLength={1}
                                value={letra}
                                onKeyDown={(e) => manejarNavegacion(e, r, c)}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setRespuestasUsuario(prev => ({ ...prev, [key]: val }));
                                    if (val !== "") {
                                        const next = document.querySelector(`input[data-pos="${r}-${c + 1}"]`);
                                        if (next) next.focus();
                                    }
                                }}
                            />
                        );
                    })}

                    {/* CAPA 2: PISTAS Y FLECHAS */}
                    {pistasColocadas.map((pista) => (
                        <div key={pista.id}
                            title={pista.type === 'pista' ? pista.text : undefined}
                            className={`absolute flex items-center justify-center 
                            ${pista.type === 'pista' ? 'pointer-events-auto cursor-help' : 'pointer-events-none'} 
                            ${pista.type === 'flecha' || pista.type === 'flecha_pista' || pista.type === 'pared' ? 'bg-transparent border-transparent' : 'border border-slate-400 bg-white shadow-sm'}`}
                            style={{
                                left: pista.x, 
                                top: pista.y, 
                                width: pista.w, 
                                height: pista.h,
                                transform: pista.type === 'pared' ? 'none' : `rotate(${pista.rotate}deg)`,
                                zIndex: 50
                            }}
                        >
                            {pista.type === 'pared' ? (
                                <div className="w-full h-full bg-black shadow-sm"></div>
                            ) : pista.type === 'imagen_vacia' ? (
                                <div className="w-full h-full overflow-hidden">
                                    {pista.src && <img src={pista.src} className="w-full h-full object-cover" alt="pista" />}
                                </div>
                            ) : pista.type === 'pista' ? (
                                <div className="w-full h-full flex items-center justify-center p-1 overflow-visible relative">
                                    <span className="text-black text-[6px] uppercase leading-tight text-center break-words font-normal antialiased tracking-tighter">
                                        {pista.text}
                                    </span>

                                    <div
                                        className="absolute text-slate-900 select-none flex items-center justify-center pointer-events-none font-normal"
                                        style={{
                                            fontSize: '6px',
                                            width: '20px',
                                            height: '20px',
                                            transformOrigin: 'center',
                                            zIndex: 60,
                                            ...(pista.direction === 'superior' && { top: '-15px', left: '50%', transform: 'translateX(-50%) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'superior-invertida' && { top: '-15px', left: '50%', transform: 'translateX(-50%) rotate(180deg) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'inferior' && { bottom: '-15px', left: '50%', transform: 'translateX(-50%) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'inferior-invertida' && { bottom: '-15px', left: '50%', transform: 'translateX(-50%) rotate(180deg) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'derecha'  && { left: '-15px', top: '50%', transform: 'translateY(-50%) rotate(-90deg) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'izquierda' && { right: '-15px', top: '50%', transform: 'translateY(-50%) rotate(90deg) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'derecha-invertida' && { left: '-15px', top: '50%', transform: 'translateY(-50%) rotate(90deg) scaleY(1.5) scaleX(2.5)' }),
                                            ...(pista.direction === 'izquierda-invertida' && { right: '-15px', top: '50%', transform: 'translateY(-50%) rotate(-90deg) scaleY(1.5) scaleX(2.5)' }),
                                        }}
                                    >
                                        ↓
                                    </div>
                                </div>
                            ) : (
                                <span 
                                    className={`${pista.type === 'flecha_pista' ? 'text-black' : 'text-orange-500'} font-black flex items-center justify-center`} 
                                    style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px`, width: '100%', height: '100%' }}
                                >
                                    {pista.text}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mt-8 mb-12">
                    <button
                        onClick={() => { if (confirm("¿Reiniciar progreso?")) { setRespuestasUsuario({}); setTiempo(0); setJuegoIniciado(false); } }}
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