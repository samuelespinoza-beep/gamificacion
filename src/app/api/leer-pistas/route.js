import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const edicion = searchParams.get('edicion') || searchParams.get('archivo');
    
    if (!edicion) {
        return NextResponse.json({ error: "Falta el parámetro edicion" }, { status: 400 });
    }

    const nombreArchivo = edicion.endsWith('.json') ? edicion : `${edicion}.json`;
    const dirHistorias = path.join(process.cwd(), 'src', 'components', 'Crucigrama', 'stories-mastergrama');
    const filePath = path.join(dirHistorias, nombreArchivo);

    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
        }

        const contenido = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(contenido);

        return NextResponse.json(json);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}