/**
 * Sistema de retroalimentación para refinar los resultados de la IA
 * Este módulo permite mejorar las respuestas basándose en la retroalimentación del usuario
 */

// Almacén de retroalimentación para mejorar futuras respuestas
let feedbackStore = [];

// Configuración del sistema de retroalimentación
const feedbackConfig = {
  maxStoreSize: 200,       // Número máximo de entradas de retroalimentación
  weightDecayFactor: 0.95, // Factor de decaimiento para retroalimentación antigua
  minFeedbackScore: 1,     // Puntuación mínima para considerar retroalimentación útil
  maxFeedbackAge: 30       // Días máximos para mantener retroalimentación
};

/**
 * Registra la retroalimentación del usuario sobre una respuesta de IA
 * @param {Object} feedbackData - Datos de retroalimentación
 * @param {string} feedbackData.promptId - ID único del prompt original
 * @param {string} feedbackData.prompt - El prompt original
 * @param {Object} feedbackData.response - La respuesta generada por la IA
 * @param {number} feedbackData.rating - Puntuación de 1 a 5
 * @param {string} feedbackData.comment - Comentario opcional del usuario
 * @param {Array} feedbackData.tags - Etiquetas opcionales (útil, confuso, incompleto, etc.)
 * @returns {boolean} Éxito de la operación
 */
const recordFeedback = (feedbackData) => {
  try {
    const { promptId, prompt, response, rating, comment = '', tags = [] } = feedbackData;
    
    if (!promptId || !prompt || !response || !rating) {
      console.error('Feedback data incomplete');
      return false;
    }
    
    // Crear entrada de retroalimentación
    const feedbackEntry = {
      id: generateFeedbackId(),
      promptId,
      prompt,
      responseSnapshot: JSON.stringify(response),
      rating,
      comment,
      tags,
      timestamp: Date.now(),
      used: 0 // Contador de veces que esta retroalimentación ha influido en respuestas
    };
    
    // Añadir al almacén
    feedbackStore.push(feedbackEntry);
    
    // Mantener el tamaño del almacén
    if (feedbackStore.length > feedbackConfig.maxStoreSize) {
      pruneFeedbackStore();
    }
    
    return true;
  } catch (error) {
    console.error('Error recording feedback:', error);
    return false;
  }
};

/**
 * Genera un ID único para una entrada de retroalimentación
 * @returns {string} ID único
 */
