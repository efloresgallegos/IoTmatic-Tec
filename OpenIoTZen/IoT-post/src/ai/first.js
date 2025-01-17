import OpenAI from "openai";

const apiKey = process.env.AI_API_KEY;
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
}`;

const api = new OpenAI({
  apiKey,
  baseURL: "https://api.openai.com/v1",  // URL base de la API
});

const sendToAI = async (userPrompt) => {
    try {
        const completion = await api.chat.completions.create({
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
        return { error: 'An error occurred while processing your request.', details: error.message };
    }
};

// Función que extrae el JSON de la respuesta generada
const selectJsonFromResponse = (response) => {
    try {
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}') + 1;
        const jsonString = response.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing JSON from response:", error);
        return null;
    }
};

// Controlador para manejar la solicitud HTTP
const controller = async (req, res) => {
    const { userPrompt } = req.body;  // Obtener el prompt del usuario desde el body de la solicitud
    const response = await sendToAI(userPrompt);  // Llamar a la función que genera la respuesta
    res.json({ response });  // Enviar la respuesta generada como JSON
};

export default { controller };