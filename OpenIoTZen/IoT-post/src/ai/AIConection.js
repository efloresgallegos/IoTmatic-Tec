import OpenAI from "openai";

const GptAPIKey = process.env.AI_API_KEY;
const DeepSeekAPIKey = process.env.DEEPSEEK_API_KEY;

if (!GptAPIKey) throw new Error("Missing OpenAI API Key.");
if (!DeepSeekAPIKey) throw new Error("Missing DeepSeek API Key.");

const systemPrompt = `Eres un asistente especializado en generar modelos de datos para sistemas IoT. 
Tu tarea es crear modelos JSON basados en las descripciones del usuario.

Ejemplo de formato de respuesta:
{
  "text": "Explicación del modelo generado",
  "model": {
    "name": "NombreDelModelo",
    "fields": [
      {
        "name": "campo1",
        "type": "TipoDeDato",
        "required": true/false
      }
    ]
  }
}

Tipos de datos disponibles: String, Number, Float, Boolean, Date, Text, UUID, JSON, Array, Object
Asegúrate de que la respuesta sea un objeto JSON válido con las propiedades "text" y "model".`;

// Inicialización de APIs
const GptAPI = new OpenAI({
  apiKey: GptAPIKey,
  baseURL: "https://api.openai.com/v1",
});

const DeepSeekAPI = new OpenAI({
  apiKey: DeepSeekAPIKey,
  baseURL: "https://api.deepseek.com",
});

// Función para enviar prompt a DeepSeek (modelo por defecto)
const sendToDeepSeek = async (userPrompt) => {
  try {
    const completion = await DeepSeekAPI.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Invalid DeepSeek response format.");

    return parseResponse(response);
  } catch (error) {
    console.error("Error in DeepSeek API:", error);
    // Si falla DeepSeek, intentamos con GPT como respaldo
    return sendToGPT(userPrompt);
  }
};

// Función de respaldo para GPT
const sendToGPT = async (userPrompt) => {
  try {
    const completion = await GptAPI.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Invalid API response format.");

    return parseResponse(response);
  } catch (error) {
    console.error("Error in OpenAI API:", error);
    return { error: "Error al procesar la solicitud.", details: error.message };
  }
};

// Función para parsear la respuesta
const parseResponse = (response) => {
  try {
    const parsedResponse = JSON.parse(response);
    
    // Verificar si tiene la estructura esperada
    if (parsedResponse.text && parsedResponse.model) {
      return parsedResponse;
    }
    
    // Si solo tiene el modelo directamente
    if (parsedResponse.name && Array.isArray(parsedResponse.fields)) {
      return {
        text: "Modelo generado correctamente.",
        model: parsedResponse
      };
    }
    
    throw new Error("Formato de respuesta inválido");
  } catch (error) {
    console.error("Error parsing response:", error);
    return { 
      error: "Error al procesar la respuesta de la IA.",
      rawResponse: response
    };
  }
};

// Manejador de solicitudes
const sendToAI = async (req, res) => {
  try {
    const { prompt: userPrompt, currentModel } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Falta el prompt del usuario." });
    }

    // Enriquecer el prompt con el contexto del modelo actual si existe
    let enhancedPrompt = userPrompt;
    if (currentModel && currentModel.name) {
      enhancedPrompt = `Modelo actual: ${JSON.stringify(currentModel)}\n\nSolicitud: ${userPrompt}`;
    }

    // Usar DeepSeek por defecto, con GPT como respaldo
    const response = await sendToDeepSeek(enhancedPrompt);
    return res.json(response);
  } catch (error) {
    console.error("Error in sendToAI:", error);
    return res.status(500).json({
      error: "Error al procesar la solicitud.",
      details: error.message
    });
  }
};

export default { sendToAI };
