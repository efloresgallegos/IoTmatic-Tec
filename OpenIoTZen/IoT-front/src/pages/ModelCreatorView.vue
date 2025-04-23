<template>
  <div class="model-creator">
    <div class="sisdai-container">
      <!-- Título -->
      <h1 class="sisdai-title text-center">{{ $t("views.modelCreator.title") }}</h1>

      <div class="sisdai-grid">
        <!-- Panel izquierdo: Formulario -->
        <div class="sisdai-panel">
          <q-card class="sisdai-card">
            <q-card-section>
              <form @submit.prevent="handleSubmit" class="sisdai-form">
                <!-- Nombre del Modelo -->
                <div class="sisdai-form-group">
                  <label for="modelName" class="sisdai-label">{{ $t("views.modelCreator.modelNameLabel") }}</label>
                  <q-input
                    id="modelName"
                    v-model="modelName"
                    :placeholder="$t('views.modelCreator.modelNamePlaceholder')"
                    :rules="[val => !!val || $t('views.modelCreator.errorModelNameRequired')]"
                    outlined
                    class="sisdai-input"
                    maxlength="15"
                  />
                </div>

                <!-- Campos -->
                <div class="sisdai-fields">
                  <div class="sisdai-section-title">{{ $t("views.modelCreator.fieldsTitle") }}</div>
                  
                  <div v-for="(field, index) in fields" :key="index" class="sisdai-field">
                    <q-card class="sisdai-field-card">
                      <q-card-section>
                        <!-- Encabezado del Campo -->
                        <div class="sisdai-field-header">
                          <div class="sisdai-field-title">{{ $t("views.modelCreator.fieldTitle") }} {{ index + 1 }}</div>
                          <q-btn
                            flat
                            round
                            color="negative"
                            icon="delete"
                            @click="removeField(index)"
                          />
                        </div>

                        <!-- Nombre del Campo -->
                        <div class="sisdai-form-group">
                          <label :for="`fieldName-${index}`" class="sisdai-label">
                            {{ $t("views.modelCreator.fieldNameLabel") }}
                          </label>
                          <q-input
                            :id="`fieldName-${index}`"
                            v-model="field.name"
                            :placeholder="$t('views.modelCreator.fieldNamePlaceholder')"
                            outlined
                            class="sisdai-input"
                            maxlength="50"
                          />
                        </div>

                        <!-- Tipo de Campo -->
                        <div class="sisdai-form-group">
                          <label :for="`fieldType-${index}`" class="sisdai-label">
                            {{ $t("views.modelCreator.fieldTypeLabel") }}
                          </label>
                          <q-select
                            :id="`fieldType-${index}`"
                            v-model="field.type"
                            :options="fieldTypes"
                            outlined
                            class="sisdai-select"
                            @update:model-value="handleFieldTypeChange(index)"
                          />
                        </div>

                        <!-- Requerido -->
                        <div class="sisdai-form-group">
                          <q-checkbox
                            v-model="field.required"
                            :label="$t('views.modelCreator.requiredLabel')"
                            class="sisdai-checkbox"
                          />
                        </div>

                        <!-- Subcampos (si el tipo es Object) -->
                        <div v-if="field.type === 'Object'" class="sisdai-subfields">
                          <div class="sisdai-section-subtitle">{{ $t("views.modelCreator.subfieldsTitle") }}</div>
                          <div v-for="(subField, subIndex) in field.fields" :key="subIndex" class="sisdai-subfield">
                            <q-card class="sisdai-subfield-card">
                              <q-card-section>
                                <div class="sisdai-subfield-header">
                                  <div class="sisdai-subfield-title">
                                    {{ $t("views.modelCreator.subfieldTitle") }} {{ subIndex + 1 }}
                                  </div>
                                  <q-btn
                                    flat
                                    round
                                    color="negative"
                                    icon="delete"
                                    @click="removeSubField(index, subIndex)"
                                  />
                                </div>

                                <div class="sisdai-form-group">
                                  <label :for="`subFieldName-${index}-${subIndex}`" class="sisdai-label">
                                    {{ $t("views.modelCreator.subfieldNameLabel") }}
                                  </label>
                                  <q-input
                                    :id="`subFieldName-${index}-${subIndex}`"
                                    v-model="subField.name"
                                    :placeholder="$t('views.modelCreator.subfieldNamePlaceholder')"
                                    outlined
                                    class="sisdai-input"
                                  />
                                </div>

                                <div class="sisdai-form-group">
                                  <label :for="`subFieldType-${index}-${subIndex}`" class="sisdai-label">
                                    {{ $t("views.modelCreator.fieldTypeLabel") }}
                                  </label>
                                  <q-select
                                    :id="`subFieldType-${index}-${subIndex}`"
                                    v-model="subField.type"
                                    :options="fieldTypes"
                                    outlined
                                    class="sisdai-select"
                                  />
                                </div>

                                <div class="sisdai-form-group">
                                  <q-checkbox
                                    v-model="subField.required"
                                    :label="$t('views.modelCreator.requiredLabel')"
                                    class="sisdai-checkbox"
                                  />
                                </div>

                                <!-- Opciones específicas para subcampos de tipo String -->
                                <div v-if="subField.type === 'String' || subField.type === 'Text'" class="sisdai-string-options">
                                  <div class="sisdai-form-group">
                                    <q-input
                                      v-model="subField.defaultValue"
                                      :label="$t('views.modelCreator.defaultValueLabel') || 'Valor predeterminado'"
                                      outlined
                                      class="sisdai-input"
                                      :hint="$t('views.modelCreator.defaultValueHint') || 'Valor por defecto'"
                                    />
                                  </div>
                                </div>

                                <!-- Opciones específicas para subcampos de tipo Number o Float -->
                                <div v-if="subField.type === 'Number' || subField.type === 'Float'" class="sisdai-number-options">
                                  <div class="sisdai-form-group">
                                    <q-input
                                      v-model.number="subField.defaultValue"
                                      :label="$t('views.modelCreator.defaultValueLabel') || 'Valor predeterminado'"
                                      outlined
                                      class="sisdai-input"
                                      type="number"
                                      :hint="$t('views.modelCreator.defaultValueHint') || 'Valor por defecto'"
                                    />
                                  </div>
                                </div>

                                <!-- Opciones específicas para subcampos de tipo Date -->
                                <div v-if="subField.type === 'Date'" class="sisdai-date-options">
                                  <div class="sisdai-form-group">
                                    <q-input
                                      v-model="subField.defaultValue"
                                      :label="$t('views.modelCreator.defaultDateLabel') || 'Fecha predeterminada'"
                                      outlined
                                      class="sisdai-input"
                                      type="date"
                                      :hint="$t('views.modelCreator.defaultDateHint') || 'Valor por defecto'"
                                    />
                                  </div>
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <q-btn
                            :label="$t('views.modelCreator.addSubfieldButton')"
                            color="primary"
                            class="sisdai-button q-mt-sm"
                            @click="addSubField(index)"
                          />
                        </div>

                        <!-- Opciones específicas para tipo Date -->
                        <div v-if="field.type === 'Date'" class="sisdai-date-options">
                          <div class="sisdai-form-group">
                            <q-input
                              v-model="field.defaultValue"
                              :label="$t('views.modelCreator.defaultDateLabel')"
                              outlined
                              class="sisdai-input"
                              type="date"
                              :hint="$t('views.modelCreator.defaultDateHint')"
                            />
                          </div>
                        </div>

                        <!-- Opciones específicas para tipo String -->
                        <div v-if="field.type === 'String' || field.type === 'Text'" class="sisdai-string-options">
                          <div class="sisdai-form-group">
                            <q-input
                              v-model="field.defaultValue"
                              :label="$t('views.modelCreator.defaultValueLabel') || 'Valor predeterminado'"
                              outlined
                              class="sisdai-input"
                              :hint="$t('views.modelCreator.defaultValueHint') || 'Valor por defecto'"
                            />
                          </div>
                        </div>

                        <!-- Opciones específicas para tipo Number o Float -->
                        <div v-if="field.type === 'Number' || field.type === 'Float'" class="sisdai-number-options">
                          <div class="sisdai-form-group">
                            <q-input
                              v-model.number="field.defaultValue"
                              :label="$t('views.modelCreator.defaultValueLabel') || 'Valor predeterminado'"
                              outlined
                              class="sisdai-input"
                              type="number"
                              :hint="$t('views.modelCreator.defaultValueHint') || 'Valor por defecto'"
                            />
                          </div>
                        </div>

                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Botones para Agregar Campos -->
                  <div class="row q-gutter-md q-mt-md">
                    <q-btn
                      :label="$t('views.modelCreator.addFieldButton')"
                      color="primary"
                      class="sisdai-button"
                      @click="addField"
                    />
                  </div>
                </div>

                <!-- Botón de Envío -->
                <q-btn
                  type="submit"
                  :label="$t('views.modelCreator.generateModelButton')"
                  color="positive"
                  class="sisdai-button q-mt-lg full-width"
                  :loading="isSubmitting"
                />
              </form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Panel derecho: Vista Previa -->
        <div class="sisdai-panel">
          <q-card class="sisdai-card">
            <q-card-section>
              <div class="sisdai-section-title">{{ $t("views.modelCreator.previewTitle") }}</div>
              <div id="json-editor-container" class="sisdai-json-container"></div>
            </q-card-section>
          </q-card>

          <!-- Componente de Interacción con IA -->
          <ai-interaction :currentModel="model" @modelUpdated="handleAiModelUpdated" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import AiInteractionWithStore from "../components/dinamic-components/AIInteractionWithStore.vue";
