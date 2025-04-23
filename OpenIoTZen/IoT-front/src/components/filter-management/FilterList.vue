<template>
  <div class="filter-list-container">
    <div class="filter-list-header q-mb-md">
      <h5 class="q-mt-none q-mb-sm">{{ $t('filterList.title') }}</h5>
      <p class="text-grey-8">{{ $t('filterList.description') }}</p>
      
      <!-- Botón para crear nuevo filtro -->
      <q-btn
        color="primary"
        :label="$t('filterList.createNew')"
        icon="add"
        @click="showFilterCreator = true"
        class="q-mt-sm"
      />
    </div>
    
    <!-- Filtros de búsqueda -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-select
          v-model="filterModel"
          :options="modelOptions"
          :label="$t('filterList.filterByModel')"
          option-value="model_id"
          option-label="name"
          map-options
          emit-value
          outlined
          dense
          clearable
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="filterDevice"
          :options="deviceOptions"
          :label="$t('filterList.filterByDevice')"
          option-value="device_id"
          option-label="name"
          map-options
          emit-value
          outlined
          dense
          clearable
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="filterType"
          :options="filterTypeOptions"
          :label="$t('filterList.filterByType')"
          outlined
          dense
          clearable
        />
      </div>
    </div>
    
    <!-- Lista de filtros -->
    <q-card v-if="!loading && filteredFilters.length > 0" flat bordered>
      <q-list separator>
        <q-item v-for="filter in filteredFilters" :key="filter.filter_id" class="filter-item">
          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-medium">
              {{ getModelName(filter.model_id) }} / {{ getDeviceName(filter.device_id) }}
            </q-item-label>
            <q-item-label caption>
              <span class="text-primary">{{ filter.field }}</span> 
              <q-badge :color="getFilterTypeColor(filter.filter_type)" class="q-ml-sm">
                {{ getFilterTypeName(filter.filter_type) }}
              </q-badge>
            </q-item-label>
            <q-item-label class="q-mt-xs">
              <div v-for="(condition, idx) in filter.conditions" :key="idx" class="condition-item">
                <q-chip size="sm" outline color="grey">
                  {{ getConditionText(condition, filter.filter_type) }}
                </q-chip>
              </div>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                icon="edit"
                color="primary"
                flat
                round
                dense
                @click="editFilter(filter)"
              />
              <q-btn
                icon="delete"
                color="negative"
                flat
                round
                dense
                @click="confirmDelete(filter)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <span class="q-ml-sm">{{ $t('filterList.loading') }}</span>
    </div>
    
    <!-- Mensaje cuando no hay filtros -->
    <q-card v-if="!loading && filteredFilters.length === 0" flat bordered class="text-center q-pa-md">
      <q-icon name="filter_alt" size="3em" color="grey-5" />
      <p class="text-grey-8">{{ $t('filterList.noFilters') }}</p>
      <q-btn
        color="primary"
        :label="$t('filterList.createFirst')"
        icon="add"
        @click="showFilterCreator = true"
      />
    </q-card>
    
    <!-- Diálogo para crear/editar filtro -->
    <q-dialog v-model="showFilterCreator" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingFilter ? $t('filterList.editFilter') : $t('filterList.newFilter') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="cancelEdit" />
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <filter-creator
            :edit-mode="!!editingFilter"
            :filter-data="editingFilter"
            @filter-saved="onFilterSaved"
            @filter-canceled="cancelEdit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!-- Diálogo de confirmación para eliminar -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('filterList.deleteConfirmation') }}</span>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('common.delete')" color="negative" @click="deleteFilter" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import apiService from '../../boot/ApiServices/api.service';
import FilterCreator from './FilterCreator.vue';