const generateFeedbackId = () => {
  return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Elimina entradas antiguas o menos útiles del almacén de retroalimentación
 */
const pruneFeedbackStore = () => {
  const now = Date.now();
  const maxAge = feedbackConfig.maxFeedbackAge * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
  
  // Filtrar entradas demasiado antiguas
  feedbackStore = feedbackStore.filter(entry => {
    return (now - entry.timestamp) < maxAge;
  });
  
  // Si aún hay demasiadas entradas, eliminar las menos útiles
  if (feedbackStore.length > feedbackConfig.maxStoreSize) {
    // Calcular una puntuación de utilidad para cada entrada
    const scoredEntries = feedbackStore.map(entry => {
      const age = (now - entry.timestamp) / (24 * 60 * 60 * 1000); // Edad en días
      const ageScore = Math.pow(feedbackConfig.weightDecayFactor, age); // Decaimiento exponencial
      const usageScore = Math.log(entry.used + 1) / Math.log(10); // Logarítmico para no sobrevalorar uso
      const ratingScore = entry.rating / 5; // Normalizar rating
      
      // Puntuación combinada
      const utilityScore = (ratingScore * 0.5) + (ageScore * 0.3) + (usageScore * 0.2);
      
      return { entry, utilityScore };
    });
    
    // Ordenar por puntuación de utilidad (descendente)
    scoredEntries.sort((a, b) => b.utilityScore - a.utilityScore);
    
    // Mantener solo las entradas más útiles
    feedbackStore = scoredEntries
      .slice(0, feedbackConfig.maxStoreSize)
      .map(item => item.entry);
  }
  
  console.log(`Feedback store pruned: ${feedbackStore.length} entries remaining`);
};

/**
 * Encuentra retroalimentación relevante para un prompt dado
 * @param {string} prompt - El prompt actual
 * @param {Object} context - Contexto adicional
 * @returns {Array} Retroalimentación relevante ordenada por relevancia
 */
const findRelevantFeedback = (prompt, context = {}) => {
  // Implementación simple basada en coincidencia de palabras clave
  const keywords = extractKeywords(prompt);
  
  if (keywords.length === 0) {
    return [];
  }
  
  // Calcular relevancia para cada entrada de retroalimentación
  const relevantEntries = feedbackStore
    .map(entry => {
      const entryKeywords = extractKeywords(entry.prompt);
      const commonKeywords = keywords.filter(kw => entryKeywords.includes(kw));
      const relevanceScore = commonKeywords.length / Math.max(keywords.length, entryKeywords.length);
      
      return { entry, relevanceScore };
    })
    .filter(item => item.relevanceScore > 0.3) // Umbral mínimo de relevancia
    .sort((a, b) => b.relevanceScore - a.relevanceScore); // Ordenar por relevancia
  
  return relevantEntries.map(item => item.entry);
};

/**
 * Extrae palabras clave de un texto
 * @param {string} text - Texto a analizar
 * @returns {Array} Lista de palabras clave
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Lista de palabras vacías en español
  const stopWords = new Set([
    'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'como', 'con', 'contra',
    'cual', 'cuando', 'de', 'del', 'desde', 'donde', 'durante', 'e', 'el', 'ella',
    'ellas', 'ellos', 'en', 'entre', 'era', 'erais', 'eran', 'eras', 'eres', 'es',
    'esa', 'esas', 'ese', 'eso', 'esos', 'esta', 'estaba', 'estabais', 'estaban',
    'estabas', 'estad', 'estada', 'estadas', 'estado', 'estados', 'estamos', 'estando',
    'estar', 'estaremos', 'estará', 'estarán', 'estarás', 'estaré', 'estaréis',
    'estaría', 'estaríais', 'estaríamos', 'estarían', 'estarías', 'estas', 'este',
    'estemos', 'esto', 'estos', 'estoy', 'estuve', 'estuviera', 'estuvierais',
    'estuvieran', 'estuvieras', 'estuvieron', 'estuviese', 'estuvieseis', 'estuviesen',
    'estuvieses', 'estuvimos', 'estuviste', 'estuvisteis', 'estuviéramos',
    'estuviésemos', 'estuvo', 'está', 'estábamos', 'estáis', 'están', 'estás', 'esté',
    'estéis', 'estén', 'estés', 'fue', 'fuera', 'fuerais', 'fueran', 'fueras',
    'fueron', 'fuese', 'fueseis', 'fuesen', 'fueses', 'fui', 'fuimos', 'fuiste',
    'fuisteis', 'fuéramos', 'fuésemos', 'ha', 'habida', 'habidas', 'habido', 'habidos',
    'habiendo', 'habremos', 'habrá', 'habrán', 'habrás', 'habré', 'habréis', 'habría',
    'habríais', 'habríamos', 'habrían', 'habrías', 'habéis', 'había', 'habíais',
    'habíamos', 'habían', 'habías', 'han', 'has', 'hasta', 'hay', 'haya', 'hayamos',
    'hayan', 'hayas', 'hayáis', 'he', 'hemos', 'hube', 'hubiera', 'hubierais',
    'hubieran', 'hubieras', 'hubieron', 'hubiese', 'hubieseis', 'hubiesen', 'hubieses',
    'hubimos', 'hubiste', 'hubisteis', 'hubiéramos', 'hubiésemos', 'hubo', 'la', 'las',
    'le', 'les', 'lo', 'los', 'me', 'mi', 'mis', 'mucho', 'muchos', 'muy', 'más',
    'mí', 'mía', 'mías', 'mío', 'míos', 'nada', 'ni', 'no', 'nos', 'nosotras',
    'nosotros', 'nuestra', 'nuestras', 'nuestro', 'nuestros', 'o', 'os', 'otra',
    'otras', 'otro', 'otros', 'para', 'pero', 'poco', 'por', 'porque', 'que', 'quien',
    'quienes', 'qué', 'se', 'sea', 'seamos', 'sean', 'seas', 'seremos', 'será',
    'serán', 'serás', 'seré', 'seréis', 'sería', 'seríais', 'seríamos', 'serían',
    'serías', 'seáis', 'si', 'sido', 'siendo', 'sin', 'sobre', 'sois', 'somos', 'son',
    'soy', 'su', 'sus', 'suya', 'suyas', 'suyo', 'suyos', 'sí', 'también', 'tanto',
    'te', 'tendremos', 'tendrá', 'tendrán', 'tendrás', 'tendré', 'tendréis', 'tendría',
    'tendríais', 'tendríamos', 'tendrían', 'tendrías', 'tened', 'tenemos', 'tenga',
    'tengamos', 'tengan', 'tengas', 'tengo', 'tengáis', 'tenida', 'tenidas', 'tenido',
    'tenidos', 'teniendo', 'tenéis', 'tenía', 'teníais', 'teníamos', 'tenían', 'tenías',
    'ti', 'tiene', 'tienen', 'tienes', 'todo', 'todos', 'tu', 'tus', 'tuve', 'tuviera',
    'tuvierais', 'tuvieran', 'tuvieras', 'tuvieron', 'tuviese', 'tuvieseis', 'tuviesen',
    'tuvieses', 'tuvimos', 'tuviste', 'tuvisteis', 'tuviéramos', 'tuviésemos', 'tuvo',
    'tuya', 'tuyas', 'tuyo', 'tuyos', 'tú', 'un', 'una', 'uno', 'unos', 'vosotras',
    'vosotros', 'vuestra', 'vuestras', 'vuestro', 'vuestros', 'y', 'ya', 'yo', 'él',
    'éramos'
  ]);
  
  // Normalizar y tokenizar el texto
  return text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
};

/**
 * Aplica la retroalimentación para mejorar un prompt
 * @param {string} prompt - El prompt original
 * @param {Array} relevantFeedback - Retroalimentación relevante
 * @returns {string} Prompt mejorado
 */
const enhancePromptWithFeedback = (prompt, relevantFeedback) => {
  if (!relevantFeedback || relevantFeedback.length === 0) {
    return prompt;
  }
  
  // Extraer patrones de prompts bien valorados
  const highRatedFeedback = relevantFeedback
    .filter(entry => entry.rating >= 4)
    .slice(0, 3); // Usar solo los 3 más relevantes
  
  if (highRatedFeedback.length === 0) {
    return prompt;
  }
  
  // Incrementar el contador de uso para las entradas utilizadas
  highRatedFeedback.forEach(entry => {
    const feedbackIndex = feedbackStore.findIndex(item => item.id === entry.id);
    if (feedbackIndex >= 0) {
      feedbackStore[feedbackIndex].used += 1;
    }
  });
  
  // Extraer patrones útiles de los prompts bien valorados
  const usefulPatterns = extractUsefulPatterns(highRatedFeedback);
  
  // Mejorar el prompt original con los patrones útiles
  let enhancedPrompt = prompt;
  
  // Añadir contexto o especificidad basada en patrones exitosos
  if (usefulPatterns.specificTerms.length > 0) {
    const missingTerms = usefulPatterns.specificTerms
      .filter(term => !prompt.toLowerCase().includes(term.toLowerCase()));
    
    if (missingTerms.length > 0) {
      enhancedPrompt += `\n\nConsideraciones adicionales basadas en casos similares exitosos: ${missingTerms.join(', ')}.`;
    }
  }
  
  return enhancedPrompt;
};

/**
 * Extrae patrones útiles de retroalimentación bien valorada
 * @param {Array} feedbackEntries - Entradas de retroalimentación
 * @returns {Object} Patrones útiles extraídos
 */
const extractUsefulPatterns = (feedbackEntries) => {
  const patterns = {
    specificTerms: [],
    structures: [],
    commonPhrases: []
  };
  
  // Extraer términos específicos que aparecen en prompts bien valorados
  feedbackEntries.forEach(entry => {
    const keywords = extractKeywords(entry.prompt);
    patterns.specificTerms.push(...keywords);
  });
  
  // Eliminar duplicados
  patterns.specificTerms = [...new Set(patterns.specificTerms)];
  
  return patterns;
};

/**
 * Actualiza la configuración del sistema de retroalimentación
 * @param {Object} newConfig - Nueva configuración
 */
const updateFeedbackConfig = (newConfig = {}) => {
  Object.assign(feedbackConfig, newConfig);
  console.log('Feedback configuration updated:', feedbackConfig);
};

/**
 * Obtiene estadísticas del sistema de retroalimentación
 * @returns {Object} Estadísticas
 */
const getFeedbackStats = () => {
  const totalEntries = feedbackStore.length;
  
  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      mostCommonTags: []
    };
  }
  
  // Calcular distribución de puntuaciones
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  
  // Contar ocurrencias de etiquetas
  const tagCounts = {};
  
  feedbackStore.forEach(entry => {
    ratingDistribution[entry.rating] = (ratingDistribution[entry.rating] || 0) + 1;
    ratingSum += entry.rating;
    
    // Contar etiquetas
    entry.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  // Calcular puntuación media
  const averageRating = ratingSum / totalEntries;
  
  // Obtener etiquetas más comunes
  const mostCommonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  
  return {
    totalEntries,
    averageRating,
    ratingDistribution,
    mostCommonTags
  };
};

export {
  recordFeedback,
  findRelevantFeedback,
  enhancePromptWithFeedback,
  updateFeedbackConfig,
  getFeedbackStats
};