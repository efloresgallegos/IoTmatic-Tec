<template>
  <div class="ai-chat-bar" :class="{ open: isVisible }">
    <!-- Botón de activación -->
    <div class="ai-toggle-button" @click="toggleVisibility" :aria-label="$t('AIInteraction.toggleChat')">
      <img src="../../assets/AIIcon.png" alt="AI Icon" class="ai-icon" />
    </div>

    <!-- Contenido del chat -->
    <div v-if="isVisible" class="ai-chat-content">
      <!-- Encabezado -->
      <div class="ai-chat-header">
        <h3>{{ $t('AIInteraction.chatTitle') }}</h3>
        <button class="close-button" @click="toggleVisibility" :aria-label="$t('AIInteraction.closeChat')">&times;</button>
      </div>

      <!-- Selector de plantillas -->
      <div class="template-selector">
        <label for="template-select">{{ $t('AIInteraction.templateLabel') }}</label>
        <select id="template-select" v-model="selectedTemplate" class="template-select">
          <option value="general">{{ $t('AIInteraction.templates.general') }}</option>
          <option value="modelCreation">{{ $t('AIInteraction.templates.modelCreation') }}</option>
          <option value="dataAnalysis">{{ $t('AIInteraction.templates.dataAnalysis') }}</option>
          <option value="deviceConfig">{{ $t('AIInteraction.templates.deviceConfig') }}</option>
          <option value="troubleshooting">{{ $t('AIInteraction.templates.troubleshooting') }}</option>
        </select>
      </div>

      <!-- Cuerpo del chat -->
      <div class="ai-chat-body" ref="chatContainer">
        <transition-group name="fade" tag="div">
          <div v-for="(message, index) in messages" :key="index"
               :class="['chat-message', message.user ? 'user' : 'ai']">
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.text)"></div>
              <div class="message-footer">
                <small class="timestamp">{{ message.timestamp }}</small>

                <!-- Botones de retroalimentación para mensajes de IA -->
                <div v-if="!message.user && !message.feedbackGiven" class="feedback-buttons">
                  <button @click="provideFeedback(message, true)" class="feedback-btn positive" :aria-label="$t('AIInteraction.feedbackHelpful')">
                    <i class="fas fa-thumbs-up"></i>
                  </button>
                  <button @click="provideFeedback(message, false)" class="feedback-btn negative" :aria-label="$t('AIInteraction.feedbackUnhelpful')">
                    <i class="fas fa-thumbs-down"></i>
                  </button>
                </div>
                <div v-else-if="!message.user && message.feedbackGiven" class="feedback-thanks">
                  {{ $t('AIInteraction.feedbackThanks') }}
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Indicador de escritura -->
        <div v-if="isTyping" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Sugerencias rápidas -->
      <div v-if="suggestions.length > 0" class="suggestions-container">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-chip"
          @click="useSuggestion(suggestion)">
          {{ suggestion }}
        </div>
      </div>

      <!-- Entrada de texto -->
      <div class="input-container">
        <textarea
          v-model="aiPrompt"
          :placeholder="$t('AIInteraction.inputPlaceholder')"
          class="input"
          rows="1"
          ref="promptInput"
          @input="autoResizeTextarea"
          @keydown.enter.prevent="sendPromptToBackend"></textarea>

        <q-btn
          @click="sendPromptToBackend"
          round
          flat
          color="primary"
          :disable="!aiPrompt.trim() || isTyping"
          class="send-btn"
          :aria-label="$t('AIInteraction.sendButton')">
          <q-icon name="send" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { useModelStore } from "src/stores/model-store";
