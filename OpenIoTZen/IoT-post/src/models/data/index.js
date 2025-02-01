import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const getJsFileNames = async () => {
  try {
    const files = await fs.readdir(__dirname);
    return files
      .filter(
        (file) =>
          !file.startsWith('.') &&
          file !== basename &&
          file.endsWith('.js') &&
          !file.endsWith('.test.js')
      )
      .map((file) => path.basename(file, '.js'));
  } catch (error) {
    console.error('Error al leer los archivos del directorio:', error.message);
    throw new Error('No se pudieron cargar los archivos de modelos');
  }
};

const getJsFile = async (name) => {
  try {
    const filePath = path.join(__dirname, `${name}.js`);

    // Verificar si el archivo existe
    await fs.access(filePath);

    // Convertir la ruta a una URL válida para import()
    const fileUrl = pathToFileURL(filePath).href;

    // Cargar el módulo dinámicamente
    const model = await import(fileUrl);
    return model.default || model; // Devuelve la exportación por defecto si existe
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`El archivo "${name}.js" no existe en el directorio de modelos.`);
    } else {
      console.error(`Error al cargar el archivo "${name}.js":`, error.message);
      throw new Error(`Error al cargar el modelo "${name}".`);
    }
  }
};

const loadModels = async () => {
  const models = await getJsFileNames();
  return models;
};

const models = await loadModels();

export { models, getJsFile };