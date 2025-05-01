<template>
  <q-page padding>
    <div class="q-pa-md">
      <h1 class="text-h4 q-mb-md">{{ $t('views.settings.title') }}</h1>
      
      <!-- Sección de dispositivos conectados -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="devices" class="q-mr-sm" />
            {{ $t('views.settings.connectedDevices') }}
          </div>
        </q-card-section>
        
        <q-card-section>
          <q-table
            :rows="connectedDevices"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :filter="filter"
            v-model:pagination="pagination"
            class="my-sticky-header-table"
          >
            <template v-slot:top-right>
              <q-input
                dense
                debounce="300"
                v-model="filter"
                :placeholder="$t('common.search')"
                class="q-mr-md"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn
                color="primary"
                icon="refresh"
                :label="$t('views.settings.refreshDevices')"
                @click="fetchConnectedDevices"
                :loading="refreshing"
              />
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.status === 'online' ? 'positive' : 'negative'"
                  :label="$t(`views.settings.status.${props.row.status}`)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <q-btn
                    dense
                    round
                    flat
                    color="primary"
                    icon="info"
                    @click="showDeviceDetails(props.row)"
                  >
                    <q-tooltip>{{ $t('views.settings.viewDetails') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    round
                    flat
                    color="warning"
                    icon="sync"
                    @click="reconnectDevice(props.row)"
                    :disable="props.row.status === 'online'"
                  >
                    <q-tooltip>{{ $t('views.settings.reconnect') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    round
                    flat
                    color="negative"
                    icon="link_off"
                    @click="disconnectDevice(props.row)"
                    :disable="props.row.status === 'offline'"
                  >
                    <q-tooltip>{{ $t('views.settings.disconnect') }}</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-negative">
                <q-icon name="warning" size="2em" class="q-mr-sm" />
                {{ $t('views.settings.noDevicesFound') }}
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Diálogo para mostrar detalles del dispositivo -->
      <q-dialog v-model="showDialog">
        <q-card style="width: 700px; max-width: 80vw;">
          <q-card-section class="row items-center q-pb-sm">
            <div class="text-h6">{{ $t('views.settings.deviceDetails') }}: {{ selectedDevice?.name }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          
          <q-separator />
          
          <q-card-section class="q-pa-md" style="max-height: 60vh; overflow: auto;">
            <q-list>
              <q-item v-for="(value, key) in deviceDetails" :key="key">
                <q-item-section>
                  <q-item-label overline>{{ $t(`views.settings.deviceProps.${key}`) }}</q-item-label>
                  <q-item-label>{{ value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn flat :label="$t('common.close')" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted} from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import apiService from 'src/boot/ApiServices/api.service';
const $q = useQuasar();
const { t } = useI18n();

// Estado
const connectedDevices = ref([]);
const loading = ref(true);
const refreshing = ref(false);
const filter = ref('');
const showDialog = ref(false);
const selectedDevice = ref(null);
const deviceDetails = ref({});

// Configuración de la tabla
const columns = [
  { name: 'id', align: 'left', label: t('views.settings.columns.id'), field: 'id', sortable: true },
  { name: 'name', align: 'left', label: t('views.settings.columns.name'), field: 'name', sortable: true },
  { name: 'type', align: 'left', label: t('views.settings.columns.type'), field: 'type', sortable: true },
  { name: 'ip', align: 'left', label: t('views.settings.columns.ip'), field: 'ip', sortable: true },
  { name: 'lastConnection', align: 'left', label: t('views.settings.columns.lastConnection'), field: 'lastConnection', sortable: true },
  { name: 'status', align: 'left', label: t('views.settings.columns.status'), field: 'status', sortable: true },
  { name: 'actions', align: 'center', label: t('views.settings.columns.actions'), field: 'actions', sortable: false }
];

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10
});

// Métodos
async function fetchConnectedDevices() {
  loading.value = true;
  refreshing.value = true;
  try {
    // Llamada al API para obtener los dispositivos conectados
    const response = await apiService.get(`/connections`);
    
    if (response.status === 404) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // La respuesta de apiService ya es un objeto con la propiedad data
    connectedDevices.value = response.data;
  } catch (error) {
    console.error('Error al obtener dispositivos conectados:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('views.settings.errors.fetchFailed'),
      icon: 'report_problem'
    });
    
    // Si hay un error, usamos datos de ejemplo para desarrollo
    if (process.env.NODE_ENV === 'development') {
      connectedDevices.value = [
        { id: '001', name: 'Sensor Temperatura', type: 'Sensor', ip: '192.168.1.101', lastConnection: '2023-10-15 14:30', status: 'online' },
        { id: '002', name: 'Cámara Seguridad', type: 'Cámara', ip: '192.168.1.102', lastConnection: '2023-10-15 13:45', status: 'online' },
        { id: '003', name: 'Actuador Puerta', type: 'Actuador', ip: '192.168.1.103', lastConnection: '2023-10-14 09:20', status: 'offline' }
      ];
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function showDeviceDetails(device) {
  selectedDevice.value = device;
  try {
    // Llamada al API para obtener detalles del dispositivo
    const response = await apiService.get(`/connections/${device.id}`);
    
    if (!response.status === 200) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // La respuesta de apiService ya es un objeto con la propiedad data
    deviceDetails.value = response.data;
  } catch (error) {
    console.error('Error al obtener detalles del dispositivo:', error);
    // Si hay un error, usamos los datos básicos que ya tenemos
    deviceDetails.value = {
      id: device.id,
      name: device.name,
      type: device.type,
      ip: device.ip,
      mac: '00:1B:44:11:3A:B7', // Valor por defecto
      model: device.model_id || 'Desconocido',
      firmware: 'v1.0.0',
      lastConnection: device.lastConnection,
      status: device.status,
      uptime: device.uptime || (device.status === 'online' ? '3d 5h 22m' : '0'),
      protocol: device.protocol || 'WebSocket',
      connectionType: device.connectionType || 'Wireless',
      user_id: device.user_id || 'Desconocido',
      model_id: device.model_id || 'Desconocido'
    };
  } finally {
    showDialog.value = true;
  }
}

async function reconnectDevice(device) {
  try {
    $q.loading.show({
      message: t('views.settings.reconnecting')
    });
    
    // Llamada al API para reconectar el dispositivo
    // Nota: En una implementación real, aquí se enviaría una solicitud al backend
    // para intentar reconectar el dispositivo. Por ahora, simulamos la reconexión.
    
    // Simulación de reconexión (esto se reemplazaría por una llamada real al API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Actualizar el estado del dispositivo
    const index = connectedDevices.value.findIndex(d => d.id === device.id);
    if (index !== -1) {
      connectedDevices.value[index].status = 'online';
      connectedDevices.value[index].lastConnection = new Date().toLocaleString();
    }
    
    // Refrescar la lista de dispositivos para obtener el estado actualizado
    await fetchConnectedDevices();
    
    $q.notify({
      color: 'positive',
      position: 'top',
      message: t('views.settings.reconnectSuccess'),
      icon: 'check_circle'
    });
  } catch (error) {
    console.error('Error al reconectar dispositivo:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('views.settings.errors.reconnectFailed'),
      icon: 'report_problem'
    });
  } finally {
    $q.loading.hide();
  }
}

async function disconnectDevice(device) {
  try {
    $q.loading.show({
      message: t('views.settings.disconnecting')
    });
    
    // Llamada al API para desconectar el dispositivo
    // Nota: En una implementación real, aquí se enviaría una solicitud al backend
    // para desconectar el dispositivo. Por ahora, simulamos la desconexión.
    
    // Simulación de desconexión (esto se reemplazaría por una llamada real al API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Actualizar el estado del dispositivo
    const index = connectedDevices.value.findIndex(d => d.id === device.id);
    if (index !== -1) {
      connectedDevices.value[index].status = 'offline';
    }
    
    // Refrescar la lista de dispositivos para obtener el estado actualizado
    await fetchConnectedDevices();
    
    $q.notify({
      color: 'info',
      position: 'top',
      message: t('views.settings.disconnectSuccess'),
      icon: 'info'
    });
  } catch (error) {
    console.error('Error al desconectar dispositivo:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('views.settings.errors.disconnectFailed'),
      icon: 'report_problem'
    });
  } finally {
    $q.loading.hide();
  }
}

// Ciclo de vida
onMounted(() => {
  fetchConnectedDevices();
});
</script>

<style>
.my-sticky-header-table {
  /* height or max-height is important */
  max-height: 450px;
}

.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  background-color: white;
}

.my-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1;
}

.my-sticky-header-table thead tr:first-child th {
  top: 0;
}
</style>