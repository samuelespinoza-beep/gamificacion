"use client";
import { useMemo } from "react";
import masterData from './data.json';

export default function Mastergrama() {
    const CELL_SIZE = 37; // Tamaño estándar de celda

    // 1. Normalización de coordenadas con margen de seguridad
    const { minX, minY, totalCols, totalRows } = useMemo(() => {
        const xs = masterData.map(d => d.x);
        const ys = masterData.map(d => d.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        return {
            minX,
            minY,
            totalCols: Math.round((maxX - minX) / CELL_SIZE) + 5, // Margen extra
            totalRows: Math.round((maxY - minY) / CELL_SIZE) + 5
        };
    }, []);

    return (
        <div className="flex justify-center bg-slate-300 min-h-screen p-10 overflow-auto">
            <div
                className="relative bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-black mb-40"
                style={{
                    width: `${totalCols * CELL_SIZE}px`,
                    height: `${totalRows * CELL_SIZE}px`,
                }}
            >
                {masterData.map((cell, index) => {
                    const col = Math.round((cell.x - minX) / CELL_SIZE);
                    const row = Math.round((cell.y - minY) / CELL_SIZE);

                    // Lógica de detección de pista (Más de 2 letras)
                    const isPista = cell.content && cell.content.trim().length > 2;

                    // Si es pista, imprimimos en la consola del navegador para confirmar renderizado
                    if (isPista && index < 5) {
                        console.log(`Renderizando pista: ${cell.storyId} en pos: ${col},${row}`);
                    }

                    return (
                        <div
                            key={`${cell.storyId}-${index}`}
                            className="absolute border-[0.5px] border-gray-600 flex items-center justify-center overflow-hidden"
                            style={{
                                width: `${CELL_SIZE}px`,
                                height: `${CELL_SIZE}px`,
                                left: `${col * CELL_SIZE}px`,
                                top: `${row * CELL_SIZE}px`,
                                // Colores de La República: Gris para pistas, Blanco para letras
                                backgroundColor: isPista ? '#e5e7eb' : '#ffffff',
                                // IMPORTANTE: Z-Index alto para pistas para que no queden "debajo"
                                zIndex: isPista ? 50 : 10,
                            }}
                        >
                            {isPista ? (
                                <span
                                    className="text-[6.5px] leading-[7.5px] text-center uppercase font-serif font-black text-black px-[1px] break-words w-full"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: '5',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {cell.content}
                                </span>
                            ) : (
                                <input
                                    className="w-full h-full text-center font-bold text-xl uppercase outline-none focus:bg-yellow-100 text-blue-900 bg-transparent"
                                    maxLength={1}
                                    defaultValue={cell.content.length === 1 ? cell.content : ''}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}