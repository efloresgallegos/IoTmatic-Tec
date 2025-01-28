import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const getJsonFileNames = async () => {
    try {
        const files = await fs.readdir(__dirname);
        const modelFiles = files.filter(
            (file) =>
                file.indexOf('.') !== 0 &&
                file !== basename &&
                file.slice(-5) === '.json'
        );

        const modelNames = modelFiles.map(file => path.basename(file, '.json'));

        return modelNames;
    } catch (error) {
        console.error('Error loading models:', error);
    }
};

const readJsonFiles = async (fileNames) => {
    try {
        const jsonFiles = await Promise.all(
            fileNames.map(async (fileName) => {
                const filePath = path.join(__dirname, `${fileName}.json`);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                return JSON.parse(fileContent);
            })
        );
        console.log(jsonFiles);
        return jsonFiles;
    } catch (error) {
        console.error('Error reading JSON files:', error);
    }
};

const jsonNames = await getJsonFileNames();
const jsons = await readJsonFiles(jsonNames);
console.log(jsons);
export { jsons };