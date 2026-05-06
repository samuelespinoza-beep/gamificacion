import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { url, method = 'POST', headers = {}, body } = await request.json();
        
        // El servidor de Next.js hace la petición por ti, saltándose el CORS del navegador
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: method === 'POST' ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}