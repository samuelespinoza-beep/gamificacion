"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import diseñoBase from "@/components/Crucigrama/mi-mastergrama.json";

export default function MastergramaLienzoLibre() {

    const [archivosDisponibles, setArchivosDisponibles] = useState([]);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState("");
    const [masterDataDinamico, setMasterDataDinamico] = useState([]);
    const ROWS = 24;
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
    const importFileRef = useRef(null);
    const [pistaIdParaImagen, setPistaIdParaImagen] = useState(null);
    const TIPOS_FLECHA = ["→", "↓", "↘", "↴", "↳", "➔", "↔", "↕"];
    const FLECHAS_PEQUENAS = ["→", "↓", "←", "↑", "↗", "↘", "↙", "↖"];

    useEffect(() => {
        fetch('/api/listar-ediciones')
            .then(res => res.json())
            .then(data => setArchivosDisponibles(data))
            .catch(err => console.error("Error cargando lista de archivos:", err));
    }, []);

    useEffect(() => {
        const layoutLocal = localStorage.getItem("mastergrama_layout");
        const respuestasGuardadas = localStorage.getItem("mastergrama_respuestas");

        try {
            if (layoutLocal) {
                const parsedLocal = JSON.parse(layoutLocal);
                if (Array.isArray(parsedLocal)) {
                    setPistasColocadas(parsedLocal);
                }
            } else if (diseñoBase) {
                if (diseñoBase.diseno && Array.isArray(diseñoBase.diseno)) {
                    setPistasColocadas(diseñoBase.diseno);
                    if (!respuestasGuardadas && diseñoBase.respuestas) {
                        setRespuestas(diseñoBase.respuestas);
                    }
                } else if (Array.isArray(diseñoBase)) {
                    setPistasColocadas(diseñoBase);
                }
            }

            if (respuestasGuardadas) {
                setRespuestas(JSON.parse(respuestasGuardadas));
            }
        } catch (error) {
            console.error("Error al cargar el layout inicial:", error);
        }
    }, [diseñoBase]);

useEffect(() => {
    if (pistasColocadas.length > 0) {
        const datosParaGuardar = pistasColocadas.map(p => {
            if (p.type === 'imagen_vacia' && p.src?.startsWith('data:image')) {
                return { ...p, src: null };
            }
            return p;
        });
        
        try {
            localStorage.setItem("mastergrama_layout", JSON.stringify(datosParaGuardar));
        } catch (e) {
            console.error("LocalStorage lleno. No se pudo guardar el layout.");
        }
    }
}, [pistasColocadas]);

    useEffect(() => {
        localStorage.setItem("mastergrama_respuestas", JSON.stringify(respuestas));
    }, [respuestas]);

    const exportarJSON = () => {
        const dataCompleta = {
            diseno: pistasColocadas,
            respuestas: respuestas
        };

        const dataStr = JSON.stringify(dataCompleta, null, 2);
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

                if (json.diseno && Array.isArray(json.diseno)) {
                    setPistasColocadas(json.diseno);
                    if (json.respuestas) {
                        setRespuestas(json.respuestas);
                    }
                    alert("Proyecto completo cargado con éxito");
                }
                else if (Array.isArray(json)) {
                    setPistasColocadas(json);
                    alert("Diseño importado (sin respuestas)");
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

    const onDrop = (e) => {
        e.preventDefault();
        if (isGameMode) return;

        const texto = e.dataTransfer.getData("content");
        const tipo = e.dataTransfer.getData("type");
        if (!tipo) return;

        // 1. PRIMERO: Calculamos las coordenadas x e y
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - 25) / SNAP_SIZE) * SNAP_SIZE;
        const y = Math.round((e.clientY - rect.top - 25) / SNAP_SIZE) * SNAP_SIZE;

        // 2. SEGUNDO: Definimos tamaños iniciales
        let initW = CELL_SIZE;
        let initH = CELL_SIZE;
        if (tipo === 'imagen_vacia') { initW = CELL_SIZE * 2; initH = CELL_SIZE * 2; }
        if (tipo === 'pared') { initW = CELL_SIZE; initH = 6; }
        if (tipo === 'flecha_pista') { initW = 30; initH = 30; }

        // 3. TERCERO: Creamos el objeto (ahora x e y ya existen)
        const nuevaPista = {
            id: Date.now(),
            text: texto,
            type: tipo,
            x, // Ya está inicializada arriba
            y, // Ya está inicializada arriba
            w: initW,
            h: initH,
            rotate: 0,
            src: null,
            direction: '↓' // Agregamos la dirección por defecto aquí
        };

        // 4. CUARTO: Registramos en el estado
        registrarPaso([...pistasColocadas, nuevaPista]);
    };
    const prepararNuevoMastergrama = () => {
        if (window.confirm("¿Deseas crear un nuevo Mastergrama? Se limpiará todo el diseño actual del lienzo.")) {
            setPistasColocadas([]);
            setRespuestas({});
            setHistorial([]);

            localStorage.removeItem("mastergrama_layout");
            localStorage.removeItem("mastergrama_respuestas");

            alert("Lienzo listo para un nuevo diseño.");
        }
    };

    const cargarPistasDeArchivo = async (nombreArchivo) => {
        if (!nombreArchivo) return;
        try {
            // Buscamos el archivo en la carpeta pública
            const res = await fetch(`/stories-mastergrama/${nombreArchivo}`);
            const data = await res.json();
            setMasterDataDinamico(data);
            setArchivoSeleccionado(nombreArchivo);
        } catch (error) {
            alert("Error al cargar el archivo de pistas");
        }
    };

    const cargarHistoriasDeArchivo = async (nombreArchivo) => {
        if (!nombreArchivo) return;

        const cacheBuster = Date.now();

        try {
            const res = await fetch(`/api/leer-pistas?archivo=${nombreArchivo}&t=${cacheBuster}`);
            const data = await res.json();

            if (data && Array.isArray(data)) {
                setMasterDataDinamico(data);
                setArchivoSeleccionado(nombreArchivo);
            } else {
            }
        } catch (error) {
        }
    };

    const pistasDesdeStories = useMemo(() => {
        if (!Array.isArray(masterDataDinamico) || masterDataDinamico.length === 0) {
            return [];
        }

        return masterDataDinamico
            .map(item => item.content)
            .filter(texto => {
                if (!texto) return false;
                const limpio = texto.trim();
                return limpio.length > 1 && !limpio.startsWith("<?ACE");
            });
    }, [masterDataDinamico]);
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
            <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={importarJSON} />

            {/* COLUMNA IZQUIERDA */}
            <div className="w-64 flex flex-col gap-4 h-[90vh]">
                {/* --- NUEVO BLOQUE: CARGAR EDICIÓN DINÁMICA --- */}
                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-blue-600 mb-2 border-b uppercase text-[10px]">📂 Cargar Edición</h2>
                    <div className="flex flex-col gap-2">
                        <select
                            className="w-full border p-1 text-[10px] rounded bg-slate-50 font-bold outline-none cursor-pointer"
                            value={archivoSeleccionado}
                            onChange={(e) => {
                                console.log("🖱️ Clic detectado en el select, valor:", e.target.value);
                                cargarHistoriasDeArchivo(e.target.value);
                            }}
                        >
                            <option value="">-- Seleccionar JSON --</option>
                            {archivosDisponibles.map(archivo => (
                                <option key={archivo} value={archivo}>
                                    {archivo.replace('.json', '')}
                                </option>
                            ))}
                        </select>
                        <p className="text-[8px] text-slate-400 italic">
                            {archivoSeleccionado ? `Cargado: ${archivoSeleccionado}` : "Selecciona una fecha para ver las pistas"}
                        </p>
                    </div>
                </div>

                {/* --- BLOQUE: HERRAMIENTAS (Mantenido) --- */}
                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-purple-600 mb-2 border-b uppercase text-xs">Herramientas</h2>
                    <div className="flex flex-col gap-2">
                        <div draggable onDragStart={(e) => { e.dataTransfer.setData("content", ""); e.dataTransfer.setData("type", "imagen_vacia"); }}
                            className="bg-purple-50 border-2 border-dashed border-purple-200 text-purple-600 p-2 text-center font-bold cursor-grab hover:bg-purple-100 rounded text-[10px]">🖼️ Imagen</div>
                        <div draggable onDragStart={(e) => { e.dataTransfer.setData("content", ""); e.dataTransfer.setData("type", "pared"); }}
                            className="bg-slate-800 text-white p-2 text-center font-bold cursor-grab hover:bg-black rounded text-[10px] flex items-center justify-center gap-2">
                            <div className="w-4 h-1 bg-white"></div> Pared
                        </div>

                        <button
                            onClick={prepararNuevoMastergrama}
                            className="w-full bg-indigo-500 text-white p-2 rounded text-[10px] font-bold hover:bg-indigo-600 uppercase shadow-sm transition-all"
                        >
                            ✨ Nuevo Mastergrama
                        </button>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                            <button onClick={exportarJSON} className="bg-blue-600 text-white p-1 rounded text-[9px] font-bold hover:bg-blue-700 uppercase italic">📤 Exportar</button>
                            <button onClick={() => importFileRef.current.click()} className="bg-green-600 text-white p-1 rounded text-[9px] font-bold hover:bg-green-700 uppercase italic">📥 Importar</button>
                        </div>
                        <button onClick={reiniciarTablero} className="bg-red-100 text-red-600 p-1 rounded text-[9px] font-bold hover:bg-red-200 uppercase">🗑️ Borrar Todo</button>
                    </div>
                </div>

                {/* --- BLOQUE: FLECHAS (Mantenido) --- */}
                <div className="bg-white p-3 rounded shadow border">
                    <h2 className="font-bold text-slate-800 mb-2 border-b uppercase text-xs">Flechas de Pista</h2>
                    <div className="grid grid-cols-4 gap-1">
                        {FLECHAS_PEQUENAS.map(f => (
                            <div key={f} draggable onDragStart={(e) => { e.dataTransfer.setData("content", f); e.dataTransfer.setData("type", "flecha_pista"); }}
                                className="bg-slate-50 border border-slate-200 text-slate-900 p-2 text-center font-bold cursor-grab hover:bg-slate-200 rounded text-sm">{f}</div>
                        ))}
                    </div>
                </div>

                {/* --- BLOQUE: STORIES (Dinámico basado en el JSON seleccionado) --- */}
                <div className="bg-white p-3 rounded shadow border overflow-hidden flex flex-col no-scrollbar">
                    <h2 className="font-bold text-red-500 mb-2 border-b uppercase text-[10px]">Stories</h2>
                    <div className="overflow-y-auto space-y-2 custom-scrollbar no-scrollbar">
                        {pistasIzquierda.map((pista, idx) => (
                            <div key={idx} draggable onDragStart={(e) => { e.dataTransfer.setData("content", pista); e.dataTransfer.setData("type", "pista"); }}
                                className="bg-slate-50 border p-2 text-[9px] text-blue-800 cursor-grab hover:bg-red-50 rounded uppercase font-bold leading-tight">{pista}</div>
                        ))}
                        {pistasIzquierda.length === 0 && (
                            <p className="text-[8px] text-slate-400 text-center py-4 italic">Selecciona una edición arriba para cargar pistas</p>
                        )}
                    </div>
                </div>
            </div>

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
                    {/* GRILLA DE INPUTS (FONDO) */}
                    {Array.from({ length: ROWS * COLS }).map((_, i) => {
                        const r = Math.floor(i / COLS);
                        const c = i % COLS;
                        const cellKey = `${r}-${c}`;
                        return (
                            <input
                                key={i}
                                className={`absolute border border-slate-100 text-center font-bold text-xs uppercase outline-none focus:bg-yellow-100/50 text-blue-900 bg-transparent transition-colors ${isGameMode ? 'border-transparent' : 'hover:bg-slate-50'}`}
                                style={{
                                    left: c * CELL_SIZE,
                                    top: r * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    zIndex: 5
                                }}
                                maxLength={1}
                                value={respuestas[cellKey] || ""}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setRespuestas(prev => ({ ...prev, [cellKey]: val }));
                                }}
                            />
                        );
                    })}

                    {/* RENDERIZADO DE PISTAS Y ELEMENTOS */}
                    {pistasColocadas.map((pista) => (
                        <div key={pista.id}
                            onMouseDown={(e) => startMoving(e, pista)}
                            className={`absolute flex items-center justify-center transition-all duration-75
                                ${pista.type === 'flecha' || pista.type === 'flecha_pista' || pista.type === 'pared' ? 'bg-transparent border-transparent' : 'border border-slate-400 bg-white shadow-sm'}
                                ${activeId === pista.id ? 'z-[500] border-blue-600 ring-2 ring-blue-500/20' : 'z-50'} 
                                group cursor-move`}
                            style={{
                                left: pista.x,
                                top: pista.y,
                                width: pista.w,
                                height: pista.h,
                                transform: pista.type === 'pared' ? 'none' : `rotate(${pista.rotate}deg)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            {!isGameMode && <div className="absolute inset-0 z-10" />}

                            {/* CONTENIDO SEGÚN TIPO */}
                            {pista.type === 'pared' ? (
                                <div className="w-full h-full bg-black shadow-sm"></div>
                            ) : pista.type === 'imagen_vacia' ? (
                                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                                    {pista.src ? (
                                        <img 
                                            src={pista.src} 
                                            className="w-full h-full object-cover" 
                                            alt="pista" 
                                            draggable={false} 
                                        />
                                    ) : (
                                        <button 
                                            onMouseDown={(e) => e.stopPropagation()} 
                                            onClick={() => { 
                                                const url = window.prompt("Pega la URL de S3 (ej: https://files.comercial...):", "https://files.comercial.larepublica.pe/anuncios/prod/"); 
                                                if (url) updatePistaDirecta(pista.id, { src: url });
                                            }} 
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-[8px] px-2 py-1 rounded-full font-bold z-20 shadow-lg transition-colors"
                                        >
                                            + Vincular S3
                                        </button>
                                    )}
                                </div>
                            ) : pista.type === 'pista' ? (
                                /* PISTAS DE TEXTO CON FLECHA DINÁMICA */
                                <div className="w-full h-full flex items-center justify-center p-1 overflow-visible pointer-events-none relative">
                                    <span className="text-black text-[6px] uppercase leading-tight text-center break-words font-normal antialiased tracking-tighter">
                                        {pista.text}
                                    </span>

                                    {/* FLECHA PEGADA: Siempre es ↓ pero cambia su coordenada Y */}
                                    <div
                                        className="absolute text-slate-900 select-none flex items-center justify-center pointer-events-none font-normal"
                                        style={{
                                            fontSize: '6px',
                                            width: '20px',
                                            height: '20px',
                                            transformOrigin: 'center',
                                            zIndex: 60,
                                            
                                            // Lógica de posicionamiento
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
                                <span className={`${pista.type === 'flecha_pista' ? 'text-black' : 'text-orange-500'} font-black pointer-events-none`} style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px` }}>{pista.text}</span>
                            )}

                            {/* CONTROLES DE EDICIÓN (SOLO MODO EDITAR) */}
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

                                            {/* BOTÓN DE DIRECCIÓN (SOLO PARA PISTAS) */}
                                            {pista.type === 'pista' && (
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const posiciones = ['superior', 'superior-invertida', 'inferior', 'inferior-invertida','izquierda', 'izquierda-invertida','derecha', 'derecha-invertida'];
                                                        const actualIdx = posiciones.indexOf(pista.direction || 'inferior');
                                                        const siguientePos = posiciones[(actualIdx + 1) % posiciones.length];
                                                        updatePistaDirecta(pista.id, { direction: siguientePos });
                                                    }}
                                                    className="bg-blue-500 text-white w-7 h-7 rounded flex items-center justify-center text-xs font-bold shadow-sm active:scale-95 transition-transform"
                                                >
                                                    {/* Mostramos un icono que indica hacia dónde se moverá la flecha en el siguiente clic */}
                                                    {pista.direction === 'superior' ? '↓' : '↑'}
                                                </button>
                                            )}

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