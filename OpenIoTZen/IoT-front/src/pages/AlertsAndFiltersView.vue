<template>
  <q-page class="q-pa-md">
    <!-- Título de la página -->
    <h2 class="text-h4 q-mb-md text-center">{{ $t('views.alertsAndFilters.title') }}</h2>

    <!-- Pestañas para organizar los componentes -->
    <q-tabs v-model="tab" align="center" class="bg-primary text-white">
      <q-tab name="alerts" :label="$t('views.alertsAndFilters.tabs.alerts')" />
      <q-tab name="filters" :label="$t('views.alertsAndFilters.tabs.filters')" />
      <q-tab name="createFilter" :label="$t('views.alertsAndFilters.tabs.createFilter')" />
    </q-tabs>

    <!-- Contenido de las pestañas -->
    <q-tab-panels v-model="tab" animated>
      <!-- Pestaña de Alertas -->
      <q-tab-panel name="alerts">
        <div class="q-pa-md">
          <h3 class="text-h5 q-mb-md text-center">{{ $t('views.alertsAndFilters.alerts.title') }}</h3>
          <q-table
            :rows="alerts"
            :columns="alertColumns"
            row-key="id"
            :loading="loadingAlerts"
            :pagination="{ rowsPerPage: 10 }"
            class="my-table"
          >
            <!-- Personalización de celdas -->
            <template v-slot:body-cell-device="props">
              <q-td :props="props">
                {{ devices[props.row.device] || $t('views.alertsAndFilters.loading') }}
              </q-td>
            </template>
            <template v-slot:body-cell-module="props">
              <q-td :props="props">
                {{ modules[props.row.module] || $t('views.alertsAndFilters.loading') }}
              </q-td>
            </template>
            <template v-slot:body-cell-resolved="props">
              <q-td :props="props">
                <q-badge :color="props.row.resolved ? 'positive' : 'negative'">
                  {{ props.row.resolved ? $t('views.alertsAndFilters.alerts.resolved') : $t('views.alertsAndFilters.alerts.pending') }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-tab-panel>

      <!-- Pestaña de Filtros -->
      <q-tab-panel name="filters">
        <div class="q-pa-md">
          <h3 class="text-h5 q-mb-md text-center">{{ $t('views.alertsAndFilters.filters.title') }}</h3>
          <q-table
            :rows="filters"
            :columns="filterColumns"
            row-key="_id"
            :loading="loadingFilters"
            :pagination="{ rowsPerPage: 10 }"
            class="my-table"
          >
            <!-- Personalización de celdas -->
            <template v-slot:body-cell-device="props">
              <q-td :props="props">
                {{ devices[props.row.device] || $t('views.alertsAndFilters.loading') }}
              </q-td>
            </template>
            <template v-slot:body-cell-module="props">
              <q-td :props="props">
                {{ modules[props.row.module] || $t('views.alertsAndFilters.loading') }}
              </q-td>
            </template>
            <template v-slot:body-cell-conditions="props">
              <q-td :props="props">
                <div v-for="(cond, i) in props.row.conditions" :key="i">
                  {{ cond.condition }} {{ cond.threshold }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  @click="handleDelete(props.row._id)"
                  color="negative"
                  icon="delete"
                  round
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-tab-panel>

      <!-- Pestaña de Crear Filtro -->
      <q-tab-panel name="createFilter">
        <div class="q-pa-md">
          <h3 class="text-h5 q-mb-md text-center">{{ $t('views.alertsAndFilters.createFilter.title') }}</h3>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="filter.device"
                :options="devicesOptions"
                option-value="_id"
                option-label="name"
                :label="$t('views.alertsAndFilters.createFilter.selectDevice')"
                outlined
                dense
                @update:model-value="handleDeviceChange"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filter.module"
                :options="modulesOptions"
                option-value="_id"
                option-label="name"
                :label="$t('views.alertsAndFilters.createFilter.selectModule')"
                outlined
                dense
                @update:model-value="handleModuleChange"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filter.field"
                :options="fieldsOptions"
                :label="$t('views.alertsAndFilters.createFilter.selectField')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="condition.condition"
                :options="conditionOptions"
                :label="$t('views.alertsAndFilters.createFilter.condition')"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="condition.threshold"
                type="number"
                :label="$t('views.alertsAndFilters.createFilter.threshold')"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-btn @click="addCondition" color="primary" :label="$t('views.alertsAndFilters.createFilter.addCondition')" class="full-width" />
            </div>
          </div>

          <div class="q-mt-md">
            <h4 class="text-h6 q-mb-sm">{{ $t('views.alertsAndFilters.createFilter.conditionsList') }}</h4>
            <q-list bordered>
              <q-item v-for="(cond, index) in filter.conditions" :key="index" class="q-my-sm">
                <q-item-section>
                  {{ cond.condition }} {{ cond.threshold }}
                </q-item-section>
                <q-item-section side>
                  <q-btn @click="removeCondition(index)" color="negative" icon="delete" round dense />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="q-mt-md text-center">
            <q-btn @click="handleSubmit" color="positive" :label="$t('views.alertsAndFilters.createFilter.createFilterButton')" />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue';
import apiService from 'src/boot/ApiServices/api.service';

export default {
  name: 'AlertAndFilterView',
  setup() {
    const tab = ref('alerts'); // Pestaña activa

    // Estado para AlertList
    const alerts = ref([]);
    const devices = ref({});
    const modules = ref({});
    const loadingAlerts = ref(false);

    // Columnas para la tabla de alertas
    const alertColumns = [
      { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
      { name: 'device', label: 'Dispositivo', field: 'device', align: 'left' },
      { name: 'module', label: 'Módulo', field: 'module', align: 'left' },
      { name: 'resolved', label: 'Estado', field: 'resolved', align: 'center' },
    ];

    // Estado para FilterForm
    const filter = reactive({
      field: '',
      conditions: [],
      device: '',
      module: '',
    });
    const condition = reactive({
      condition: '<',
      threshold: 0,
    });
    const devicesOptions = ref([]);
    const modulesOptions = ref([]);
    const fieldsOptions = ref([]);
    const conditionOptions = ['<', '<=', '=', '>=', '>'];

    // Estado para FilterList
    const filters = ref([]);
    const loadingFilters = ref(false);

    // Columnas para la tabla de filtros
    const filterColumns = [
      { name: 'device', label: 'Dispositivo', field: 'device', align: 'left' },
      { name: 'module', label: 'Módulo', field: 'module', align: 'left' },
      { name: 'field', label: 'Campo', field: 'field', align: 'left' },
      { name: 'conditions', label: 'Condiciones', field: 'conditions', align: 'left' },
      { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
    ];

    // Métodos para AlertList
    const fetchAlerts = async () => {
      loadingAlerts.value = true;
      const data = await apiService.get('/alerts/getall');
      alerts.value = data;

      const devicePromises = data.map((alert) => apiService.get(`/devices/byid/${alert.device}`));
      const modulePromises = data.map((alert) => apiService.get(`/modules/${alert.module}`));

      const deviceResults = await Promise.all(devicePromises);
      const moduleResults = await Promise.all(modulePromises);

      const devicesMap = {};
      const modulesMap = {};

      deviceResults.forEach((result, index) => {
        devicesMap[data[index].device] = result.name;
      });

      moduleResults.forEach((result, index) => {
        modulesMap[data[index].module] = result.name;
      });

      devices.value = devicesMap;
      modules.value = modulesMap;
      loadingAlerts.value = false;
    };

    // Métodos para FilterForm
    const handleDeviceChange = async (deviceId) => {
      filter.device = deviceId;
      const modulesData = await apiService.get(`/data/from-device/${deviceId}`);
      modulesOptions.value = modulesData.modules;
    };

    const handleModuleChange = async (moduleId) => {
      filter.module = moduleId;
      const fieldsData = await apiService.post(`/modules/graphable/${filter.device}`, { module: moduleId });
      fieldsOptions.value = fieldsData.graphableAttributes;
    };

    const addCondition = () => {
      filter.conditions.push({ ...condition });
      condition.condition = '<';
      condition.threshold = 0;
    };

    const removeCondition = (index) => {
      filter.conditions.splice(index, 1);
    };

    const handleSubmit = async () => {
      await apiService.post('/filters/create', filter);
      filter.field = '';
      filter.conditions = [];
      filter.device = '';
      filter.module = '';
      fetchFilters(); // Actualizar la lista de filtros
    };

    // Métodos para FilterList
    const fetchFilters = async () => {
      loadingFilters.value = true;
      const data = await apiService.get('/filters/getall');
      filters.value = data;

      const devicePromises = data.map((filter) => apiService.get(`/devices/byid/${filter.device}`));
      const modulePromises = data.map((filter) => apiService.get(`/modules/${filter.module}`));

      const deviceResults = await Promise.all(devicePromises);
      const moduleResults = await Promise.all(modulePromises);

      const devicesMap = {};
      const modulesMap = {};

      deviceResults.forEach((result, index) => {
        devicesMap[data[index].device] = result.name;
      });

      moduleResults.forEach((result, index) => {
        modulesMap[data[index].module] = result.name;
      });

      devices.value = devicesMap;
      modules.value = modulesMap;
      loadingFilters.value = false;
    };

    const handleDelete = async (id) => {
      await apiService.delete(`/filters/delete/${id}`);
      filters.value = filters.value.filter((filter) => filter._id !== id);
    };

    // Cargar datos iniciales
    fetchAlerts();
    fetchFilters();

    return {
      tab,
      alerts,
      devices,
      modules,
      alertColumns,
      loadingAlerts,
      filter,
      condition,
      devicesOptions,
      modulesOptions,
      fieldsOptions,
      conditionOptions,
      filters,
      filterColumns,
      loadingFilters,
      handleDeviceChange,
      handleModuleChange,
      addCondition,
      removeCondition,
      handleSubmit,
      handleDelete,
    };
  },
};
</script>

<style scoped>
.my-table {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

.q-pa-md {
  padding: 16px;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-mt-md {
  margin-top: 16px;
}

.q-col-gutter-md {
  margin: -8px;
}

.q-col-gutter-md > * {
  padding: 8px;
}
</style>