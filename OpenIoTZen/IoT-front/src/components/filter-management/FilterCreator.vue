<template>
  <div class="filter-creator-container q-pa-md">
    <h5 class="q-mt-none q-mb-md">{{ $t('filterCreator.title') }}</h5>
    
    <!-- Selección de modelo y dispositivo -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedModel"
          :options="modelOptions"
          :label="$t('filterCreator.selectModel')"
          option-value="model_id"
          option-label="name"
          map-options
          emit-value
          outlined
          @update:model-value="onModelChange"
          :loading="loadingModels"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedDevice"
          :options="deviceOptions"
          :label="$t('filterCreator.selectDevice')"
          option-value="device_id"
          option-label="name"
          map-options
          emit-value
          outlined
          :disable="!selectedModel"
          :loading="loadingDevices"
        />
      </div>
    </div>
    
    <!-- Selección de campo y tipo de filtro -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedField"
          :options="fieldOptions"
          :label="$t('filterCreator.selectField')"
          outlined
          :disable="!selectedModel || !selectedDevice"
          :loading="loadingFields"
          @update:model-value="onFieldChange"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="filterType"
          :options="filterTypeOptions"
          :label="$t('filterCreator.filterType')"
          outlined
          :disable="!selectedField"
        />
      </div>
    </div>
    
    <!-- Configuración de condiciones -->
    <div class="q-mt-md">
      <div class="text-subtitle1 q-mb-sm">{{ $t('filterCreator.conditions') }}</div>
      
      <div v-for="(condition, index) in conditions" :key="index" class="row q-col-gutter-md q-mb-md">
        <!-- Operador de condición -->
        <div class="col-12 col-md-5">
          <q-select
            v-model="condition.condition"
            :options="getOperatorOptions()"
            :label="$t('filterCreator.operator')"
            outlined
            dense
          />
        </div>
        
        <!-- Valor umbral -->
        <div class="col-12 col-md-5">
          <!-- Input numérico para filtros numéricos -->
          <q-input
            v-if="filterType === 'numeric'"
            v-model.number="condition.threshold"
            type="number"
            :label="$t('filterCreator.threshold')"
            outlined
            dense
          />
          
          <!-- Toggle para filtros booleanos -->
          <q-toggle
            v-else-if="filterType === 'boolean'"
            v-model="condition.threshold"
            :label="condition.threshold ? $t('filterCreator.true') : $t('filterCreator.false')"
            color="primary"
          />
          
          <!-- Input de texto para filtros de texto -->
          <q-input
            v-else-if="filterType === 'string'"
            v-model="condition.threshold"
            :label="$t('filterCreator.textValue')"
            outlined
            dense
          />
        </div>
        
        <!-- Botón para eliminar condición -->
        <div class="col-12 col-md-2 flex items-center">
          <q-btn
            icon="delete"
            color="negative"
            flat
            dense
            @click="removeCondition(index)"
            :disable="conditions.length <= 1"
          />
        </div>
      </div>
      
      <!-- Botón para agregar condición -->
      <q-btn
        icon="add"
        :label="$t('filterCreator.addCondition')"
        color="primary"
        outline
        class="q-mt-sm"
        @click="addCondition"
        :disable="!selectedField"
      />
    </div>
    
    <!-- Botones de acción -->
    <div class="row justify-end q-mt-lg">
      <q-btn
        :label="$t('common.cancel')"
        color="grey"
        flat
        class="q-mr-sm"
        @click="resetForm"
      />
      <q-btn
        :label="$t('common.save')"
        color="primary"
        @click="saveFilter"
        :loading="saving"
        :disable="!isFormValid"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import apiService from '../../boot/ApiServices/api.service';

