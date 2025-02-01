import OpenAI from "openai";

const GptAPIKey = process.env.AI_API_KEY;
const DeepSeekAPIKey = process.env.DEEPSEEK_API_KEY;
const systemPrompt = `You are a developer assistant. You generate Sequelize models based on user inputs. like this: {
    "name": "User",
    "fields": [
        {
            "name": "username",
            "type": "String",
            "required": true
        },
        {
            "name": "email",
            "type": "String",
            "required": true
        },
        {
            "name": "password",
            "type": "String",
            "required": true
        },
        {
            "name": "age",
            "type": "Number",
            "required": false
        }
    ]
}
    Try to separate the response in a JSON format divided in 2 properties, "text" and "Json", in the property "text" you should explain the changes and all that things.`;

const GptAPI = new OpenAI({
  apiKey: GptAPIKey,
  baseURL: "https://api.openai.com/v1", // URL base de la API
});

const DeepSeekAPI = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: DeepSeekAPIKey,
  });

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

    const response = completion.choices[0].message.content;
    const jsonResponse = selectJsonFromResponse(response);
    return jsonResponse;
  } catch (error) {
    console.error("Error en la API:", error);
    return {
      error: "An error occurred while processing your request.",
      details: error.message,
    };
  }
};

const sendToDeepSeek = async (userPrompt) => {
  try {
    
    const completion = await DeepSeekAPI.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "deepseek-chat",
    });
    const response = completion.choices[0].message.content;
    const jsonResponse = selectJsonFromResponse(response);
    return jsonResponse;
  } catch (error) {
    console.error("Error en la API DeepSeek:", error);
    return {
      error: "An error occurred while processing your request with DeepSeek.",
      details: error.message,
    };
  }
};

// Función que extrae el JSON de la respuesta generada
const selectJsonFromResponse = (response) => {
  try {
    const jsonStart = response.indexOf("{");
    const jsonEnd = response.lastIndexOf("}") + 1;
    const jsonString = response.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON from response:", error);
    return null;
  }
};

const controller = {
  sendToGPT,
  sendToDeepSeek,
};

export default controller;
