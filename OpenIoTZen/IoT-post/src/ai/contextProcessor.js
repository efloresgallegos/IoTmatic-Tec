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
<<<<<<< HEAD
  const { prompt, currentModel, userData } = requestContext;
=======
  const { prompt, currentModel } = requestContext;
>>>>>>> d5400d713f195b3cff70d4a82df972cab384402c
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
<<<<<<< HEAD
 * Detecta la intención principal del prompt del usuario
 * @param {string} prompt - El prompt del usuario
 * @returns {string} La intención detectada
 */
const detectIntent = (prompt) => {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Patrones para detectar intenciones comunes
  const intentPatterns = {
    create: ['crear', 'nuevo', 'diseñar', 'generar', 'hacer un'],
    modify: ['modificar', 'cambiar', 'actualizar', 'editar', 'ajustar'],
    analyze: ['analizar', 'examinar', 'evaluar', 'revisar', 'estudiar'],
    troubleshoot: ['problema', 'error', 'falla', 'no funciona', 'arreglar'],
    explain: ['explicar', 'describir', 'cómo funciona', 'qué significa', 'entender']
  };

  // Detectar la intención basada en patrones
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => lowercasePrompt.includes(pattern))) {
      return intent;
    }
  }

  return 'general'; // Intención por defecto
};

/**
 * Extrae entidades relevantes del prompt del usuario
 * @param {string} prompt - El prompt del usuario
 * @returns {Object} Entidades extraídas
 */
const extractEntities = (prompt) => {
  const entities = {
    deviceTypes: [],
    dataTypes: [],
    actions: [],
    parameters: {}
  };

  // Patrones para detectar tipos de dispositivos comunes
  const devicePatterns = [
    'sensor', 'actuador', 'cámara', 'termostato', 'interruptor', 'medidor',
    'controlador', 'gateway', 'hub', 'arduino', 'raspberry', 'esp8266', 'esp32'
  ];

  // Patrones para detectar tipos de datos
  const dataTypePatterns = [
    'temperatura', 'humedad', 'presión', 'velocidad', 'nivel', 'voltaje',
    'corriente', 'energía', 'potencia', 'luz', 'sonido', 'movimiento', 'posición'
  ];

  // Patrones para detectar acciones
  const actionPatterns = [
    'medir', 'controlar', 'monitorear', 'registrar', 'alertar', 'notificar',
    'activar', 'desactivar', 'encender', 'apagar', 'ajustar', 'calibrar'
  ];

  // Detectar tipos de dispositivos
  devicePatterns.forEach(pattern => {
    if (prompt.toLowerCase().includes(pattern)) {
      entities.deviceTypes.push(pattern);
    }
  });

  // Detectar tipos de datos
  dataTypePatterns.forEach(pattern => {
    if (prompt.toLowerCase().includes(pattern)) {
      entities.dataTypes.push(pattern);
    }
  });

  // Detectar acciones
  actionPatterns.forEach(pattern => {
    if (prompt.toLowerCase().includes(pattern)) {
      entities.actions.push(pattern);
    }
  });

  // Extraer parámetros numéricos (por ejemplo, "cada 5 minutos")
  const timeIntervalMatch = prompt.match(/cada\s+(\d+)\s+(segundo|minuto|hora|día)/i);
  if (timeIntervalMatch) {
    entities.parameters.timeInterval = {
      value: parseInt(timeIntervalMatch[1]),
      unit: timeIntervalMatch[2]
    };
  }

  return entities;
};

/**
 * Evalúa la complejidad del prompt del usuario
 * @param {string} prompt - El prompt del usuario
 * @returns {string} Nivel de complejidad (simple, medium, complex)
 */
const assessComplexity = (prompt) => {
  const wordCount = prompt.split(/\s+/).length;
  const sentenceCount = prompt.split(/[.!?]+/).length - 1;
  const technicalTerms = countTechnicalTerms(prompt);

  // Evaluación simple basada en longitud y términos técnicos
  if (wordCount < 15 && technicalTerms < 2) {
    return 'simple';
  } else if (wordCount > 50 || technicalTerms > 5 || sentenceCount > 4) {
    return 'complex';
  } else {
    return 'medium';
  }
};

/**
 * Cuenta la cantidad de términos técnicos en el prompt
 * @param {string} prompt - El prompt del usuario
 * @returns {number} Cantidad de términos técnicos
 */
