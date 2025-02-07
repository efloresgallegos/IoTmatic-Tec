<template>
  <q-page padding class="page-container">
    <q-card class="main-container">
      <!-- Header Section -->
      <q-card-section class="header-section">
        <h1 class="title">{{ $t('views.home.welcome') }}</h1>
        <p class="introduction">
          {{ $t('views.home.introduction') }}
        </p>
      </q-card-section>

      <!-- Features Section -->
      <q-card-section class="features-section">
        <h2 class="features-title">{{ $t('views.home.features') }}</h2>
        <q-list bordered class="features-list">
          <q-item v-for="(key, index) in featureKeys" :key="index" class="feature-item">
            <q-item-section>
              <strong>{{ $t(`views.home.featuresList.${key}`) }}</strong>
              <p class="feature-description">{{ $t(`views.home.featuresDescriptions.${key}`) }}</p>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- JSON Editor Section -->
      <q-card-section class="editor-section">
        <div id="json-editor-container" class="json-editor-container"></div>
      </q-card-section>

      <!-- Save Button Section -->
      <q-card-section class="button-section">
        <q-btn
          :label="$t('views.home.saveJson')"
          @click="saveJson"
          color="primary"
          class="save-button"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script>
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

export default {
  name: "MainView",
  data() {
    return {
      editor: null,
      initialJson: {
        Model: [
          {
            data: {
              module: "672c449e7343ec42ea17c022",
              device: "671906e10f23ffb984d43b04",
              Sensores: [
                {
                  sensor: "Extractor",
                  pot: 12.9,
                  volt: 121.9,
                  amp: 1.008,
                },
                {
                  sensor: "Bomba de agua",
                  pot: 14.8,
                  volt: 122.5,
                  amp: 0.418,
                },
                {
                  sensor: "Lámpara",
                  pot: 484.4,
                  volt: 121.3,
                  amp: 3.938,
                },
              ],
            },
          },
        ],
      },
      featureKeys: [
        "dataModels",
        "dataMonitoring",
        "jsonManagement",
        "dataVisualization",
        "dataComparison",
      ],
    };
  },
  mounted() {
    // Inicializa el JSONEditor
    const container = document.getElementById("json-editor-container");
    const options = {
      mode: "form", // Opciones: 'tree', 'view', 'form', 'text', 'code'
      modes: ["tree", "view", "form", "text", "code"], // Modos disponibles para cambiar
      onChange: () => {
        console.log("El JSON ha cambiado.");
      },
    };
    this.editor = new JSONEditor(container, options);
    this.editor.set(this.initialJson);
  },
  methods: {
    saveJson() {
      const updatedJson = this.editor.get();
      console.log("JSON actualizado:", updatedJson);
    },
  },
};
</script>

<style scoped>
/* Variables globales */
@import "../css/pages/IndexPage.css";

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.main-container {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  background-color: var(--sisdae-bg-light);
  border-radius: var(--sisdae-border-radius);
  box-shadow: var(--sisdae-box-shadow);
  font-family: var(--sisdae-font-family);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.header-section {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: var(--sisdae-border-radius);
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2.5rem;
  color: var(--sisdae-primary-color);
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
}

.introduction {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--sisdae-text-color);
  margin-bottom: 2rem;
  text-align: center;
}

.features-section {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: var(--sisdae-border-radius);
  margin-bottom: 1.5rem;
}

.features-title {
  font-size: 2rem;
  color: var(--sisdae-secondary-color);
  margin-bottom: 1rem;
  text-align: center;
}

.feature-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: var(--sisdae-border-radius);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.feature-item:hover {
  transform: scale(1.02);
  background-color: rgba(255, 255, 255, 0.9);
}

.feature-description {
  font-size: 0.9rem;
  color: var(--sisdae-text-color);
  margin-top: 0.5rem;
}

.editor-section {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: var(--sisdae-border-radius);
  margin-bottom: 1.5rem;
}

.json-editor-container {
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  overflow-x: auto;
  margin: 0 auto;
}

.button-section {
  text-align: center;
}

.save-button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.save-button:hover {
  transform: scale(1.05);
  background-color: var(--sisdae-primary-color-hover);
}
</style>