import { useQuasar } from "quasar";
import { useModelStore } from "../stores/model-store";
import { mapState, mapActions } from "pinia";

export default {
  components: { AiInteraction: AiInteractionWithStore },

  setup() {
    const $q = useQuasar();
    return { $q };
  },

  data() {
    return {
      editor: null,
      fieldTypes: [
        { value: "String", label: "Texto" },
        { value: "Number", label: "Número" },
        { value: "Float", label: "Decimal" },
        { value: "Boolean", label: "Booleano" },
        { value: "Date", label: "Fecha" },
        { value: "Text", label: "Texto Largo" },
        { value: "UUID", label: "UUID" },
        { value: "JSON", label: "JSON" },
        { value: "Array", label: "Array" },
        { value: "Object", label: "Objeto" }
      ]
    };
  },
  
  computed: {
    ...mapState(useModelStore, ['currentModel', 'isSubmitting', 'lastCreatedModelId']),
    
    modelName: {
      get() {
        return this.currentModel.name;
      },
      set(value) {
        this.updateCurrentModelName(value);
      }
    },
    
    fields: {
      get() {
        return this.currentModel.fields;
      },
      set(value) {
        this.updateCurrentModelFields(value);
      }
    },
    
    model() {
      return this.currentModel;
    },
  },

  methods: {
    ...mapActions(useModelStore, [
      'setCurrentModel',
      'updateCurrentModelName',
      'updateCurrentModelFields',
      'addField',
      'removeField',
      'addSubField',
      'removeSubField',
      'updateFieldType',
      'saveModel',
      'updateModelFromAI'
    ]),
    
    syncFromJson(jsonModel) {
      if (!jsonModel) {
        console.error('Error: jsonModel is undefined or null');
        return;
      }
      
      this.updateModelFromAI(jsonModel);
      
      // Actualizar el editor JSON si existe
      if (this.editor) {
        this.editor.set(this.model);
      }
    },
    
    initJsonEditor() {
      try {
        const container = document.getElementById("json-editor-container");
        if (!container) {
          console.error("JSON editor container not found");
          return;
        }
        
        const options = {
          mode: "tree",
          modes: ["tree", "view", "form", "text", "code"],
          onChange: () => {
            try {
              const updatedModel = this.editor.get();
              this.syncFromJson(updatedModel);
            } catch (error) {
              console.error("Error updating model from editor:", error);
            }
          },
          onError: (error) => {
            console.error("JSONEditor error:", error);
            this.$q.notify({
              type: 'negative',
              message: this.$t('views.modelCreator.jsonEditorError'),
              position: 'top'
            });
          }
        };
        
        this.editor = new JSONEditor(container, options);
        this.editor.set(this.model);
      } catch (error) {
        console.error("Error initializing JSON editor:", error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.jsonEditorInitError') || 'Error al inicializar el editor JSON',
          position: 'top'
        });
      }
    },

    handleFieldTypeChange(index) {
      this.updateFieldType(index, this.fields[index].type);
      // Actualizar el editor JSON
      if (this.editor) {
        this.editor.set(this.model);
      }
    },

    removeField(index) {
      this.$q.dialog({
        title: this.$t('views.modelCreator.confirmDeleteTitle'),
        message: this.$t('views.modelCreator.confirmDeleteMessage'),
        ok: {
          label: this.$t('common.accept'),
          color: 'negative'
        },
        cancel: {
          label: this.$t('common.cancel'),
          color: 'primary'
        }
      }).onOk(() => {
        // Llamar a la acción del store mapeada
        this.removeField(index);
        // Actualizar el editor JSON
        if (this.editor) {
          this.editor.set(this.model);
        }
        this.$q.notify({
          type: 'info',
          message: this.$t('views.modelCreator.fieldDeleted'),
          position: 'top'
        });
      });
    },

    removeSubField(fieldIndex, subFieldIndex) {
      this.$q.dialog({
        title: this.$t('views.modelCreator.confirmDeleteTitle'),
        message: this.$t('views.modelCreator.confirmDeleteMessage'),
        ok: {
          label: this.$t('common.accept'),
          color: 'negative'
        },
        cancel: {
          label: this.$t('common.cancel'),
          color: 'primary'
        }
      }).onOk(() => {
        // Llamar a la acción del store mapeada
        this.removeSubField(fieldIndex, subFieldIndex);
        // Actualizar el editor JSON
        if (this.editor) {
          this.editor.set(this.model);
        }
        this.$q.notify({
          type: 'info',
          message: this.$t('views.modelCreator.subfieldDeleted'),
          position: 'top'
        });
      });
    },

    async handleSubmit() {
      // Validación del nombre del modelo
      if (!this.modelName.trim()) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.errorModelNameRequired'),
          position: 'top'
        });
        return;
      }

      // Validación de campos
      if (this.fields.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.errorNoFields'),
          position: 'top'
        });
        return;
      }

      // Validar que todos los campos tengan nombre
      const emptyNameField = this.fields.find(field => !field.name.trim());
      if (emptyNameField) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.errorEmptyFieldName'),
          position: 'top'
        });
        return;
      }

      // Validar nombres duplicados
      const fieldNames = this.fields.map(field => field.name.trim());
      if (new Set(fieldNames).size !== fieldNames.length) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.errorDuplicateFieldNames'),
          position: 'top'
        });
        return;
      }

      try {
        await this.saveModel();
        
        this.$q.notify({
          type: 'positive',
          message: this.$t('views.modelCreator.successModelGenerated'),
          position: 'top',
          timeout: 3000
        });
        
        this.resetForm();
      } catch (error) {
        console.error("Error generating model:", error);
        // Mostrar mensaje de error específico si está disponible
        const errorMessage = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : this.$t('common.errorMessage');
          
        this.$q.notify({
          type: 'negative',
          message: errorMessage,
          position: 'top',
          timeout: 5000
        });
      }
    },

    resetForm() {
      this.setCurrentModel({
        name: "",
        fields: []
      });
      if (this.editor) {
        this.editor.set(this.model);
      }
    },

    async handleAiModelUpdated(updatedModel) {
      // Validar que el modelo actualizado sea válido
      if (!updatedModel || !updatedModel.name || !Array.isArray(updatedModel.fields)) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.invalidAiModel') || 'El modelo sugerido por la IA no es válido',
          position: 'top'
        });
        return;
      }
      
      // Estilos para la presentación del JSON
      const jsonStyles = `
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin: 0.5rem 0;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        white-space: pre-wrap;
        max-height: 40vh;
        overflow: auto;
        border: 1px solid #ddd;
      `;

      // Formatear los modelos para la visualización
      const currentModelJson = JSON.stringify(this.model, null, 2);
      const updatedModelJson = JSON.stringify(updatedModel, null, 2);

      const dialogContent = `
        <div style="max-width: 800px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div>
              <h6 style="color: #2c3e50; margin: 0 0 0.5rem 0; font-weight: 600;">
                ${this.$t('views.modelCreator.currentModel')}
              </h6>
              <div style="${jsonStyles}">${currentModelJson}</div>
            </div>
            <div>
              <h6 style="color: #27ae60; margin: 0 0 0.5rem 0; font-weight: 600;">
                ${this.$t('views.modelCreator.aiSuggestedModel')}
              </h6>
              <div style="${jsonStyles}">${updatedModelJson}</div>
            </div>
          </div>
          <p style="color: #7f8c8d; font-size: 0.9rem; margin: 0;">
            ${this.$t('views.modelCreator.dialogWarning')}
          </p>
        </div>
      `;

      try {
        const confirmed = await this.$q.dialog({
          title: this.$t('views.modelCreator.aiUpdateTitle'),
          message: dialogContent,
          html: true,
          ok: {
            label: this.$t('common.accept'),
            color: 'positive',
            flat: false
          },
          cancel: {
            label: this.$t('common.cancel'),
            color: 'negative',
            flat: true
          },
          persistent: true,
          style: 'min-width: 70vw;'
        });

        if (confirmed) {
          try {
            this.updateModelFromAI(updatedModel);
            this.$q.notify({
              type: 'positive',
              message: this.$t('views.modelCreator.aiUpdateSuccess'),
              icon: 'check_circle',
              position: 'top',
              timeout: 3000
            });
          } catch (syncError) {
            console.error('Error syncing model:', syncError);
            this.$q.notify({
              type: 'negative',
              message: this.$t('views.modelCreator.syncError') || 'Error al sincronizar el modelo',
              position: 'top',
              timeout: 3000
            });
          }
        }
      } catch (error) {
        this.$q.notify({
          type: 'info',
          message: this.$t('views.modelCreator.aiUpdateCancelled'),
          icon: 'info',
          position: 'top'
        });
        console.error('Error updating model:', error); 
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initJsonEditor();
    });
  },
  
  watch: {
    model: {
      handler(newVal) {
        if (this.editor) {
          const currentJson = this.editor.get();
          if (JSON.stringify(currentJson) !== JSON.stringify(newVal)) {
            this.editor.set(newVal);
          }
        }
      },
      deep: true
    }
  },

  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }
};
</script>

