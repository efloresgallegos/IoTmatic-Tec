/**
 * Sistema de procesamiento de contexto para optimizar las interacciones con IA
 * Este módulo se enfoca en la creación y optimización de modelos IoT
 */

/**
 * Extrae información relevante del modelo actual
 * @param {Object} requestContext - El contexto de la solicitud
 * @param {string} requestContext.prompt - El prompt del usuario
 * @param {Object} requestContext.currentModel - El modelo actual
 * @returns {Object} Contexto procesado con información relevante
 */
const extractRelevantContext = (requestContext) => {
  const { prompt, currentModel } = requestContext;
  const relevantContext = {
    userPrompt: prompt,
    modelContext: null
  };

  // Procesar el modelo actual si existe
  if (currentModel && Object.keys(currentModel).length > 0) {
    relevantContext.modelContext = {
      name: currentModel.name,
      fields: currentModel.fields || []
    };
  }

  return relevantContext;
};

/**
 * Optimiza el prompt para la IA basado en el modelo actual
 * @param {Object} processedContext - El contexto procesado
 * @param {string} templatePrompt - La plantilla de prompt seleccionada
 * @returns {string} Prompt optimizado para la IA
 */
const optimizePrompt = (processedContext, templatePrompt) => {
  const { userPrompt, modelContext } = processedContext;
  
  // Construir un prompt optimizado basado en el modelo actual
  let optimizedPrompt = templatePrompt;
  
  // Añadir información sobre el modelo actual si existe
  if (modelContext) {
    optimizedPrompt += "\n\nModelo actual:";
    optimizedPrompt += `\n- Nombre: ${modelContext.name || 'Sin nombre'}`;
    optimizedPrompt += `\n- Campos: ${JSON.stringify(modelContext.fields)}`;
  }
  
  // Añadir el prompt original del usuario
  optimizedPrompt += `\n\nPrompt del usuario: ${userPrompt}`;
  
  return optimizedPrompt;
};

export {
  extractRelevantContext,
  optimizePrompt
};