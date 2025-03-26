import OpenAI from "openai";

const GptAPIKey = process.env.AI_API_KEY;
const DeepSeekAPIKey = process.env.DEEPSEEK_API_KEY;

if (!GptAPIKey) throw new Error("Missing OpenAI API Key.");
if (!DeepSeekAPIKey) throw new Error("Missing DeepSeek API Key.");

const systemPrompt = `Eres un asistente de desarrollo. Generas modelos de Sequelize basados en las entradas del usuario, como este: {
  "name": "Usuario",
  "fields": [
    {
      "name": "nombreDeUsuario",
      "type": "String",
      "required": true
    },
    {
      "name": "edad",
      "type": "Number",
      "required": false
    },
    {
      "name": "configuraciones",
      "type": "Object",
      "required": false,
      "fields": [
        {
          "name": "tema",
          "type": "String",
          "required": false
        },
        {
          "name": "notificaciones",
          "type": "Boolean",
          "required": true
        }
      ]
    }
  ]
}
Intenta separar la respuesta en un formato JSON dividido en dos propiedades, "texto" y "Json". La propiedad "texto" debe explicar los cambios. Asegúrate de que todo esté en español.`;

// Inicialización de APIs
const GptAPI = new OpenAI({
  apiKey: GptAPIKey,
  baseURL: "https://api.openai.com/v1",
});

const DeepSeekAPI = new OpenAI({
  apiKey: DeepSeekAPIKey,
  baseURL: "https://api.deepseek.com",
});

// Función para enviar prompt a GPT
const sendToGPT = async (userPrompt) => {
  try {
    const completion = await GptAPI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion?.choices?.[0]?.message?.content;
    if (!response) throw new Error("Invalid API response format.");

    return selectJsonFromResponse(response);
  } catch (error) {
    console.error("Error in OpenAI API:", error);
    return { error: "An error occurred while processing your request.", details: error.message };
  }
};

// Función para enviar prompt a DeepSeek
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

    return selectJsonFromResponse(response);
  } catch (error) {
    console.error("Error in DeepSeek API:", error);
    return { error: "An error occurred while processing your request with DeepSeek.", details: error.message };
  }
};

// Función que extrae el JSON de la respuesta generada
const selectJsonFromResponse = (response) => {
  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response.");
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Error parsing JSON from response:", error);
    return { error: "Failed to parse JSON response." };
  }
};

// Manejador de solicitudes
const sendToAI = async (req, res) => {
  try {
    const { prompt: userPrompt, AI } = req.body;

    if (!userPrompt || !AI) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    let response;
    switch (AI) {
      case "GPT":
        response = await sendToGPT(userPrompt);
        break;
      case "DeepSeek":
        response = await sendToDeepSeek(userPrompt);
        break;
      default:
        return res.status(400).json({ error: "Invalid AI specified. Use 'GPT' or 'DeepSeek'." });
    }

    return res.json(response);
  } catch (error) {
    console.error("Error in sendToAI:", error);
    return res.status(500).json({
      error: "An error occurred while processing your request.",
      details: error.message
    });
  }
};

export default { sendToAI };
