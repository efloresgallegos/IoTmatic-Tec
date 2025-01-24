<template>
  <q-page padding>
    <q-card class="main-container">
      <q-card-section class="header-section">
        <h1 class="title">{{ $t('views.home.welcome') }}</h1>
        <p class="introduction">
          {{ $t('views.home.introduction') }}
        </p>
      </q-card-section>
      <q-card-section class="features-section">
        <h2 class="features-title">{{ $t('views.home.features') }}</h2>
        <q-list bordered class="features-list">
          <q-item>
            <q-item-section>
              <strong>{{ $t('views.home.featuresList.dataModels') }}</strong>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>{{ $t('views.home.featuresList.dataMonitoring') }}</strong>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>{{ $t('views.home.featuresList.jsonManagement') }}</strong>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>{{ $t('views.home.featuresList.dataVisualization') }}</strong>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <strong>{{ $t('views.home.featuresList.dataComparison') }}</strong>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section class="editor-section">
        <div id="json-editor-container" class="json-editor-container"></div>
      </q-card-section>
      <q-card-section class="button-section">
        <q-btn :label="$t('views.home.saveJson')" @click="saveJson" color="primary" />
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
            "data": {
              "module": "672c449e7343ec42ea17c022",
              "device": "671906e10f23ffb984d43b04",
              "Sensores": [
                {
                  "sensor": "Extractor",
                  "pot": 12.9,
                  "volt": 121.9,
                  "amp": 1.008
                },
                {
                  "sensor": "Bomba de agua",
                  "pot": 14.8,
                  "volt": 122.5,
                  "amp": 0.418
                },
                {
                  "sensor": "Lámpara",
                  "pot": 484.4,
                  "volt": 121.3,
                  "amp": 3.938
                }
              ]
            }
          }
        ]
      },
    };
  },
  mounted() {
    // Inicializa el JSONEditor
    const container = document.getElementById("json-editor-container");
    const options = {
      mode: "form", // Opciones: 'tree', 'view', 'form', 'text', 'code'
      modes: ['tree', 'view', 'form', 'text', 'code'], // Modos disponibles para cambiar
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
@import '../css/pages/IndexPage.css';
</style>