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
      default: () => ['#FF5733', '#33C4FF', '#FFB833', '#FF33A8', '#33FF57']
    },

    // Opciones adicionales
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
    let refreshTimer = null;

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

      // Configurar temporizador de actualización automática si está habilitado
      if (props.autoRefresh && props.refreshInterval > 0) {
        refreshTimer = setInterval(refreshData, props.refreshInterval);
      }
    });

    onBeforeUnmount(() => {
      // Limpiar temporizador
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    });

    // Observar cambios en las propiedades para recargar datos
    watch(
      [() => props.modelId, () => props.deviceId, () => props.startDate, () => props.endDate, () => props.groupBy, () => props.fields, () => props.chartType],
      async () => {
        await loadChartData();
      }
    );

    return {
      loading,
      chartData,
      chartId,
      graphContainer,
      componenteGrafica,
      variables,
      refreshData,
      downloadChart,
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
  color: #333;
  font-weight: 500;
}

.no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  color: #666;
  font-style: italic;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.chart-controls {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.control-btn {
  min-width: 110px;
}
</style>
