<template>
  <q-page class="device-view-page">
    <div class="sisdai-container">
      <h1 class="sisdai-title text-center">Vista de Dispositivo</h1>
      
      <div class="sisdai-grid">
        <!-- Panel izquierdo -->
        <div class="sisdai-panel">
          <q-card class="sisdai-card">
            <q-card-section>
              <div class="sisdai-section-title">Generar JSON para POST</div>
              <q-select 
                v-model="selectedModel" 
                :options="generalModels" 
                option-value="model_id" 
                option-label="name"
                label="Selecciona un módulo" 
                dense 
                outlined 
                class="sisdai-select"
                :disable="loadingModels" 
              />
              <q-btn 
                label="Obtener JSON para POST" 
                color="primary" 
                class="sisdai-button q-mt-md full-width" 
                @click="handlePostRequest"
                :disable="!selectedModel" 
              />
              <div class="q-mt-md">
                <div v-if="jsonResponse" class="sisdai-json-container" ref="jsonEditor"></div>
                <p v-else class="sisdai-text-secondary">No se ha hecho ninguna petición aún.</p>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="sisdai-card q-mt-md">
            <q-card-section>
              <div class="sisdai-section-title">Datos más recientes</div>
              <q-select 
                v-model="selectedModelForLatestData" 
                :options="generalModels" 
                option-value="model_id"
                option-label="name" 
                label="Selecciona un módulo" 
                dense 
                outlined 
                class="sisdai-select"
              />
              <q-btn 
                label="Ver datos más recientes" 
                color="primary" 
                class="sisdai-button q-mt-md full-width"
                @click="handleGetLatestData" 
                :disable="!selectedModelForLatestData" 
              />
              <div class="q-mt-md">
                <div v-if="latestDataResponse" class="sisdai-json-container" ref="latestJsonEditor"></div>
                <p v-else class="sisdai-text-secondary">No se ha obtenido datos recientes.</p>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Panel derecho -->
        <div class="sisdai-panel">
          <q-card class="sisdai-card">
            <q-card-section>
              <div class="sisdai-section-title">Graficación y Datos por Rango de Fechas</div>
              <div class="sisdai-form-grid">
                <q-select 
                  v-model="selectedGraphModule" 
                  :options="generalModels" 
                  option-value="model_id"
                  option-label="name" 
                  label="Selecciona un módulo para graficar" 
                  dense 
                  outlined 
                  class="sisdai-select"
                  @update:model-value="handleModelSelection"
                />
                <q-select 
                  v-model="chartType" 
                  :options="chartTypes" 
                  option-value="value" 
                  option-label="label"
                  label="Selecciona tipo de gráfica" 
                  dense 
                  outlined 
                  class="sisdai-select"
                />
                <q-input 
                  v-model="dateRange.startDate" 
                  type="date" 
                  label="Fecha de inicio" 
                  dense 
                  outlined 
                  class="sisdai-input"
                />
                <q-input 
                  v-model="dateRange.endDate" 
                  type="date" 
                  label="Fecha de fin" 
                  dense 
                  outlined 
                  class="sisdai-input"
                />
                <q-select 
                  v-model="groupBy" 
                  :options="groupByOptions" 
                  option-value="value" 
                  option-label="label"
                  label="Agrupar por fecha" 
                  dense 
                  outlined 
                  class="sisdai-select"
                />
                <q-btn 
                  label="Agregar Gráfica" 
                  color="primary" 
                  class="sisdai-button full-width q-mt-md" 
                  @click="handleAddGraph"
                  :disable="!selectedGraphModule || !chartType || !dateRange.startDate || !dateRange.endDate || !groupBy" 
                />
              </div>

              <div v-if="fields.length > 0" class="sisdai-fields-section q-mt-md">
                <div class="sisdai-section-title">Selecciona campos a graficar:</div>
                <div class="sisdai-fields-grid">
                  <q-checkbox 
                    v-for="(field, index) in fields" 
                    :key="index"
                    v-model="selectedFields" 
                    :val="field" 
                    :label="field"
                    class="sisdai-checkbox"
                  />
                </div>
              </div>
              <div v-else class="sisdai-text-secondary q-mt-md">Cargando campos...</div>
            </q-card-section>
          </q-card>

          <q-card v-if="graphs.length > 0" class="sisdai-card q-mt-md">
            <q-card-section>
              <div class="sisdai-section-title">Gráficas</div>
              <div v-for="(graphConfig, index) in graphs" :key="index" class="sisdai-graph-container q-mt-md">
                <div class="sisdai-graph-title">{{ getModuleName(graphConfig.module) }}</div>
                <DynamicGraphicsComponent 
                  :tipoGrafica="graphConfig.chartType" 
                  :datos="graphConfig.chartData"
                  :variables="graphConfig.variables" 
                  :nombre_color="graphConfig.nombreColor"
                  :nombre_barra="graphConfig.nombreBarra" 
                  :titulo_eje_x="graphConfig.tituloEjeX"
                  :titulo_eje_y="graphConfig.tituloEjeY" 
                />
                <div class="sisdai-graph-actions q-mt-md">
                  <q-btn 
                    label="Quitar Gráfica" 
                    color="negative" 
                    class="sisdai-button" 
                    @click="handleRemoveGraph(index)"
                    :disable="isDownloading" 
                  />
                  <q-btn 
                    label="Descargar PNG" 
                    color="positive" 
                    class="sisdai-button q-ml-sm"
                    @click="handleDownloadGraph(graphConfig, index, 'png')" 
                    :disable="isDownloading" 
                  />
                </div>
              </div>
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
import DynamicGraphicsComponent from "../components/small-components/graphics.vue";
import { useQuasar } from 'quasar';

