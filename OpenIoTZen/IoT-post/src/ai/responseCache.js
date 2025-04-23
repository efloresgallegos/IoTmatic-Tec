/**
 * Sistema de caché para respuestas de IA
 * Este módulo permite almacenar y reutilizar respuestas similares
 * para reducir llamadas a la API y mejorar el tiempo de respuesta
 */

// Caché en memoria para almacenar respuestas
let responseCache = {};

// Configuración del caché
const cacheConfig = {
  maxSize: 100,           // Número máximo de entradas en caché
  ttl: 24 * 60 * 60 * 1000, // Tiempo de vida de las entradas (24 horas)
  similarityThreshold: 0.8  // Umbral de similitud para considerar un prompt como similar
};

/**
 * Calcula la similitud entre dos strings usando el coeficiente de Jaccard
 * @param {string} str1 - Primer string
 * @param {string} str2 - Segundo string
 * @returns {number} Valor de similitud entre 0 y 1
 */
const calculateSimilarity = (str1, str2) => {
  // Normalizar y tokenizar los strings
  const tokens1 = new Set(
    str1.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
  );
  
  const tokens2 = new Set(
    str2.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
  );
  
  // Calcular la intersección
  const intersection = new Set([...tokens1].filter(token => tokens2.has(token)));
  
  // Calcular la unión
  const union = new Set([...tokens1, ...tokens2]);
  
  // Calcular el coeficiente de Jaccard
  return intersection.size / union.size;
};

/**
 * Genera una clave de caché basada en el prompt y el contexto
 * @param {string} prompt - El prompt del usuario
 * @param {Object} context - El contexto de la solicitud
 * @returns {string} Clave de caché
 */
const generateCacheKey = (prompt, context = {}) => {
  // Extraer información relevante del contexto
  const { AI = 'GPT', currentModel = {} } = context;
  const modelName = currentModel.name || 'unknown';
  
  // Generar una clave única basada en el prompt y el contexto
  return `${AI}:${modelName}:${prompt}`;
};

/**
 * Busca una respuesta en caché para un prompt similar
 * @param {string} prompt - El prompt del usuario
 * @param {Object} context - El contexto de la solicitud
 * @returns {Object|null} Respuesta en caché o null si no se encuentra
 */
const findCachedResponse = (prompt, context = {}) => {
  const now = Date.now();
  const cacheKey = generateCacheKey(prompt, context);
  
  // Comprobar si hay una coincidencia exacta
  if (responseCache[cacheKey] && responseCache[cacheKey].expiry > now) {
    console.log('Cache hit: Exact match found');
    return responseCache[cacheKey].data;
  }
  
  // Buscar prompts similares
  for (const key in responseCache) {
    const cacheEntry = responseCache[key];
    
    // Ignorar entradas expiradas
    if (cacheEntry.expiry <= now) {
      continue;
    }
    
    // Extraer el prompt de la clave de caché
    const cachedPrompt = key.split(':').slice(2).join(':');
    
    // Calcular similitud
    const similarity = calculateSimilarity(prompt, cachedPrompt);
    
    if (similarity >= cacheConfig.similarityThreshold) {
      console.log(`Cache hit: Similar prompt found (similarity: ${similarity.toFixed(2)})`);
      return cacheEntry.data;
    }
  }
  
  return null;
};

/**
 * Almacena una respuesta en el caché
 * @param {string} prompt - El prompt del usuario
 * @param {Object} response - La respuesta de la IA
 * @param {Object} context - El contexto de la solicitud
 */
const cacheResponse = (prompt, response, context = {}) => {
  const cacheKey = generateCacheKey(prompt, context);
  const now = Date.now();
  
  // Almacenar la respuesta con tiempo de expiración
  responseCache[cacheKey] = {
    data: response,
    timestamp: now,
    expiry: now + cacheConfig.ttl
  };
  
  // Limpiar el caché si supera el tamaño máximo
  const cacheSize = Object.keys(responseCache).length;
  if (cacheSize > cacheConfig.maxSize) {
    pruneCache();
  }
};

/**
 * Elimina las entradas más antiguas o expiradas del caché
 */
const pruneCache = () => {
  const now = Date.now();
  const entries = Object.entries(responseCache);
  
  // Eliminar entradas expiradas
  const validEntries = entries.filter(([_, entry]) => entry.expiry > now);
  
  // Si aún hay demasiadas entradas, eliminar las más antiguas
  if (validEntries.length > cacheConfig.maxSize) {
    // Ordenar por timestamp (más antiguo primero)
    validEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Crear un nuevo caché con solo las entradas más recientes
    const newCache = {};
    validEntries.slice(-cacheConfig.maxSize).forEach(([key, value]) => {
      newCache[key] = value;
    });
    
    responseCache = newCache;
  } else {
    // Reconstruir el caché solo con entradas válidas
    responseCache = Object.fromEntries(validEntries);
  }
  
  console.log(`Cache pruned: ${entries.length} -> ${Object.keys(responseCache).length} entries`);
};

/**
 * Limpia completamente el caché
 */
const clearCache = () => {
  responseCache = {};
  console.log('Cache cleared');
};

/**
 * Actualiza la configuración del caché
 * @param {Object} newConfig - Nueva configuración
 */
const updateCacheConfig = (newConfig = {}) => {
  Object.assign(cacheConfig, newConfig);
  console.log('Cache configuration updated:', cacheConfig);
};

export {
  findCachedResponse,
  cacheResponse,
  clearCache,
  updateCacheConfig
};