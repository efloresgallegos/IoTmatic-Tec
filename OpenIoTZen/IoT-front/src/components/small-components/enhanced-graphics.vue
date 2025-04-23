<template>
  <div class="enhanced-graphics-container" ref="graphContainer">
    <!-- Indicador de carga -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner color="primary" size="3em" />
      <div class="loading-text">{{ $t('enhancedGraphics.loading') }}</div>
    </div>
    
    <!-- Componente de gráfico dinámico -->
    <component
      v-if="!loading && chartData.length > 0"
      :is="componenteGrafica"
      :barras_id="chartId"
      :datos="chartData"
      :variables="variables"
      :nombre_color="nombreColor"
      :nombre_barra="nombreBarra"
      :titulo_eje_x="tituloEjeX"
      :titulo_eje_y="tituloEjeY"
      :colores="colores"
    />
    
    <!-- Mensaje cuando no hay datos -->
    <div v-if="!loading && chartData.length === 0" class="no-data-message">
      {{ $t('enhancedGraphics.noData') }}
    </div>
    
    <!-- Controles del gráfico -->
    <div v-if="!loading && chartData.length > 0" class="chart-controls">
      <q-btn
        v-if="enableRealtime"
        :color="realtimeEnabled ? 'positive' : 'grey'"
        :icon="realtimeEnabled ? 'sync' : 'sync_disabled'"
        :label="realtimeEnabled ? $t('enhancedGraphics.realtimeEnabled') : $t('enhancedGraphics.enableRealtime')"
        @click="toggleRealtime"
        size="sm"
        class="control-btn"
      />
      <q-btn
        icon="refresh"
        :label="$t('enhancedGraphics.refreshData')"
        @click="refreshData"
        color="primary"
        size="sm"
        class="control-btn"
      />
      <q-btn
        icon="download"
        :label="$t('enhancedGraphics.downloadPNG')"
        @click="downloadChart('png')"
        color="secondary"
        size="sm"
        class="control-btn"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { SisdaiBarras, SisdaiDona, SisdaiAreasApiladas, SisdaiCajasBigotes, SisdaiGraficas } from '@centrogeomx/sisdai-graficas';

