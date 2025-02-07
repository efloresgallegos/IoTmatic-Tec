import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

// Get all valid .js file names in the directory
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

// Check if a file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Dynamically load a JavaScript file by name
const getJsFile = async (name) => {
  const filePath = path.join(__dirname, `${name}.js`);

  if (!(await fileExists(filePath))) {
    throw new Error(`El archivo "${name}.js" no existe en el directorio de modelos.`);
  }

  try {
    const fileUrl = pathToFileURL(filePath).href;
    return await import(fileUrl);
  } catch (error) {
    console.error(`Error al cargar el archivo "${name}.js":`, error.message);
    throw new Error(`Error al cargar el modelo "${name}".`);
  }
};

// Load all models concurrently
const loadModels = async () => {
  const modelNames = await getJsFileNames();
  const models = {};

  const results = await Promise.allSettled(modelNames.map(getJsFile));

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      models[modelNames[index]] = result.value;
    } else {
      console.error(`Error al cargar el modelo "${modelNames[index]}":`, result.reason);
    }
  });

  return models;
};

// Export the promise for models and the getJsFile function
const modelsPromise = loadModels();

export { modelsPromise as models, getJsFile };