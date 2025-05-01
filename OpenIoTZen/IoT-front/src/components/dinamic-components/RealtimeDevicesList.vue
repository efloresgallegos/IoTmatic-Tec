<template>
  <div class="realtime-devices-container">
    <div class="realtime-header">
      <h3>{{ $t('views.devices.realtime.title') }}</h3>
      <q-toggle
        v-model="realtimeEnabled"
        :label="$t('views.devices.realtime.toggle')"
        color="primary"
        @update:model-value="toggleRealtime"
      />
    </div>

    <div v-if="realtimeEnabled" class="realtime-content">
      <div v-if="connectedDevices.length > 0" class="connected-devices-list">
        <div
          v-for="device in connectedDevices"
          :key="device.device_id"
          class="connected-device-item"
        >
          <div class="device-status">
            <span class="status-indicator online"></span>
          </div>
          <div class="device-info">
            <p class="device-name">{{ device.name }}</p>
            <p class="device-model">{{ device.model ? device.model.name : $t('views.devices.realtime.noModel') }}</p>
          </div>
          <div class="device-time">
            <p>{{ formatTime(device.connected_since) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-devices">
        <p>{{ $t('views.devices.realtime.noDevices') }}</p>
      </div>
    </div>
    <div v-else class="realtime-disabled">
      <p>{{ $t('views.devices.realtime.disabled') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import realtimeService from '../../boot/ApiServices/realtime.service';

const { t } = useI18n();
const $q = useQuasar();

// Estado del componente
const realtimeEnabled = ref(false);
const connectedDevices = ref([]);
let unsubscribeDeviceStatus = null;

// Formatear tiempo de conexión
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// Activar/desactivar monitoreo en tiempo real
const toggleRealtime = () => {
  if (realtimeEnabled.value) {
    setupRealtimeMonitoring();
    $q.notify({
      type: 'positive',
      message: t('views.devices.realtime.activated'),
      position: 'top',
      timeout: 2000
    });
  } else {
    cleanupRealtimeMonitoring();
    $q.notify({
      type: 'info',
      message: t('views.devices.realtime.deactivated'),
      position: 'top',
      timeout: 2000
    });
  }
};

// Configurar monitoreo en tiempo real
const setupRealtimeMonitoring = async () => {
  // Limpiar suscripción anterior si existe
  cleanupRealtimeMonitoring();

  // Si no está conectado, intentar conectar primero
  if (!realtimeService.connected) {
    try {
      console.log('Intentando conectar el servicio de tiempo real...');
      await realtimeService.connect();
    } catch (error) {
      console.error('Error al conectar el servicio de tiempo real:', error);
      $q.notify({
        type: 'negative',
        message: t('views.devices.realtime.connectionError'),
        position: 'top',
        timeout: 3000
      });
      realtimeEnabled.value = false;
      return;
    }
  }

  // Suscribirse a actualizaciones de estado de dispositivos
  if (realtimeService.connected) {
    // Suscribirse a eventos de dispositivos conectados
    realtimeService.subscribeToDeviceStatus();

    // Registrar manejador para actualizaciones de estado
    unsubscribeDeviceStatus = realtimeService.on('device_status_update', handleDeviceStatusUpdate);

    // Cargar dispositivos ya conectados
    connectedDevices.value = realtimeService.getConnectedDevices();
  } else {
    console.warn('Servicio de tiempo real no conectado');
    $q.notify({
      type: 'warning',
      message: t('views.devices.realtime.connectionError'),
      position: 'top',
      timeout: 3000
    });
    realtimeEnabled.value = false;
  }
};

// Manejar actualizaciones de estado de dispositivos
const handleDeviceStatusUpdate = (data) => {
  if (data.status === 'connected') {
    // Verificar si el dispositivo ya está en la lista
    const existingIndex = connectedDevices.value.findIndex(d => d.device_id === data.device_id);

    if (existingIndex >= 0) {
      // Actualizar dispositivo existente
      connectedDevices.value[existingIndex] = {
        ...connectedDevices.value[existingIndex],
        ...data,
        connected_since: data.connected_since || new Date().toISOString()
      };
    } else {
      // Añadir nuevo dispositivo
      connectedDevices.value.push({
        ...data,
        connected_since: data.connected_since || new Date().toISOString()
      });
    }
  } else if (data.status === 'disconnected') {
    // Eliminar dispositivo de la lista
    connectedDevices.value = connectedDevices.value.filter(d => d.device_id !== data.device_id);
  }
};

// Limpiar monitoreo en tiempo real
const cleanupRealtimeMonitoring = () => {
  if (unsubscribeDeviceStatus) {
    unsubscribeDeviceStatus();
    unsubscribeDeviceStatus = null;
  }

  // Limpiar lista de dispositivos conectados
  connectedDevices.value = [];
};

onMounted(async () => {
  // Verificar si el servicio de tiempo real está conectado
  console.log('Componente RealtimeDevicesList montado, estado de conexión:', realtimeService.connected);

  if (!realtimeService.connected) {
    try {
      console.log('Intentando conectar el servicio de tiempo real desde RealtimeDevicesList...');
      await realtimeService.connect();
      console.log('Conexión WebSocket establecida correctamente');

      // Habilitar automáticamente el monitoreo si la conexión fue exitosa
      if (realtimeService.connected) {
        console.log('Habilitando monitoreo automáticamente después de la conexión exitosa');
        realtimeEnabled.value = true;
        setupRealtimeMonitoring();
      }
    } catch (error) {
      console.error('Error al conectar servicio de tiempo real:', error);
      $q.notify({
        type: 'negative',
        message: t('views.devices.realtime.connectionError'),
        position: 'top',
        timeout: 3000
      });
    }
  } else {
    // Si ya está conectado, habilitamos el monitoreo automáticamente
    console.log('WebSocket ya conectado, habilitando monitoreo automáticamente');
    realtimeEnabled.value = true;
    setupRealtimeMonitoring();
  }
});

onUnmounted(() => {
  cleanupRealtimeMonitoring();
});
</script>

<style scoped>
.realtime-devices-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 20px;
}

.realtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.realtime-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.connected-devices-list {
  max-height: 300px;
  overflow-y: auto;
}

.connected-device-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.connected-device-item:last-child {
  border-bottom: none;
}

.device-status {
  margin-right: 12px;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.online {
  background-color: #4CAF50;
  box-shadow: 0 0 5px #4CAF50;
}

.device-info {
  flex: 1;
}

.device-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.device-model {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.device-time {
  font-size: 0.8rem;
  color: #999;
}

.no-devices, .realtime-disabled {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
