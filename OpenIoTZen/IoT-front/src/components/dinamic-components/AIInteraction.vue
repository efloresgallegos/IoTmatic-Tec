<template>
  <div class="ai-chat-bar" :class="{ open: isVisible }">
    <div class="ai-toggle-button" @click="toggleVisibility">
      <img src="../../assets/AIIcon.png" alt="AI Icon" class="ai-icon" />
    </div>
    
    <div v-if="isVisible" class="ai-chat-content">
      <div class="ai-chat-header">
        <h3>Chat con IA</h3>
        <button class="close-button" @click="toggleVisibility">&times;</button>
      </div>
      
      <div class="ai-chat-body" ref="chatContainer">
        <transition-group name="fade" tag="div">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['chat-message', message.user ? 'user' : 'ai']">
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <small class="timestamp">{{ message.timestamp }}</small>
            </div>
          </div>
        </transition-group>
      </div>
      
      <div class="input-container">
        <textarea v-model="aiPrompt" 
                  placeholder="Escribe un mensaje..." 
                  class="input"
                  rows="1"
                  @keyup.enter="sendPromptToBackend"></textarea>
        
        <q-btn @click="sendPromptToBackend"
               round flat color="primary" 
               :disable="!aiPrompt.trim()" 
               class="send-btn">
          <q-icon name="send" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import apiService from "src/boot/ApiServices/api.service";

export default {
  data() {
    return {
      aiPrompt: "",
      isVisible: false,
      messages: []
    };
  },
  methods: {
    async sendPromptToBackend() {
      if (!this.aiPrompt.trim()) return;

      const timestamp = moment().format("HH:mm");
      const userMessage = { text: this.aiPrompt, user: true, timestamp };
      this.messages.push(userMessage);
      this.aiPrompt = "";
      this.scrollToBottom();

      try {
        const response = await apiService.post("/ai/sendToAI", { 
          prompt: userMessage.text, 
          AI: "GPT" 
        });

        // Mostrar texto de respuesta
        const aiTextMessage = { 
          text: response.data.text, 
          user: false, 
          timestamp: moment().format("HH:mm") 
        };
        this.messages.push(aiTextMessage);

        // Emitir JSON si existe
        if (response.data.Json) {
          this.$emit('modelUpdated', response.data.Json);
        }

        this.scrollToBottom();
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        // Opcional: Mostrar mensaje de error en el chat
        this.messages.push({
          text: "Error al procesar la solicitud",
          user: false,
          timestamp: moment().format("HH:mm")
        });
      }
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
@import "../../css/dinamic-components/AIInteraction.css";
</style>
