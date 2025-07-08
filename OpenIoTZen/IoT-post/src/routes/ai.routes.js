/**
 * Rutas para el sistema de IA mejorado
 * Este archivo define los endpoints relacionados con la interacción con IA
 */

import { Router } from 'express';
import enhancedAI from '../ai/enhancedAI.js';

const router = Router();

/**
 * @route POST /deepseek
 * @desc Envía un prompt a DeepSeek y devuelve la respuesta procesada
 * @access Public
 */
router.post('/deepseek', enhancedAI.sendToDeepSeek);

/**
 * @route POST /gpt
 * @desc Envía un prompt a GPT y devuelve la respuesta procesada
 * @access Public
 */
router.post('/gpt', enhancedAI.sendToGPT);

/**
 * @route POST /feedback
 * @desc Recibe retroalimentación sobre una respuesta de IA
 * @access Public
 */
router.post('/feedback', enhancedAI.receiveFeedback);

/**
 * @route GET /templates
 * @desc Obtiene las plantillas disponibles para prompts
 * @access Public
 */
router.get('/templates', (req, res) => {
  // Lista de plantillas disponibles con descripciones
  const templates = [
    {
      id: 'general',
      name: 'General',
      description: 'Plantilla general para cualquier consulta relacionada con IoT'
    },
    {
      id: 'modelCreation',
      name: 'Creación de Modelos',
      description: 'Optimizada para crear o modificar modelos de datos para dispositivos IoT'
    },
    {
      id: 'dataAnalysis',
      name: 'Análisis de Datos',
      description: 'Especializada en analizar datos y proporcionar insights valiosos'
    },
    {
      id: 'deviceConfig',
      name: 'Configuración de Dispositivos',
      description: 'Ayuda con la configuración y optimización de dispositivos IoT'
    },
    {
      id: 'troubleshooting',
      name: 'Resolución de Problemas',
      description: 'Asistencia para diagnosticar y resolver problemas con dispositivos o sistemas IoT'
    },
    {
      id: 'codeGeneration',
      name: 'Generación de Código',
      description: 'Genera código optimizado para sistemas IoT basado en tus requisitos'
    }
  ];
  
  res.json(templates);
});

export default router;