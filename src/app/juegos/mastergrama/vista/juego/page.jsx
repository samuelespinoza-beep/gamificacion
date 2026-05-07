"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import styles from "@/components/Mastergrama/Mastergrama.module.scss";

const CELL_SIZE = 50;
let ROWS;
let COLS;

const INDICADOR_FLECHA = {
    H: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    V: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    )
};

const Timer = memo(({ juegoIniciado, resetKey }) => {
    const [tiempo, setTiempo] = useState(0);

    useEffect(() => {
        setTiempo(0);
    }, [resetKey]);

    useEffect(() => {
        let intervalo;
        if (juegoIniciado) {
            intervalo = setInterval(() => {
                setTiempo((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(intervalo);
    }, [juegoIniciado, resetKey]);

    const formatearTiempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return <span className={styles.header__timerValue}>{formatearTiempo(tiempo)}</span>;
});

const Cell = memo(({ r, c, letra, correcta, juegoIniciado, onNav, onChange, isHighlighted, isActive, onClick }) => {
    const cellClass = [
        styles.cell,
        !juegoIniciado && styles["cell--disabled"],
        letra !== "" && letra === correcta && styles["cell--correct"],
        letra !== "" && letra !== correcta && styles["cell--wrong"],
        isActive && styles["cell--focus"],
        isHighlighted && styles["cell--highlighted"],
    ].filter(Boolean).join(" ");

    return (
        <input
            data-pos={`${r}-${c}`}
            disabled={!juegoIniciado}
            className={cellClass}
            style={{ left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, }}
            maxLength={1}
            value={letra}
            type="text"
            inputMode="text"
            pattern="[a-zA-ZñÑ]*"
            onKeyDown={(e) => onNav(e, r, c)}
            onChange={(e) => onChange(e.target.value.toUpperCase(), r, c)}
            onClick={onClick}
            onFocus={onClick}
        />
    );
});

const renderArrowIcon = (text) => {
    const svgProps = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3.5",
        strokeLinecap: "square",
        strokeLinejoin: "miter",
        style: { width: "70%", height: "70%" }
    };

    switch (text) {
        case "↓":
            return (
                <svg {...svgProps}>
                    <line x1="12" y1="4" x2="12" y2="16" />
                    <polyline points="5,13 12,20 19,13" />
                </svg>
            );
        case "➔":
        case "→":
            return (
                <svg {...svgProps}>
                    <line x1="4" y1="12" x2="16" y2="12" />
                    <polyline points="13,5 20,12 13,19" />
                </svg>
            );
        case "↳":
            return (
                <svg {...svgProps}>
                    <polyline points="6,4 6,16 16,16" />
                    <polyline points="13,9 20,16 13,23" />
                </svg>
            );
        case "↴":
            return (
                <svg {...svgProps}>
                    <polyline points="4,6 16,6 16,16" />
                    <polyline points="9,13 16,20 23,13" />
                </svg>
            );
        default:
            return text;
    }
};

const PistasLayer = memo(({ pistasColocadas }) => {
    return (
        <>
            {pistasColocadas.map((pista) => {
                const baseStyle = {
                    left: pista.x,
                    top: pista.y,
                    width: pista.w,
                    height: pista.h,
                    zIndex: 50,
                };

                if (pista.type === "pared") {
                    return (
                        <div key={pista.id} className={`${styles.pistaBase} ${styles.pared}`} style={baseStyle}>
                            <div className={styles.pared__fill} />
                        </div>
                    );
                }

                if (pista.type === "imagen_vacia") {
                    return (
                        <div key={pista.id} className={`${styles.pistaBase} ${styles.imagenVacia}`} style={baseStyle}>
                            {pista.src && <img src={pista.src} alt="pista" />}
                        </div>
                    );
                }

                if (pista.type === "pista") {
                    return (
                        <div key={pista.id} className={`${styles.pistaBase} ${styles.pista}`} style={{ ...baseStyle, transform: `rotate(${pista.rotate}deg)` }} title={pista.text}>
                            <div className={styles.pistaInner}>
                                <span className={styles.pistaText}>
                                    {pista.text}
                                </span>

                                {pista.direction && (
                                    <div className={`${styles.pistaArrow} ${styles[`pistaArrow--${pista.direction}`]}`}>
                                        ↓
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                if (pista.type === "flecha" || pista.type === "flecha_pista") {
                    return (
                        <div key={pista.id} className={`${styles.pistaBase} ${styles.flecha}`} style={{ ...baseStyle, transform: `rotate(${pista.rotate}deg)` }}>
                            <span className={[styles.flecha__icon, pista.type === "flecha_pista" && styles["flecha--pista"]].filter(Boolean).join(" ")} style={{ fontSize: `${Math.min(pista.w, pista.h) * 0.9}px` }}>
                                {renderArrowIcon(pista.text)}
                            </span>
                        </div>
                    );
                }

                return null;
            })}
        </>
    );
});

const Mastergrama = ({ isBlack }) => {

    const [pistasColocadas, setPistasColocadas] = useState([]);
    const [respuestasUsuario, setRespuestasUsuario] = useState({});
    const [solucionMaestra, setSolucionMaestra] = useState({});
    const [hasMounted, setHasMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [celdaActiva, setCeldaActiva] = useState(null);
    const [direccion, setDireccion] = useState("H");
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);
    const BOARD_WIDTH = cols * CELL_SIZE;
    const BOARD_HEIGHT = rows * CELL_SIZE;
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString('en-CA'));
    const [error, setError] = useState(null);

    const cargarMastergrama = useCallback(async (fecha) => {
        try {
            setLoading(true);
            setError(null); // IMPORTANTÍSIMO: Limpiar error previo
            setJuegoIniciado(false);

            const cacheKey = `mastergrama_${fecha}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            let data;

            if (cachedData) {
                data = JSON.parse(cachedData);
            } else {
                const resGQL = await fetch("/api/proxy", {
                    method: "POST",
                    body: JSON.stringify({
                        url: "https://qacronosprintedapi.glr.pe/graphql",
                        body: {
                            query: `query GetToday($date: String) { 
                            mastergrama(date: $date) { mastergrama_json } 
                        }`,
                            variables: { date: fecha }
                        }
                    })
                });

                const resultGQL = await resGQL.json();
                const rutaJson = resultGQL.data?.mastergrama[0]?.mastergrama_json;

                // Si la rutaJson no existe, lanzamos el error manualmente para ir al catch
                if (!rutaJson) {
                    throw new Error("No hay un Mastergrama disponible para esta fecha.");
                }

                const resFile = await fetch("/api/proxy", {
                    method: "POST",
                    body: JSON.stringify({ url: rutaJson, method: 'GET' })
                });

                data = await resFile.json();
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            }

            if (data) {
                setPistasColocadas(data.diseno || []);
                setSolucionMaestra(data.respuestas || {});
                setRows(data.rows || 18);
                setCols(data.cols || 20);
                setRespuestasUsuario({});
                setResetKey(prev => prev + 1);
            }
        } catch (err) {
            console.error("Error cargando Mastergrama:", err);
            setError(err.message); // Guardamos el mensaje para el popup

            // LIMPIEZA CRÍTICA: Si hay error, vaciamos el tablero anterior
            setPistasColocadas([]);
            setSolucionMaestra({});
            setRows(0);
            setCols(0);
            setRespuestasUsuario({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setHasMounted(true);
        cargarMastergrama(fechaSeleccionada);
    }, [fechaSeleccionada, cargarMastergrama]);

    const estaEnEje = useCallback((r, c) => {
        return false;
    }, []);

    const manejarClickCelda = useCallback((r, c) => {
        if (!juegoIniciado) return;
        if (celdaActiva?.r === r && celdaActiva?.c === c) {
            setDireccion((prev) => (prev === "H" ? "V" : "H"));
        } else {
            setCeldaActiva({ r, c });
        }
    }, [celdaActiva, juegoIniciado]);

    useEffect(() => {
        if (hasMounted) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem(
                    "mastergrama_respuestas_jugador",
                    JSON.stringify(respuestasUsuario)
                );
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [respuestasUsuario, hasMounted]);

    const manejarNavegacion = useCallback((e, r, c) => {
        if (!juegoIniciado) return;
        let nR = r, nC = c;

        if (e.key === "ArrowUp") nR--;
        else if (e.key === "ArrowDown") nR++;
        else if (e.key === "ArrowLeft") nC--;
        else if (e.key === "ArrowRight") nC++;
        else if (e.key === "Backspace" && e.target.value === "") nC--;
        else return;

        e.preventDefault();
        const nextInput = document.querySelector(`input[data-pos="${nR}-${nC}"]`);
        if (nextInput) nextInput.focus();
    }, [juegoIniciado]);

    const handleCellChange = useCallback((val, r, c) => {
        const soloLetras = val.toUpperCase().replace(/[^A-ZÑ]/g, "");

        if (val !== "" && soloLetras === "") return;

        const key = `${r}-${c}`;
        setRespuestasUsuario((prev) => ({ ...prev, [key]: soloLetras }));

        if (soloLetras !== "") {
            let nR = r, nC = c;

            if (direccion === "H") {
                nC++;
            } else {
                nR++;
            }

            const next = document.querySelector(`input[data-pos="${nR}-${nC}"]`);
            if (next) {
                next.focus();
                setCeldaActiva({ r: nR, c: nC });
            }
        }
    }, [direccion]);

    if (!hasMounted || loading) {
        return (
            <div className={styles.loading}>
                <p className={styles.loading__text}>CARGANDO TABLERO...</p>
            </div>
        );
    }

    return (
        <div className={`${styles.mastergrama} ${isBlack ? styles["mastergrama--dark"] : styles["mastergrama--light"]}`}>

            {/* ENCABEZADO */}
            <div className={styles.header}>
                <div className={styles.header__left}>
                    <h1 className={styles.header__title}>Mastergrama</h1>

                    {/* SELECTOR DE FECHA */}
                    <div className={styles.datePicker}>
                        <label htmlFor="fecha-mastergrama">Fecha:</label>
                        <input
                            type="date"
                            id="fecha-mastergrama"
                            value={fechaSeleccionada}
                            max={new Date().toLocaleDateString('en-CA')} // No permite fechas futuras
                            onChange={(e) => setFechaSeleccionada(e.target.value)}
                            className={styles.datePicker__input}
                        />
                    </div>
                </div>

                <div className={styles.header__timer}>
                    <span className={styles.header__timerLabel}>Tiempo de Juego</span>
                    <Timer juegoIniciado={juegoIniciado} resetKey={resetKey} />
                </div>
            </div>

            {/* Área principal del juego */}
            <div className={styles.boardWrapper}>
                {/* SI HAY UN ERROR: Mostramos el aviso directamente en lugar del frame del tablero */}
                {error ? (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorBox}>
                            <p className={styles.errorText}>{error}</p>
                            <button
                                className={styles.errorButton}
                                onClick={() => setFechaSeleccionada(new Date().toLocaleDateString('en-CA'))}
                            >
                                Volver a Hoy
                            </button>
                        </div>
                    </div>
                ) : (
                    /* SI NO HAY ERROR: Renderizamos el tablero normal */
                    <div className={styles.boardFrame}>

                        {/* OVERLAY DE INICIO */}
                        {!juegoIniciado && (
                            <div className={styles.overlay}>
                                <button
                                    onClick={() => setJuegoIniciado(true)}
                                    className={styles.overlay__btn}
                                >
                                    🚀 Empezar a Jugar
                                </button>
                            </div>
                        )}

                        {/* TABLERO */}
                        <div
                            className={styles.board}
                            style={{
                                width: BOARD_WIDTH,
                                height: BOARD_HEIGHT,
                                backgroundImage: `linear-gradient(#6c6e72ff 1px, transparent 1px), linear-gradient(90deg, #6c6e72ff 1px, transparent 1px)`,
                                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                            }}
                        >
                            {/* CAPA 1: INPUTS */}
                            {Array.from({ length: rows * cols }).map((_, i) => {
                                const r = Math.floor(i / cols);
                                const c = i % cols;
                                const key = `${r}-${c}`;
                                const letra = respuestasUsuario[key] || "";
                                const correcta = solucionMaestra[key];

                                return (
                                    <Cell
                                        key={i}
                                        r={r}
                                        c={c}
                                        letra={letra}
                                        correcta={correcta}
                                        juegoIniciado={juegoIniciado}
                                        onNav={manejarNavegacion}
                                        onChange={handleCellChange}
                                        isHighlighted={estaEnEje(r, c)}
                                        isActive={celdaActiva?.r === r && celdaActiva?.c === c}
                                        onClick={() => manejarClickCelda(r, c)}
                                    />
                                );
                            })}

                            {celdaActiva && (
                                <div
                                    className={styles.directionIndicator}
                                    style={{
                                        left: celdaActiva.c * CELL_SIZE,
                                        top: celdaActiva.r * CELL_SIZE,
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                    }}
                                >
                                    <div className={styles.directionIndicator__icon}>
                                        {INDICADOR_FLECHA[direccion]}
                                    </div>
                                </div>
                            )}

                            {/* CAPA 2: PISTAS Y FLECHAS */}
                            <PistasLayer pistasColocadas={pistasColocadas} />
                        </div>
                    </div>
                )}
            </div>

            {/* BOTONES */}
            <div className={styles.actions}>
                <button
                    className={styles.actions__reset}
                    onClick={() => {
                        if (confirm("¿Reiniciar progreso?")) {
                            setRespuestasUsuario({});
                            setResetKey(k => k + 1);
                            setJuegoIniciado(false);
                        }
                    }}
                >
                    ↻ Reiniciar
                </button>

                <button
                    className={styles.actions__solution}
                    onClick={() => {
                        if (confirm("¿Ver la solución completa? Perderás tu progreso actual.")) {
                            setRespuestasUsuario(solucionMaestra);
                        }
                    }}
                >
                    💡 Ver Solución
                </button>
            </div>
        </div>
    );
};

export default Mastergrama;