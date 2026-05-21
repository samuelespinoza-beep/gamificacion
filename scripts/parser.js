const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Capturamos el nombre de la edición desde la consola
const FOLDER_NAME = process.argv[2];

// Carpeta donde están los .idml de origen
const PARENT_DIR = path.join(__dirname, 'ediciones');

async function extraerHistoriasIDML() {
    if (!FOLDER_NAME) {
        console.error("❌ ERROR: Debes ingresar el nombre de la edición.");
        return;
    }

    // Ruta a la carpeta DESCOMPRIMIDA directamente
    const BASE_PATH = path.join(PARENT_DIR, FOLDER_NAME);
    const STORIES_DIR = path.join(BASE_PATH, 'Stories');
    const SPREADS_DIR = path.join(BASE_PATH, 'Spreads');

    const OUTPUT_FOLDER = path.join(__dirname, '..', 'src', 'components', 'Crucigrama', 'stories-mastergrama');
    const OUTPUT_FILE = path.join(OUTPUT_FOLDER, `${FOLDER_NAME}.json`);

    console.log(`📂 Procesando desde: ${BASE_PATH}`);

    try {
        const storiesMap = {};
        const finalResults = [];

        // 1. EXTRAER STORIES (Texto)
        if (fs.existsSync(STORIES_DIR)) {
            const storyFiles = fs.readdirSync(STORIES_DIR);
            storyFiles.forEach(file => {
                const contentXml = fs.readFileSync(path.join(STORIES_DIR, file), 'utf8');
                const matches = [...contentXml.matchAll(/<Content>(.*?)<\/Content>/g)];
                if (matches.length > 0) {
                    const text = matches.map(m => m[1]).join(" ").trim();
                    storiesMap[file.replace('.xml', '').replace('Story_', '')] = text.toUpperCase();
                }
            });
        }

        // 2. EXTRAER GEOMETRÍA (Spreads)
        const multiplyMatrices = (m1, m2) => ([
            m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
        ]);

        const applyTransform = (m, x, y) => ({
            x: m[0] * x + m[2] * y + m[4],
            y: m[1] * x + m[3] * y + m[5]
        });

        if (fs.existsSync(SPREADS_DIR)) {
            const spreadFiles = fs.readdirSync(SPREADS_DIR);
            spreadFiles.forEach(file => {
                const xml = fs.readFileSync(path.join(SPREADS_DIR, file), 'utf8');
                
                // Dividir por bloques de elementos para mantener jerarquía
                // Buscamos Group, TextFrame, Rectangle, Polygon
                const items = xml.match(/<(Group|TextFrame|Rectangle|Polygon|\/Group)[^>]*>/g) || [];
                const transformStack = [[1, 0, 0, 1, 0, 0]];

                // Para cada item, necesitamos su XML interno para buscar PathGeometry
                let lastPos = 0;
                items.forEach((tag, idx) => {
                    const startIdx = xml.indexOf(tag, lastPos);
                    lastPos = startIdx + 1;

                    if (tag.startsWith('<Group')) {
                        const m = tag.match(/ItemTransform="([^"]+)"/);
                        const local = m ? m[1].split(' ').map(parseFloat) : [1, 0, 0, 1, 0, 0];
                        transformStack.push(multiplyMatrices(transformStack[transformStack.length - 1], local));
                    } 
                    else if (tag.startsWith('</Group')) {
                        if (transformStack.length > 1) transformStack.pop();
                    } 
                    else {
                        // Es un TextFrame, Rectangle o Polygon
                        const m = tag.match(/ItemTransform="([^"]+)"/);
                        const local = m ? m[1].split(' ').map(parseFloat) : [1, 0, 0, 1, 0, 0];
                        const absT = multiplyMatrices(transformStack[transformStack.length - 1], local);

                        // Buscar el bounding box del PathGeometry para ancho y alto
                        const objectXml = xml.substring(startIdx, xml.indexOf('>', startIdx + 500) + 2000);
                        const anchors = [...objectXml.matchAll(/Anchor="([^"]+)"/g)];
                        
                        let minAX = Infinity, minAY = Infinity, maxAX = -Infinity, maxAY = -Infinity;
                        anchors.forEach(a => {
                            const [ax, ay] = a[1].split(' ').map(parseFloat);
                            if (ax < minAX) minAX = ax; if (ay < minAY) minAY = ay;
                            if (ax > maxAX) maxAX = ax; if (ay > maxAY) maxAY = ay;
                        });

                        const width = maxAX - minAX;
                        const height = maxAY - minAY;
                        const realPos = applyTransform(absT, minAX, minAY);

                        const storyMatch = tag.match(/ParentStory="([^"]+)"/);
                        const storyId = storyMatch ? storyMatch[1].replace('Story_', '') : null;
                        const content = storiesMap[storyId] || '';

                        let role = content.length > 3 ? 'pista' : 'celda';
                        if ("➔↓←↑↳↴".includes(content)) role = 'flecha';
                        if (tag.includes('FillColor="Color/Black"')) role = 'pared';

                        if (content || role === 'pared' || tag.includes('StrokeColor="Color/Black"')) {
                            finalResults.push({
                                id: storyId || tag.match(/Self="([^"]+)"/)?.[1],
                                x: realPos.x,
                                y: realPos.y,
                                width: Math.round(width),
                                height: Math.round(height),
                                content: content,
                                role: role
                            });
                        }
                    }
                });
            });
        }

        // 3. NORMALIZACIÓN Y GUARDADO
        if (finalResults.length === 0) return console.log("⚠️ No se encontraron elementos.");

        const minX = Math.min(...finalResults.map(r => r.x));
        const minY = Math.min(...finalResults.map(r => r.y));
        
        const output = finalResults.map(r => ({
            ...r,
            x: Math.round(r.x - minX),
            y: Math.round(r.y - minY)
        }));

        if (!fs.existsSync(OUTPUT_FOLDER)) fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`✅ PROCESADO: ${output.length} elementos en ${OUTPUT_FILE}`);

    } catch (err) {
        console.error("❌ ERROR:", err.stack);
    }
}

extraerHistoriasIDML();