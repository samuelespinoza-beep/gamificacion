import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Apuntamos a la carpeta interna de componentes
    const dir = path.join(process.cwd(), 'src', 'components', 'Crucigrama', 'stories-mastergrama');

    try {
        if (!fs.existsSync(dir)) return NextResponse.json([]);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        return NextResponse.json(files);
    } catch (e) {
        return NextResponse.json({ error: "Error al leer la carpeta de historias" }, { status: 500 });
    }
}