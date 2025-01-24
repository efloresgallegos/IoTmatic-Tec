import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const getJsFileNames = async () => {
    try {
        const files = await fs.readdir(__dirname);
        const modelFiles = files.filter(
            (file) =>
                file.indexOf('.') !== 0 &&
                file !== basename &&
                file.slice(-3) === '.js'
        );

        const modelNames = modelFiles.map(file => path.basename(file, '.js'));
        console.log(modelNames);

        return modelNames;
    } catch (error) {
        console.error('Error loading models:', error);
    }
};

const models = await getJsFileNames();
export { models };