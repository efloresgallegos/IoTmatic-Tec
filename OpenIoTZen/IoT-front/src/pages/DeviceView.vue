<template>
  <q-page padding>
    <div class="q-gutter-lg">
      <h1 class="text-h5 text-center">Vista de Dispositivo</h1>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Generar JSON para POST</div>
              <q-select v-model="selectedModel" :options="generalModels" option-value="model_id" option-label="name"
                label="Selecciona un módulo" dense outlined :disable="loadingModels" />
              <q-btn label="Obtener JSON para POST" color="green" class="q-mt-md full-width" @click="handlePostRequest"
                :disable="!selectedModel" />
              <div class="q-mt-md">
                <div v-if="jsonResponse" class="json-container" ref="jsonEditor"></div>
                <p v-else>No se ha hecho ninguna petición aún.</p>
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section>
              <div class="text-h6">Datos más recientes</div>
              <q-select v-model="selectedModelForLatestData" :options="generalModels" option-value="model_id"
                option-label="name" label="Selecciona un módulo" dense outlined />
              <q-btn label="Ver datos más recientes" color="blue" class="q-mt-md full-width"
                @click="handleGetLatestData" :disable="!selectedModelForLatestData" />
              <div class="q-mt-md">
                <div v-if="latestDataResponse" class="json-container" ref="latestJsonEditor"></div>
                <p v-else>No se ha obtenido datos recientes.</p>
              </div>
            </q-card-section>
          </q-card>
        </div>


        <!-- Lado derecho -->
        <div class="col-12 col-md-9">
          <q-card>
            <q-card-section>
              <div class="text-h6">Graficación y Datos por Rango de Fechas</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select v-model="selectedGraphModule" :options="generalModels" option-value="model_id"
                    option-label="name" label="Selecciona un módulo para graficar" dense outlined
                    @update:model-value="handleModelSelection"
                    />
                </div>
                <div class="col-12 col-md-6">
                  <q-select v-model="chartType" :options="chartTypes" option-value="value" option-label="label"
                    label="Selecciona tipo de gráfica" dense outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="dateRange.startDate" type="date" label="Fecha de inicio" dense outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="dateRange.endDate" type="date" label="Fecha de fin" dense outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-select v-model="groupBy" :options="groupByOptions" option-value="value" option-label="label"
                    label="Agrupar por fecha" dense outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-btn label="Agregar Gráfica" color="orange" class="full-width q-mt-md" @click="handleAddGraph"
                    :disable="!selectedGraphModule || !chartType || !dateRange.startDate || !dateRange.endDate || !groupBy" />
                </div>
              </div>
              <div v-if="fields.length > 0" class="q-mt-md">
                <div class="text-h6">Selecciona campos a graficar:</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6" v-for="(field, index) in fields" :key="index">
                    <q-checkbox v-model="selectedFields" :val="field" :label="field" />
                  </div>
                </div>
              </div>
              <div v-else class="q-mt-md">Cargando campos...</div>
            </q-card-section>
          </q-card>
          <q-card v-if="graphs.length > 0" class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Gráficas</div>
              <div v-for="(graphConfig, index) in graphs" :key="index" class="q-mt-md">
                <div class="text-h7">{{ getModuleName(graphConfig.module) }}</div>
                <DynamicGraphicsComponent :tipoGrafica="graphConfig.chartType" :datos="graphConfig.chartData"
                  :variables="graphConfig.variables" :nombre_color="graphConfig.nombreColor"
                  :nombre_barra="graphConfig.nombreBarra" :titulo_eje_x="graphConfig.tituloEjeX"
                  :titulo_eje_y="graphConfig.tituloEjeY" />
                <q-btn label="Quitar Gráfica" color="red" class="q-mt-md" @click="handleRemoveGraph(index)"
                  :disable="isDownloading" />
                <q-btn label="Descargar PNG" color="green" class="q-mt-md"
                  @click="handleDownloadGraph(graphConfig, index, 'png')" :disable="isDownloading" />
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

const user = JSON.parse(localStorage.getItem("user"));
export default {
  components: {
    DynamicGraphicsComponent
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
      loadingModels: false, // Estado de carga
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
      this.loadingModels = true; // Activar carga
      try {
        const response = await apiService.get("/models");
        console.log("Módulos:", response);
        this.generalModels = response.data || [];
      } catch (error) {
        console.error("Error al obtener los módulos:", error);
      } finally {
        this.loadingModels = false; // Desactivar carga
      }
    },
    async handlePostRequest() {
      try {
        const response = await apiService.post(`/data/getJson/`, {
          model_id: this.selectedModel.model_id, // Asegúrate de usar model_id
          device_id: Number(this.$route.params.id),
          user_id: user.user_id,
        });
        console.log("JSON generado:", response);
        const json = response.data;
        this.jsonResponse = json;
        this.createJsonEditor("jsonEditor", json);
      } catch (error) {
        console.error("Error al realizar la petición POST:", error);
        this.$q.notify({
          type: "negative",
          message: "Error al generar el JSON para POST",
        });
      }
    },

    async handleGetLatestData() {
      try {
        const response = await apiService.post(`/data/getlatest`, {
          model_id: this.selectedModelForLatestData.model_id, // Asegúrate de usar model_id
          device_id: this.$route.params.id,
        });
        this.latestDataResponse = response.data;
        this.createJsonEditor("latestJsonEditor", response.data); // Pasar response.data
      } catch (error) {
        console.error("Error al obtener datos más recientes:", error);
        this.$q.notify({
          type: "negative",
          message: "Error al obtener los datos más recientes",
        });
      }
    },
    handleRedirectToGraphs() {
      this.$router.push(`/graficas/${this.$route.params.id}`);
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
    async handleAddGraph() {
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
      } catch (error) {
        console.error("Error al agregar gráfica:", error);
        this.$q.notify({
          type: "negative",
          message: "Error al agregar la gráfica",
        });
      }
    },
    handleRemoveGraph(index) {
      this.graphs.splice(index, 1);
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
          type: "positive",
          message: `Gráfica descargada en formato ${format}`,
        });
      } catch (error) {
        console.error("Error al descargar la gráfica:", error);
        this.$q.notify({
          type: "negative",
          message: "Error al descargar la gráfica",
        });
      } finally {
        this.isDownloading = false;
      }
    },
    async handleModelSelection(selectedModel) {
      if (selectedModel) {
        this.selectedModel = selectedModel.model_id; // Guarda el model_id seleccionado
        await this.getFields(); // Llama a la función para obtener los campos
      }
    },
    // Obtiene los campos graficables
    async getFields() {
      try {
        const response = await apiService.get(`/data/getGraphable/${this.selectedModel}`);
        console.log("Campos:", response);
        this.fields = response.data || []; // Almacena los campos en el estado
      } catch (error) {
        console.error("Error al obtener los campos:", error);
      }
    },
    getModuleName(moduleId) {
      const module = this.generalModels.find((model) => model.model_id === moduleId);
      return module ? module.name : 'Desconocido';
    }
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
.q-page {
  padding: 16px;
}

.json-container {
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  background-color: #fff;
}

.full-width {
  width: 100%;
}

.jsoneditor {
  border: none !important;
}

.jsoneditor-menu {
  background-color: #1976d2 !important;
  border-bottom: none !important;
}

@media (max-width: 600px) {
  .q-page {
    padding: 8px;
  }

  .json-container {
    height: 200px;
  }
}
</style>