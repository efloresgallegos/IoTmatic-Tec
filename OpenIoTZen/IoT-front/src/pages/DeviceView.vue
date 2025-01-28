<template>
    <q-page padding>
      <div class="q-gutter-lg">
        <h1 class="text-h5 text-center">Vista de Dispositivo</h1>
        <div class="row">
          <div class="col-3">
            <q-card class="q-mb-md">
              <q-card-section>
                <div class="text-h6">Generar JSON para POST</div>
                <q-select
                  v-model="selectedModule"
                  :options="generalModules"
                  option-value="_id"
                  option-label="name"
                  label="Selecciona un módulo"
                  dense
                  outlined
                />
                <q-btn
                  label="Obtener JSON para POST"
                  color="green"
                  class="q-mt-md full-width"
                  @click="handlePostRequest"
                  :disable="!selectedModule"
                />
                <div class="q-mt-md">
                  <div v-if="jsonResponse" class="json-container" ref="jsonEditor"></div>
                  <p v-else>No se ha hecho ninguna petición aún.</p>
                </div>
              </q-card-section>
            </q-card>
  
            <q-card>
              <q-card-section>
                <div class="text-h6">Datos más recientes</div>
                <q-select
                  v-model="selectedModuleForLatestData"
                  :options="generalModules"
                  option-value="_id"
                  option-label="name"
                  label="Selecciona un módulo"
                  dense
                  outlined
                />
                <q-btn
                  label="Ver datos más recientes"
                  color="blue"
                  class="q-mt-md full-width"
                  @click="handleGetLatestData"
                  :disable="!selectedModuleForLatestData"
                />
                <div class="q-mt-md">
                  <div v-if="latestDataResponse" class="json-container" ref="latestJsonEditor"></div>
                  <p v-else>No se ha obtenido datos recientes.</p>
                </div>
              </q-card-section>
            </q-card>
          </div>
  
          <!-- Lado derecho -->
          <div class="col-9">
            <q-card>
              <q-card-section>
                <div class="text-h6">Gráficas</div>
                <q-btn
                  label="Ir a Gráficas"
                  color="orange"
                  class="q-mt-md full-width"
                  @click="handleRedirectToGraphs"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page>
  </template>
  
  <script>
  import JSONEditor from "jsoneditor";
  import "jsoneditor/dist/jsoneditor.css";
  import apiService from "../boot/ApiServices/api.service";
  
  export default {
    data() {
      return {
        generalModules: [], // Lista de módulos
        selectedModule: null, // Para "Generar JSON para POST"
        selectedModuleForLatestData: null, // Para "Ver datos más recientes"
        jsonResponse: null, // Respuesta del módulo seleccionado
        latestDataResponse: null, // Datos más recientes del módulo seleccionado
      };
    },
    methods: {
      async fetchModules() {
        try {
          const response = await apiService.get("/modules");
          this.generalModules = response.modules || [];
        } catch (error) {
          console.error("Error al obtener los módulos:", error);
        }
      },
      async handlePostRequest() {
        try {
          const response = await apiService.post(`/data/json/${this.$route.params.id}`, {
            module: this.selectedModule,
          });
          this.jsonResponse = response;
          this.createJsonEditor("jsonEditor", response);
        } catch (error) {
          console.error("Error al realizar la petición POST:", error);
        }
      },
      async handleGetLatestData() {
        try {
          const response = await apiService.post(`/data/latest/${this.$route.params.id}`, {
            module: this.selectedModuleForLatestData,
          });
          this.latestDataResponse = response;
          this.createJsonEditor("latestJsonEditor", response);
        } catch (error) {
          console.error("Error al obtener datos más recientes:", error);
        }
      },
      handleRedirectToGraphs() {
        this.$router.push(`/graficas/${this.$route.params.id}`);
      },
      createJsonEditor(ref, data) {
        const container = this.$refs[ref];
        if (container) {
          new JSONEditor(container, {
            mode: "view",
            modes: ["view", "tree"],
            onChangeText: (json) => {
              console.log("JSON editado:", json);
            },
          }).set(data);
        }
      },
    },
    mounted() {
      this.fetchModules();
    },
  };
  </script>
  
  <style scoped>
  .q-page {
    padding: 16px;
  }
  
  .json-container {
    height: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: auto;
  }
  
  .full-width {
    width: 100%;
  }
  </style>
  