import { mapActions } from "pinia";
import aiService from "../../services/ai.service";

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
      messages: [],
      isTyping: false,
      selectedTemplate: "general",
      suggestions: [],
      promptHistory: [],
      historyIndex: -1
    };
  },
  computed: {
    contextData() {
      return {
        currentModel: this.currentModel,
        userData: {
          expertise: localStorage.getItem('userExpertise') || 'intermediate',
          preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
        }
      };
    }
  },
  watch: {
    selectedTemplate() {
      this.updateSuggestions();
    }
  },
  mounted() {
    // Inicializar sugerencias basadas en la plantilla seleccionada
    this.updateSuggestions();

    // Escuchar eventos de teclado para navegación del historial
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    ...mapActions(useModelStore, ['updateModelFromAI']),

    async sendPromptToBackend() {
      if (!this.aiPrompt.trim() || this.isTyping) return;

      const timestamp = moment().format("HH:mm");
      const promptId = `prompt_${Date.now()}`;
      const userMessage = {
        id: promptId,
        text: this.aiPrompt,
        user: true,
        timestamp
      };

      // Guardar en historial
      this.promptHistory.push(this.aiPrompt);
      this.historyIndex = this.promptHistory.length;

      this.messages.push(userMessage);
      this.aiPrompt = "";
      this.scrollToBottom();
      this.isTyping = true;

      try {
        // Enviar el modelo actual junto con el prompt para contexto
        const response = await aiService.sendToAI({
          prompt: userMessage.text,
          AI: "GPT",
          currentModel: this.currentModel,
          template: this.selectedTemplate,
          userData: this.contextData.userData
        });

        this.isTyping = false;

        // Mostrar texto de respuesta
        const aiTextMessage = {
          id: `response_${Date.now()}`,
          promptId: promptId,
          text: response.data.text || response.data.error || "No se pudo procesar la respuesta",
          user: false,
          timestamp: moment().format("HH:mm"),
          feedbackGiven: false
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

        // Actualizar sugerencias basadas en la respuesta
        this.generateContextualSuggestions(response.data.text);
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        this.isTyping = false;

        // Mostrar mensaje de error en el chat
        this.messages.push({
          id: `error_${Date.now()}`,
          text: "Error al procesar la solicitud. Por favor, intenta de nuevo.",
          user: false,
          timestamp: moment().format("HH:mm"),
          isError: true
        });

        this.scrollToBottom();
      }
    },

    toggleVisibility() {
      this.isVisible = !this.isVisible;
      if (this.isVisible) {
        this.$nextTick(() => {
          this.$refs.promptInput?.focus();
          this.scrollToBottom();
        });
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    formatMessage(text) {
      if (!text) return '';

      // Convertir URLs en enlaces clicables
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let formattedText = text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);

      // Convertir saltos de línea en <br>
      formattedText = formattedText.replace(/\n/g, '<br>');

      return formattedText;
    },

    provideFeedback(message, isPositive) {
      // Marcar que se ha dado retroalimentación
      message.feedbackGiven = true;

      // Enviar retroalimentación al backend
      aiService.sendFeedback({
        prompt: this.messages.find(m => m.id === message.promptId)?.text || '',
        response: message.text,
        helpful: isPositive,
        comments: isPositive ? 'útil' : 'no útil'
      }).catch(error => {
        console.error("Error al enviar retroalimentación:", error);
      });
    },

    async updateSuggestions() {
      try {
        // Obtener sugerencias del servicio de IA basadas en la plantilla seleccionada
        const suggestions = await aiService.getSuggestions({
          template: this.selectedTemplate
        });

        if (suggestions && suggestions.length > 0) {
          this.suggestions = suggestions;
          return;
        }
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
      }

      // Sugerencias predeterminadas si falla el servicio
      switch (this.selectedTemplate) {
        case 'modelCreation':
          this.suggestions = [
            "Crea un modelo para un sensor de temperatura",
            "Necesito un modelo para datos de usuario",
            "Modifica mi modelo para añadir geolocalización"
          ];
          break;
        case 'dataAnalysis':
          this.suggestions = [
            "Analiza estos datos de humedad",
            "¿Qué tendencias ves en estos valores?",
            "Compara estos resultados con los estándares"
          ];
          break;
        case 'deviceConfig':
          this.suggestions = [
            "Configura un ESP32 para medir temperatura",
            "¿Cómo conecto mi sensor a la red?",
            "Optimiza el consumo de batería"
          ];
          break;
        case 'troubleshooting':
          this.suggestions = [
            "Mi sensor no envía datos",
            "Error de conexión en mi dispositivo",
            "Problemas de precisión en las mediciones"
          ];
          break;
        default:
          this.suggestions = [
            "¿Cómo puedo empezar con IoT?",
            "Explícame qué es MQTT",
            "Recomienda sensores para mi proyecto"
          ];
      }
    },

    async generateContextualSuggestions(responseText) {
      if (!responseText) return;

      try {
        // Generar sugerencias basadas en la respuesta de la IA
        const suggestions = await aiService.getSuggestions({
          template: this.selectedTemplate,
          context: responseText
        });

        if (suggestions && suggestions.length > 0) {
          this.suggestions = suggestions;
          return;
        }
      } catch (error) {
        console.error('Error al generar sugerencias contextuales:', error);
      }

      // Palabras clave para generar sugerencias contextuales si falla el servicio
      const keywords = {
        'sensor': ['¿Qué sensores recomiendas?', '¿Cómo calibro este sensor?'],
        'temperatura': ['¿Qué rango de temperatura es óptimo?', '¿Cómo afecta la temperatura a otros sensores?'],
        'conexión': ['¿Cómo mejoro la estabilidad de conexión?', '¿Qué protocolo es mejor para mi caso?'],
        'batería': ['¿Cómo optimizo el consumo de energía?', '¿Qué batería recomiendas?'],
        'datos': ['¿Cómo almaceno estos datos?', '¿Qué formato es mejor para transferir estos datos?'],
        'error': ['¿Cómo soluciono este error?', '¿Es un problema común?']
      };

      const lowercaseResponse = responseText.toLowerCase();
      let contextualSuggestions = [];

      // Buscar palabras clave en la respuesta
      Object.entries(keywords).forEach(([keyword, suggestions]) => {
        if (lowercaseResponse.includes(keyword) && suggestions.length > 0) {
          // Añadir una sugerencia aleatoria relacionada con la palabra clave
          const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          contextualSuggestions.push(randomSuggestion);
        }
      });

      // Limitar a 3 sugerencias y mezclar con algunas generales si es necesario
      if (contextualSuggestions.length > 3) {
        contextualSuggestions = contextualSuggestions.slice(0, 3);
      } else if (contextualSuggestions.length < 3) {
        // Añadir algunas sugerencias generales si no hay suficientes contextuales
        const generalSuggestions = [
          "¿Puedes explicar más sobre esto?",
          "¿Hay alternativas a considerar?",
          "¿Cómo implemento esta solución?"
        ];

        while (contextualSuggestions.length < 3 && generalSuggestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * generalSuggestions.length);
          contextualSuggestions.push(generalSuggestions.splice(randomIndex, 1)[0]);
        }
      }

      this.suggestions = contextualSuggestions;
    },

    useSuggestion(suggestion) {
      this.aiPrompt = suggestion;
      this.$nextTick(() => {
        this.$refs.promptInput?.focus();
      });
    },

    autoResizeTextarea() {
      const textarea = this.$refs.promptInput;
      if (!textarea) return;

      // Restablecer altura para medir correctamente
      textarea.style.height = 'auto';

      // Establecer nueva altura basada en el contenido (con un máximo)
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    },

    handleKeyDown(event) {
      // Solo procesar si el chat está visible y el input tiene el foco
      if (!this.isVisible || document.activeElement !== this.$refs.promptInput) return;

      // Navegar por el historial con las flechas arriba/abajo
      if (event.key === 'ArrowUp' && this.historyIndex > 0) {
        this.historyIndex--;
        this.aiPrompt = this.promptHistory[this.historyIndex];
        this.$nextTick(() => this.autoResizeTextarea());
      } else if (event.key === 'ArrowDown' && this.historyIndex < this.promptHistory.length - 1) {
        this.historyIndex++;
        this.aiPrompt = this.promptHistory[this.historyIndex];
        this.$nextTick(() => this.autoResizeTextarea());
      } else if (event.key === 'ArrowDown' && this.historyIndex === this.promptHistory.length - 1) {
        // Limpiar el input si estamos al final del historial y presionamos abajo
        this.historyIndex = this.promptHistory.length;
        this.aiPrompt = '';
      }
    }
  }
};
</script>