export default {
  name: 'FilterList',
  components: {
    FilterCreator
  },
  
  setup() {
    const $q = useQuasar();
    const { t } = useI18n();
    
    // Estados
    const loading = ref(false);
    const filters = ref([]);
    const models = ref([]);
    const devices = ref([]);
    const showFilterCreator = ref(false);
    const editingFilter = ref(null);
    const showDeleteConfirm = ref(false);
    const filterToDelete = ref(null);
    
    // Filtros de búsqueda
    const filterModel = ref(null);
    const filterDevice = ref(null);
    const filterType = ref(null);
    
    // Opciones para filtros
    const modelOptions = computed(() => models.value);
    const deviceOptions = computed(() => devices.value);
    const filterTypeOptions = [
      { label: t('filterCreator.numeric'), value: 'numeric' },
      { label: t('filterCreator.boolean'), value: 'boolean' },
      { label: t('filterCreator.string'), value: 'string' }
    ];
    
    // Filtros filtrados según criterios de búsqueda
    const filteredFilters = computed(() => {
      let result = [...filters.value];
      
      if (filterModel.value) {
        result = result.filter(f => f.model_id === filterModel.value);
      }
      
      if (filterDevice.value) {
        result = result.filter(f => f.device_id === filterDevice.value);
      }
      
      if (filterType.value) {
        result = result.filter(f => f.filter_type === filterType.value);
      }
      
      return result;
    });
    
    // Cargar datos iniciales
    onMounted(async () => {
      await Promise.all([
        loadFilters(),
        loadModels(),
        loadDevices()
      ]);
    });
    
    // Cargar filtros
    const loadFilters = async () => {
      loading.value = true;
      try {
        const response = await apiService.get('/filters');
        filters.value = response.data;
      } catch (error) {
        console.error('Error al cargar filtros:', error);
        $q.notify({
          type: 'negative',
          message: t('filterList.errorLoadingFilters')
        });
      } finally {
        loading.value = false;
      }
    };
    
    // Cargar modelos
    const loadModels = async () => {
      try {
        const response = await apiService.get('/models');
        models.value = response.data;
      } catch (error) {
        console.error('Error al cargar modelos:', error);
      }
    };
    
    // Cargar dispositivos
    const loadDevices = async () => {
      try {
        const response = await apiService.get('/devices');
        devices.value = response.data;
      } catch (error) {
        console.error('Error al cargar dispositivos:', error);
      }
    };
    
    // Obtener nombre de modelo por ID
    const getModelName = (modelId) => {
      const model = models.value.find(m => m.model_id === modelId);
      return model ? model.name : t('filterList.unknownModel');
    };
    
    // Obtener nombre de dispositivo por ID
    const getDeviceName = (deviceId) => {
      const device = devices.value.find(d => d.device_id === deviceId);
      return device ? device.name : t('filterList.unknownDevice');
    };
    
    // Obtener nombre legible del tipo de filtro
    const getFilterTypeName = (type) => {
      switch (type) {
        case 'numeric': return t('filterCreator.numeric');
        case 'boolean': return t('filterCreator.boolean');
        case 'string': return t('filterCreator.string');
        default: return type;
      }
    };
    
    // Obtener color para el tipo de filtro
    const getFilterTypeColor = (type) => {
      switch (type) {
        case 'numeric': return 'blue';
        case 'boolean': return 'green';
        case 'string': return 'purple';
        default: return 'grey';
      }
    };
    
    // Obtener texto descriptivo de la condición
    const getConditionText = (condition, filterType) => {
      const { condition: operator, threshold } = condition;
      let operatorText = operator;
      
      // Traducir operador
      switch (operator) {
        case '=': operatorText = '=';
          break;
        case '!=': operatorText = '≠';
          break;
        case '>': operatorText = '>';
          break;
        case '<': operatorText = '<';
          break;
        case '>=': operatorText = '≥';
          break;
        case '<=': operatorText = '≤';
          break;
        case 'contains': operatorText = t('filterCreator.operators.contains');
          break;
        case 'starts_with': operatorText = t('filterCreator.operators.startsWith');
          break;
        case 'ends_with': operatorText = t('filterCreator.operators.endsWith');
          break;
      }
      
      // Formatear según tipo
      let thresholdText = threshold;
      if (filterType === 'boolean') {
        thresholdText = threshold ? t('filterCreator.true') : t('filterCreator.false');
      } else if (filterType === 'string') {
        thresholdText = `"${threshold}"`;
      }
      
      return `${operatorText} ${thresholdText}`;
    };
    
    // Editar un filtro existente
    const editFilter = (filter) => {
      editingFilter.value = { ...filter };
      showFilterCreator.value = true;
    };
    
    // Confirmar eliminación de filtro
    const confirmDelete = (filter) => {
      filterToDelete.value = filter;
      showDeleteConfirm.value = true;
    };
    
    // Eliminar filtro
    const deleteFilter = async () => {
      try {
        await apiService.delete(`/filters/${filterToDelete.value.filter_id}`);
        await loadFilters();
        $q.notify({
          type: 'positive',
          message: t('filterList.filterDeleted')
        });
      } catch (error) {
        console.error('Error al eliminar filtro:', error);
        $q.notify({
          type: 'negative',
          message: t('filterList.errorDeletingFilter')
        });
      }
    };
    
    // Manejar guardado de filtro
    const onFilterSaved = async () => {
      showFilterCreator.value = false;
      editingFilter.value = null;
      await loadFilters();
    };
    
    // Cancelar edición
    const cancelEdit = () => {
      editingFilter.value = null;
      showFilterCreator.value = false;
    };
    
    return {
      // Estados
      loading,
      filters,
      showFilterCreator,
      editingFilter,
      showDeleteConfirm,
      
      // Filtros de búsqueda
      filterModel,
      filterDevice,
      filterType,
      
      // Opciones
      modelOptions,
      deviceOptions,
      filterTypeOptions,
      
      // Computados
      filteredFilters,
      
      // Métodos
      getModelName,
      getDeviceName,
      getFilterTypeName,
      getFilterTypeColor,
      getConditionText,
      editFilter,
      confirmDelete,
      deleteFilter,
      onFilterSaved,
      cancelEdit
    };
  }
};
</script>

<style scoped>
.filter-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-item {
  transition: background-color 0.3s;
}

.filter-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.condition-item {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 4px;
}
</style>