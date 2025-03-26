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
                            <q-checkbox
                              v-model="field.includeTime"
                              :label="$t('views.modelCreator.includeTimeLabel')"
                              class="sisdai-checkbox"
                            />
                          </div>
                          <div class="sisdai-form-group">
                            <q-select
                              v-model="field.dateFormat"
                              :options="dateFormats"
                              :label="$t('views.modelCreator.dateFormatLabel')"
                              outlined
                              class="sisdai-select"
                            />
                          </div>
                          <div class="sisdai-form-group">
                            <q-input
                              v-model="field.minDate"
                              :label="$t('views.modelCreator.minDateLabel')"
                              outlined
                              class="sisdai-input"
                              :type="field.includeTime ? 'datetime-local' : 'date'"
                              :hint="$t('views.modelCreator.minDateHint')"
                            />
                          </div>
                          <div class="sisdai-form-group">
                            <q-input
                              v-model="field.maxDate"
                              :label="$t('views.modelCreator.maxDateLabel')"
                              outlined
                              class="sisdai-input"
                              :type="field.includeTime ? 'datetime-local' : 'date'"
                              :hint="$t('views.modelCreator.maxDateHint')"
                            />
                          </div>
                          <div class="sisdai-form-group">
                            <q-input
                              v-model="field.defaultValue"
                              :label="$t('views.modelCreator.defaultDateLabel')"
                              outlined
                              class="sisdai-input"
                              :type="field.includeTime ? 'datetime-local' : 'date'"
                              :hint="$t('views.modelCreator.defaultDateHint')"
                            />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Botón para Agregar Campo -->
                  <q-btn
                    :label="$t('views.modelCreator.addFieldButton')"
                    color="primary"
                    class="sisdai-button q-mt-md"
                    @click="addField"
                  />
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
import AiInteraction from "../components/dinamic-components/AIInteraction.vue";
import apiService from "../boot/ApiServices/api.service";
import { useQuasar } from "quasar";