<style>
.ai-chat-bar {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 912999; /* Aumentado de 2005 a 9999 */
  display: flex;
  flex-direction: column;
  border-radius: 10px 0 0 10px;
}

.ai-toggle-button {
  position: absolute;
  top: 20px;
  left: -60px;
  width: 60px;
  height: 60px;
  background-color: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  z-index: 9998; /* Asegurar que el botón también tenga alto z-index */
}

.ai-toggle-button:hover {
  transform: scale(1.05);
  background-color: #1976d2;
}

.ai-chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #2196f3;
  color: white;
  border-radius: 10px 0 0 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-button:hover {
  transform: scale(1.1);
}

.template-selector {
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.template-selector label {
  margin-right: 10px;
  font-size: 14px;
  color: #555;
}

.template-select {
  flex-grow: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.ai-chat-body {
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
  background-color: #f9f9f9;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user {
  flex-direction: row-reverse;
  text-align: right;
}

.ai {
  flex-direction: row;
  text-align: left;
}

.message-content {
  padding: 12px 15px;
  border-radius: 18px;
  max-width: 85%;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.user .message-content {
  background-color: #e3f2fd;
  border-bottom-right-radius: 4px;
}

.ai .message-content {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.message-text a {
  color: #2196f3;
  text-decoration: underline;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.timestamp {
  color: #9e9e9e;
}

.feedback-buttons {
  display: flex;
  gap: 8px;
}

.feedback-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.feedback-btn.positive:hover {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.feedback-btn.negative:hover {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
}

.feedback-thanks {
  font-size: 11px;
  color: #9e9e9e;
  font-style: italic;
}

.typing-indicator {
  display: flex;
  padding: 12px 15px;
  background-color: #ffffff;
  border-radius: 18px;
  width: fit-content;
  margin-bottom: 15px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #9e9e9e;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: bounce 1.3s linear infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.suggestions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.suggestion-chip {
  background-color: #e0e0e0;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-chip:hover {
  background-color: #d5d5d5;
  transform: translateY(-1px);
}

.input-container {
  display: flex;
  align-items: flex-end;
  padding: 10px 15px 15px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 0 10px;
}

.input {
  flex-grow: 1;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 14px;
  line-height: 1.4;
  max-height: 150px;
  overflow-y: auto;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #2196f3;
}

.send-btn {
  margin-left: 10px;
  background-color: #2196f3 !important;
  color: white !important;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background-color: #1976d2 !important;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #e0e0e0 !important;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .ai-chat-bar {
    width: 100%;
    border-radius: 0;
  }

  .ai-toggle-button {
    top: auto;
    bottom: 20px;
    left: 20px;
  }

  .message-content {
    max-width: 90%;
  }
}
</style>
