"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import masterData from "@/components/Crucigrama/data.json";
import diseñoBase from "@/components/Crucigrama/mi-mastergrama.json";

export default function MastergramaLienzoLibre() {
    const ROWS = 18;
    const COLS = 20;
    const CELL_SIZE = 50;
    const SNAP_SIZE = 10;
    const BOARD_WIDTH = COLS * CELL_SIZE;
    const BOARD_HEIGHT = ROWS * CELL_SIZE;

    const [pistasColocadas, setPistasColocadas] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isGameMode, setIsGameMode] = useState(false);
    const [respuestas, setRespuestas] = useState({});

    const fileInputRef = useRef(null);
    const importFileRef = useRef(null); // Ref para importar JSON
    const [pistaIdParaImagen, setPistaIdParaImagen] = useState(null);

    const TIPOS_FLECHA = ["→", "↓", "↘", "↴", "↳", "➔", "↔", "↕"];
    const FLECHAS_PEQUENAS = ["→", "↓", "←", "↑", "↗", "↘", "↙", "↖"];

    // --- PERSISTENCIA LOCAL ---
    // --- EFECTO 1: CARGAR DATOS AL INICIAR ---
    useEffect(() => {
        // Intentamos obtener del localStorage primero
        const layoutLocal = localStorage.getItem("mastergrama_layout");

        try {
            if (layoutLocal) {
                const parsedLocal = JSON.parse(layoutLocal);
                // Si hay datos locales guardados por el usuario, los usamos
                if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
                    setPistasColocadas(parsedLocal);
                    console.log("Cargado desde LocalStorage");
                } else {
                    // Si el localStorage está vacío, usamos el JSON importado
                    setPistasColocadas(diseñoBase || []);
                    console.log("LocalStorage vacío, cargando diseñoBase");
                }
            } else {
                // No existe la llave en localStorage (Incógnito / Usuario nuevo)
                setPistasColocadas(diseñoBase || []);
                console.log("Sin registro previo, cargando diseñoBase");
            }
        } catch (error) {
            console.error("Error al cargar el layout:", error);
            setPistasColocadas(diseñoBase || []);
        }

        // Cargar respuestas si existen
        const respuestasGuardadas = localStorage.getItem("mastergrama_respuestas");
        if (respuestasGuardadas) {
            setRespuestas(JSON.parse(respuestasGuardadas));
        }
    }, [diseñoBase]); // Se ejecuta cuando el componente nace o el JSON cambia

    useEffect(() => {
        if (pistasColocadas.length > 0) {
            localStorage.setItem("mastergrama_layout", JSON.stringify(pistasColocadas));
        }
    }, [pistasColocadas]);

    useEffect(() => {
        localStorage.setItem("mastergrama_respuestas", JSON.stringify(respuestas));
    }, [respuestas]);

    // --- FUNCIONES DE EXPORTACIÓN / IMPORTACIÓN ---
    const exportarJSON = () => {
        const dataStr = JSON.stringify(pistasColocadas, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'mi-mastergrama.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importarJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (Array.isArray(json)) {
                    setPistasColocadas(json);
                    alert("Diseño importado con éxito");
                }
            } catch (err) {
                alert("Error al leer el archivo JSON");
            }
        };
        reader.readAsText(file);
    };

    const registrarPaso = useCallback((nuevoEstado) => {
        setHistorial(prev => [...prev, JSON.stringify(pistasColocadas)].slice(-20));
        setPistasColocadas(nuevoEstado);
    }, [pistasColocadas]);

    const deshacer = useCallback(() => {
        if (historial.length === 0) return;
        const anterior = historial[historial.length - 1];
        setPistasColocadas(JSON.parse(anterior));
        setHistorial(prev => prev.slice(0, -1));
    }, [historial]);

    const reiniciarTablero = () => {
        if (window.confirm("¿Estás seguro de que quieres borrar todo el progreso?")) {
            setPistasColocadas([]);
            setRespuestas({});
            localStorage.removeItem("mastergrama_layout");
            localStorage.removeItem("mastergrama_respuestas");
        }
    };

    const updatePistaDirecta = (id, newProps) => {
        setPistasColocadas(prev => prev.map(p => {
            if (p.id === id) {
                const updated = { ...p, ...newProps };
                if (newProps.x !== undefined) updated.x = Math.round(newProps.x / SNAP_SIZE) * SNAP_SIZE;
                if (newProps.y !== undefined) updated.y = Math.round(newProps.y / SNAP_SIZE) * SNAP_SIZE;
                if (p.type !== 'pared' && p.type !== 'flecha_pista') {
                    if (newProps.w !== undefined) updated.w = Math.max(10, Math.round(newProps.w / SNAP_SIZE) * SNAP_SIZE);
                    if (newProps.h !== undefined) updated.h = Math.max(10, Math.round(newProps.h / SNAP_SIZE) * SNAP_SIZE);
                }
                return updated;
            }
            return p;
        }));
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!activeId || !interactionMode || isGameMode) return;
            if (interactionMode === 'move') {
                updatePistaDirecta(activeId, { x: e.clientX - offset.x, y: e.clientY - offset.y });
            }
            else if (interactionMode === 'resize-w') {
                updatePistaDirecta(activeId, { w: e.clientX - offset.startClientX + offset.startWidth });
            }
            else if (interactionMode === 'resize-h') {
                updatePistaDirecta(activeId, { h: e.clientY - offset.startClientY + offset.startHeight });
            }
        };
        const handleMouseUp = () => {
            if (activeId) registrarPaso(pistasColocadas);
            setActiveId(null);
            setInteractionMode(null);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [activeId, interactionMode, offset, pistasColocadas, isGameMode, registrarPaso]);

    const startMoving = (e, pista) => {
        if (isGameMode) return;
        e.stopPropagation();
        setActiveId(pista.id);
        setInteractionMode('move');
        setOffset({ x: e.clientX - pista.x, y: e.clientY - pista.y });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && pistaIdParaImagen) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPistasColocadas(prev => prev.map(p => p.id === pistaIdParaImagen ? { ...p, src: event.target.result } : p));
                setPistaIdParaImagen(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        if (isGameMode) return;
        const texto = e.dataTransfer.getData("content");
        const tipo = e.dataTransfer.getData("type");
        if (!tipo) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - 25) / SNAP_SIZE) * SNAP_SIZE;
        const y = Math.round((e.clientY - rect.top - 25) / SNAP_SIZE) * SNAP_SIZE;
        let initW = CELL_SIZE; let initH = CELL_SIZE;
        if (tipo === 'imagen_vacia') { initW = CELL_SIZE * 2; initH = CELL_SIZE * 2; }
        if (tipo === 'pared') { initW = CELL_SIZE; initH = 6; }
        if (tipo === 'flecha_pista') { initW = 30; initH = 30; }
        registrarPaso([...pistasColocadas, { id: Date.now(), text: texto, type: tipo, x, y, w: initW, h: initH, rotate: 0, src: null }]);
    };

    const pistasDesdeStories = useMemo(() => {
        if (!Array.isArray(masterData)) return [];
        return masterData.map(d => d.content).filter(texto => texto && texto.length > 2);
    }, []);
    const pistasIzquierda = useMemo(() => pistasDesdeStories.filter((_, i) => i % 2 === 0), [pistasDesdeStories]);
    const pistasDerecha = useMemo(() => pistasDesdeStories.filter((_, i) => i % 2 !== 0), [pistasDesdeStories]);

    return (
        <div className="min-h-screen bg-slate-100 p-4 flex flex-row gap-4 justify-between font-sans select-none overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { display: none; }
                .no-select-area { user-select: none !important; -webkit-user-select: none !important; }
            `}} />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={importarJSON} />

            {/* COLUMNA IZQUIERDA */}
            <div className="w-64 flex flex-col gap-4 h-[90vh]">
                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-purple-600 mb-2 border-b uppercase text-xs">Herramientas</h2>
                    <div className="flex flex-col gap-2">
                        <div draggable onDragStart={(e) => { e.dataTransfer.setData("content", ""); e.dataTransfer.setData("type", "imagen_vacia"); }}
                            className="bg-purple-50 border-2 border-dashed border-purple-200 text-purple-600 p-2 text-center font-bold cursor-grab hover:bg-purple-100 rounded text-[10px]">🖼️ Imagen</div>
                        <div draggable onDragStart={(e) => { e.dataTransfer.setData("content", ""); e.dataTransfer.setData("type", "pared"); }}
                            className="bg-slate-800 text-white p-2 text-center font-bold cursor-grab hover:bg-black rounded text-[10px] flex items-center justify-center gap-2">
                            <div className="w-4 h-1 bg-white"></div> Pared
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                            <button onClick={exportarJSON} className="bg-blue-600 text-white p-1 rounded text-[9px] font-bold hover:bg-blue-700 uppercase italic">📤 Exportar</button>
                            <button onClick={() => importFileRef.current.click()} className="bg-green-600 text-white p-1 rounded text-[9px] font-bold hover:bg-green-700 uppercase italic">📥 Importar</button>
                        </div>
                        <button onClick={reiniciarTablero} className="bg-red-100 text-red-600 p-1 rounded text-[9px] font-bold hover:bg-red-200 uppercase">🗑️ Borrar Todo</button>
                    </div>
                </div>

                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-slate-800 mb-2 border-b uppercase text-xs">Flechas de Pista</h2>
                    <div className="grid grid-cols-4 gap-1">
                        {FLECHAS_PEQUENAS.map(f => (
                            <div key={f} draggable onDragStart={(e) => { e.dataTransfer.setData("content", f); e.dataTransfer.setData("type", "flecha_pista"); }}
                                className="bg-slate-50 border border-slate-200 text-slate-900 p-2 text-center font-bold cursor-grab hover:bg-slate-200 rounded text-sm">{f}</div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-3 rounded shadow border overflow-hidden flex flex-col no-scrollbar">
                    <h2 className="font-bold text-red-500 mb-2 border-b uppercase text-[10px]">Stories</h2>
                    <div className="overflow-y-auto space-y-2 custom-scrollbar no-scrollbar">
                        {pistasIzquierda.map((pista, idx) => (
                            <div key={idx} draggable onDragStart={(e) => { e.dataTransfer.setData("content", pista); e.dataTransfer.setData("type", "pista"); }}
                                className="bg-slate-50 border p-2 text-[9px] text-blue-800 cursor-grab hover:bg-red-50 rounded uppercase font-bold leading-tight">{pista}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ÁREA CENTRAL */}
            <div className="flex flex-col items-center flex-1 no-select-area">
                <div className="flex gap-4 mb-4 items-center">
                    <button onClick={() => setIsGameMode(false)} className={`px-4 py-2 rounded font-bold text-white text-xs ${!isGameMode ? 'bg-indigo-600 shadow-md' : 'bg-slate-400'}`}>⚙️ Editar</button>
                    <button onClick={() => setIsGameMode(true)} className={`px-4 py-2 rounded font-bold text-white text-xs ${isGameMode ? 'bg-green-600 shadow-md' : 'bg-slate-400'}`}>🎮 Jugar</button>
                    <h1 className="ml-4 text-lg font-black text-slate-700 uppercase italic">Mastergrama</h1>
                </div>

                <div
                    className="relative bg-white shadow-2xl border-2 border-slate-800"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, backgroundImage: `linear-gradient(#6c6e72ff 1px, transparent 1px), linear-gradient(90deg, #6c6e72ff 1px, transparent 1px)`, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
                >
                    {isGameMode && Array.from({ length: ROWS * COLS }).map((_, i) => {
                        const r = Math.floor(i / COLS); const c = i % COLS;
                        return (
                            <input
                                key={i}
                                className="absolute border border-transparent text-center font-bold text-xl uppercase outline-none focus:bg-yellow-50/50 text-blue-900 bg-transparent"
                                style={{ left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, zIndex: 10 }}
                                maxLength={1}
                                value={respuestas[`${r}-${c}`] || ""}
                                onChange={(e) => setRespuestas({ ...respuestas, [`${r}-${c}`]: e.target.value.toUpperCase() })}
                            />
                        );
                    })}

                    {pistasColocadas.map((pista) => (
                        <div key={pista.id}
                            onMouseDown={(e) => startMoving(e, pista)}
                            className={`absolute flex items-center justify-center transition-all duration-75
                            ${pista.type === 'flecha' || pista.type === 'flecha_pista' || pista.type === 'pared' ? 'bg-transparent border-transparent' : 'border border-slate-400 bg-white shadow-sm'}
                            ${activeId === pista.id ? 'z-[500] border-blue-600 ring-2 ring-blue-500/20' : 'z-50'} 
                            group cursor-move`}
                            style={{ left: pista.x, top: pista.y, width: pista.w, height: pista.h, transform: pista.type === 'pared' ? 'none' : `rotate(${pista.rotate}deg)`, transformOrigin: 'center center' }}
                        >
                            {!isGameMode && <div className="absolute inset-0 z-10" />}

                            {pista.type === 'pared' ? (
                                <div className="w-full h-full bg-black shadow-sm"></div>
                            ) : pista.type === 'imagen_vacia' ? (
                                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                                    {pista.src ? (
                                        <img src={pista.src} className="w-full h-full object-cover" alt="pista" draggable={false} />
                                    ) : (
                                        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => { setPistaIdParaImagen(pista.id); fileInputRef.current.click(); }} className="bg-purple-600 text-white text-[8px] px-2 py-1 rounded-full font-bold z-20">+ Imagen</button>
                                    )}
                                </div>
                            ) : pista.type === 'pista' ? (
                                <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden pointer-events-none">
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
                                <span className={`${pista.type === 'flecha_pista' ? 'text-black' : 'text-orange-500'} font-black pointer-events-none`} style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px` }}>{pista.text}</span>
                            )}

                            {!isGameMode && (
                                <>
                                    {pista.type !== 'pared' && pista.type !== 'flecha_pista' && (
                                        <>
                                            <div onMouseDown={(e) => { e.stopPropagation(); setActiveId(pista.id); setInteractionMode('resize-w'); setOffset({ startClientX: e.clientX, startWidth: pista.w }); }}
                                                className="absolute -right-1 top-0 w-4 h-full cursor-ew-resize z-[100] bg-transparent" />
                                            <div onMouseDown={(e) => { e.stopPropagation(); setActiveId(pista.id); setInteractionMode('resize-h'); setOffset({ startClientY: e.clientY, startHeight: pista.h }); }}
                                                className="absolute -bottom-1 left-0 h-4 w-full cursor-ns-resize z-[100] bg-transparent" />
                                        </>
                                    )}
                                    <div className="absolute -top-12 left-0 right-0 h-12 hidden group-hover:flex items-start justify-center z-[150]">
                                        <div className="flex gap-2 bg-slate-900 p-1.5 rounded shadow-2xl border border-slate-700">
                                            <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (pista.type === 'pared') { registrarPaso(pistasColocadas.map(p => p.id === pista.id ? { ...p, w: p.h, h: p.w } : p)); } else { updatePistaDirecta(pista.id, { rotate: (pista.rotate + 90) % 360 }); } }} className="bg-indigo-600 text-white w-7 h-7 rounded flex items-center justify-center text-xs">↻</button>
                                            <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); registrarPaso(pistasColocadas.filter(p => p.id !== pista.id)); }} className="bg-red-600 text-white w-7 h-7 rounded flex items-center justify-center text-xs">✕</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="w-64 flex flex-col h-[90vh]">
                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-orange-500 mb-2 border-b uppercase text-xs">Flechas Grandes</h2>
                    <div className="grid grid-cols-4 gap-1">
                        {TIPOS_FLECHA.map(f => (
                            <div key={f} draggable onDragStart={(e) => { e.dataTransfer.setData("content", f); e.dataTransfer.setData("type", "flecha"); }}
                                className="bg-orange-50 border border-orange-200 text-orange-600 p-2 text-center font-bold cursor-grab hover:bg-orange-100 rounded text-sm">{f}</div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 bg-white p-3 rounded shadow border overflow-hidden flex flex-col no-scrollbar mt-4">
                    <h2 className="font-bold text-red-500 mb-2 border-b uppercase text-[10px]">Stories (N-Z)</h2>
                    <div className="overflow-y-auto space-y-2 custom-scrollbar no-scrollbar">
                        {pistasDerecha.map((pista, idx) => (
                            <div key={idx} draggable onDragStart={(e) => { e.dataTransfer.setData("content", pista); e.dataTransfer.setData("type", "pista"); }}
                                className="bg-slate-50 border p-2 text-[9px] text-blue-800 cursor-grab hover:bg-red-50 rounded uppercase font-bold leading-tight">{pista}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}