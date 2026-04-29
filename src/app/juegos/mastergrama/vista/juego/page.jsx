"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import styles from "@/components/Mastergrama/Mastergrama.module.scss";
const S3_URL = "https://files.comercial.larepublica.pe/anuncios/prod/26.json";
const ROWS = 18;
const COLS = 20;
const CELL_SIZE = 50;
const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;


// AGREGAR AQUÍ:
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
        isActive && styles["cell--focus"],           // <--- Línea nueva
        isHighlighted && styles["cell--highlighted"], // <--- Línea nueva
    ].filter(Boolean).join(" ");

    return (
        <input
            data-pos={`${r}-${c}`}
            disabled={!juegoIniciado}
            className={cellClass}
            style={{
                left: c * CELL_SIZE,
                top: r * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
            }}
            maxLength={1}
            value={letra}
            onKeyDown={(e) => onNav(e, r, c)}
            onChange={(e) => onChange(e.target.value.toUpperCase(), r, c)}
            onClick={onClick}  // <--- Línea nueva
            onFocus={onClick}  // <--- Línea nueva (para soporte de teclado)
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
                        <div key={pista.id} title={pista.text} className={`${styles.pistaBase} ${styles.pista}`} style={{ ...baseStyle, transform: `rotate(${pista.rotate}deg)` }}>
                            <div className={styles.pistaInner}>
                                <span className={styles.pistaText}>{pista.text}</span>
                                {pista.direction && (
                                    <div className={[styles.pistaArrow, styles[`pistaArrow--${pista.direction}`]].filter(Boolean).join(" ")}>↓</div>
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
    const [celdaActiva, setCeldaActiva] = useState(null); // {r, c}
    const [direccion, setDireccion] = useState("H"); // "H" o "V"

    useEffect(() => {
        setHasMounted(true);

        const cargarDatos = async () => {
            try {
                // Revisamos si ya tenemos el JSON guardado
                const cachedData = sessionStorage.getItem("mastergrama_api_cache");
                let data;

                if (cachedData) {
                    data = JSON.parse(cachedData);
                } else {
                    // Si no hay caché, pedimos a la API y guardamos
                    const res = await fetch(S3_URL);
                    data = await res.json();
                    sessionStorage.setItem("mastergrama_api_cache", JSON.stringify(data));
                }

                if (data.diseno) {
                    setPistasColocadas(data.diseno);
                    setSolucionMaestra(data.respuestas || {});
                } else {
                    setPistasColocadas(data || []);
                }
            } catch (error) {
                console.error("Error cargando el Mastergrama:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();

        const guardado = localStorage.getItem("mastergrama_respuestas_jugador");
        if (guardado) setRespuestasUsuario(JSON.parse(guardado));
    }, []);

    const estaEnEje = useCallback((r, c) => {
        // Ya no pintamos ninguna celda extra, la flecha se encarga de la dirección
        return false;
    }, []);

    // Función que maneja el cambio de dirección al hacer clic
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
            // Debounce para no saturar el main thread en cada tecla
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
        const key = `${r}-${c}`;
        setRespuestasUsuario((prev) => ({ ...prev, [key]: val }));

        if (val !== "") {
            let nR = r, nC = c;

            // Si la dirección es Horizontal (H), aumenta columna. 
            // Si es Vertical (V), aumenta fila.
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
                <h1 className={`${styles.header__title} ${isBlack ? styles["header__title--dark"] : styles["header__title--light"]}`}>Mastergrama</h1>
                <div className={styles.header__timer}>
                    <span className={styles.header__timerLabel}>Tiempo de Juego</span>
                    <Timer juegoIniciado={juegoIniciado} resetKey={resetKey} />
                </div>
            </div>

            {/* Área principal del juego */}
            <div className={styles.boardWrapper}>
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
                        {Array.from({ length: ROWS * COLS }).map((_, i) => {
                            const r = Math.floor(i / COLS);
                            const c = i % COLS;
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
                                    // --- NUEVAS LÍNEAS AÑADIDAS ---
                                    isHighlighted={estaEnEje(r, c)}
                                    isActive={celdaActiva?.r === r && celdaActiva?.c === c}
                                    onClick={() => manejarClickCelda(r, c)}
                                // ------------------------------
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