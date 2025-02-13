import Conversation from "../models/conversations.model.js";
import { Op } from "sequelize";

const saveMessages = async (userId, prompt, aiResponse) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Buscar si ya existe una conversación del día
        let conversation = await Conversation.findOne({
            where: {
                user_id: userId,
                date: today
            }
        });

        const newMessage = {
            timestamp: new Date().toISOString(),
            prompt,
            response: aiResponse.text,
            response_json: aiResponse.Json || null
        };

        if (conversation) {
            // Si la conversación ya existe, agregamos el nuevo mensaje al JSON
            const updatedMessages = [...conversation.messages, newMessage];
            await conversation.update({ messages: updatedMessages });
        } else {
            // Si no existe, creamos una nueva conversación
            await Conversation.create({
                user_id: userId,
                date: today,
                messages: [newMessage],
                ai_model: "GPT"
            });
        }

        console.log("Mensaje guardado correctamente.");
    } catch (error) {
        console.error("Error al guardar la conversación:", error);
    }
};

const getMessages = async (userId, date) => {
    try {
        const conversation = await Conversation.findOne({
            where: {
                user_id: userId,
                date
            }
        });

        if (!conversation) {
            return { error: "No conversation found." };
        }

        return conversation.messages;
    } catch (error) {
        console.error("Error al obtener la conversación:", error);
        return { error: "An error occurred while processing your request." };
    }
}

const updateMessages = async (userId, date, messages) => {
    try {
        const conversation = await Conversation.findOne({
            where: {
                user_id: userId,
                date
            }
        });

        if (!conversation) {
            return { error: "No conversation found." };
        }

        await conversation.update({ messages });
        return { message: "Conversation updated successfully." };
    } catch (error) {
        console.error("Error al actualizar la conversación:", error);
        return { error: "An error occurred while processing your request." };
    }
}

export default {
    saveMessages,
    getMessages,
    updateMessages
};