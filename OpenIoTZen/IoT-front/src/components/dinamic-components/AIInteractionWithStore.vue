<template>
  <div class="ai-chat-bar" :class="{ open: isVisible }" style="bottom: 120px; height: calc(100% - 120px);">
    <div class="ai-toggle-button" @click="toggleVisibility" style="bottom: 140px;">
      <img src="../../assets/AIIcon.png" alt="AI Icon" class="ai-icon" />
    </div>
    
    <div v-if="isVisible" class="ai-chat-content">
      <div class="ai-chat-header">
        <h3>{{ $t('AIInteraction.chatTitle') }}</h3>
        <button class="close-button" @click="toggleVisibility" :aria-label="$t('AIInteraction.closeChat')">&times;</button>
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
                  :placeholder="$t('AIInteraction.inputPlaceholder')" 
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
import { useModelStore } from "src/stores/model-store";
import { mapActions } from "pinia";

export default {
  props: {
    currentModel: {
      type: Object,
      default: () => ({
        name: "",
        fields: []
      })
    }
  },
  data() {
    return {
      aiPrompt: "",
      isVisible: false,
      messages: []
    };
  },
  methods: {
    ...mapActions(useModelStore, ['updateModelFromAI']),
    
    async sendPromptToBackend() {
      if (!this.aiPrompt.trim()) return;

      const timestamp = moment().format("HH:mm");
      const userMessage = { text: this.aiPrompt, user: true, timestamp };
      this.messages.push(userMessage);
      this.aiPrompt = "";
      this.scrollToBottom();

      try {
        // Enviar el modelo actual junto con el prompt para contexto
        const response = await apiService.post("/ai/sendToAI", { 
          prompt: userMessage.text, 
          AI: "DeepSeek",
          currentModel: this.currentModel,
          context: {
            modelType: "IoT",
            supportedFieldTypes: {
              invernaderoId: {
                type: "String",
                required: true,
                defaultValue: null,
                fields: []
              }
            },
            modelContext: {
              name: this.currentModel.name,
              description: this.currentModel.description,
              fields: this.currentModel.fields
            }
          }
        });

        // Mostrar texto de respuesta
        const aiTextMessage = { 
          text: response.data.text, 
          user: false, 
          timestamp: moment().format("HH:mm") 
        };
        this.messages.push(aiTextMessage);

        // Actualizar el modelo en el store si la IA devuelve un JSON
        if (response.data.Json) {
          // Actualizar el modelo en el store
          this.updateModelFromAI(response.data.Json);
          
          // Emitir evento para notificar al componente padre
          this.$emit('modelUpdated', response.data.Json);
        }

        this.scrollToBottom();
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        // Mostrar mensaje de error en el chat
        this.messages.push({
          text: this.$t('common.errorMessage'),
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

.ai-chat-bar {
  position: fixed;
  right: 0;
  width: 350px;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 999999;
  transition: transform 0.3s ease;
  transform: translateX(100%);
}

.ai-chat-bar.open {
  transform: translateX(0);
}

.ai-toggle-button {
  position: fixed;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999999;
  transition: transform 0.3s ease;
}
</style>