import graphController from '../controllers/graph.controller.js';
import { Router } from 'express';

const router = Router();

// Ruta para obtener campos graficables de un modelo
router.get('/fields/:id', graphController.getGraphableFields);

// Ruta para obtener datos procesados para gráficos
router.post('/data', graphController.getGraphData);

// Ruta para obtener datos optimizados para un tipo específico de gráfico
router.post('/optimized', graphController.getOptimizedChartData);

// Ruta para limpiar el caché de datos de gráficos
router.get('/clear-cache', graphController.clearCache);

export default router;