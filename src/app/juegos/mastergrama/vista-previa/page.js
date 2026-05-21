"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

/**
 * MASTERGRAMA ARCHITECT VIEW
 * Vista técnica para validar la geometría exacta extraída del IDML
 */
function ArchitectContent() {
    const searchParams = useSearchParams();
    const edicion = searchParams.get("edicion") || "MASTERGRAMA_8669_DO_12-04-26";
    
    const [pistas, setPistas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1.2);
    const [pan, setPan] = useState({ x: 100, y: 100 });
    const isDragging = useRef(false);
    const lastPan = useRef({ x: 0, y: 0 });
    const gridSize = 37;

    // Calculamos el origen global buscando el valor mínimo absoluto de las celdas
    const gridOrigin = useMemo(() => {
        const gridItems = pistas.filter(p => p.role === 'celda' || p.role === 'pared');
        if (gridItems.length === 0) return { x: 0, y: 0 };
        
        // Buscamos el mínimo para que sea el punto de anclaje de la rejilla
        const minX = Math.min(...gridItems.map(p => p.x));
        const minY = Math.min(...gridItems.map(p => p.y));
        
        return { 
            x: minX % gridSize, 
            y: minY % gridSize 
        };
    }, [pistas]);

    useEffect(() => {
        async function fetchPistas() {
            try {
                setLoading(true);
                const res = await fetch(`/api/leer-pistas?edicion=${edicion}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPistas(data);
                }
            } catch (err) {
                console.error("Error loading pistas:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPistas();
    }, [edicion]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        isDragging.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPan.current.x;
        const dy = e.clientY - lastPan.current.y;
        setPan(prev => ({ x: prev.x + dx / zoom, y: prev.y + dy / zoom }));
        lastPan.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => isDragging.current = false;

    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 5));
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a1a1b] text-indigo-400 font-mono">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] tracking-[0.3em] uppercase">Analizando Geometría...</p>
            </div>
        );
    }

    return (
        <div 
            className="h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800 relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* GRID BACKGROUND REMOVIDO */}

            {/* ARTBOARD */}
            <div 
                className="absolute"
                style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: '0 0',
                    transition: isDragging.current ? 'none' : 'transform 0.15s ease-out'
                }}
            >
                {pistas
                    .filter(p => (p.content && p.content.trim() !== "") || p.role === 'pared') // Filtrar elementos vacíos
                    .filter(p => !(p.x === 0 && p.y === 471)) // Filtrar coordenadas de "basura" del IDML
                    .map((p, idx) => {
                        const isCelda = p.role === 'celda';
                        const isPared = p.role === 'pared';
                        const isFlecha = p.role === 'flecha';
                        const isPista = p.role === 'pista';

                    // Ajuste magnético para celdas y paredes
                    let finalX = p.x;
                    let finalY = p.y;
                    
                    if (isCelda || isPared) {
                        finalX = Math.round((p.x - gridOrigin.x) / gridSize) * gridSize + gridOrigin.x;
                        finalY = Math.round((p.y - gridOrigin.y) / gridSize) * gridSize + gridOrigin.y;
                    }

                    return (
                        <div 
                            key={`${p.id}-${idx}`}
                            className="absolute group box-border shadow-none"
                            style={{
                                left: Math.round(finalX),
                                top: Math.round(finalY),
                                width: (isCelda || isPared) ? (gridSize + 1) : 'auto',
                                height: (isCelda || isPared) ? (gridSize + 1) : 'auto',
                                zIndex: isPared ? 1 : (isPista ? 20 : 10),
                            }}
                        >
                            <div className={`
                                w-full h-full border border-black flex items-center justify-center transition-colors
                                ${isPared ? 'bg-black' : 'bg-white'}
                                ${isPista ? 'p-[2px] border-[1px] min-w-[60px]' : ''}
                            `}>
                                {isCelda && (
                                    <span className="text-[14px] font-bold text-black leading-none">
                                        {p.content}
                                    </span>
                                )}
                                {isFlecha && (
                                    <span className="text-[18px] font-medium text-black leading-none">
                                        {p.content}
                                    </span>
                                )}
                                {isPista && (
                                    <p className="text-[5px] font-bold leading-[0.95] uppercase text-center text-black tracking-tighter">
                                        {p.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* OVERLAY UI REMOVIDO POR SOLICITUD */}

            {/* CONTROLS */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 5))} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-800 font-bold border-bottom border-slate-100 transition-colors">+</button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.1))} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-800 font-bold transition-colors">−</button>
                </div>
                <button 
                    onClick={() => { setPan({ x: 50, y: 50 }); setZoom(1.2); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black h-12 px-6 rounded-xl uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    Reset View
                </button>
            </div>

            <div className="absolute bottom-8 left-8 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex gap-4">
                <span>🖱️ Drag to Pan</span>
                <span className="text-white/20">|</span>
                <span>🖱️ Ctrl + Scroll to Zoom</span>
            </div>
        </div>
    );
}

export default function ArchitectPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-black" />}>
            <ArchitectContent />
        </Suspense>
    );
}
