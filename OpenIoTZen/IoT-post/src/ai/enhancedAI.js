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
    const { prompt, AI = "GPT", currentModel = {}, userData = {}, template = "" } = requestData;
    
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
    const processedContext = extractRelevantContext({ prompt, currentModel, userData });
    
    // 3. Buscar retroalimentación relevante
    const relevantFeedback = findRelevantFeedback(prompt);
    
    // 4. Seleccionar plantilla de prompt adecuada
    const templatePrompt = template ? template : selectPromptTemplate(prompt);
    
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
        { 
          role: "system", 
          content: `${systemPrompt}\n\nIMPORTANTE: Tu respuesta debe ser en formato JSON con la siguiente estructura:\n{
            "text": "Tu respuesta en texto plano",
            "Json": {
              "name": "Nombre del modelo",
              "fields": [
                {
                  "name": "nombre_campo",
                  "type": "tipo_campo",
                  "description": "descripción del campo"
                }
              ]
            }
          }`
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1800,
      response_format: { type: "json_object" }
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
        { 
          role: "system", 
<<<<<<< HEAD
          content: `${systemPrompt}\n\nIMPORTANTE: Tu respuesta debe ser en formato JSON con la siguiente estructura:\n{
            "text": "Tu respuesta en texto plano",
            "Json": {
              "name": "Nombre del modelo",
              "fields": [
                {
                  "name": "nombre_campo",
                  "type": "tipo_campo",
                  "description": "descripción del campo"
                }
              ]
            }
          }`
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
=======
          content: systemPrompt + "\nIMPORTANTE: Tu respuesta debe ser un JSON válido con la siguiente estructura:\n{\n  \"text\": \"tu explicación aquí\",\n  \"Json\": {\n    \"name\": \"nombre del modelo\",\n    \"fields\": [\n      {\n        \"name\": \"nombre del campo\",\n        \"type\": \"tipo del campo\",\n        \"required\": true/false,\n        \"fields\": []\n      }\n    ]\n  }\n}\n\nReglas para la generación del modelo:\n1. Mantén el modelo conciso y enfocado (máximo 8-10 campos principales)\n2. Agrupa información relacionada en campos de tipo Object\n3. Usa solo los tipos de datos básicos: String, Number, Boolean, Date, Object\n4. Marca como required solo los campos verdaderamente esenciales\n5. Evita campos redundantes o que puedan derivarse de otros\n6. Prioriza la simplicidad y la claridad sobre la exhaustividad" 
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
>>>>>>> d5400d713f195b3cff70d4a82df972cab384402c
      response_format: { type: "json_object" }
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Formato de respuesta de DeepSeek inválido.");

    try {
      const parsedResponse = JSON.parse(response);
      
      // Validar y ajustar el número de campos si es necesario
      if (parsedResponse.Json && parsedResponse.Json.fields) {
        if (parsedResponse.Json.fields.length > 10) {
          parsedResponse.Json.fields = parsedResponse.Json.fields.slice(0, 10);
          parsedResponse.text += "\n\nNota: Se han limitado los campos a los 10 más importantes para mantener el modelo conciso.";
        }
      }

      return {
        text: parsedResponse.text || "Modelo generado exitosamente",
        Json: parsedResponse.Json || {}
      };
    } catch (parseError) {
      console.error("Error al parsear la respuesta de DeepSeek:", parseError);
      return {
        text: "Error al procesar la respuesta de la IA. Por favor, intenta de nuevo.",
        Json: {}
      };
    }
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
    // Si la respuesta es un string vacío o null
    if (!response || typeof response !== 'string') {
      return {
        text: "No se recibió una respuesta válida.",
        error: true
      };
    }

    // Intentar parsear la respuesta como JSON
    try {
      const parsedResponse = JSON.parse(response);
      
      // Si la respuesta es un modelo directo (tiene name y fields)
      if (parsedResponse.name && Array.isArray(parsedResponse.fields)) {
        return {
          text: "He creado un modelo basado en tu descripción.",
          Json: parsedResponse
        };
      }
      
      // Si la respuesta ya tiene la estructura esperada
      if (parsedResponse.text && parsedResponse.Json) {
        return parsedResponse;
      }

      // Si la respuesta es otro tipo de JSON
      return {
        text: "He procesado tu solicitud.",
        Json: parsedResponse
      };
    } catch (jsonError) {
      console.error("Error al parsear JSON:", jsonError);
      
      // Si no es JSON válido, devolver como texto plano
      return {
        text: response,
        error: false
      };
    }
  } catch (error) {
    console.error("Error al procesar la respuesta:", error);
    return {
      text: response || "Ocurrió un error al procesar la respuesta.",
      error: true
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

const enhancedAI = {
  /**
   * Controlador para enviar prompts a DeepSeek
   */
  async sendToDeepSeek(req, res) {
    try {
      const { prompt, currentModel } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "El prompt es requerido" });
      }

      const response = await processAIRequest({
        prompt,
        AI: "DeepSeek",
        currentModel
      });

      if (response.error) {
        return res.status(400).json({ message: response.error });
      }

      return res.json(response);
    } catch (error) {
      console.error("Error en DeepSeek API:", error);
      return res.status(500).json({
        message: error.message || "Error al procesar la solicitud con DeepSeek"
      });
    }
  },

  /**
   * Controlador para enviar prompts a GPT
   */
  async sendToGPT(req, res) {
    try {
      const { prompt, currentModel } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "El prompt es requerido" });
      }

      const response = await processAIRequest({
        prompt,
        AI: "GPT",
        currentModel
      });

      if (response.error) {
        return res.status(400).json({ message: response.error });
      }

      return res.json(response);
    } catch (error) {
      console.error("Error en GPT API:", error);
      return res.status(500).json({
        message: error.message || "Error al procesar la solicitud con GPT"
      });
    }
  },

  /**
   * Controlador para recibir retroalimentación
   */
  async receiveFeedback(req, res) {
    try {
      const { prompt, response, helpful, comments } = req.body;
      
      // Aquí puedes implementar la lógica para almacenar el feedback
      console.log('Feedback recibido:', { prompt, response, helpful, comments });
      
      return res.json({ message: "Feedback recibido correctamente" });
    } catch (error) {
      console.error("Error al procesar feedback:", error);
      return res.status(500).json({ message: "Error al procesar el feedback" });
    }
  }
};

export default enhancedAI;