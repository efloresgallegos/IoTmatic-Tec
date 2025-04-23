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
              <p class="sisdai-description">Obtén la estructura JSON necesaria para enviar datos a este dispositivo mediante una solicitud POST. Este JSON incluye todos los campos requeridos según el modelo de datos seleccionado.</p>
              
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
                :loading="isLoading"
              />
              <div class="q-mt-md">
                <div v-if="jsonResponse" class="sisdai-json-container" ref="jsonEditor"></div>
                <p v-else class="sisdai-text-secondary">No se ha generado ningún JSON. Selecciona un módulo y haz clic en "Obtener JSON para POST".</p>
              </div>
              
              <div v-if="jsonResponse" class="q-mt-md">
                <div class="sisdai-section-subtitle">Cómo usar este JSON</div>
                <div class="sisdai-usage-steps">
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">1</div>
                    <div class="sisdai-step-content">
                      <strong>Copia el JSON</strong> generado usando el botón "Copiar JSON" que aparece debajo del editor.
                    </div>
                  </div>
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">2</div>
                    <div class="sisdai-step-content">
                      <strong>Completa los valores</strong> de cada campo con los datos que deseas enviar al dispositivo.
                    </div>
                  </div>
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">3</div>
                    <div class="sisdai-step-content">
                      <strong>Realiza la solicitud POST</strong> a la siguiente URL:
                      <div class="sisdai-code-snippet">
                        <code>POST /api/data</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="sisdai-code-container q-mt-md">
                  <pre><code>// Ejemplo de cómo enviar datos usando fetch
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    // Aquí va el JSON que has generado y completado
  })
})
.then(response => response.json())
.then(data => console.log('Éxito:', data))
.catch(error => console.error('Error:', error));</code></pre>
                </div>
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

          <!-- Sección para código de conexión WebSocket -->
          <q-card class="sisdai-card q-mt-md">
            <q-card-section>
              <div class="sisdai-section-title">Código para Conexión WebSocket</div>
              <p class="sisdai-description">Genera código para conectar dispositivos IoT a través de WebSockets y enviar datos según el modelo seleccionado.</p>
              
              <q-select 
                v-model="selectedModelForWebSocket" 
                :options="generalModels" 
                option-value="model_id"
                option-label="name" 
                label="Selecciona un módulo para conexión WebSocket" 
                dense 
                outlined 
                class="sisdai-select"
              />
              
              <div class="q-mb-md">
                <q-select
                  v-model="wsCodeType"
                  :options="wsCodeTypes"
                  option-value="value"
                  option-label="label"
                  label="Selecciona el tipo de conexión"
                  dense
                  outlined
                  class="sisdai-select"
                />
              </div>

              <q-tabs
                v-model="wsCodeLanguage"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="python" label="Python" />
                <q-tab name="javascript" label="JavaScript" />
                <q-tab name="arduino" label="Arduino" />
              </q-tabs>

              <q-tab-panels v-model="wsCodeLanguage" animated class="q-mt-md">
                <q-tab-panel name="python">
                  <div class="sisdai-code-container" style="max-height: 400px; overflow-y: auto;">
                    <pre><code>{{ pythonWebSocketCode }}</code></pre>
                  </div>
                  <q-btn 
                    label="Copiar Código Python" 
                    color="primary" 
                    class="sisdai-button q-mt-md full-width" 
                    @click="copyCode(pythonWebSocketCode)"
                    :disable="!selectedModelForWebSocket" 
                  />
                </q-tab-panel>
                
                <q-tab-panel name="javascript">
                  <div class="sisdai-code-container" style="max-height: 400px; overflow-y: auto;">
                    <pre><code>{{ javascriptWebSocketCode }}</code></pre>
                  </div>
                  <q-btn 
                    label="Copiar Código JavaScript" 
                    color="primary" 
                    class="sisdai-button q-mt-md full-width" 
                    @click="copyCode(javascriptWebSocketCode)"
                    :disable="!selectedModelForWebSocket" 
                  />
                </q-tab-panel>

                <q-tab-panel name="arduino">
                  <div class="sisdai-code-container" style="max-height: 400px; overflow-y: auto;">
                    <pre><code>{{ arduinoCode }}</code></pre>
                  </div>
                  <q-btn 
                    label="Copiar Código Arduino" 
                    color="primary" 
                    class="sisdai-button q-mt-md full-width" 
                    @click="copyCode(arduinoCode)"
                    :disable="!selectedModelForWebSocket" 
                  />
                </q-tab-panel>
              </q-tab-panels>
              
              <div class="q-mt-md">
                <div class="sisdai-section-subtitle">Instrucciones de uso</div>
                <div class="sisdai-usage-steps">
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">1</div>
                    <div class="sisdai-step-content">
                      <strong>Selecciona un módulo</strong> para determinar la estructura de datos que enviará tu dispositivo IoT.
                    </div>
                  </div>
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">2</div>
                    <div class="sisdai-step-content">
                      <strong>Copia el código</strong> en el lenguaje que prefieras (Python o JavaScript).
                    </div>
                  </div>
                  <div class="sisdai-usage-step">
                    <div class="sisdai-step-number">3</div>
                    <div class="sisdai-step-content">
                      <strong>Ejecuta el código en tu dispositivo IoT</strong> para establecer la conexión WebSocket y comenzar a enviar datos.
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- La sección de envío programado de datos ha sido eliminada -->

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
                  label="Agregar 'Gráfica'" 
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
              <div class="sisdai-section-title">'Gráfica's</div>
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
                    label="Quitar 'Gráfica'" 
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
import { useAuthStore } from "../stores/auth-store";
import { useModelStore } from "../stores/model-store";
import { useDevicesStore } from "../stores/devices-store";
import { mapState, mapActions } from 'pinia';

