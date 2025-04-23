<template>
  <q-page padding>
    <div class="filter-management-container">
      <div class="row q-col-gutter-md">
        <!-- Sección de título y descripción -->
        <div class="col-12">
          <h4 class="q-mt-none q-mb-sm">{{ $t('filterManagement.title') }}</h4>
          <p class="text-grey-8">{{ $t('filterManagement.description') }}</p>
        </div>
        
        <!-- Pestañas para navegación -->
        <div class="col-12">
          <q-tabs
            v-model="activeTab"
            class="text-primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="filters" :label="$t('filterManagement.tabs.filters')" icon="filter_list" />
            <q-tab name="alerts" :label="$t('filterManagement.tabs.alerts')" icon="notifications" />
          </q-tabs>
          
          <q-separator />
          
          <q-tab-panels v-model="activeTab" animated>
            <!-- Panel de filtros -->
            <q-tab-panel name="filters">
              <filter-list />
            </q-tab-panel>
            
            <!-- Panel de alertas -->
            <q-tab-panel name="alerts">
              <alert-list />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import FilterList from '../components/filter-management/FilterList.vue';
import AlertList from '../components/filter-management/AlertList.vue';

export default {
  name: 'FilterManagementPage',
  components: {
    FilterList,
    AlertList
  },
  
  setup() {
    const activeTab = ref('filters');
    
    return {
      activeTab
    };
  }
};
</script>

<style scoped>
.filter-management-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>