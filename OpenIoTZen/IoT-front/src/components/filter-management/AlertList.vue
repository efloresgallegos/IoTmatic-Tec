<template>
  <div class="alert-list-container">
    <div class="alert-list-header q-mb-md">
      <h5 class="q-mt-none q-mb-sm">{{ $t('alertList.title') }}</h5>
      <p class="text-grey-8">{{ $t('alertList.description') }}</p>
    </div>
    
    <!-- Filtros de búsqueda -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-select
          v-model="filterModel"
          :options="modelOptions"
          :label="$t('alertList.filterByModel')"
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
          :label="$t('alertList.filterByDevice')"
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
          v-model="alertStatus"
          :options="statusOptions"
          :label="$t('alertList.filterByStatus')"
          outlined
          dense
          clearable
        />
      </div>
    </div>
    
    <!-- Lista de alertas -->
    <q-card v-if="!loading && filteredAlerts.length > 0" flat bordered>
      <q-list separator>
        <q-item v-for="alert in filteredAlerts" :key="alert.alert_id" class="alert-item">
          <q-item-section avatar>
            <q-avatar :color="getStatusColor(alert)" text-color="white" icon="warning" />
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-medium">
              {{ getModelName(alert.model_id) }} / {{ getDeviceName(alert.device_id) }}
            </q-item-label>
            <q-item-label caption>
              {{ formatDate(alert.createdAt) }}
            </q-item-label>
            <q-item-label class="q-mt-xs">
              {{ alert.description }}
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                v-if="!alert.seen"
                icon="visibility"
                color="primary"
                flat
                round
                dense
                @click="markAsSeen(alert)"
                :title="$t('alertList.markAsSeen')"
              />
              <q-btn
                v-if="!alert.resolved"
                icon="check_circle"
                color="positive"
                flat
                round
                dense
                @click="markAsResolved(alert)"
                :title="$t('alertList.markAsResolved')"
              />
              <q-btn
                icon="delete"
                color="negative"
                flat
                round
                dense
                @click="confirmDelete(alert)"
                :title="$t('alertList.delete')"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      
      <!-- Paginación -->
      <div class="row justify-center q-pa-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-links
          direction-links
          color="primary"
        />
      </div>
    </q-card>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <span class="q-ml-sm">{{ $t('alertList.loading') }}</span>
    </div>
    
    <!-- Mensaje cuando no hay alertas -->
    <q-card v-if="!loading && filteredAlerts.length === 0" flat bordered class="text-center q-pa-md">
      <q-icon name="notifications_off" size="3em" color="grey-5" />
      <p class="text-grey-8">{{ $t('alertList.noAlerts') }}</p>
    </q-card>
    
    <!-- Diálogo de confirmación para eliminar -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('alertList.deleteConfirmation') }}</span>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('common.delete')" color="negative" @click="deleteAlert" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import apiService from '../../boot/ApiServices/api.service';

