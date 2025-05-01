/**
 * Sistema de IA mejorado para OpenIoTZen
 * Este módulo integra plantillas de prompts, procesamiento de contexto,
 * sistema de caché y retroalimentación para optimizar las interacciones con IA
 */

import OpenAI from "openai";
import { selectPromptTemplate } from "./promptTemplates.js";
import { extractRelevantContext, optimizePrompt } from "./contextProcessor.js";
import { findCachedResponse, cacheResponse } from "./responseCache.js";
import { findRelevantFeedback, enhancePromptWithFeedback, recordFeedback } from "./feedbackSystem.js";

// Configuración de APIs
const GptAPIKey = process.env.AI_API_KEY;
const DeepSeekAPIKey = process.env.DEEPSEEK_API_KEY;

if (!GptAPIKey) throw new Error("Missing OpenAI API Key.");
if (!DeepSeekAPIKey) throw new Error("Missing DeepSeek API Key.");

// Inicialización de APIs
const GptAPI = new OpenAI({
  apiKey: GptAPIKey,
  baseURL: "https://api.openai.com/v1",
});

const DeepSeekAPI = new OpenAI({
  apiKey: DeepSeekAPIKey,
  baseURL: "https://api.deepseek.com",
});

/**
 * Procesa una solicitud de IA con el sistema mejorado
 * @param {Object} requestData - Datos de la solicitud
 * @param {string} requestData.prompt - El prompt del usuario
 * @param {string} requestData.AI - El proveedor de IA a utilizar ("GPT" o "DeepSeek")
 * @param {Object} requestData.currentModel - El modelo actual (si existe)
 * @param {Object} requestData.userData - Datos del usuario (si están disponibles)
 * @returns {Object} Respuesta procesada
 */
const processAIRequest = async (requestData) => {
  try {
    const { prompt, AI = "GPT", currentModel = {}, userData = {}, supportedFieldTypes = {} } = requestData;
    
    if (!prompt) {
      return { error: "Se requiere un prompt." };
    }
    
    // 1. Buscar en caché para respuestas similares
    const cachedResponse = findCachedResponse(prompt, { AI, currentModel });
    if (cachedResponse) {
      console.log("Usando respuesta en caché");
      return cachedResponse;
    }
    
    // 2. Extraer contexto relevante
    const processedContext = extractRelevantContext({ prompt, currentModel, userData, supportedFieldTypes });
    
    // 3. Buscar retroalimentación relevante
    const relevantFeedback = findRelevantFeedback(prompt);
    
    // 4. Seleccionar plantilla de prompt adecuada
    const templatePrompt = selectPromptTemplate(prompt);
    
    // 5. Mejorar el prompt con retroalimentación
    const enhancedPrompt = enhancePromptWithFeedback(prompt, relevantFeedback);
    
    // 6. Optimizar el prompt final
    const optimizedPrompt = optimizePrompt(processedContext, templatePrompt);
    
    // 7. Enviar a la API de IA correspondiente
    let response;
    if (AI === "GPT") {
      response = await sendToGPT(enhancedPrompt, optimizedPrompt);
    } else if (AI === "DeepSeek") {
      response = await sendToDeepSeek(enhancedPrompt, optimizedPrompt);
    } else {
      return { error: "Proveedor de IA no válido. Use 'GPT' o 'DeepSeek'." };
    }
    
    // 8. Almacenar en caché para futuras solicitudes
    if (!response.error) {
      cacheResponse(prompt, response, { AI, currentModel });
    }
    
    return response;
  } catch (error) {
    console.error("Error en processAIRequest:", error);
    return {
      error: "Ocurrió un error al procesar la solicitud.",
      details: error.message
    };
  }
};

/**
 * Envía un prompt a la API de GPT
 * @param {string} userPrompt - El prompt mejorado del usuario
 * @param {string} systemPrompt - El prompt del sistema optimizado
 * @returns {Object} Respuesta procesada
 */
