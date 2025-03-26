<template>
  <q-page padding>
    <div class="q-pa-md">
      <h1 class="text-h4 q-mb-md">Modelos de datos</h1>
      
      <q-table
        title="Modelos disponibles"
        :rows="models"
        :columns="columns"
        row-key="model_id"
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
            placeholder="Buscar"
            class="q-mr-md"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-btn
                dense
                round
                flat
                color="primary"
                icon="visibility"
                @click="showModelSchema(props.row)"
              >
                <q-tooltip>Visualizar esquema</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                flat
                color="negative"
                icon="delete"
                @click.stop="confirmDelete(props.row)"
              >
                <q-tooltip>Eliminar modelo</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

      <!-- Diálogo para mostrar el esquema del modelo (ahora más compacto) -->
      <q-dialog v-model="showDialog" standard>
        <q-card style="width: 700px; max-width: 80vw;">
          <q-card-section class="row items-center q-pb-sm">
            <div class="text-h6">Esquema: {{ selectedModel?.name }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          
          <q-separator />
          
          <q-card-section class="q-pa-md" style="max-height: 60vh; overflow: auto;">
            <q-tree
              :nodes="formattedSchema"
              node-key="id"
              default-expand-all
            />
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Diálogo de confirmación para eliminar -->
      <q-dialog v-model="confirmDeleteDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="negative" text-color="white" />
            <span class="q-ml-sm">¿Estás seguro de que deseas eliminar el modelo "{{ modelToDelete?.name }}"?</span>
          </q-card-section>

          <q-card-section class="q-pt-none">
            Esta acción no se puede deshacer.
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <q-btn flat label="Eliminar" color="negative" @click="deleteModel" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import ApiServices from '../boot/ApiServices/api.service.js';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ModelsView',

  setup() {
    const $q = useQuasar();
    const models = ref([]);
    const loading = ref(true);
    const showDialog = ref(false);
    const selectedModel = ref(null);
    const selectedModelSchema = ref({});
    const filter = ref('');
    const confirmDeleteDialog = ref(false);
    const modelToDelete = ref(null);
    
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10
    });

    const columns = [
      {
        name: 'model_id',
        label: 'ID',
        field: 'model_id',
        sortable: true,
        align: 'left'
      },
      {
        name: 'name',
        required: true,
        label: 'Nombre',
        field: 'name',
        sortable: true,
        align: 'left'
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: '',
        align: 'center'
      }
    ];

    // Formato mejorado para el esquema
    const formattedSchema = computed(() => {
      const formatObject = (obj, prefix = '') => {
        if (!obj || typeof obj !== 'object') return [];
        
        return Object.entries(obj).map(([key, value]) => {
          const nodeId = prefix ? `${prefix}.${key}` : key;
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            return {
              id: nodeId,
              label: key,
              children: formatObject(value, nodeId),
              icon: 'fas fa-folder'
            };
          } else if (Array.isArray(value)) {
            return {
              id: nodeId,
              label: `${key} (${value.length} items)`,
              children: value.map((item, index) => {
                if (typeof item === 'object') {
                  return {
                    id: `${nodeId}[${index}]`,
                    label: `Item ${index}`,
                    children: formatObject(item, `${nodeId}[${index}]`),
                    icon: 'fas fa-list-ul'
                  };
                }
                return {
                  id: `${nodeId}[${index}]`,
                  label: `${index}: ${item}`,
                  icon: 'fas fa-circle'
                };
              }),
              icon: 'fas fa-list-ul'
            };
          }
          
          return {
            id: nodeId,
            label: `${key}: ${value}`,
            icon: 'fas fa-circle'
          };
        });
      };
      
      return formatObject(selectedModelSchema.value);
    });

    const fetchModels = async () => {
      try {
        loading.value = true;
        const response = await ApiServices.get('models');
        
        if (Array.isArray(response.data)) {
          models.value = response.data;
          pagination.value.rowsNumber = models.value.length;
        } else {
          console.error('Invalid response format:', response);
          models.value = [];
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        models.value = [];
        $q.notify({
          color: 'negative',
          message: 'Error al cargar los modelos',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const showModelSchema = async (model) => {
      try {
        loading.value = true;
        selectedModel.value = model;
        const response = await ApiServices.get(`models/${model.model_id}/json`);
        selectedModelSchema.value = response.data;
        showDialog.value = true;
      } catch (error) {
        console.error('Error fetching model schema:', error);
        $q.notify({
          color: 'negative',
          message: 'Error al cargar el esquema del modelo',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const confirmDelete = (model) => {
      modelToDelete.value = model;
      confirmDeleteDialog.value = true;
    };

    const deleteModel = async () => {
      if (!modelToDelete.value) return;
      
      try {
        loading.value = true;
        await ApiServices.delete(`models/${modelToDelete.value.model_id}`);
        
        $q.notify({
          color: 'positive',
          message: `Modelo '${modelToDelete.value.name}' eliminado con éxito`,
          icon: 'check_circle'
        });
        
        // Actualizar lista de modelos
        await fetchModels();
      } catch (error) {
        console.error('Error deleting model:', error);
        $q.notify({
          color: 'negative',
          message: 'Error al eliminar el modelo',
          icon: 'error'
        });
      } finally {
        loading.value = false;
        modelToDelete.value = null;
      }
    };

    onMounted(() => {
      fetchModels();
    });

    return {
      models,
      columns,
      loading,
      showDialog,
      selectedModel,
      selectedModelSchema,
      filter,
      pagination,
      confirmDeleteDialog,
      modelToDelete,
      formattedSchema,
      showModelSchema,
      confirmDelete,
      deleteModel
    };
  }
});
</script>

<style lang="scss">
.my-sticky-header-table {
  /* height or max-height is important */
  max-height: 70vh;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: white;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }
  
  thead tr:first-child th {
    top: 0;
  }
}
</style>