export default {
  name: 'AlertList',
  
  setup() {
    const $q = useQuasar();
    const { t } = useI18n();
    
    // Estados
    const loading = ref(false);
    const alerts = ref([]);
    const models = ref([]);
    const devices = ref([]);
    const showDeleteConfirm = ref(false);
    const alertToDelete = ref(null);
    
    // Paginación
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const totalPages = computed(() => Math.ceil(filteredAlerts.value.length / itemsPerPage));
    
    // Filtros de búsqueda
    const filterModel = ref(null);
    const filterDevice = ref(null);
    const alertStatus = ref(null);
    
    // Opciones para filtros
    const modelOptions = computed(() => models.value);
    const deviceOptions = computed(() => devices.value);
    const statusOptions = [
      { label: t('alertList.status.all'), value: 'all' },
      { label: t('alertList.status.unseen'), value: 'unseen' },
      { label: t('alertList.status.unresolved'), value: 'unresolved' },
      { label: t('alertList.status.resolved'), value: 'resolved' }
    ];
    
    // Alertas filtradas según criterios de búsqueda
    const filteredAlerts = computed(() => {
      let result = [...alerts.value];
      
      if (filterModel.value) {
        result = result.filter(a => a.model_id === filterModel.value);
      }
      
      if (filterDevice.value) {
        result = result.filter(a => a.device_id === filterDevice.value);
      }
      
      if (alertStatus.value) {
        switch (alertStatus.value) {
          case 'unseen':
            result = result.filter(a => !a.seen);
            break;
          case 'unresolved':
            result = result.filter(a => !a.resolved);
            break;
          case 'resolved':
            result = result.filter(a => a.resolved);
            break;
        }
      }
      
      // Ordenar por fecha (más recientes primero)
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return result;
    });
    
    // Cargar datos iniciales
    onMounted(async () => {
      await Promise.all([
        loadAlerts(),
        loadModels(),
        loadDevices()
      ]);
    });
    
    // Cargar alertas
    const loadAlerts = async () => {
      loading.value = true;
      try {
        const response = await apiService.get('/alerts');
        alerts.value = response.data;
      } catch (error) {
        console.error('Error al cargar alertas:', error);
        $q.notify({
          type: 'negative',
          message: t('alertList.errorLoadingAlerts')
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
      return model ? model.name : t('alertList.unknownModel');
    };
    
    // Obtener nombre de dispositivo por ID
    const getDeviceName = (deviceId) => {
      const device = devices.value.find(d => d.device_id === deviceId);
      return device ? device.name : t('alertList.unknownDevice');
    };
    
    // Formatear fecha
    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
    };
    
    // Obtener color según estado de la alerta
    const getStatusColor = (alert) => {
      if (alert.resolved) return 'positive';
      if (!alert.seen) return 'negative';
      return 'warning';
    };
    
    // Marcar alerta como vista
    const markAsSeen = async (alert) => {
      try {
        await apiService.patch(`/alerts/${alert.alert_id}`, { seen: true });
        await loadAlerts();
        $q.notify({
          type: 'positive',
          message: t('alertList.markedAsSeen')
        });
      } catch (error) {
        console.error('Error al marcar alerta como vista:', error);
        $q.notify({
          type: 'negative',
          message: t('alertList.errorUpdatingAlert')
        });
      }
    };
    
    // Marcar alerta como resuelta
    const markAsResolved = async (alert) => {
      try {
        await apiService.patch(`/alerts/${alert.alert_id}`, { resolved: true });
        await loadAlerts();
        $q.notify({
          type: 'positive',
          message: t('alertList.markedAsResolved')
        });
      } catch (error) {
        console.error('Error al marcar alerta como resuelta:', error);
        $q.notify({
          type: 'negative',
          message: t('alertList.errorUpdatingAlert')
        });
      }
    };
    
    // Confirmar eliminación de alerta
    const confirmDelete = (alert) => {
      alertToDelete.value = alert;
      showDeleteConfirm.value = true;
    };
    
    // Eliminar alerta
    const deleteAlert = async () => {
      try {
        await apiService.delete(`/alerts/${alertToDelete.value.alert_id}`);
        await loadAlerts();
        $q.notify({
          type: 'positive',
          message: t('alertList.alertDeleted')
        });
      } catch (error) {
        console.error('Error al eliminar alerta:', error);
        $q.notify({
          type: 'negative',
          message: t('alertList.errorDeletingAlert')
        });
      }
    };
    
    // Resetear página cuando cambian los filtros
    watch([filterModel, filterDevice, alertStatus], () => {
      currentPage.value = 1;
    });
    
    return {
      // Estados
      loading,
      alerts,
      showDeleteConfirm,
      
      // Paginación
      currentPage,
      totalPages,
      
      // Filtros de búsqueda
      filterModel,
      filterDevice,
      alertStatus,
      
      // Opciones
      modelOptions,
      deviceOptions,
      statusOptions,
      
      // Computados
      filteredAlerts,
      
      // Métodos
      getModelName,
      getDeviceName,
      formatDate,
      getStatusColor,
      markAsSeen,
      markAsResolved,
      confirmDelete,
      deleteAlert
    };
  }
};
</script>

<style scoped>
.alert-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.alert-item {
  transition: background-color 0.3s;
}

.alert-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>