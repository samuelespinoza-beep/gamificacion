import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    if (!folder) return NextResponse.json([]);

    try {
        // Ruta corregida hacia stories-mastergrama
        const filePath = path.join(process.cwd(), 'src', 'components', 'Crucigrama', 'stories-mastergrama', folder, 'data.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "No se encontró el archivo" }, { status: 404 });
        }

        const data = fs.readFileSync(filePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (e) {
        return NextResponse.json([]);
    }
}