<style scoped>
.model-creator {
  padding: 20px;
  background-color: var(--sisdae-bg-light);
  min-height: 100vh;
}

.sisdai-container {
  max-width: 1400px;
  margin: 0 auto;
}

.sisdai-title {
  font-size: 2rem;
  color: var(--sisdae-primary-color);
  margin-bottom: 2rem;
  font-weight: bold;
}

.sisdai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.sisdai-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sisdai-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sisdai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sisdai-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sisdai-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sisdai-label {
  font-weight: 500;
  color: var(--sisdae-text-color);
}

.sisdai-section-title {
  font-size: 1.2rem;
  color: var(--sisdae-primary-color);
  margin-bottom: 1rem;
  font-weight: bold;
}

.sisdai-section-subtitle {
  font-size: 1rem;
  color: var(--sisdae-secondary-color);
  margin: 1rem 0;
  font-weight: 500;
}

.sisdai-field {
  margin-bottom: 1.5rem;
}

.sisdai-field-card {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.sisdai-field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sisdai-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sisdai-field-title {
  font-weight: 500;
  color: var(--sisdae-primary-color);
}

.sisdai-subfield {
  margin-bottom: 1rem;
}

.sisdai-subfield-card {
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.sisdai-subfield-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sisdai-subfield-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sisdai-subfield-title {
  font-weight: 500;
  color: var(--sisdae-secondary-color);
}

.sisdai-date-options {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.sisdai-json-container {
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  background-color: #fff;
}

.sisdai-button {
  font-weight: 500;
  text-transform: none;
}

.sisdai-input,
.sisdai-select {
  width: 100%;
}

.sisdai-checkbox {
  margin-top: 0.5rem;
}
</style>