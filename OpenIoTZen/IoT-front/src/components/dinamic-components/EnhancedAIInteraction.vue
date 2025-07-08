<template>
  <div class="ai-chat-bar" :class="{ open: isVisible }">
    <!-- Botón de activación -->
    <button
      class="ai-toggle-button"
      :aria-labelledby="$t('AIInteraction.tools')"
      aria-controls="menuai"
      :aria-expanded="isVisible"
      @click="toggleVisibility"
      type="button"
      :aria-label="$t('AIInteraction.openMenu')"
    >
      <div class="header-content">
        <q-icon name="smart_toy" size="24px" color="white" />
        <h3>{{ $t('AIInteraction.chatTitle') }}</h3>
      </div>
      <q-icon 
        :name="isVisible ? 'close' : 'smart_toy'" 
        size="24px" 
        color="white"
        class="close-button"
      />
    </button>

    <!-- Contenido del chat -->
    <div 
      v-if="isVisible" 
      class="ai-chat-content"
      id="menuai"
      :aria-hidden="!isVisible"
    >
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
                  <q-btn
                    flat
                    dense
                    round
                    icon="thumb_up"
                    size="sm"
                    color="positive"
                    @click="provideFeedback(message, true)"
                    :aria-label="$t('AIInteraction.feedbackHelpful')"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="thumb_down"
                    size="sm"
                    color="negative"
                    @click="provideFeedback(message, false)"
                    :aria-label="$t('AIInteraction.feedbackUnhelpful')"
                  />
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
        <q-chip
          v-for="(suggestion, index) in suggestions"
          :key="index"
          clickable
          @click="useSuggestion(suggestion)"
          class="suggestion-chip"
        >
          {{ suggestion }}
        </q-chip>
      </div>

      <!-- Entrada de texto -->
      <div class="input-container">
        <q-input
          v-model="aiPrompt"
          type="textarea"
          :placeholder="$t('AIInteraction.inputPlaceholder')"
          class="input"
          autogrow
          ref="promptInput"
          @keydown.enter.prevent="sendPromptToBackend"
          outlined
          dense
        >
          <template v-slot:after>
            <q-btn
              round
              flat
              icon="send"
              color="primary"
              :disable="!aiPrompt.trim() || isTyping"
              @click="sendPromptToBackend"
              :aria-label="$t('AIInteraction.sendButton')"
            />
          </template>
        </q-input>
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
  mounted() {
    // Inicializar sugerencias
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
          currentModel: this.currentModel,
          userData: this.contextData.userData
        });

        this.isTyping = false;

        // Verificar que la respuesta sea válida
        if (!response || !response.data) {
          throw new Error('Respuesta inválida del servidor');
        }

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

        // Actualizar el modelo en el store si la IA devuelve un modelo
        if (response.data.model) {
          try {
            // Actualizar el modelo en el store
            this.updateModelFromAI(response.data.model);

            // Emitir evento para notificar al componente padre
            this.$emit('modelUpdated', response.data.model);
          } catch (jsonError) {
            console.error("Error al procesar el modelo:", jsonError);
            this.messages.push({
              id: `error_${Date.now()}`,
              text: "Error al procesar la estructura del modelo. Por favor, intenta de nuevo.",
              user: false,
              timestamp: moment().format("HH:mm"),
              isError: true
            });
          }
        }

        this.scrollToBottom();

        // Actualizar sugerencias basadas en la respuesta
        this.generateContextualSuggestions(response.data.text || response.data.error || "");

      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        this.isTyping = false;

        // Mostrar mensaje de error en el chat
        this.messages.push({
          id: `error_${Date.now()}`,
          text: error.message || this.$t('AIInteraction.errorMessage') || "Error al procesar la solicitud. Por favor, intenta de nuevo.",
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
        // Obtener sugerencias del servicio de IA
        const suggestions = await aiService.getSuggestions({
        });

        if (suggestions && suggestions.length > 0) {
          this.suggestions = suggestions;
          return;
        }
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
      }

      // Sugerencias predeterminadas si falla el servicio
      this.suggestions = [
        "¿Cómo puedo empezar con IoT?",
        "Explícame qué es MQTT",
        "Recomienda sensores para mi proyecto"
      ];
    },

    async generateContextualSuggestions(responseText) {
      if (!responseText) return;

      try {
        // Generar sugerencias basadas en la respuesta de la IA
        const suggestions = await aiService.getSuggestions({
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
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  z-index: 912999;
  display: flex;
  flex-direction: column;
  transform: translateY(calc(100% - 60px));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.ai-chat-bar.open {
  transform: translateY(0);
}

.ai-toggle-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #2196f3;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  z-index: 2;
  border: none;
}

.ai-toggle-button:hover {
  background-color: #1976d2;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.ai-chat-content {
  display: flex;
  flex-direction: column;
  height: 500px;
  background-color: #f8f9fa;
}

.ai-chat-body {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user {
  flex-direction: row-reverse;
}

.message-content {
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 85%;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.user .message-content {
  background-color: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai .message-content {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-text pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

.message-text pre.json-code {
  background-color: rgba(0, 0, 0, 0.05);
  color: inherit;
}

.user .message-text pre {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-text a {
  color: inherit;
  text-decoration: underline;
}

.message-text code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

.user .message-text code {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.timestamp {
  color: inherit;
  opacity: 0.7;
}

.feedback-buttons {
  display: flex;
  gap: 4px;
}

.typing-indicator {
  display: flex;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 16px;
  width: fit-content;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.typing-indicator span {
  height: 6px;
  width: 6px;
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
  30% { transform: translateY(-3px); }
}

.suggestions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.suggestion-chip {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #e3f2fd;
  color: #1976d2;
}

.input-container {
  padding: 12px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.input {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .ai-chat-bar {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  .message-content {
    max-width: 90%;
  }
}
</style>
