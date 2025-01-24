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
@import "../../css/dinamic-components/AIInteraction.css";
</style>