import realtimeService from '../../boot/ApiServices/realtime.service';
import graphService from '../../services/graph.service';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'EnhancedGraphicsComponent',
  components: {
    SisdaiBarras,
    SisdaiDona,
    SisdaiAreasApiladas,
    SisdaiCajasBigotes,
    SisdaiGraficas
  },
  props: {
    // Configuración del gráfico
    chartType: {
      type: String,
      required: true,
      validator: (value) => ['barras', 'pastel', 'areasApiladas', 'cajasBigotes', 'lineas'].includes(value)
    },
    modelId: {
      type: [Number, String],
      required: true
    },
    deviceId: {
      type: [Number, String],
      required: false,
      default: null
    },
    fields: {
      type: Array,
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    groupBy: {
      type: String,
      required: true,
      validator: (value) => ['day', 'month', 'year'].includes(value)
    },
    
    // Personalización del gráfico
    tituloEjeX: {
      type: String,
      default: 'Fecha'
    },
    tituloEjeY: {
      type: String,
      default: 'Valor'
    },
    nombreColor: {
      type: String,
      default: 'color'
    },
    nombreBarra: {
      type: String,
      default: 'barra'
    },
    colores: {
      type: Array,
      default: () => ['#FF5733', '#33C4FF', '#FFB833', '#33FF57', '#FF33A8']
    },
    
    // Opciones adicionales
    enableRealtime: {
      type: Boolean,
      default: true
    },
    autoRefresh: {
      type: Boolean,
      default: false
    },
    refreshInterval: {
      type: Number,
      default: 60000 // 1 minuto por defecto
    }
  },
  
  setup(props, { emit }) {
    const $q = useQuasar();
    const { t } = useI18n();
    const loading = ref(true);
    const chartData = ref([]);
    const chartId = ref(`chart-${uuidv4()}`);
    const graphContainer = ref(null);
    const realtimeEnabled = ref(props.autoRefresh);
    let refreshTimer = null;
    let realtimeUnsubscribe = null;
    
    // Componente de gráfico a utilizar
    const componenteGrafica = computed(() => {
      switch (props.chartType) {
        case 'barras':
          return 'SisdaiBarras';
        case 'pastel':
          return 'SisdaiDona';
        case 'areasApiladas':
          return 'SisdaiAreasApiladas';
        case 'cajasBigotes':
          return 'SisdaiCajasBigotes';
        case 'lineas':
          return 'SisdaiGraficas';
        default:
          return 'SisdaiBarras';
      }
    });
    
    // Variables a mostrar en el gráfico
    const variables = computed(() => {
      return props.fields;
    });
    
    // Cargar datos del gráfico
    const loadChartData = async () => {
      loading.value = true;
      try {
        const response = await graphService.getOptimizedChartData({
          model_id: props.modelId,
          device_id: props.deviceId,
          start_date: props.startDate,
          end_date: props.endDate,
          group_by: props.groupBy,
          fields: props.fields,
          chart_type: props.chartType
        });
        
        chartData.value = response.data;
        emit('data-loaded', chartData.value);
      } catch (error) {
        console.error('Error al cargar datos del gráfico:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al cargar los datos del gráfico',
          position: 'top',
          timeout: 3000
        });
        chartData.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // Actualizar datos
    const refreshData = async () => {
      await loadChartData();
      $q.notify({
        type: 'positive',
        message: t('enhancedGraphics.dataUpdated'),
        position: 'top',
        timeout: 2000
      });
    };
    
    // Activar/desactivar tiempo real
    const toggleRealtime = () => {
      realtimeEnabled.value = !realtimeEnabled.value;
      
      if (realtimeEnabled.value) {
        setupRealtimeUpdates();
        $q.notify({
          type: 'positive',
          message: t('enhancedGraphics.realtimeActivated'),
          position: 'top',
          timeout: 2000
        });
      } else {
        cleanupRealtimeUpdates();
        $q.notify({
          type: 'info',
          message: t('enhancedGraphics.realtimeDeactivated'),
          position: 'top',
          timeout: 2000
        });
      }
    };
    
    // Configurar actualizaciones en tiempo real
    const setupRealtimeUpdates = () => {
      // Limpiar suscripción anterior si existe
      cleanupRealtimeUpdates();
      
      // Suscribirse a actualizaciones
      if (realtimeService.connected) {
        // Usar el servicio de gráficos para suscribirse a actualizaciones en tiempo real
        realtimeUnsubscribe = graphService.subscribeToRealtimeUpdates({
          device_id: props.deviceId,
          model_id: props.modelId
        }, handleRealtimeUpdate);
      } else {
        console.warn('Servicio de tiempo real no conectado');
        $q.notify({
          type: 'warning',
          message: t('enhancedGraphics.realtimeConnectionError'),
          position: 'top',
          timeout: 3000
        });
      }
      
      // Configurar temporizador de actualización automática
      if (props.autoRefresh && !refreshTimer) {
        refreshTimer = setInterval(refreshData, props.refreshInterval);
      }
    };
    
    // Limpiar actualizaciones en tiempo real
    const cleanupRealtimeUpdates = () => {
      // Cancelar suscripción a eventos
      if (realtimeUnsubscribe) {
        realtimeUnsubscribe();
        realtimeUnsubscribe = null;
      }
      
      // Limpiar temporizador
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };
    
    // Manejar actualización en tiempo real
    const handleRealtimeUpdate = (data) => {
      // Verificar que la actualización corresponda a nuestro modelo y dispositivo
      if (data.model_id == props.modelId && 
          (!props.deviceId || data.device_id == props.deviceId)) {
        
        // Verificar si hay campos relevantes para este gráfico
        const hasRelevantFields = props.fields.some(field => 
          data.data[field] !== undefined
        );
        
        if (hasRelevantFields) {
          // Actualizar datos (en un caso real, habría que integrar los nuevos datos)
          // Para simplificar, solo notificamos y sugerimos actualizar
          $q.notify({
            type: 'info',
            message: 'Nuevos datos disponibles. Haga clic en Actualizar para verlos.',
            position: 'top',
            timeout: 3000,
            actions: [{
              label: 'Actualizar',
              color: 'white',
              handler: () => refreshData()
            }]
          });
        }
      }
    };
    
    // Descargar gráfico como imagen
    const downloadChart = (format = 'png') => {
      try {
        if (!graphContainer.value) return;
        
        const svgElement = graphContainer.value.querySelector('svg');
        if (!svgElement) {
          throw new Error('No se encontró el elemento SVG');
        }
        
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `grafico-${chartId.value}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        $q.notify({
          type: 'positive',
          message: `Gráfica descargada en formato ${format}`,
          position: 'top',
          timeout: 2000
        });
      } catch (error) {
        console.error('Error al descargar la gráfica:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al descargar la gráfica',
          position: 'top',
          timeout: 3000
        });
      }
    };
    
    // Ciclo de vida del componente
    onMounted(async () => {
      await loadChartData();
      
      // Configurar actualizaciones en tiempo real si están habilitadas
      if (props.enableRealtime && realtimeEnabled.value) {
        setupRealtimeUpdates();
      }
    });
    
    onBeforeUnmount(() => {
      cleanupRealtimeUpdates();
    });
    
    // Observar cambios en las propiedades para recargar datos
    watch(
      [() => props.modelId, () => props.deviceId, () => props.startDate, () => props.endDate, () => props.groupBy, () => props.fields, () => props.chartType],
      async () => {
        await loadChartData();
        
        // Actualizar suscripción en tiempo real si está habilitada
        if (realtimeEnabled.value) {
          setupRealtimeUpdates();
        }
      }
    );
    
    return {
      loading,
      chartData,
      chartId,
      graphContainer,
      componenteGrafica,
      variables,
      realtimeEnabled,
      refreshData,
      toggleRealtime,
      downloadChart,
      // Eliminamos las propiedades duplicadas que ya vienen de props
    };
  }
};
</script>

<style scoped>
.enhanced-graphics-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  margin-bottom: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--q-primary);
}

.no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
  font-style: italic;
}

.chart-controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.control-btn {
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .chart-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .control-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>