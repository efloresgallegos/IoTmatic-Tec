<template>
  <div class="model-creator">
    <div class="container">
      <!-- Título -->
      <h1 class="title">{{ $t("views.modelCreator.title") }}</h1>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="form">
        <!-- Nombre del Modelo -->
        <div class="form-group">
          <label for="modelName" class="label">{{ $t("views.modelCreator.modelNameLabel") }}</label>
          <input type="text" id="modelName" v-model="modelName" class="input"
            :placeholder="$t('views.modelCreator.modelNamePlaceholder')" maxlength="15"
            :class="{ 'input-error': modelNameError }" />
          <small v-if="modelNameError" class="error-message">
            {{ $t("views.modelCreator.errorModelNameRequired") }}
          </small>
        </div>

        <!-- Campos -->
        <div class="fields">
          <h3 class="subtitle">{{ $t("views.modelCreator.fieldsTitle") }}</h3>
          <div v-for="(field, index) in fields" :key="index" class="field">
            <!-- Encabezado del Campo -->
            <div class="field-header">
              <h4 class="field-title">{{ $t("views.modelCreator.fieldTitle") }} {{ index + 1 }}</h4>
              <button type="button" class="btn-delete" @click="removeField(index)">
                {{ $t("views.modelCreator.deleteFieldButton") }}
              </button>
            </div>

            <!-- Nombre del Campo -->
            <div class="form-group">
              <label for="fieldName" class="label">{{ $t("views.modelCreator.fieldNameLabel") }}</label>
              <input type="text" :id="`fieldName-${index}`" v-model="field.name" class="input"
                :placeholder="$t('views.modelCreator.fieldNamePlaceholder')" maxlength="50" />
            </div>

            <!-- Tipo de Campo -->
            <div class="form-group">
              <label for="fieldType" class="label">{{ $t("views.modelCreator.fieldTypeLabel") }}</label>
              <select :id="`fieldType-${index}`" v-model="field.type" class="select">
                <option value="String">String</option>
                <option value="Number">Number</option>
                <option value="Object">Object</option>
                <option value="Boolean">Boolean</option>
                <option value="Array">Array</option>
              </select>
            </div>

            <!-- Requerido -->
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="field.required" class="checkbox" />
                <span class="checkbox-custom"></span>
                <span>{{ $t("views.modelCreator.requiredLabel") }}</span>
              </label>
            </div>
            <!-- Subcampos (si el tipo es Object) -->
            <div v-if="field.type === 'Object'" class="subfields">
              <h5 class="subtitle">{{ $t("views.modelCreator.subfieldsTitle") }}</h5>
              <div v-for="(subField, subIndex) in field.fields" :key="subIndex" class="subfield">
                <div class="form-group">
                  <label for="subFieldName" class="label">{{ $t("views.modelCreator.subfieldNameLabel") }}</label>
                  <input type="text" :id="`subFieldName-${index}-${subIndex}`" v-model="subField.name" class="input"
                    :placeholder="$t('views.modelCreator.subfieldNamePlaceholder')" />
                </div>
                <div class="form-group">
                  <label for="subFieldType" class="label">{{ $t("views.modelCreator.fieldTypeLabel") }}</label>
                  <select :id="`subFieldType-${index}-${subIndex}`" v-model="subField.type" class="select">
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Object">Object</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Array">Array</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="field.required" class="checkbox" />
                    <span class="checkbox-custom"></span>
                    <span>{{ $t("views.modelCreator.requiredLabel") }}</span>
                  </label>
                </div>
                <button type="button" class="btn-delete" @click="removeSubField(index, subIndex)">
                  {{ $t("views.modelCreator.deleteSubfieldButton") }}
                </button>
              </div>
              <button type="button" class="btn-add" @click="addSubField(index)">
                {{ $t("views.modelCreator.addSubfieldButton") }}
              </button>
            </div>
          </div>

          <!-- Botón para Agregar Campo -->
          <button type="button" class="btn-add" @click="addField">
            {{ $t("views.modelCreator.addFieldButton") }}
          </button>
        </div>

        <!-- Botón de Envío -->
        <button type="submit" class="btn-submit">{{ $t("views.modelCreator.generateModelButton") }}</button>
      </form>

      <!-- Vista Previa -->
      <div class="preview">
        <h3 class="subtitle">{{ $t("views.modelCreator.previewTitle") }}</h3>
        <div id="json-editor-container" class="json-editor-container"></div>
      </div>

      <!-- Componente de Interacción con IA -->
      <ai-interaction :currentModel="model" @modelUpdated="handleAiModelUpdated" />
    </div>
  </div>
</template>

<script>
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import AiInteraction from "../components/dinamic-components/AiInteraction.vue";
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
      modelNameError: false,
      editor: null,
    };
  },
  computed: {
    model() {
      return {
        name: this.modelName,
        fields: this.fields.map((field) => ({
          name: field.name,
          type: field.type,
          required: field.required,
          fields: field.type === "Object" ? field.fields || [] : undefined
        })),
      };
    },
  },
  mounted() {
    const container = document.getElementById("json-editor-container");
    const options = {
      mode: "tree",
      modes: ["tree", "view", "form", "text", "code"],
      onChange: () => {
        const updatedModel = this.editor.get();
        this.modelName = updatedModel.name;
        this.fields = updatedModel.fields;
      },
    };
    this.editor = new JSONEditor(container, options);
    this.editor.set(this.model);
  },
  methods: {
    addField() {
      this.fields.push({ name: "", type: "String", required: false });
    },
    removeField(index) {
      this.fields.splice(index, 1);
    },
    addSubField(fieldIndex) {
      if (!this.fields[fieldIndex].fields) this.fields[fieldIndex].fields = [];
      this.fields[fieldIndex].fields.push({ name: "", type: "String", required: false });
    },
    removeSubField(fieldIndex, subFieldIndex) {
      this.fields[fieldIndex].fields.splice(subFieldIndex, 1);
    },
    async handleSubmit() {
      if (!this.modelName.trim()) {
      this.modelNameError = true;
      return;
      }
      this.modelNameError = false;

      try {
      const response = await apiService.post('/generator', {
        name: this.modelName,
        fields: this.fields
      });

      console.log("Model generated:", response.data);
      this.$q.notify({
        type: 'positive',
        message: this.$t("views.modelCreator.successModelGenerated")
      });
      this.modelName = "";
      this.fields = [];
      } catch (error) {
      console.error("Error generating model:", error);
      this.$q.notify({
        type: 'negative', 
        message: this.$t("common.errorMessage")
      });
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
      this.modelName = updatedModel.name;
      this.fields = updatedModel.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required || false,
        fields: field.fields?.map(subField => ({
          name: subField.name,
          type: subField.type,
          required: subField.required || false
        })) || []
      }));
      
      this.$q.notify({
        type: 'positive',
        message: this.$t('views.modelCreator.aiUpdateSuccess'),
        icon: 'check_circle'
      });
      
      if (this.editor) this.editor.set(this.model);
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
  watch: {
    model: {
      handler(newVal) {
        if (this.editor) this.editor.update(newVal);
      },
      deep: true,
    },
  },
  beforeUnmount() {
    if (this.editor) this.editor.destroy();
  },
};
</script>

<style scoped>
@import '../css/pages/ModelCreatorView.css';
</style>