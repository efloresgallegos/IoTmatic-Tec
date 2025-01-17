<template>
  <div class="model-creator">
    <div class="container">
      <h1 class="title">{{ $t("views.modelCreator.title") }}</h1>
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="modelName" class="label">{{ $t("views.modelCreator.modelNameLabel") }}</label>
          <input type="text" id="modelName" v-model="modelName" class="input"
            :placeholder="$t('views.modelCreator.modelNamePlaceholder')" maxlength="15"
            :class="{ 'input-error': modelNameError }" />
          <small v-if="modelNameError" class="error-message">{{ $t("views.modelCreator.errorModelNameRequired")
            }}</small>
        </div>

        <div class="fields">
          <h3 class="subtitle">{{ $t("views.modelCreator.fieldsTitle") }}</h3>
          <div v-for="(field, index) in fields" :key="index" class="field">
            <div class="field-header">
              <h4 class="field-title">{{ $t("views.modelCreator.fieldTitle") }} {{ index + 1 }}</h4>
              <button type="button" class="btn-delete" @click="removeField(index)">
                {{ $t("views.modelCreator.deleteFieldButton") }}
              </button>
            </div>
            <div class="form-group">
              <label for="fieldName" class="label">{{ $t("views.modelCreator.fieldNameLabel") }}</label>
              <input type="text" :id="`fieldName-${index}`" v-model="field.name" class="input"
                :placeholder="$t('views.modelCreator.fieldNamePlaceholder')" maxlength="50" />
            </div>
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
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="field.required" class="checkbox" />
                {{ $t("views.modelCreator.requiredLabel") }}
              </label>
            </div>
            <!-- Subcampos -->
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
                    <input type="checkbox" v-model="subField.required" class="checkbox" />
                    {{ $t("views.modelCreator.requiredLabel") }}
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
          <button type="button" class="btn-add" @click="addField">{{ $t("views.modelCreator.addFieldButton") }}</button>
        </div>
        <button type="submit" class="btn-submit">{{ $t("views.modelCreator.generateModelButton") }}</button>
      </form>

      <!-- Vista previa -->
      <div class="preview">
        <h3 class="subtitle">{{ $t("views.modelCreator.previewTitle") }}</h3>
        <div id="json-editor-container" class="json-editor-container"></div>
      </div>

      <ai-interaction :currentModel="model" @modelUpdated="handleAiModelUpdated" />
    </div>
  </div>
</template>

<script>
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import AiInteraction from "../components/dinamic-components/AiInteraction.vue";

export default {
  components: {
    AiInteraction
  },
  data() {
    return {
      modelName: "",
      fields: [],
      modelNameError: false,
      editor: null,
      showAiInteraction: false, // Estado para mostrar/ocultar el componente flotante
    };
  },
  computed: {
    model() {
      return {
        name: this.modelName,
        fields: this.fields.map(field => {
          const baseField = {
            name: field.name,
            type: field.type,
            required: field.required,
          };
          if (field.type === 'Object') {
            baseField.fields = field.fields || [];
          }
          return baseField;
        }),
      };
    },
  },
  mounted() {
    const container = document.getElementById("json-editor-container");
    const options = {
      mode: "tree",
      modes: ['tree', 'view', 'form', 'text', 'code'],
      onChange: () => {
        const updatedModel = this.editor.get();
        this.modelName = updatedModel.name;  // Actualiza el modelName
        this.fields = updatedModel.fields;   // Actualiza los campos
      },
    };
    this.editor = new JSONEditor(container, options);
    this.editor.set(this.model);
  },
  methods: {
    toggleAiInteraction() {
      this.showAiInteraction = !this.showAiInteraction;
    },
    addField() {
      this.fields.push({ name: "", type: "String", required: false, maxLength: 50 });
    },
    removeField(index) {
      this.fields.splice(index, 1);
    },
    addSubField(fieldIndex) {
      const field = this.fields[fieldIndex];
      if (!field.fields) field.fields = [];
      field.fields.push({ name: "", type: "String", required: false });
    },
    removeSubField(fieldIndex, subFieldIndex) {
      this.fields[fieldIndex].fields.splice(subFieldIndex, 1);
    },
    handleSubmit() {
      if (!this.modelName.trim()) {
        this.modelNameError = true;
        return;
      }
      this.modelNameError = false;

      console.log("Model generated:", this.model);
      alert(this.$t("views.modelCreator.successModelGenerated"));
      this.modelName = "";
      this.fields = [];
    },
    handleAiModelUpdated(updatedModel) {
      this.modelName = updatedModel.name;
      this.fields = updatedModel.fields;
      if (this.editor) {
        this.editor.set(this.model);  // Actualiza el editor
      }
    }
  },
  watch: {
    model: {
      handler(newVal) {
        if (this.editor) {
          this.editor.update(newVal);
        }
      },
      deep: true
    }
  },
  directives: {
    blur: {
      mounted(el) {
        el.addEventListener('blur', function () {
          const vm = this;
          if (vm.editor) {
            vm.editor.set(vm.model);
          }
        }.bind(this), true);
      }
    },
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }
};
</script>

<style scoped>
/* Usando clases de SISADAE */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.input,
.select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox {
  transform: scale(1.5);
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #4caf50;
  /* Color del checkbox */
}

.btn-add,
.btn-delete,
.btn-submit {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: bold;
}

.btn-add {
  background-color: #4caf50;
  color: white;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-submit {
  background-color: #2196f3;
  color: white;
}

.error-message {
  color: #f44336;
  font-size: 0.9em;
}

.subtitle {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.preview {
  margin-top: 30px;
  padding: 15px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.json-editor-container {
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
}

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff9800;
  color: white;
  border-radius: 50%;
  padding: 15px;
  font-size: 30px;
  cursor: pointer;
  z-index: 999;
}

.ai-interaction {
  position: fixed;
  bottom: 100px;
  right: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  cursor: move;
  width: 300px;
}

.ai-interaction.dragging {
  cursor: grabbing;
}

.ai-model-changes {
  margin-top: 20px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
}

.input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-submit {
  margin-top: 10px;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
}

button {
  cursor: pointer;
}
</style>