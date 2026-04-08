const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ 
    ignoreAttributes: false, 
    attributeNamePrefix: "" 
});

const BASE_PATH = './scripts/raw-idml/';
const OUTPUT_PATH = './public/data/mastergrama.json';

function parseIdmlProject() {
    console.log("🚀 Iniciando procesamiento de IDML...");

    // 1. Leer el DesignMap para obtener la hoja de ruta
    const designMapContent = fs.readFileSync(path.join(BASE_PATH, 'designmap.xml'), 'utf-8');
    const designMap = parser.parse(designMapContent);
    
    // 2. Mapear Contenido (Stories)
    const stories = {};
    const storyFiles = fs.readdirSync(path.join(BASE_PATH, 'stories'));
    
    storyFiles.forEach(file => {
        if (file.endsWith('.xml')) {
            const xml = fs.readFileSync(path.join(BASE_PATH, 'stories', file), 'utf-8');
            const jsonObj = parser.parse(xml);
            const story = jsonObj.Idpkg_Story?.Story;
            
            if (story) {
                // Buscamos el texto dentro de la estructura compleja de InDesign
                let content = "";
                const pStyle = story.ParagraphStyleRange;
                
                if (Array.isArray(pStyle)) {
                    content = pStyle.map(p => p.CharacterStyleRange?.Content || "").join(' ');
                } else {
                    content = pStyle?.CharacterStyleRange?.Content || "";
                }
                
                stories[story.Self] = content;
            }
        }
    });

    // 3. Procesar la Geometría (Spreads) basándose en el DesignMap
    const finalData = [];
    const spreadFiles = fs.readdirSync(path.join(BASE_PATH, 'spreads'));

    spreadFiles.forEach(file => {
        if (file.endsWith('.xml')) {
            const xml = fs.readFileSync(path.join(BASE_PATH, 'spreads', file), 'utf-8');
            const jsonObj = parser.parse(xml);
            let textFrames = jsonObj.Idpkg_Spread?.Spread?.TextFrame || [];
            if (!Array.isArray(textFrames)) textFrames = [textFrames];

            textFrames.forEach(frame => {
                const transform = frame.ItemTransform.split(' ');
                
                finalData.push({
                    id: frame.Self,
                    x: parseFloat(transform[4]),
                    y: parseFloat(transform[5]),
                    text: stories[frame.ParentStory] || "",
                    role: frame.ElementLabel || 'celda_vacia',
                    stroke: parseFloat(frame.StrokeWeight) || 0,
                    // Extraemos dimensiones del PathGeometry si es necesario para el tamaño
                    width: frame.TextFramePreference?.TextColumnFixedWidth || 32
                });
            });
        }
    });

    // 4. Exportar JSON para Next.js
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2));
    console.log(`✅ Éxito: ${finalData.length} elementos vinculados.`);
}

parseIdmlProject();