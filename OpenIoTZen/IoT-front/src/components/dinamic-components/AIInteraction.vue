<template>
  <div class="ai-chat-bar" :class="{ open: isVisible }">
    <div class="ai-toggle-button" @click="toggleVisibility">
      <img src="../../assets/AIIcon.png" alt="AI Icon" class="ai-icon" />
    </div>
    <div v-if="isVisible" class="ai-chat-content">
      <div class="ai-chat-header">
        <h3>{{ $t("views.modelCreator.AIInteraction.aiPromptTitle") }}</h3>
        <button class="close-button" @click="toggleVisibility">&times;</button>
      </div>
      <div class="ai-chat-body">
        <transition-group name="fade" tag="div">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['chat-message', message.user ? 'user' : 'ai']"
          >
            <div class="message-icon">
              <q-avatar>
                <q-icon :name="message.user ? 'person' : 'smart_toy'" size="sm" />
              </q-avatar>
            </div>
            <div class="message-content">
              <p>{{ message.text }}</p>
              <div v-if="message.status" class="message-info">
                <small>
                  {{ message.status === 'error' ? $t("views.modelCreator.AIInteraction.errorPromptRequired") : $t("views.modelCreator.AIInteraction.aiSubmitButton") }}
                </small>
                <span class="timestamp">{{ message.timestamp }}</span>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Área de cambios generados por la IA -->
        <div v-if="aiChanges">
          <h4>{{ $t("views.modelCreator.AIInteraction.aiChangesTitle") }}</h4>
          <p>{{ $t("views.modelCreator.AIInteraction.aiChangesDescription") }}</p>
          <pre>{{ JSON.stringify(aiChanges, null, 2) }}</pre>
          <div v-if="hasChanges">
            <button @click="applyChanges">
              {{ $t("views.modelCreator.AIInteraction.applyChangesButton") }}
            </button>
          </div>
        </div>
      </div>

      <div class="input-container">
        <textarea
          v-model="aiPrompt"
          :placeholder="$t('views.modelCreator.AIInteraction.aiPromptPlaceholder')"
          class="input small-input"
          rows="1"
        ></textarea>
        <q-btn
          @click="sendPromptToBackend"
          round
          flat
          color="primary"
          :disable="!aiPrompt.trim()"
          class="send-btn"
        >
          <q-icon name="send" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

export default {
  data() {
    return {
      aiPrompt: "",
      isVisible: false,
      messages: [],
      currentModel: {}, // JSON actual del modelo
      aiChanges: null,  // JSON generado por la IA
    };
  },
  computed: {
    hasChanges() {
      // Compara el JSON actual con los cambios generados por la IA
      return JSON.stringify(this.currentModel) !== JSON.stringify(this.aiChanges);
    },
  },
  methods: {
    async sendPromptToBackend() {
      const timestamp = moment().format("HH:mm");
      const newMessage = { text: this.aiPrompt, user: true, status: "sending", timestamp };

      this.messages.push(newMessage);
      const messageIndex = this.messages.length - 1;

      try {
        const response = await axios.post("/api/ai/editModel", { prompt: this.aiPrompt });

        this.messages[messageIndex].status = "sent";
        this.messages.push({
          text: response.data,
          user: false,
          timestamp,
        });

        this.aiChanges = response.data; // Almacenar los cambios generados por la IA
        this.currentModel = { ...this.currentModel }; // Aseguramos que el modelo actual se mantenga

        this.aiPrompt = "";
      } catch (error) {
        console.error("Error al enviar el prompt:", error);
        this.messages[messageIndex].status = "error";
      }
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },
    applyChanges() {
      if (this.hasChanges) {
        // Aplica los cambios generados por la IA
        this.currentModel = { ...this.aiChanges };
        alert("Cambios aplicados exitosamente.");
      }
    },
  },
};
</script>

<style scoped>
.ai-chat-bar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 2005;
  display: flex;
  flex-direction: column;
}

.ai-chat-bar.open {
  transform: translateX(0);
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
  padding: 15px;
  background-color: #2196f3;
  color: white;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.ai-chat-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.user {
  flex-direction: row-reverse;
  text-align: right;
}

.ai {
  flex-direction: row;
  text-align: left;
}

.message-icon {
  margin: 0 10px;
}

.message-content {
  background-color: #e0f7fa;
  padding: 10px;
  border-radius: 10px;
  max-width: 80%;
  position: relative;
}

.user .message-content {
  background-color: #e0f7fa;
}

.ai .message-content {
  background-color: #f1f8e9;
}

.message-info {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
  font-size: 0.8em;
  color: gray;
}

.timestamp {
  display: block;
  font-size: 0.8em;
  color: gray;
  margin-top: 5px;
}

.input-container {
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}

.input {
  flex-grow: 1;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
}

.small-input {
  width: 70%;
}

.send-btn {
  margin-left: 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