const sendToGPT = async (userPrompt, systemPrompt) => {
  try {
    const completion = await GptAPI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Formato de respuesta de API inválido.");

    return parseAIResponse(response);
  } catch (error) {
    console.error("Error en la API de OpenAI:", error);
    return { 
      error: "Ocurrió un error al procesar tu solicitud con OpenAI.", 
      details: error.message 
    };
  }
};

/**
 * Envía un prompt a la API de DeepSeek
 * @param {string} userPrompt - El prompt mejorado del usuario
 * @param {string} systemPrompt - El prompt del sistema optimizado
 * @returns {Object} Respuesta procesada
 */
const sendToDeepSeek = async (userPrompt, systemPrompt) => {
  try {
    const completion = await DeepSeekAPI.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Formato de respuesta de DeepSeek inválido.");

    return parseAIResponse(response);
  } catch (error) {
    console.error("Error en la API de DeepSeek:", error);
    return { 
      error: "Ocurrió un error al procesar tu solicitud con DeepSeek.", 
      details: error.message 
    };
  }
};

/**
 * Analiza y estructura la respuesta de la IA
 * @param {string} response - Respuesta en texto de la IA
 * @returns {Object} Respuesta estructurada
 */
const parseAIResponse = (response) => {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = response.match(/\{[\s\S]*\}/); 
    
    if (jsonMatch) {
      // Intentar parsear el JSON encontrado
      try {
        const parsedJson = JSON.parse(jsonMatch[0]);
        
        // Verificar si tiene la estructura esperada (text y Json)
        if (parsedJson.text && parsedJson.Json) {
          return parsedJson;
        } else {
          // Si tiene estructura JSON pero no el formato esperado
          return {
            text: response,
            Json: parsedJson
          };
        }
      } catch (jsonError) {
        // Si hay error al parsear el JSON, devolver el texto completo
        console.warn("Error al parsear JSON de la respuesta:", jsonError);
        return { text: response };
      }
    } else {
      // Si no se encuentra JSON, devolver el texto completo
      return { text: response };
    }
  } catch (error) {
    console.error("Error al procesar la respuesta:", error);
    return { 
      error: "Error al procesar la respuesta de la IA.",
      text: response 
    };
  }
};

/**
 * Registra retroalimentación sobre una respuesta de IA
 * @param {Object} feedbackData - Datos de retroalimentación
 * @returns {boolean} Éxito de la operación
 */
const submitFeedback = (feedbackData) => {
  return recordFeedback(feedbackData);
};

/**
 * Manejador de solicitudes para la API
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const sendToAI = async (req, res) => {
  try {
    const requestData = req.body;
    
    if (!requestData.prompt || !requestData.AI) {
      return res.status(400).json({ error: "Faltan parámetros requeridos." });
    }
    
    // Add support for field types
    const { supportedFieldTypes } = requestData;
    
    // Procesar la solicitud con el sistema mejorado
    const response = await processAIRequest(requestData);
    return res.json(response);
  } catch (error) {
    console.error("Error en sendToAI:", error);
    return res.status(500).json({
      error: "Ocurrió un error al procesar tu solicitud.",
      details: error.message
    });
  }
};

/**
 * Manejador para recibir retroalimentación del usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const receiveFeedback = (req, res) => {
  try {
    const feedbackData = req.body;
    
    if (!feedbackData.promptId || !feedbackData.rating) {
      return res.status(400).json({ error: "Faltan parámetros requeridos para la retroalimentación." });
    }
    
    const success = submitFeedback(feedbackData);
    
    if (success) {
      return res.json({ success: true, message: "Retroalimentación registrada correctamente." });
    } else {
      return res.status(500).json({ error: "Error al registrar la retroalimentación." });
    }
  } catch (error) {
    console.error("Error en receiveFeedback:", error);
    return res.status(500).json({
      error: "Ocurrió un error al procesar la retroalimentación.",
      details: error.message
    });
  }
};

export default { 
  sendToAI,
  receiveFeedback,
  processAIRequest
};