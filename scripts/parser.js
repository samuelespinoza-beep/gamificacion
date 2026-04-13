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
        console.log("💡 Uso: node scripts/parser.js 'MASTERGRAMA_12-04-26'");
        return;
    }

    const EDITION_DIR = path.join(PARENT_DIR, FOLDER_NAME);

    // --- CARPETA CENTRALIZADA ---
    // Todos los archivos irán aquí: src/components/Crucigrama/stories-mastergrama/
    const OUTPUT_FOLDER = path.join(__dirname, '..', 'src', 'components', 'Crucigrama', 'stories-mastergrama');

    // El nombre del archivo será el nombre de la edición (ej: MASTERGRAMA_12-04-26.json)
    const OUTPUT_FILE = path.join(OUTPUT_FOLDER, `${FOLDER_NAME}.json`);

    console.log("--------------------------------------------------");
    console.log(`📂 Procesando edición: '${FOLDER_NAME}'`);
    console.log("--------------------------------------------------");

    // 1. Validar existencia de la carpeta de origen
    if (!fs.existsSync(EDITION_DIR)) {
        console.error(`❌ ERROR: No se encontró la carpeta de origen en: ${EDITION_DIR}`);
        return;
    }

    // 2. Buscar archivo .idml
    const archivosEnCarpeta = fs.readdirSync(EDITION_DIR);
    const nombreArchivoIdml = archivosEnCarpeta.find(f => f.endsWith('.idml'));

    if (!nombreArchivoIdml) {
        console.error(`❌ ERROR: No hay archivo .idml en la carpeta.`);
        return;
    }

    try {
        const idmlPath = path.join(EDITION_DIR, nombreArchivoIdml);
        const zip = new AdmZip(idmlPath);
        const zipEntries = zip.getEntries();
        const listaPistas = [];

        zipEntries.forEach((entry) => {
            if (entry.entryName.startsWith('Stories/') && entry.entryName.endsWith('.xml')) {
                const contenidoXml = entry.getData().toString('utf8');
                const matches = [...contenidoXml.matchAll(/<Content>(.*?)<\/Content>/g)];

                if (matches.length > 0) {
                    const textoPista = matches.map(m => m[1]).join(" ").trim();
                    if (textoPista.length > 3) {
                        listaPistas.push({
                            id: entry.name.replace('.xml', ''),
                            content: textoPista.toUpperCase()
                        });
                    }
                }
            }
        });

        // --- 3. PERSISTENCIA CENTRALIZADA ---
        // Creamos la carpeta 'stories-mastergrama' si no existe
        if (!fs.existsSync(OUTPUT_FOLDER)) {
            console.log(`📁 Creando carpeta central de historias...`);
            fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
        }

        // Guardamos el JSON con el nombre dinámico
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(listaPistas, null, 2));

        // Mantenemos la actualización del data.json raíz como fallback por si acaso
        const ROOT_DATA_PATH = path.join(__dirname, '..', 'src', 'components', 'Crucigrama', 'data.json');
        fs.writeFileSync(ROOT_DATA_PATH, JSON.stringify(listaPistas, null, 2));

        console.log(`✅ ÉXITO: Se extrajeron ${listaPistas.length} historias.`);
        console.log(`💾 Guardado en: src/components/Crucigrama/stories-mastergrama/${FOLDER_NAME}.json`);
        console.log(`🔄 Sincronizado en: src/components/Crucigrama/data.json`);

    } catch (error) {
        console.error("❌ ERROR CRÍTICO:", error.message);
    }
}

extraerHistoriasIDML();