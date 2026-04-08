const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const STORIES_DIR = './scripts/raw-idml/stories/';
const OUTPUT_PATH = './src/components/Crucigrama/data.json';

async function extraerSoloHistorias() {
    console.log("📂 Leyendo historias de InDesign...");
    const archivos = fs.readdirSync(STORIES_DIR);
    const listaPistas = [];
    const parser = new xml2js.Parser();

    for (const archivo of archivos) {
        if (archivo.endsWith('.xml')) {
            const contenidoXml = fs.readFileSync(path.join(STORIES_DIR, archivo), 'utf-8');

            // Extraer texto entre etiquetas <Content>
            const matches = [...contenidoXml.matchAll(/<Content>(.*?)<\/Content>/g)];
            if (matches.length > 0) {
                const textoPista = matches.map(m => m[1]).join(" ").trim();

                // Solo guardamos si parece una pista (más de 3 letras)
                if (textoPista.length > 3) {
                    listaPistas.push({
                        id: archivo,
                        content: textoPista.toUpperCase()
                    });
                }
            }
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(listaPistas, null, 2));
    console.log(`✅ Se encontraron ${listaPistas.length} historias con texto.`);
}

extraerSoloHistorias();