export default {
  components: { AiInteraction },

  setup() {
    const $q = useQuasar();
    return { $q };
  },

  data() {
    return {
      modelName: "",
      fields: [],
      isSubmitting: false,
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
        { value: "Array", label: "Array" }
      ],
      dateFormats: [
        { value: "ISO", label: "ISO 8601" },
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
      ]
    };
  },

  computed: {
    model() {
      return {
        name: this.modelName,
        fields: this.fields.map((field) => ({
          name: field.name,
          type: field.type === 'Integer' ? 'Number' : field.type,
          required: field.required,
          includeTime: field.type === 'Date' ? field.includeTime : undefined,
          dateFormat: field.type === 'Date' ? field.dateFormat : undefined,
          minDate: field.type === 'Date' ? field.minDate : undefined,
          maxDate: field.type === 'Date' ? field.maxDate : undefined,
          defaultValue: field.type === 'Date' ? field.defaultValue : undefined,
          fields: field.type === "Object" ? field.fields.map(subField => ({
            name: subField.name,
            type: subField.type,
            required: subField.required,
            includeTime: subField.type === 'Date' ? subField.includeTime : undefined,
            dateFormat: subField.type === 'Date' ? subField.dateFormat : undefined,
            minDate: subField.type === 'Date' ? subField.minDate : undefined,
            maxDate: subField.type === 'Date' ? subField.maxDate : undefined,
            defaultValue: subField.type === 'Date' ? subField.defaultValue : undefined
          })) : undefined
        })),
      };
    },
  },

  methods: {
    syncFromJson(jsonModel) {
      this.modelName = jsonModel.name || "";
      this.fields = (jsonModel.fields || []).map(field => ({
        name: field.name || "",
        type: field.type || "String",
        required: field.required || false,
        includeTime: field.type === 'Date' ? (field.includeTime || false) : false,
        dateFormat: field.type === 'Date' ? (field.dateFormat || "ISO") : "ISO",
        minDate: field.type === 'Date' ? field.minDate : null,
        maxDate: field.type === 'Date' ? field.maxDate : null,
        defaultValue: field.type === 'Date' ? field.defaultValue : null,
        fields: field.type === "Object" ? (field.fields || []).map(subField => ({
          name: subField.name || "",
          type: subField.type || "String",
          required: subField.required || false,
          includeTime: subField.type === 'Date' ? (subField.includeTime || false) : false,
          dateFormat: subField.type === 'Date' ? (subField.dateFormat || "ISO") : "ISO",
          minDate: subField.type === 'Date' ? subField.minDate : null,
          maxDate: subField.type === 'Date' ? subField.maxDate : null,
          defaultValue: subField.type === 'Date' ? subField.defaultValue : null
        })) : undefined
      }));
    },

    handleFieldTypeChange(index) {
      const field = this.fields[index];
      if (field.type === 'Date') {
        field.includeTime = false;
        field.dateFormat = 'ISO';
        field.minDate = null;
        field.maxDate = null;
        field.defaultValue = null;
      }
      // Actualizar el editor JSON
      if (this.editor) {
        this.editor.set(this.model);
      }
    },

    addField() {
      this.fields.push({
        name: "",
        type: "String",
        required: false,
        includeTime: false,
        dateFormat: "ISO",
        minDate: null,
        maxDate: null,
        defaultValue: null
      });
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
        this.fields.splice(index, 1);
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

    addSubField(fieldIndex) {
      if (!this.fields[fieldIndex].fields) {
        this.fields[fieldIndex].fields = [];
      }
      this.fields[fieldIndex].fields.push({
        name: "",
        type: "String",
        required: false,
        includeTime: false,
        dateFormat: "ISO",
        minDate: null,
        maxDate: null,
        defaultValue: null
      });
      // Actualizar el editor JSON
      if (this.editor) {
        this.editor.set(this.model);
      }
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
        this.fields[fieldIndex].fields.splice(subFieldIndex, 1);
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
      if (!this.modelName.trim()) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('views.modelCreator.errorModelNameRequired'),
          position: 'top'
        });
        return;
      }

      this.isSubmitting = true;
      try {
        await apiService.post('/generator', this.model);
        this.$q.notify({
          type: 'positive',
          message: this.$t('views.modelCreator.successModelGenerated'),
          position: 'top'
        });
        this.resetForm();
      } catch (error) {
        console.error("Error generating model:", error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('common.errorMessage'),
          position: 'top'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.modelName = "";
      this.fields = [];
      if (this.editor) {
        this.editor.set(this.model);
      }
    },

    async handleAiModelUpdated(updatedModel) {
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

      const dialogContent = `
        <div style="max-width: 800px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div>
              <h6 style="color: #2c3e50; margin: 0 0 0.5rem 0; font-weight: 600;">
                ${this.$t('views.modelCreator.currentModel')}
              </h6>
              <div style="${jsonStyles}">${JSON.stringify(this.model, null, 2)}</div>
            </div>
            <div>
              <h6 style="color: #27ae60; margin: 0 0 0.5rem 0; font-weight: 600;">
                ${this.$t('views.modelCreator.aiSuggestedModel')}
              </h6>
              <div style="${jsonStyles}">${JSON.stringify(updatedModel, null, 2)}</div>
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
          this.syncFromJson(updatedModel);
          this.$q.notify({
            type: 'positive',
            message: this.$t('views.modelCreator.aiUpdateSuccess'),
            icon: 'check_circle'
          });
        }
      } catch (error) {
        this.$q.notify({
          type: 'info',
          message: this.$t('views.modelCreator.aiUpdateCancelled'),
          icon: 'info'
        });
        console.error('Error updating model:', error); 
      }
    },
  },

  mounted() {
    const container = document.getElementById("json-editor-container");
    const options = {
      mode: "tree",
      modes: ["tree", "view", "form", "text", "code"],
      onChange: () => {
        const updatedModel = this.editor.get();
        this.syncFromJson(updatedModel);
      },
    };
    this.editor = new JSONEditor(container, options);
    this.editor.set(this.model);
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

@media (max-width: 1024px) {
  .sisdai-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .model-creator {
    padding: 10px;
  }
  
  .sisdai-title {
    font-size: 1.5rem;
  }
  
  .sisdai-json-container {
    height: 300px;
  }
}

/* Animaciones */
.sisdai-field-card,
.sisdai-subfield-card {
  transition: all 0.3s ease;
}

.sisdai-field-card:hover,
.sisdai-subfield-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Estilos para el editor JSON */
:deep(.jsoneditor) {
  border: none !important;
}

:deep(.jsoneditor-menu) {
  background-color: var(--sisdae-primary-color) !important;
  border-bottom: none !important;
}

:deep(.jsoneditor-menu a) {
  color: white !important;
}

/* Estilos para las notificaciones */
:deep(.q-notification) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.q-notification__message) {
  font-weight: 500;
}

/* Estilos para los diálogos */
:deep(.q-dialog) {
  border-radius: 8px;
}

:deep(.q-dialog__title) {
  font-weight: 600;
}

:deep(.q-dialog__message) {
  font-size: 1rem;
}
</style>