export default {
  components: {
    DynamicGraphicsComponent
  },
  setup() {
    const q = useQuasar();
    const authStore = useAuthStore();
    const modelStore = useModelStore();
    return { q, authStore, modelStore };
  },
  data() {
    return {
      deviceData: null,
      generalModels: [],
      selectedModel: null,
      selectedModelForLatestData: null,
      selectedModelForWebSocket: null,
      wsCodeLanguage: 'python',
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
      // Propiedades para envío programado de datos
      selectedModelForDataUpload: null,
      dataUploadInterval: 5,
      dataUploadIntervalUnit: { value: 'minutes', label: 'Minutos' },
      dataUploadActive: false,
      dataUploadTimer: null,
      nextUploadTime: 'No programado',
      dataUploadHistory: [],

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
      intervalUnits: [
        { value: "seconds", label: "Segundos" },
        { value: "minutes", label: "Minutos" },
        { value: "hours", label: "Horas" },
      ],
      // Propiedades para código WebSocket
      pythonWebSocketCode: 'Selecciona un módulo para generar el código',
      javascriptWebSocketCode: 'Selecciona un módulo para generar el código',
      arduinoCode: 'Selecciona un módulo para generar el código',
      wsCodeType: { value: 'periodic', label: 'Envío Periódico' },
      wsCodeTypes: [
        { value: 'periodic', label: 'Envío Periódico' },
        { value: 'event', label: 'Basado en Eventos' },
        { value: 'batch', label: 'Envío por Lotes' }
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useModelStore, ['models']),
    ...mapState(useDevicesStore, ['devices'])
  },
  methods: {
    ...mapActions(useModelStore, ['fetchModels']),
    ...mapActions(useDevicesStore, ['getDeviceData']),
    
    async fetchDeviceData() {
      try {
        // Obtener el ID del dispositivo de los parámetros de la ruta
        const deviceId = parseInt(this.$route.params.id);
        if (!deviceId) {
          throw new Error('ID de dispositivo no encontrado');
        }
        
        // Llamar al método del store para obtener los datos del dispositivo
        const response = await this.getDeviceData(deviceId);
        if (response) {
          // Actualizar los datos del dispositivo en el componente
          this.deviceData = response;
          
          // El dispositivo se ha cargado correctamente
        }
      } catch (error) {
        console.error('Error al obtener datos del dispositivo:', error);
        this.q.notify({
          type: 'negative',
          message: 'Error al cargar los datos del dispositivo'
        });
      }
    },
    

    
    startDataUpload() {
      if (!this.selectedModelForDataUpload || !this.dataUploadInterval || !this.dataUploadIntervalUnit) {
        this.q.notify({
          type: 'warning',
          message: 'Por favor completa todos los campos para iniciar el envío programado'
        });
        return;
      }
      
      // Calcular el intervalo en milisegundos
      let intervalMs = this.dataUploadInterval * 1000; // Base en segundos
      if (this.dataUploadIntervalUnit.value === 'minutes') {
        intervalMs *= 60;
      } else if (this.dataUploadIntervalUnit.value === 'hours') {
        intervalMs *= 3600;
      }
      
      // Iniciar el temporizador
      this.dataUploadActive = true;
      this.dataUploadTimer = setInterval(() => {
        this.sendDataToServer();
      }, intervalMs);
      
      // Actualizar próximo tiempo de envío
      this.updateNextUploadTime(intervalMs);
      
      // Registrar en el historial
      this.dataUploadHistory.unshift({
        timestamp: new Date(),
        success: true,
        message: 'Envío programado iniciado'
      });
      
      this.$q.notify({
        type: 'positive',
        message: 'Envío programado iniciado correctamente'
      });
    },
    
    stopDataUpload() {
      if (this.dataUploadTimer) {
        clearInterval(this.dataUploadTimer);
        this.dataUploadTimer = null;
      }
      
      this.dataUploadActive = false;
      this.nextUploadTime = 'No programado';
      
      // Registrar en el historial
      this.dataUploadHistory.unshift({
        timestamp: new Date(),
        success: true,
        message: 'Envío programado detenido'
      });
      
      this.$q.notify({
        type: 'info',
        message: 'Envío programado detenido'
      });
    },
    
    updateNextUploadTime(intervalMs) {
      const nextTime = new Date(Date.now() + intervalMs);
      this.nextUploadTime = nextTime.toLocaleTimeString();
    },
    
    sendDataToServer() {
      // Implementación del envío de datos al servidor
      const deviceId = parseInt(this.$route.params.id);
      const modelId = this.selectedModelForDataUpload;
      
      // Aquí iría la lógica para generar y enviar datos de prueba
      // Por ahora simulamos el envío y registramos en el historial
      const success = Math.random() > 0.2; // Simulamos éxito con 80% de probabilidad
      
      console.log(`Enviando datos para dispositivo ${deviceId} con modelo ${modelId}`);
      
      // En una implementación real, aquí se enviarían los datos al servidor
      // apiService.post('/data', { deviceId, modelId, data: {...} });
      
      this.dataUploadHistory.unshift({
        timestamp: new Date(),
        success: success,
        message: success ? `Datos enviados correctamente para modelo ${modelId}` : `Error al enviar datos para dispositivo ${deviceId}`
      });
      
      // Limitar el historial a 10 entradas
      if (this.dataUploadHistory.length > 10) {
        this.dataUploadHistory.pop();
      }
      
      // Actualizar próximo tiempo de envío
      let intervalMs = this.dataUploadInterval * 1000;
      if (this.dataUploadIntervalUnit.value === 'minutes') {
        intervalMs *= 60;
      } else if (this.dataUploadIntervalUnit.value === 'hours') {
        intervalMs *= 3600;
      }
      this.updateNextUploadTime(intervalMs);
    },
    
    handleModelSelection() {
      if (!this.selectedGraphModule) return;
      
      // Obtener los campos disponibles para el modelo seleccionado
      this.fields = [];
      this.selectedFields = [];
      
      // Simulamos la carga de campos (en producción, esto vendría del API)
      setTimeout(() => {
        // Ejemplo de campos que podrían venir del modelo seleccionado
        this.fields = ['temperatura', 'humedad', 'presion', 'velocidad', 'nivel'];
      }, 500);
    },
    
    handleAddGraph() {
      if (!this.selectedGraphModule || !this.chartType || !this.dateRange.startDate || 
          !this.dateRange.endDate || !this.groupBy || this.selectedFields.length === 0) {
        this.q.notify({
          type: 'warning',
          message: 'Por favor completa todos los campos para agregar una gráfica'
        });
        return;
      }
      
      // Generar datos de ejemplo para la gráfica
      const chartData = this.generateSampleChartData();
      
      // Configurar la gráfica
      const graphConfig = {
        module: this.selectedGraphModule,
        chartType: this.chartType,
        chartData: chartData,
        variables: this.selectedFields,
        nombreColor: 'Valores',
        nombreBarra: 'Fecha',
        tituloEjeX: 'Fecha',
        tituloEjeY: 'Valor'
      };
      
      // Agregar la gráfica a la lista
      this.graphs.push(graphConfig);
      
      this.q.notify({
        type: 'positive',
        message: 'Gráfica agregada correctamente'
      });
    },
    
    generateSampleChartData() {
      // Generar datos de ejemplo para la gráfica basados en los campos seleccionados
      const startDate = new Date(this.dateRange.startDate);
      const endDate = new Date(this.dateRange.endDate);
      const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Generar datos para cada día en el rango
      const chartData = [];
      for (let i = 0; i <= dayDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dataPoint = {
          fecha: currentDate.toISOString().split('T')[0]
        };
        
        // Generar valores aleatorios para cada campo seleccionado
        this.selectedFields.forEach(field => {
          // Valores aleatorios diferentes según el campo
          if (field === 'temperatura') {
            dataPoint[field] = Math.floor(Math.random() * 30) + 10; // 10-40
          } else if (field === 'humedad') {
            dataPoint[field] = Math.floor(Math.random() * 60) + 20; // 20-80
          } else if (field === 'presion') {
            dataPoint[field] = Math.floor(Math.random() * 200) + 900; // 900-1100
          } else if (field === 'velocidad') {
            dataPoint[field] = Math.floor(Math.random() * 50) + 5; // 5-55
          } else if (field === 'nivel') {
            dataPoint[field] = Math.floor(Math.random() * 100); // 0-100
          } else {
            dataPoint[field] = Math.floor(Math.random() * 100); // 0-100 para otros campos
          }
        });
        
        chartData.push(dataPoint);
      }
      
      return chartData;
    },
    
    async handlePostRequest() {
      this.isLoading = true;
      try {
        if (!this.selectedModel) {
          this.q.notify({
            type: 'negative',
            message: 'Por favor, selecciona un módulo primero'
          });
          return;
        }
        // Asegurarse de que estamos pasando el ID del modelo, no el objeto completo
        const modelId = typeof this.selectedModel === 'object' ? this.selectedModel.model_id : this.selectedModel;
        const response = await apiService.post('/data/getJson', { model_id: modelId, device_id: this.$route.params.id, user_id: this.user.id  });
        this.jsonResponse = response.data;
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && response.data.data) {
          this.jsonResponse = response.data.data;
        } else {
          this.jsonResponse = response.data;
        }
        
        this.$nextTick(() => {
          this.initJsonEditor();
        });
      } catch (error) {
        console.error('Error al obtener estructura JSON:', error);
        this.q.notify({
          type: 'negative',
          message: 'Error al generar JSON'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async generateWebSocketCode(modelId) {
    try {
      const deviceId = parseInt(this.$route.params.id);
      if (!deviceId || !modelId) {
        throw new Error('ID de dispositivo o modelo no encontrado');
      }
      // Obtener la estructura JSON del modelo para usar en el código WebSocket
      const userId = this.authStore?.user?.id || 1; // Valor por defecto si no hay usuario
      
      // Mostrar indicador de carga
      this.isLoading = true;
      
      // Llamar al endpoint del backend para obtener el código WebSocket
      const response = await apiService.post('data/getWebSocketCode', {
        device_id: deviceId,
        model_id: modelId.model_id,
        user_id: userId
      });
      
      if (response.data) {
        // Actualizar los códigos generados
        this.pythonWebSocketCode = response.data.pythonCode || 'No se pudo generar el código Python';
        this.javascriptWebSocketCode = response.data.javascriptCode || 'No se pudo generar el código JavaScript';
        this.arduinoCode = response.data.arduinoCode || 'No se pudo generar el código Arduino';
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error al obtener el código WebSocket:', error);
      this.pythonWebSocketCode = 'Error al obtener código del servidor. Contacte al administrador.';
      this.javascriptWebSocketCode = 'Error al obtener código del servidor. Contacte al administrador.';
      
      this.q.notify({
        type: 'negative',
        message: 'Error al generar código WebSocket'
      });
    } finally {
      // Ocultar indicador de carga
      this.isLoading = false;
    }
  },

    async handleGetLatestData() {
      try {
        // Asegurarse de que estamos pasando el ID del modelo, no el objeto completo
        const modelId = typeof this.selectedModelForLatestData === 'object' ? this.selectedModelForLatestData.model_id : this.selectedModelForLatestData;
        const deviceId = parseInt(this.$route.params.id);
        
        // Usar el método actualizado que incluye el ID del dispositivo
        const response = await apiService.get(`/data/getLatest?model=${modelId}&device=${deviceId}`);
        this.latestDataResponse = response.data;
        this.$nextTick(() => {
          this.initLatestJsonEditor();
        });
      } catch (error) {
        console.error('Error al obtener datos recientes:', error);
        this.q.notify({
          type: 'negative',
          message: 'Error al obtener datos recientes'
        });
      }
    },

    initJsonEditor() {
      const container = this.$refs.jsonEditor;
      if (!container) return;

      if (this.jsonEditorInstance) {
        this.jsonEditorInstance.destroy();
      }

      this.jsonEditorInstance = new JSONEditor(container, {
        mode: 'tree',
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false,
        onError: (err) => {
          console.error('Error en el editor JSON:', err);
        }
      });

      this.jsonEditorInstance.set(this.jsonResponse);
      this.addCopyButton('jsonEditor', this.jsonEditorInstance);
    },

    initLatestJsonEditor() {
      const container = this.$refs.latestJsonEditor;
      if (!container) return;

      if (this.latestJsonEditorInstance) {
        this.latestJsonEditorInstance.destroy();
      }

      this.latestJsonEditorInstance = new JSONEditor(container, {
        mode: 'view',
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false,
        onError: (err) => {
          console.error('Error en el editor JSON:', err);
        }
      });

      this.latestJsonEditorInstance.set(this.latestDataResponse);
    },

    // Método unificado para agregar botón de copiar
    createCopyButton() {
      const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copiar JSON';
        copyButton.onclick = () => {
          const jsonContent = this.jsonEditorInstance.get();
          navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2))
            .then(() => {
              this.q.notify({
                message: 'JSON copiado al portapapeles',
                color: 'positive'
              });
            })
            .catch(err => {
              console.error('Error al copiar:', err);
              this.q.notify({
                message: 'Error al copiar el JSON',
                color: 'negative'
              });
            });
        };
        this.$refs.jsonEditor.appendChild(copyButton);
      },

    cleanupResources() {
      // Detener el envío programado si está activo
      if (this.dataUploadActive) {
        this.stopDataUpload();
      }
      // Limpiar los editores JSON si existen
      if (this.jsonEditorInstance) {
        this.jsonEditorInstance.destroy();
      }
      if (this.latestJsonEditorInstance) {
        this.latestJsonEditorInstance.destroy();
      }
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
    selectedModelForWebSocket(newVal) {
      if (newVal) {
        this.generateWebSocketCode(newVal);
      } else {
        this.pythonWebSocketCode = 'Selecciona un módulo para generar el código';
        this.javascriptWebSocketCode = 'Selecciona un módulo para generar el código';
      }
    },
    wsCodeType(newVal) {
      // Actualizar el código cuando cambia el tipo de conexión
      if(newVal === 'python') {
        this.generatePythonWebSocketCode();
      } else if(newVal === 'javascript') {
        this.generateJavascriptWebSocketCode();
      }
      if (this.selectedModelForWebSocket) {
        this.generateWebSocketCode(this.selectedModelForWebSocket);
      }
    },
  },
  mounted() {
    // Llamar al método fetchModels del store
    this.fetchModels().then(() => {
      // Actualizar generalModels con los modelos del store
      this.generalModels = this.models;
    }).catch(error => {
      console.error('Error al cargar modelos:', error);
      this.q.notify({
        type: 'negative',
        message: 'Error al cargar los módulos'
      });
    });
    this.fetchDeviceData();
  },
  beforeUnmount() {
    // Limpiar todos los recursos al desmontar el componente
    this.cleanupResources();
  },




  handleDownloadGraph(graphConfig, index, format) {
    this.isDownloading = true;
    // Implementación de descarga de gráfica
    setTimeout(() => {
      this.isDownloading = false;
      this.q.notify({
        type: 'positive',
        message: `'Gráfica' descargada en formato ${format}`
      });
    }, 1000);
  },

  // Método para generar código WebSocket
  

  // Método para copiar código al portapapeles
  copyCode(code) {
    navigator.clipboard.writeText(code)
      .then(() => {
        this.q.notify({
          type: 'positive',
          message: 'Código copiado al portapapeles'
        });
      })
      .catch(err => {
        console.error('Error al copiar el código:', err);
        this.q.notify({
          type: 'negative',
          message: 'Error al copiar el código'
        });
      });
  },
  
  // Método para obtener el nombre del módulo
  getModuleName(modelId) {
    if (!modelId || !this.generalModels) return 'Módulo';
    const model = this.generalModels.find(m => m.model_id === modelId);
    return model ? model.name : 'Módulo';
  },

  handleRemoveGraph(index) {
    this.graphs.splice(index, 1);
    this.q.notify({
      type: 'info',
      message: 'Gráfica eliminada'
    });
  },
}
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

.sisdai-section-subtitle {
  font-size: 1rem;
  color: var(--sisdae-primary-color);
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  font-weight: bold;
}

.sisdai-description {
  font-size: 0.9rem;
  color: var(--sisdae-text-color, #555);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.sisdai-form-grid {
  display: grid;
}

.sisdai-usage-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
}

.sisdai-usage-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sisdai-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--sisdae-primary-color, #1976d2);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.sisdai-step-content {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.5;
}

.sisdai-code-snippet {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  font-family: monospace;
}

.ws-data-item {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.ws-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.ws-data-timestamp {
  font-size: 0.8rem;
  color: #666;
}

.ws-data-type {
  font-size: 0.8rem;
}

.ws-data-content {
  padding: 12px;
  margin: 0;
  background-color: white;
  font-size: 0.9rem;
  max-height: 200px;
  overflow-y: auto;
}

.sisdai-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.sisdai-section-subtitle {
  font-size: 1rem;
  color: var(--sisdae-secondary-color);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.sisdai-code-container {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9rem;
  border: 1px solid #ddd;
}

.sisdai-ws-status {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ws-data-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.ws-data-timestamp {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.ws-data-content {
  background-color: #f9f9f9;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0;
  overflow-x: auto;
  font-size: 0.9rem;
}

/* Estilos para el envío programado de datos */
.sisdai-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.sisdai-status-container {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.sisdai-history-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sisdai-history-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.sisdai-history-item:last-child {
  border-bottom: none;
}

.sisdai-history-timestamp {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.sisdai-history-message {
  margin-top: 4px;
  width: 100%;
}
</style>