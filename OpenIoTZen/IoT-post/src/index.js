import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {sequelize} from './db/database.js';
import db from './db/db.js';
import usersRoutes from './routes/users.routes.js';
import devicesRoutes from './routes/devices.routes.js';
import modelsRoutes from './routes/models.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import filtersRoutes from './routes/filters.routes.js';
import userFiltersRoutes from './routes/userFilters.routes.js';
import userAlertsRoutes from './routes/userAlerts.routes.js';
import userDevicesRoutes from './routes/userDevices.routes.js';
import userModelsRoutes from './routes/userModels.routes.js';
import deviceModelsRoutes from './routes/deviceModels.routes.js';
import typesRoutes from './routes/types.routes.js';
import generatorRoutes from './routes/generator.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rutas
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const routes = [
  { path: '/users', route: usersRoutes },
  { path: '/devices', route: devicesRoutes },
  { path: '/models', route: modelsRoutes },
  { path: '/alerts', route: alertsRoutes },
  { path: '/filters', route: filtersRoutes },
  { path: '/user-filters', route: userFiltersRoutes },
  { path: '/user-alerts', route: userAlertsRoutes },
  { path: '/user-devices', route: userDevicesRoutes },
  { path: '/user-models', route: userModelsRoutes },
  { path: '/device-models', route: deviceModelsRoutes },
  { path: '/types', route: typesRoutes },
  { path: '/generator', route: generatorRoutes },
  { path: '/ai', route: aiRoutes}
];

routes.forEach((route) => {
  app.use(`/api${route.path}`, route.route);
});

// Ruta para 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrió un error interno en el servidor.' });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    await db.createDatabaseAndTables();
    await sequelize.authenticate();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa no manejada:', promise, 'razón:', reason);
  process.exit(1);
});