export default {
  name: 'FilterCreator',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    filterData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['filter-saved', 'filter-canceled'],
  
  setup(props, { emit }) {
    const $q = useQuasar();
    const { t } = useI18n();
    
    // Estados
    const loadingModels = ref(false);
    const loadingDevices = ref(false);
    const loadingFields = ref(false);
    const saving = ref(false);
    
    // Datos del formulario
    const selectedModel = ref(null);
    const selectedDevice = ref(null);
    const selectedField = ref('');
    const filterType = ref('numeric');
    const conditions = ref([{ condition: '>', threshold: 0 }]);
    
    // Opciones para selects
    const modelOptions = ref([]);
    const deviceOptions = ref([]);
    const fieldOptions = ref([]);
    
    // Opciones de tipo de filtro
    const filterTypeOptions = [
      { label: t('filterCreator.numeric'), value: 'numeric' },
      { label: t('filterCreator.boolean'), value: 'boolean' },
      { label: t('filterCreator.string'), value: 'string' }
    ];
    
    // Validación del formulario
    const isFormValid = computed(() => {
      return (
        selectedModel.value &&
        selectedDevice.value &&
        selectedField.value &&
        filterType.value &&
        conditions.value.length > 0 &&
        conditions.value.every(c => c.condition && (c.threshold !== undefined))
      );
    });
    
    // Cargar modelos al iniciar
    onMounted(async () => {
      await loadModels();
      
      // Si estamos en modo edición, cargar datos del filtro
      if (props.editMode && props.filterData) {
        await loadFilterData();
      }
    });
    
    // Cargar modelos disponibles
    const loadModels = async () => {
      loadingModels.value = true;
      try {
        const response = await apiService.get('/models');
        modelOptions.value = response.data;
      } catch (error) {
        console.error('Error al cargar modelos:', error);
        $q.notify({
          type: 'negative',
          message: t('filterCreator.errorLoadingModels')
        });
      } finally {
        loadingModels.value = false;
      }
    };
    
    // Cuando cambia el modelo, cargar dispositivos asociados
    const onModelChange = async () => {
      selectedDevice.value = null;
      selectedField.value = '';
      deviceOptions.value = [];
      fieldOptions.value = [];
      
      if (!selectedModel.value) return;
      
      await loadDevices();
    };
    
    // Cargar dispositivos para el modelo seleccionado
    const loadDevices = async () => {
      loadingDevices.value = true;
      try {
        const response = await apiService.get(`/devices/model/${selectedModel.value}`);
        deviceOptions.value = response.data;
      } catch (error) {
        console.error('Error al cargar dispositivos:', error);
        $q.notify({
          type: 'negative',
          message: t('filterCreator.errorLoadingDevices')
        });
      } finally {
        loadingDevices.value = false;
      }
    };
    
    // Cuando cambia el dispositivo, cargar campos disponibles
    watch(selectedDevice, async () => {
      if (selectedDevice.value) {
        await loadFields();
      }
    });
    
    // Cargar campos disponibles para el modelo seleccionado
    const loadFields = async () => {
      loadingFields.value = true;
      try {
        // Obtener campos graficables como punto de partida
        const response = await apiService.get(`/graph/fields/${selectedModel.value}`);
        fieldOptions.value = response.data.map(field => ({
          label: field,
          value: field
        }));
      } catch (error) {
        console.error('Error al cargar campos:', error);
        $q.notify({
          type: 'negative',
          message: t('filterCreator.errorLoadingFields')
        });
      } finally {
        loadingFields.value = false;
      }
    };
    
    // Cuando cambia el campo, detectar automáticamente el tipo de dato
    const onFieldChange = async () => {
      if (!selectedField.value) return;
      
      try {
        // Intentar obtener el último valor para detectar el tipo
        const response = await apiService.post('/data/latest', {
          model_id: selectedModel.value,
          device_id: selectedDevice.value
        });
        
        if (response.data && response.data[selectedField.value] !== undefined) {
          const value = response.data[selectedField.value];
          
          // Detectar tipo de dato
          if (typeof value === 'boolean') {
            filterType.value = 'boolean';
            conditions.value = [{ condition: '=', threshold: false }];
          } else if (typeof value === 'number') {
            filterType.value = 'numeric';
            conditions.value = [{ condition: '>', threshold: 0 }];
          } else if (typeof value === 'string') {
            filterType.value = 'string';
            conditions.value = [{ condition: 'contains', threshold: '' }];
          }
        }
      } catch (error) {
        console.error('Error al detectar tipo de dato:', error);
        // Si falla, mantener el tipo numérico por defecto
      }
    };
    
    // Obtener opciones de operadores según el tipo de filtro
    const getOperatorOptions = () => {
      switch (filterType.value) {
        case 'numeric':
          return [
            { label: t('filterCreator.operators.equal'), value: '=' },
            { label: t('filterCreator.operators.notEqual'), value: '!=' },
            { label: t('filterCreator.operators.greaterThan'), value: '>' },
            { label: t('filterCreator.operators.lessThan'), value: '<' },
            { label: t('filterCreator.operators.greaterOrEqual'), value: '>=' },
            { label: t('filterCreator.operators.lessOrEqual'), value: '<=' }
          ];
        case 'boolean':
          return [
            { label: t('filterCreator.operators.equal'), value: '=' },
            { label: t('filterCreator.operators.notEqual'), value: '!=' }
          ];
        case 'string':
          return [
            { label: t('filterCreator.operators.equal'), value: '=' },
            { label: t('filterCreator.operators.notEqual'), value: '!=' },
            { label: t('filterCreator.operators.contains'), value: 'contains' },
            { label: t('filterCreator.operators.startsWith'), value: 'starts_with' },
            { label: t('filterCreator.operators.endsWith'), value: 'ends_with' }
          ];
        default:
          return [];
      }
    };
    
    // Agregar una nueva condición
    const addCondition = () => {
      let newCondition;
      
      switch (filterType.value) {
        case 'numeric':
          newCondition = { condition: '>', threshold: 0 };
          break;
        case 'boolean':
          newCondition = { condition: '=', threshold: false };
          break;
        case 'string':
          newCondition = { condition: 'contains', threshold: '' };
          break;
        default:
          newCondition = { condition: '=', threshold: 0 };
      }
      
      conditions.value.push(newCondition);
    };
    
    // Eliminar una condición
    const removeCondition = (index) => {
      conditions.value.splice(index, 1);
    };
    
    // Guardar el filtro
    const saveFilter = async () => {
      saving.value = true;
      
      try {
        const filterData = {
          model_id: selectedModel.value,
          device_id: selectedDevice.value,
          field: selectedField.value,
          filter_type: filterType.value,
          conditions: conditions.value
        };
        
        let response;
        if (props.editMode && props.filterData.filter_id) {
          response = await apiService.put(`/filters/${props.filterData.filter_id}`, filterData);
        } else {
          response = await apiService.post('/filters', filterData);
        }
        
        $q.notify({
          type: 'positive',
          message: props.editMode 
            ? t('filterCreator.filterUpdated') 
            : t('filterCreator.filterCreated')
        });
        
        emit('filter-saved', response.data);
        resetForm();
      } catch (error) {
        console.error('Error al guardar filtro:', error);
        $q.notify({
          type: 'negative',
          message: t('filterCreator.errorSavingFilter')
        });
      } finally {
        saving.value = false;
      }
    };
    
    // Cargar datos de un filtro existente (modo edición)
    const loadFilterData = async () => {
      const filter = props.filterData;
      
      selectedModel.value = filter.model_id;
      await loadDevices();
      selectedDevice.value = filter.device_id;
      await loadFields();
      selectedField.value = filter.field;
      filterType.value = filter.filter_type || 'numeric';
      conditions.value = filter.conditions || [{ condition: '>', threshold: 0 }];
    };
    
    // Resetear formulario
    const resetForm = () => {
      if (props.editMode) {
        emit('filter-canceled');
        return;
      }
      
      selectedField.value = '';
      filterType.value = 'numeric';
      conditions.value = [{ condition: '>', threshold: 0 }];
    };
    
    // Observar cambios en el tipo de filtro para actualizar condiciones
    watch(filterType, (newType) => {
      // Resetear condiciones al cambiar el tipo
      switch (newType) {
        case 'numeric':
          conditions.value = [{ condition: '>', threshold: 0 }];
          break;
        case 'boolean':
          conditions.value = [{ condition: '=', threshold: false }];
          break;
        case 'string':
          conditions.value = [{ condition: 'contains', threshold: '' }];
          break;
      }
    });
    
    return {
      // Estados
      loadingModels,
      loadingDevices,
      loadingFields,
      saving,
      
      // Datos del formulario
      selectedModel,
      selectedDevice,
      selectedField,
      filterType,
      conditions,
      
      // Opciones
      modelOptions,
      deviceOptions,
      fieldOptions,
      filterTypeOptions,
      
      // Métodos
      onModelChange,
      onFieldChange,
      getOperatorOptions,
      addCondition,
      removeCondition,
      saveFilter,
      resetForm,
      
      // Computados
      isFormValid
    };
  }
};
</script>

<style scoped>
.filter-creator-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>