<template>
  <div class="model-creator">
    <div class="sisdai-container">
      <!-- Título con instrucciones breves -->
      <div class="page-header">
        <h1 class="sisdai-title text-center">{{ $t("views.modelCreator.title") }}</h1>
        <p class="text-center q-mx-auto description-text">Crea un nuevo modelo de datos definiendo sus campos y propiedades. Los modelos te permiten estructurar la información que envían tus dispositivos IoT.</p>
      </div>

      <!-- Indicador de pasos -->
      <div class="steps-container q-mb-lg">
        <div class="step-item" :class="{'step-active': activeStep >= 1}">
          <div class="step-number">1</div>
          <div class="step-text">Información básica</div>
        </div>
        <div class="step-connector" :class="{'step-connector-active': activeStep >= 2}"></div>
        <div class="step-item" :class="{'step-active': activeStep >= 2}">
          <div class="step-number">2</div>
          <div class="step-text">Definir campos</div>
        </div>
        <div class="step-connector" :class="{'step-connector-active': activeStep >= 3}"></div>
        <div class="step-item" :class="{'step-active': activeStep >= 3}">
          <div class="step-number">3</div>
          <div class="step-text">Revisar y guardar</div>
        </div>
      </div>

      <div class="sisdai-grid">
        <!-- Panel izquierdo: Formulario -->
        <div class="sisdai-panel">
          <q-card class="sisdai-card">
            <q-card-section>
              <form @submit.prevent="handleSubmit" class="sisdai-form">
                <!-- Paso 1: Nombre del Modelo -->
                <div v-if="activeStep === 1" class="step-content">
                  <div class="sisdai-form-group">
                    <h2 class="step-title">Información básica del modelo</h2>
                    <p class="step-description">Proporciona un nombre descriptivo para tu modelo de datos.</p>

                    <label for="modelName" class="sisdai-label">{{ $t("views.modelCreator.modelNameLabel") }}</label>
                    <q-input
                      id="modelName"
                      v-model="modelName"
                      :placeholder="$t('views.modelCreator.modelNamePlaceholder')"
                      :rules="[val => !!val || $t('views.modelCreator.errorModelNameRequired')]"
                      outlined
                      lazy-rules
                      class="sisdai-input"
                      maxlength="15"
                      @update:model-value="updatePreview"
                      hint="Este nombre se usará para identificar el modelo en todo el sistema"
                    />
                  </div>

                  <div class="sisdai-form-group">
                    <label for="modelDescription" class="sisdai-label">Descripción (opcional)</label>
                    <q-input
                      id="modelDescription"
                      v-model="modelDescription"
                      type="textarea"
                      outlined
                      placeholder="Describe brevemente para qué sirve este modelo de datos"
                      class="sisdai-input"
                      rows="3"
                      @update:model-value="updatePreview"
                    />
                  </div>
                  <div class="form-navigation">
                    <div></div> <!-- Espacio vacío para alineación -->
                    <q-btn
                      label="Siguiente"
                      color="primary"
                      :disable="!modelName"
                      @click="nextStep"
                      class="navigation-button"
                    />
                  </div>
                </div>

                <!-- Paso 2: Campos -->
                <div v-if="activeStep === 2" class="step-content">
                  <div class="sisdai-fields">
                    <h2 class="step-title">Definición de campos</h2>
                    <p class="step-description">Define los campos que contendrá tu modelo. Cada campo debe tener un nombre único y un tipo de datos.</p>

                    <div v-for="(field, index) in fields" :key="index" class="sisdai-field">
                      <q-card class="sisdai-field-card">
                        <q-card-section>
                          <!-- Encabezado del Campo con estado de validación -->
                          <div class="sisdai-field-header">
                            <div class="sisdai-field-title">
                              <q-badge v-if="isFieldValid(field)" color="positive" class="q-mr-sm">
                                <q-icon name="check" size="xs" />
                              </q-badge>
                              <q-badge v-else color="warning" class="q-mr-sm">
                                <q-icon name="warning" size="xs" />
                              </q-badge>
                              Campo {{ index + 1 }}
                            </div>
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
                              @update:model-value="updatePreview"
                              :error="!field.name"
                              :error-message="!field.name ? 'Campo requerido' : ''"
                            />
                          </div>

                          <!-- Tipo de Campo con ayuda visual -->
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
                              emit-value
                              map-options
                              :option-label="opt => `${opt.label} - ${opt.description}`"
                            >
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                            </q-select>
                          </div>

                          <!-- Requerido con tooltip de ayuda -->
                          <div class="sisdai-form-group">
                            <q-checkbox
                              v-model="field.required"
                              :label="$t('views.modelCreator.requiredLabel')"
                              class="sisdai-checkbox"
                              @update:model-value="updatePreview"
                            >
                              <q-tooltip>Los campos requeridos deben tener un valor en cada registro</q-tooltip>
                            </q-checkbox>
                          </div>

                          <!-- Subcampos (si el tipo es Object) -->
                          <div v-if="field.type === 'Object'" class="sisdai-subfields">
                            <div class="sisdai-section-subtitle">{{ $t("views.modelCreator.subfieldsTitle") }}</div>
                            <div class="q-ml-md">
                              <!-- Mostrar mensaje si no hay subcampos -->
                              <div v-if="!field.fields || field.fields.length === 0" class="text-grey q-my-md">
                                No hay subcampos definidos. Agrega al menos uno para objetos complejos.
                              </div>

                              <div v-for="(subField, subIndex) in field.fields" :key="subIndex" class="sisdai-subfield">
                                <q-card class="sisdai-subfield-card">
                                  <q-card-section>
                                    <div class="sisdai-subfield-header">
                                      <div class="sisdai-subfield-title">
                                        Subcampo {{ subIndex + 1 }}
                                      </div>
                                      <q-btn
                                        flat
                                        round
                                        color="negative"
                                        icon="delete"
                                        @click="removeSubField(index, subIndex)"
                                        size="sm"
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
                                        @update:model-value="updatePreview"
                                      />
                                    </div>

                                    <div class="sisdai-form-group">
                                      <label :for="`subFieldType-${index}-${subIndex}`" class="sisdai-label">
                                        {{ $t("views.modelCreator.fieldTypeLabel") }}
                                      </label>
                                      <q-select
                                        :id="`subFieldType-${index}-${subIndex}`"
                                        v-model="subField.type"
                                        :options="fieldTypes.filter(t => t.value !== 'Object')"
                                        outlined
                                        class="sisdai-select"
                                        emit-value
                                        map-options
                                        @update:model-value="updatePreview"
                                        :option-label="opt => `${opt.label} - ${opt.description}`"
                                      />
                                    </div>

                                    <div class="sisdai-form-group">
                                      <q-checkbox
                                        v-model="subField.required"
                                        :label="$t('views.modelCreator.requiredLabel')"
                                        class="sisdai-checkbox"
                                        @update:model-value="updatePreview"
                                      />
                                    </div>

                                    <!-- Opciones específicas para subcampos de tipo String -->
                                    <div v-if="subField.type === 'String' || subField.type === 'Text'" class="sisdai-string-options">
                                      <div class="sisdai-form-group">
                                        <q-input
                                          v-model="subField.defaultValue"
                                          :label="$t('views.modelCreator.defaultValueLabel')"
                                          outlined
                                          class="sisdai-input"
                                          :hint="$t('views.modelCreator.defaultValueHint')"
                                          @update:model-value="updatePreview"
                                        />
                                      </div>
                                    </div>

                                    <!-- Opciones específicas para subcampos de tipo Number o Float -->
                                    <div v-if="subField.type === 'Number' || subField.type === 'Float'" class="sisdai-number-options">
                                      <div class="sisdai-form-group">
                                        <q-input
                                          v-model.number="subField.defaultValue"
                                          :label="$t('views.modelCreator.defaultValueLabel')"
                                          outlined
                                          class="sisdai-input"
                                          type="number"
                                          :hint="$t('views.modelCreator.defaultValueHint')"
                                          @update:model-value="updatePreview"
                                        />
                                      </div>
                                    </div>

                                    <!-- Opciones específicas para subcampos de tipo Date -->
                                    <div v-if="subField.type === 'Date'" class="sisdai-date-options">
                                      <div class="sisdai-form-group">
                                        <q-input
                                          v-model="subField.defaultValue"
                                          :label="$t('views.modelCreator.defaultDateLabel')"
                                          outlined
                                          class="sisdai-input"
                                          type="date"
                                          :hint="$t('views.modelCreator.defaultDateHint')"
                                          @update:model-value="updatePreview"
                                        />
                                      </div>
                                    </div>
                                  </q-card-section>
                                </q-card>
                              </div>
                            </div>
                            <q-btn
                              :label="$t('views.modelCreator.addSubfieldButton')"
                              color="secondary"
                              class="sisdai-button q-mt-sm"
                              @click="addSubField(index)"
                              icon="add"
                              outline
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
                                @update:model-value="updatePreview"
                              />
                            </div>
                          </div>

                          <!-- Opciones específicas para tipo String -->
                          <div v-if="field.type === 'String' || field.type === 'Text'" class="sisdai-string-options">
                            <div class="sisdai-form-group">
                              <q-input
                                v-model="field.defaultValue"
                                :label="$t('views.modelCreator.defaultValueLabel')"
                                outlined
                                class="sisdai-input"
                                :hint="$t('views.modelCreator.defaultValueHint')"
                                @update:model-value="updatePreview"
                              />
                            </div>
                          </div>

                          <!-- Opciones específicas para tipo Number o Float -->
                          <div v-if="field.type === 'Number' || field.type === 'Float'" class="sisdai-number-options">
                            <div class="sisdai-form-group">
                              <q-input
                                v-model.number="field.defaultValue"
                                :label="$t('views.modelCreator.defaultValueLabel')"
                                outlined
                                class="sisdai-input"
                                type="number"
                                :hint="$t('views.modelCreator.defaultValueHint')"
                                @update:model-value="updatePreview"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Botones para Agregar Campos -->
                    <div class="q-mt-md">
                      <q-btn
                        :label="$t('views.modelCreator.addFieldButton')"
                        color="primary"
                        class="sisdai-button"
                        @click="addField"
                        icon="add"
                      />

                      <!-- Botón para agregar campo desde plantilla -->
                      <q-btn
                        label="Agregar campo común"
                        color="secondary"
                        class="sisdai-button q-ml-md"
                        icon="playlist_add"
                        outline
                        @click="showFieldTemplateDialog = true"
                      />
                    </div>
                  </div>

                  <!-- Navegación entre pasos -->
                  <div class="form-navigation q-mt-md">
                    <q-btn
                      label="Anterior"
                      color="grey"
                      flat
                      @click="previousStep"
                      class="navigation-button"
                    />
                    <q-btn
                      label="Siguiente"
                      color="primary"
                      :disable="!canProceedToReview"
                      @click="nextStep"
                      class="navigation-button"
                    />
                  </div>
                </div>

                <!-- Paso 3: Revisar y Guardar -->
                <div v-if="activeStep === 3" class="step-content">
                  <h2 class="step-title">Revisar y guardar modelo</h2>
                  <p class="step-description">Revisa la estructura de tu modelo antes de guardarlo.</p>

                  <div class="review-section">
                    <div class="review-item">
                      <div class="review-label">Nombre del modelo:</div>
                      <div class="review-value">{{ modelName }}</div>
                    </div>

                    <div v-if="modelDescription" class="review-item">
                      <div class="review-label">Descripción:</div>
                      <div class="review-value">{{ modelDescription }}</div>
                    </div>

                    <div class="review-item">
                      <div class="review-label">Número de campos:</div>
                      <div class="review-value">{{ fields.length }}</div>
                    </div>

                    <div class="review-item">
                      <div class="review-label">Campos:</div>
                      <div class="review-value">
                        <ul class="fields-list">
                          <li v-for="(field, index) in fields" :key="index">
                            <strong>{{ field.name }}</strong> ({{ getFieldTypeName(field.type) }})
                            <span v-if="field.required" class="required-badge">Requerido</span>
                            <div v-if="field.type === 'Object' && field.fields && field.fields.length > 0" class="subfields-list">
                              <ul>
                                <li v-for="(subField, subIndex) in field.fields" :key="subIndex">
                                  {{ subField.name }}: {{ getFieldTypeName(subField.type) }}
                                  <span v-if="subField.required" class="required-badge">Requerido</span>
                                </li>
                              </ul>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="form-navigation q-mt-lg">
                    <q-btn
                      label="Anterior"
                      color="grey"
                      flat
                      @click="previousStep"
                      class="navigation-button"
                    />
                    <q-btn
                      type="submit"
                      :label="$t('views.modelCreator.generateModelButton')"
                      color="positive"
                      class="navigation-button"
                      :loading="isSubmitting"
                      icon="save"
                    />
                  </div>
                </div>
              </form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Panel derecho: Vista Previa -->
        <div class="sisdai-panel">
          <div class="sticky-panel">
            <q-card class="sisdai-card">
              <q-card-section>
                <div class="sisdai-section-title">{{ $t("views.modelCreator.previewTitle") }}</div>
                <div id="json-editor-container" class="sisdai-json-container"></div>

                <!-- Tarjeta de estadísticas del modelo -->
                <div class="model-stats q-mt-md">
                  <div class="stats-item">
                    <div class="stats-value">{{ fields.length }}</div>
                    <div class="stats-label">Campos</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-value">{{ getRequiredFieldsCount() }}</div>
                    <div class="stats-label">Requeridos</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-value">{{ getObjectFieldsCount() }}</div>
                    <div class="stats-label">Objetos</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Componente de Interacción con IA mejorado -->
            <EnhancedAIInteraction :currentModel="model" @modelUpdated="handleAiModelUpdated" />

            <!-- Tips para mejores prácticas -->
            <q-card class="sisdai-card q-mt-md">
              <q-card-section>
                <div class="sisdai-section-title">
                  <q-icon name="tips_and_updates" class="q-mr-sm" />
                  Tips para mejores modelos
                </div>
                <q-list bordered separator>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Usa nombres descriptivos para los campos</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Define campos requeridos solo cuando sea necesario</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Agrupa información relacionada en campos de tipo Object</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo para plantillas de campos comunes -->
    <q-dialog v-model="showFieldTemplateDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Agregar campo común</div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item v-for="template in fieldTemplates" :key="template.name" clickable @click="addFieldFromTemplate(template)">
              <q-item-section avatar>
                <q-icon :name="template.icon" :color="template.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ template.name }}</q-item-label>
                <q-item-label caption>{{ template.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import EnhancedAIInteraction from "../components/dinamic-components/EnhancedAIInteraction.vue";
import { useQuasar } from "quasar";
import { useModelStore } from "../stores/model-store";
import { mapState, mapActions } from "pinia";
import apiService from "../boot/ApiServices/api.service";

export default {
  components: { EnhancedAIInteraction },

  setup() {
    const quasar = useQuasar();
    return { quasar };
  },

  data() {
    return {
      editor: null,
      activeStep: 1,
      modelDescription: "",
      showFieldTemplateDialog: false,
      fieldTypes: [
        { value: "String", label: "Texto", description: "Para textos cortos como nombres o códigos" },
        { value: "Number", label: "Número", description: "Para valores enteros (sin decimales)" },
        { value: "Float", label: "Decimal", description: "Para valores con decimales" },
        { value: "Boolean", label: "Booleano", description: "Para valores verdadero/falso" },
        { value: "Date", label: "Fecha", description: "Para almacenar fechas" },
        { value: "Text", label: "Texto Largo", description: "Para descripciones o contenido extenso" },
        { value: "UUID", label: "UUID", description: "Identificador único universal" },
        { value: "JSON", label: "JSON", description: "Para datos estructurados en formato JSON" },
        { value: "Array", label: "Array", description: "Para listas de valores" },
        { value: "Object", label: "Objeto", description: "Para agrupar varios campos relacionados" }
      ],
      fieldTemplates: [
        {
          name: "Temperatura",
          type: "Float",
          required: true,
          defaultValue: 0.0,
          icon: "device_thermostat",
          color: "red",
          description: "Medida de temperatura en grados centígrados"
        },
        {
          name: "Humedad",
          type: "Float",
          required: true,
          defaultValue: 0.0,
          icon: "water_drop",
          color: "blue",
          description: "Porcentaje de humedad relativa"
        },
        {
          name: "Timestamp",
          type: "Date",
          required: true,
          defaultValue: null,
          icon: "schedule",
          color: "grey",
          description: "Marca de tiempo de la medición"
        },
        {
          name: "Ubicación",
          type: "Object",
          required: false,
          icon: "place",
          color: "green",
          description: "Coordenadas geográficas",
          fields: [
            { name: "latitud", type: "Float", required: true, defaultValue: 0.0 },
            { name: "longitud", type: "Float", required: true, defaultValue: 0.0 },
            { name: "altitud", type: "Float", required: false, defaultValue: 0.0 }
          ]
        },
        {
          name: "Estatus",
          type: "Boolean",
          required: false,
          defaultValue: true,
          icon: "toggle_on",
          color: "purple",
          description: "Estado activo/inactivo del dispositivo"
        }
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
      return {
        ...this.currentModel,
        description: this.modelDescription
      };
    },

    // Validar si se puede proceder a la revisión
    canProceedToReview() {
      if (this.fields.length === 0) return false;

      // Verificar que todos los campos tengan nombre
      for (const field of this.fields) {
        if (!field.name || field.name.trim() === '') return false;

        // Verificar subcampos si es objeto
        if (field.type === 'Object' && field.fields && field.fields.length > 0) {
          for (const subField of field.fields) {
            if (!subField.name || subField.name.trim() === '') return false;
          }
        }
      }

      // Verificar que no haya nombres duplicados
      const fieldNames = this.fields.map(field => field.name.trim());
      return new Set(fieldNames).size === fieldNames.length;
    }
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
      'updateModelFromAI',
      'updateCurrentModelId'
    ]),

    // Método para actualizar la vista previa
    updatePreview() {
      if (this.editor) {
        this.editor.set({
          ...this.model,
          description: this.modelDescription
        });
      }
    },

    // Avanzar al siguiente paso
    nextStep() {
      if (this.activeStep < 3) {
        this.activeStep++;
      }
    },

    // Retroceder al paso anterior
    previousStep() {
      if (this.activeStep > 1) {
        this.activeStep--;
      }
    },

    // Verificar si un campo es válido
    isFieldValid(field) {
      return field.name && field.name.trim() !== '';
    },

    // Obtener el nombre descriptivo de un tipo de campo
    getFieldTypeName(typeValue) {
      const type = this.fieldTypes.find(t => t.value === typeValue);
      return type ? type.label : typeValue;
    },

    // Contar campos requeridos
    getRequiredFieldsCount() {
      let count = 0;
      for (const field of this.fields) {
        if (field.required) count++;

        if (field.type === 'Object' && field.fields) {
          for (const subField of field.fields) {
            if (subField.required) count++;
          }
        }
      }
      return count;
    },

    // Contar campos tipo objeto
    getObjectFieldsCount() {
      return this.fields.filter(f => f.type === 'Object').length;
    },

    // Añadir un campo desde plantilla
    addFieldFromTemplate(template) {
      this.addField();
      const newIndex = this.fields.length - 1;

      this.fields[newIndex] = {
        ...this.fields[newIndex],
        name: template.name,
        type: template.type,
        required: template.required,
        defaultValue: template.defaultValue
      };

      // Si es un objeto, copiar también los subcampos
      if (template.type === 'Object' && template.fields) {
        this.fields[newIndex].fields = JSON.parse(JSON.stringify(template.fields));
      }

      this.updatePreview();
      this.showFieldTemplateDialog = false;
    },

    syncFromJson(jsonModel) {
      if (!jsonModel) {
        console.error('Error: jsonModel is undefined or null');
        return;
      }

      // Extraer la descripción si está presente
      if (jsonModel.description) {
        this.modelDescription = jsonModel.description;
        delete jsonModel.description;
      }

      this.updateModelFromAI(jsonModel);

      // Actualizar el editor JSON si existe
      if (this.editor) {
        this.editor.set({
          ...jsonModel,
          description: this.modelDescription
        });
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
        this.editor.set({
          ...this.model,
          description: this.modelDescription
        });
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
      this.updatePreview();
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
        },
        persistent: true
      }).onOk(() => {
        // Llamar a la acción del store mapeada
        this.removeField(index);
        // Actualizar el editor JSON
        this.updatePreview();
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
        },
        persistent: true
      }).onOk(() => {
        // Llamar a la acción del store mapeada
        this.removeSubField({ fieldIndex, subFieldIndex });
        // Actualizar el editor JSON
        this.updatePreview();
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
        // Preparar el modelo para enviar al generador
        const modelToGenerate = {
          name: this.modelName.toLowerCase().replace(/\s+/g, '_'),
          fields: this.fields.map(field => ({
            ...field,
            name: field.name.trim(),
            type: typeof field.type === 'object' ? field.type.value : field.type,
            // Si es un objeto, procesar sus subcampos
            ...(field.type === 'Object' && field.fields ? {
              fields: field.fields.map(subField => ({
                ...subField,
                name: subField.name.trim(),
                type: typeof subField.type === 'object' ? subField.type.value : subField.type
              }))
            } : {})
          }))
        };

        // Enviar al endpoint del generador
        const { data } = await apiService.post('generator', modelToGenerate);

        if (data) {
          this.$q.notify({
            type: 'positive',
            message: this.$t('views.modelCreator.successModelGenerated'),
            position: 'top',
            timeout: 3000
          });

          this.resetForm();
        }
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
      this.modelDescription = "";
      this.activeStep = 1;
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

      // Extraer descripción si existe
      let updatedDescription = this.modelDescription;
      if (updatedModel.description) {
        updatedDescription = updatedModel.description;
        delete updatedModel.description;
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
      const currentModelJson = JSON.stringify({...this.model, description: this.modelDescription}, null, 2);
      const updatedModelJson = JSON.stringify({...updatedModel, description: updatedDescription}, null, 2);

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
            // Actualizar el modelo
            this.updateModelFromAI(updatedModel);

            // Actualizar la descripción
            this.modelDescription = updatedDescription;

            // Actualizar el editor JSON
            this.updatePreview();

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
          if (JSON.stringify(currentJson) !== JSON.stringify({...newVal, description: this.modelDescription})) {
            this.editor.set({...newVal, description: this.modelDescription});
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
  background-color: var(--sisdae-bg-light, #f5f7fa);
  min-height: 100vh;
}

.sisdai-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.sisdai-title {
  font-size: 2rem;
  color: var(--sisdae-primary-color, #1976d2);
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.description-text {
  max-width: 700px;
  color: #555;
  margin-bottom: 1.5rem;
}

/* Estilos para indicador de pasos */
.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-text {
  font-size: 0.9rem;
  color: #555;
  text-align: center;
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 10px;
  position: relative;
  top: -10px;
  transition: background-color 0.3s ease;
}

.step-active .step-number {
  background-color: var(--sisdae-primary-color, #1976d2);
  color: white;
}

.step-active .step-text {
  color: var(--sisdae-primary-color, #1976d2);
  font-weight: 500;
}

.step-connector-active {
  background-color: var(--sisdae-primary-color, #1976d2);
}

/* Contenido por pasos */
.step-content {
  animation: fadeIn 0.3s ease;
}

.step-title {
  font-size: 1.4rem;
  color: var(--sisdae-primary-color, #1976d2);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.step-description {
  color: #555;
  margin-bottom: 1.5rem;
}

.form-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.navigation-button {
  min-width: 120px;
}

/* Panel de revisión */
.review-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.review-item {
  margin-bottom: 1rem;
}

.review-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.3rem;
}

.fields-list {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.subfields-list {
  margin: 0.3rem 0;
}

.required-badge {
  background-color: #ff5252;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.sisdai-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
}

/* Panel flotante */
.sticky-panel {
  position: sticky;
  top: 20px;
  margin-bottom: 80px; /* Agregar margen inferior para evitar que el footer tape el contenido */
  padding-bottom: 20px; /* Padding adicional para mejorar la visualización */

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
  color: var(--sisdae-text-color, #333);
}

.sisdai-section-title {
  font-size: 1.2rem;
  color: var(--sisdae-primary-color, #1976d2);
  margin-bottom: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.sisdai-section-subtitle {
  font-size: 1rem;
  color: var(--sisdae-secondary-color, #555);
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
  color: var(--sisdae-primary-color, #1976d2);
  display: flex;
  align-items: center;
}

.sisdai-subfields {
  margin-bottom: 1rem;
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
  color: var(--sisdae-secondary-color, #555);
}

.sisdai-date-options {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.sisdai-json-container {
  height: 400px;
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

/* Tarjeta de estadísticas */
.model-stats {
  display: flex;
  justify-content: space-around;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1rem;
}

.stats-item {
  text-align: center;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--sisdae-primary-color, #1976d2);
}

.stats-label {
  font-size: 0.9rem;
  color: #555;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 1024px) {
  .sisdai-grid {
    grid-template-columns: 1fr;
  }

  .sticky-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .step-item {
    margin-bottom: 1rem;
    flex-direction: row;
    width: 100%;
  }

  .step-number {
    margin-right: 1rem;
    margin-bottom: 0;
  }

  .step-connector {
    width: 2px;
    height: 20px;
    margin: 0 0 0 18px;
    top: 0;
  }
}

/* Estilos para el asistente de IA */
:deep(.ai-chat-bar) {
  position: fixed !important;
  bottom: 140px !important; /* Z-index extremadamente alto para asegurarnos que esté sobre todo */
  right: 20px !important;
  width: 350px !important;
  height: 500px !important;
  z-index: 999999 !important;
  transform: translateX(calc(100% - 60px)) !important;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ai-chat-bar.open) {
  transform: translateX(0) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important; /* Sombra más prominente para enfatizar */
}

:deep(.ai-toggle-button) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 60px !important;
  height: 60px !important;
  background-color: var(--sisdae-primary-color, #1976d2) !important;
  border-radius: 16px 0 0 16px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  cursor: pointer !important;
  z-index: 2 !important;
}

:deep(.ai-chat-content) {
  position: relative !important;
  height: 100% !important;
  background-color: #ffffff !important;
  margin-left: 60px !important;
  border-radius: 0 16px 16px 0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

:deep(.ai-chat-body) {
  height: calc(100% - 180px) !important;
  padding: 16px !important;
  overflow-y: auto !important;
}

:deep(.suggestions-container) {
  max-height: 80px !important;
  overflow-y: auto !important;
  padding: 12px !important;
  background-color: #f8f9fa !important;
  border-top: 1px solid #e0e0e0 !important;
}

:deep(.input-container) {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  background-color: #ffffff !important;
  border-top: 1px solid #e0e0e0 !important;
  padding: 12px !important;
}
</style>