const user = JSON.parse(localStorage.getItem("user"));

export default {
  components: {
    DynamicGraphicsComponent
  },
  setup() {
    const $q = useQuasar();
    return { $q };
  },
  data() {
    return {
      generalModels: [],
      selectedModel: null,
      selectedModelForLatestData: null,
      jsonResponse: null,
      latestDataResponse: null,
      jsonEditorInstance: null,
      latestJsonEditorInstance: null,
      loadingModels: false,
      selectedGraphModule: null,
      chartType: null,
      dateRange: {
        startDate: null,
        endDate: null,
      },
      groupBy: null,
      fields: [],
      selectedFields: [],
      graphs: [],
      isDownloading: false,
      isLoading: false,
      chartTypes: [
        { value: "barras", label: "Barra" },
        { value: "lineas", label: "Línea" },
        { value: "pastel", label: "Pastel" },
        { value: "areasApiladas", label: "Áreas Apiladas" },
        { value: "cajasBigotes", label: "Cajas y Bigotes" },
      ],
      groupByOptions: [
        { value: "day", label: "Día" },
        { value: "month", label: "Mes" },
        { value: "year", label: "Año" },
      ],
    };
  },
  methods: {
    async fetchModels() {
      this.loadingModels = true;
      try {
        const response = await apiService.get("/models");
        this.generalModels = response.data || [];
        this.$q.notify({
          type: 'positive',
          message: 'Módulos cargados exitosamente',
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al obtener los módulos:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar los módulos',
          position: 'top',
          timeout: 3000
        });
      } finally {
        this.loadingModels = false;
      }
    },

    async handlePostRequest() {
      this.isLoading = true;
      try {
        const response = await apiService.post(`/data/getJson/`, {
          model_id: this.selectedModel.model_id,
          device_id: Number(this.$route.params.id),
          user_id: Number(user.user_id),
        });
        this.jsonResponse = response.data;
        this.createJsonEditor("jsonEditor", response.data);
        this.$q.notify({
          type: 'positive',
          message: 'JSON generado exitosamente',
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al realizar la petición POST:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al generar el JSON',
          position: 'top',
          timeout: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleGetLatestData() {
      this.isLoading = true;
      try {
        const response = await apiService.post(`/data/getlatest`, {
          model_id: this.selectedModelForLatestData.model_id,
          device_id: this.$route.params.id,
        });
        this.latestDataResponse = response.data;
        this.createJsonEditor("latestJsonEditor", response.data);
        this.$q.notify({
          type: 'positive',
          message: 'Datos recientes obtenidos exitosamente',
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al obtener datos más recientes:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al obtener los datos recientes',
          position: 'top',
          timeout: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleAddGraph() {
      this.isLoading = true;
      try {
        const response = await apiService.post(`/data/getGraphData/`, {
          model_id: this.selectedGraphModule,
          start_date: this.dateRange.startDate,
          end_date: this.dateRange.endDate,
          group_by: this.groupBy,
          fields: this.selectedFields,
        });
        const graphData = response.data;
        this.graphs.push({
          module: this.selectedGraphModule,
          chartType: this.chartType,
          chartData: graphData,
          variables: this.selectedFields,
          nombreColor: 'color',
          nombreBarra: 'barra',
          tituloEjeX: 'Eje X',
          tituloEjeY: 'Eje Y',
        });
        this.$q.notify({
          type: 'positive',
          message: 'Gráfica agregada exitosamente',
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al agregar gráfica:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al agregar la gráfica',
          position: 'top',
          timeout: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },

    handleRemoveGraph(index) {
      this.graphs.splice(index, 1);
      this.$q.notify({
        type: 'info',
        message: 'Gráfica eliminada',
        position: 'top',
        timeout: 2000
      });
    },

    async handleDownloadGraph(graphConfig, index, format) {
      this.isDownloading = true;
      try {
        const svgElement = this.$refs[`graph-${index}`].$el.querySelector('svg');
        if (!svgElement) {
          throw new Error('No se encontró el elemento SVG');
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `graph-${index}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.$q.notify({
          type: 'positive',
          message: `Gráfica descargada en formato ${format}`,
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al descargar la gráfica:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al descargar la gráfica',
          position: 'top',
          timeout: 3000
        });
      } finally {
        this.isDownloading = false;
      }
    },

    async handleModelSelection(selectedModel) {
      if (selectedModel) {
        this.selectedModel = selectedModel.model_id;
        await this.getFields();
      }
    },

    async getFields() {
      try {
        const response = await apiService.get(`/data/getGraphable/${this.selectedModel}`);
        this.fields = response.data || [];
        this.$q.notify({
          type: 'positive',
          message: 'Campos cargados exitosamente',
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error("Error al obtener los campos:", error);
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar los campos',
          position: 'top',
          timeout: 3000
        });
      }
    },

    getModuleName(moduleId) {
      const module = this.generalModels.find((model) => model.model_id === moduleId);
      return module ? module.name : 'Desconocido';
    },

    createJsonEditor(ref, data) {
      this.$nextTick(() => {
        const container = this.$refs[ref];
        if (container) {
          // Destruir la instancia anterior si existe
          if (ref === "jsonEditor" && this.jsonEditorInstance) {
            this.jsonEditorInstance.destroy();
          } else if (ref === "latestJsonEditor" && this.latestJsonEditorInstance) {
            this.latestJsonEditorInstance.destroy();
          }

          // Crear nueva instancia
          const editor = new JSONEditor(container, {
            mode: "view",
            modes: ["view", "tree"],
            onChangeText: (json) => {
              console.log("JSON editado:", json);
            },
          });
          editor.set(data);

          // Guardar la instancia
          if (ref === "jsonEditor") {
            this.jsonEditorInstance = editor;
          } else if (ref === "latestJsonEditor") {
            this.latestJsonEditorInstance = editor;
          }

          // Añadir funcionalidad de copiar JSON
          this.addCopyButton(ref, editor);
        }
      });
    },

    addCopyButton(ref, editor) {
      const container = this.$refs[ref];
      if (container) {
        // Crear el botón de copiar
        const copyButton = document.createElement("button");
        copyButton.textContent = "Copiar JSON";
        copyButton.style.marginTop = "10px";
        copyButton.style.padding = "8px 16px";
        copyButton.style.cursor = "pointer";
        copyButton.style.backgroundColor = "#1976d2";
        copyButton.style.color = "#fff";
        copyButton.style.border = "none";
        copyButton.style.borderRadius = "4px";
        copyButton.style.fontSize = "14px";
        copyButton.style.fontWeight = "bold";

        // Evento de copia
        copyButton.addEventListener("click", () => {
          const json = editor.getText(); // Obtiene el JSON como texto
          navigator.clipboard.writeText(json).then(() => {
            this.$q.notify({
              type: "positive",
              message: "JSON copiado al portapapeles.",
            });
          }).catch((err) => {
            console.error("Error al copiar el JSON:", err);
            this.$q.notify({
              type: "negative",
              message: "Error al copiar el JSON.",
            });
          });
        });

        // Insertar el botón después del contenedor del editor
        container.appendChild(copyButton);
      }
    },
  },
  watch: {
    jsonResponse(newVal) {
      if (!newVal && this.jsonEditorInstance) {
        this.jsonEditorInstance.destroy();
        this.jsonEditorInstance = null;
      }
    },
    latestDataResponse(newVal) {
      if (!newVal && this.latestJsonEditorInstance) {
        this.latestJsonEditorInstance.destroy();
        this.latestJsonEditorInstance = null;
      }
    },
  },
  mounted() {
    this.fetchModels();
  }
};
</script>

<style scoped>
.device-view-page {
  padding: 20px;
  background-color: var(--sisdae-bg-light);
}

.sisdai-container {
  max-width: 1400px;
  margin: 0 auto;
}

.sisdai-title {
  font-size: 2rem;
  color: var(--sisdae-primary-color);
  margin-bottom: 2rem;
  font-weight: bold;
}

.sisdai-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.sisdai-panel {
  display: flex;
  flex-direction: column;
}

.sisdai-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sisdai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sisdai-section-title {
  font-size: 1.2rem;
  color: var(--sisdae-primary-color);
  margin-bottom: 1rem;
  font-weight: bold;
}

.sisdai-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.sisdai-fields-section {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 8px;
}

.sisdai-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.sisdai-graph-container {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.sisdai-graph-title {
  font-size: 1.1rem;
  color: var(--sisdae-secondary-color);
  margin-bottom: 1rem;
  font-weight: bold;
}

.sisdai-graph-actions {
  display: flex;
  gap: 0.5rem;
}

.sisdai-json-container {
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  background-color: #fff;
  padding: 1rem;
}

.sisdai-text-secondary {
  color: var(--sisdae-text-color);
  font-size: 0.9rem;
}

.sisdai-button {
  font-weight: 500;
  text-transform: none;
}

.sisdai-select,
.sisdai-input {
  width: 100%;
}

@media (max-width: 1024px) {
  .sisdai-grid {
    grid-template-columns: 1fr;
  }
  
  .sisdai-form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .device-view-page {
    padding: 10px;
  }
  
  .sisdai-title {
    font-size: 1.5rem;
  }
  
  .sisdai-json-container {
    height: 200px;
  }
}

/* Añadir estilos para los estados de carga */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Mejorar la apariencia de los botones deshabilitados */
.sisdai-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Añadir animación de carga */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.loading {
  animation: pulse 1.5s infinite;
}

/* Mejorar la apariencia de los checkboxes */
.sisdai-checkbox {
  transition: all 0.3s ease;
}

.sisdai-checkbox:hover {
  transform: translateX(5px);
}

/* Mejorar la apariencia de los contenedores de gráficas */
.sisdai-graph-container {
  transition: all 0.3s ease;
}

.sisdai-graph-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mejorar la apariencia de los inputs y selects */
.sisdai-input:focus,
.sisdai-select:focus {
  border-color: var(--sisdae-primary-color);
  box-shadow: 0 0 0 2px rgba(var(--sisdae-primary-color-rgb), 0.2);
}

/* Añadir estilos para las notificaciones */
:deep(.q-notification) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.q-notification__message) {
  font-weight: 500;
}

/* Mejorar la apariencia del contenedor JSON */
.sisdai-json-container {
  transition: all 0.3s ease;
}

.sisdai-json-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Añadir estilos para el estado de carga de los modelos */
.loading-models {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.loading-models .q-spinner {
  color: var(--sisdae-primary-color);
}
</style>