const countTechnicalTerms = (prompt) => {
  const technicalTerms = [
    'mqtt', 'http', 'api', 'json', 'xml', 'rest', 'websocket', 'tcp', 'udp',
    'gpio', 'i2c', 'spi', 'uart', 'pwm', 'adc', 'dac', 'microcontrolador',
    'firmware', 'protocolo', 'latencia', 'throughput', 'bandwidth', 'gateway',
    'encriptación', 'autenticación', 'autorización', 'ssl', 'tls', 'ssh',
    'algoritmo', 'base de datos', 'sql', 'nosql', 'cloud', 'edge computing'
  ];

  const lowercasePrompt = prompt.toLowerCase();
  return technicalTerms.filter(term => lowercasePrompt.includes(term)).length;
};

/**
 * Extrae los tipos de campos de un modelo
 * @param {Object} model - El modelo actual
 * @returns {Object} Conteo de tipos de campos
 */
const extractFieldTypes = (model) => {
  const fieldTypes = {};
  
  const countFieldTypes = (fields) => {
    if (!fields || !Array.isArray(fields)) return;
    
    fields.forEach(field => {
      if (field.type) {
        fieldTypes[field.type] = (fieldTypes[field.type] || 0) + 1;
      }
      
      // Procesar campos anidados si es un objeto
      if (field.type === 'Object' && field.fields) {
        countFieldTypes(field.fields);
      }
    });
  };
  
  countFieldTypes(model.fields);
  return fieldTypes;
};

/**
 * Evalúa la complejidad de un modelo
 * @param {Object} model - El modelo a evaluar
 * @returns {string} Nivel de complejidad (simple, medium, complex)
 */
const assessModelComplexity = (model) => {
  if (!model.fields || !Array.isArray(model.fields)) {
    return 'simple';
  }
  
  const fieldCount = model.fields.length;
  let nestedFieldCount = 0;
  let maxNestingLevel = 0;
  
  const countNestedFields = (fields, level = 1) => {
    if (!fields || !Array.isArray(fields)) return;
    
    fields.forEach(field => {
      if (field.type === 'Object' && field.fields) {
        nestedFieldCount += field.fields.length;
        maxNestingLevel = Math.max(maxNestingLevel, level);
        countNestedFields(field.fields, level + 1);
      }
    });
  };
  
  countNestedFields(model.fields);
  
  // Evaluación basada en cantidad de campos y niveles de anidamiento
  if (fieldCount <= 3 && nestedFieldCount === 0) {
    return 'simple';
  } else if (fieldCount > 10 || nestedFieldCount > 5 || maxNestingLevel > 2) {
    return 'complex';
  } else {
    return 'medium';
  }
};

/**
 * Optimiza el prompt para la IA basado en el contexto procesado
=======
 * Optimiza el prompt para la IA basado en el modelo actual
>>>>>>> d5400d713f195b3cff70d4a82df972cab384402c
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
<<<<<<< HEAD
    optimizedPrompt += `\n- Número de campos: ${modelContext.fieldCount || 0}`;
    
    if (Object.keys(modelContext.fieldTypes).length > 0) {
      optimizedPrompt += `\n- Tipos de campos: ${JSON.stringify(modelContext.fieldTypes)}`;
    }
  }
  
  // Añadir información sobre la intención detectada
  optimizedPrompt += `\n\nIntención detectada: ${detectedIntent}`;
  
  // Añadir información sobre entidades detectadas si son relevantes
  if (detectedEntities.deviceTypes.length > 0 || 
      detectedEntities.dataTypes.length > 0 || 
      detectedEntities.actions.length > 0) {
    
    optimizedPrompt += '\n\nEntidades detectadas:';
    
    if (detectedEntities.deviceTypes.length > 0) {
      optimizedPrompt += `\n- Dispositivos: ${detectedEntities.deviceTypes.join(', ')}`;
    }
    
    if (detectedEntities.dataTypes.length > 0) {
      optimizedPrompt += `\n- Tipos de datos: ${detectedEntities.dataTypes.join(', ')}`;
    }
    
    if (detectedEntities.actions.length > 0) {
      optimizedPrompt += `\n- Acciones: ${detectedEntities.actions.join(', ')}`;
    }
  }
  
  // Ajustar el nivel de detalle según la complejidad
  optimizedPrompt += `\n\nNivel de complejidad: ${complexity}`;
  if (complexity === 'simple') {
    optimizedPrompt += '\nProporciona una respuesta sencilla y directa.';
  } else if (complexity === 'complex') {
    optimizedPrompt += '\nProporciona una respuesta detallada y completa.';
=======
    optimizedPrompt += `\n- Campos: ${JSON.stringify(modelContext.fields)}`;
>>>>>>> d5400d713f195b3cff70d4a82df972cab384402c
  }
  
  // Añadir el prompt original del usuario
  optimizedPrompt += `\n\nPrompt del usuario: ${userPrompt}`;
  
  return optimizedPrompt;
};

export {
  extractRelevantContext,
  optimizePrompt
};