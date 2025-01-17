<template>
  <div
    class="ai-floating-ball"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @click="toggleVisibility"
    :style="{ top: `${positionY}px`, left: `${positionX}px` }"
  >
    <img src="../..//assets/AIIcon.png" alt="AI Icon" class="ai-icon" />
    <div v-if="isVisible" class="ai-interaction" @mousedown.stop>
      <h3>{{ $t("views.modelCreator.aiPromptTitle") }}</h3>

      <textarea
        v-model="aiPrompt"
        :placeholder="$t('views.modelCreator.aiPromptPlaceholder')"
        class="input"
        rows="4"
        @click.stop
      ></textarea>
      <button @click="sendPromptToBackend" class="btn-submit" @click.stop>
        {{ $t("views.modelCreator.aiSubmitButton") }}
      </button>

      <!-- Mostrar los cambios de la IA -->
      <div v-if="aiModel && aiModel !== currentModel" class="ai-model-changes">
        <h4>{{ $t("views.modelCreator.aiChangesTitle") }}</h4>
        <p>{{ $t("views.modelCreator.aiChangesDescription") }}</p>
        <pre v-if="aiModel && Object.keys(aiModel).length > 0">{{ formattedAiModel }}</pre>
        <button v-if="aiModel && Object.keys(aiModel).length > 0" @click="applyChanges" @click.stop>
          {{ $t("views.modelCreator.applyChangesButton") }}
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  props: {
    currentModel: Object,
  },
  data() {
    return {
      aiPrompt: "",
      aiModel: null,
      isVisible: false,
      dragging: false,
      positionX: window.innerWidth - 80, // Default to bottom-right
      positionY: window.innerHeight - 80,
      offsetX: 0,
      offsetY: 0,
    };
  },
  computed: {
    formattedAiModel() {
      return JSON.stringify(this.aiModel, null, 2);
    },
  },
  methods: {
    async sendPromptToBackend() {
      try {
        if (!this.aiPrompt.trim()) {
          alert(this.$t("views.modelCreator.errorPromptRequired"));
          return;
        }

        const response = await axios.post("/api/ai/editModel", {
          prompt: this.aiPrompt,
          model: this.currentModel,
        });

        this.aiModel = response.data;
      } catch (error) {
        console.error("Error al enviar el prompt:", error);
        alert(this.$t("views.modelCreator.errorProcessingPrompt"));
      }
    },
    applyChanges() {
      this.$emit("modelUpdated", this.aiModel);
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },
    startDrag(event) {
      this.dragging = true;
      const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
      const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
      this.offsetX = clientX - this.positionX;
      this.offsetY = clientY - this.positionY;

      window.addEventListener("mousemove", this.drag);
      window.addEventListener("mouseup", this.stopDrag);
      window.addEventListener("touchmove", this.drag);
      window.addEventListener("touchend", this.stopDrag);
    },
    drag(event) {
      if (this.dragging) {
        const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
        const newX = clientX - this.offsetX;
        const newY = clientY - this.offsetY;

        // Ajustar los límites para permitir el movimiento completo
        this.positionX = Math.max(0, Math.min(newX, window.innerWidth - 60));
        this.positionY = Math.max(0, Math.min(newY, window.innerHeight - 60));
        event.preventDefault();
      }
    },
    stopDrag() {
      this.dragging = false;
      window.removeEventListener("mousemove", this.drag);
      window.removeEventListener("mouseup", this.stopDrag);
      window.removeEventListener("touchmove", this.drag);
      window.removeEventListener("touchend", this.stopDrag);
    }
  }
};
</script>


<style scoped>
.ai-floating-ball {
  position: fixed;
  bottom: 20px;
  right: 20px;
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
  z-index: 2005;
  transition: background-color 0.3s, color 0.3s;
}

.ai-interaction {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  position: absolute;
  width: 300px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 1001;
  top: -30px;
  left: -320px;
  color: #333;
}

.ai-model-changes {
  margin-top: 20px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
}

.input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-submit {
  margin-top: 10px;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
}

button {
  cursor: pointer;
}
</style>
