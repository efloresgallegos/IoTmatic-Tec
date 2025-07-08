import { defineStore, acceptHMRUpdate } from 'pinia'
import apiService from '../boot/ApiServices/api.service'

export const useModelStore = defineStore('model', {
  state: () => ({
    models: [],
    currentModel: {
      name: '',
      fields: []
    },
    lastCreatedModelId: null,
    isSubmitting: false
  }),

  getters: {
    getModels: (state) => state.models,
    getCurrentModel: (state) => state.currentModel,
    getLastCreatedModelId: (state) => state.lastCreatedModelId
  },

  actions: {
    setCurrentModel(model) {
      this.currentModel = model
    },

    updateCurrentModelName(name) {
      this.currentModel.name = name
    },

    updateCurrentModelFields(fields) {
      this.currentModel.fields = fields
    },

    addField() {
      this.currentModel.fields.push({
        name: '',
        type: 'String',
        required: false,
        defaultValue: null,
        fields: []
      })
    },
    


    removeField(index) {
      this.currentModel.fields.splice(index, 1)
    },

    addSubField(fieldIndex) {
      if (!this.currentModel.fields[fieldIndex].fields) {
        this.currentModel.fields[fieldIndex].fields = []
      }
      
      this.currentModel.fields[fieldIndex].fields.push({
        name: '',
        type: 'String',
        required: false,
        defaultValue: null
      })
    },

    removeSubField(fieldIndex, subFieldIndex) {
      this.currentModel.fields[fieldIndex].fields.splice(subFieldIndex, 1)
    },

    updateFieldType(index, type) {
      const field = this.currentModel.fields[index]
      field.type = type
      
      // Reiniciar todas las propiedades específicas
      field.defaultValue = null
    },

    async saveModel() {
      this.isSubmitting = true
      try {
        const response = await apiService.post('/models', this.currentModel)
        this.lastCreatedModelId = response.data.id
        this.models.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error al guardar el modelo:', error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchModels() {
      try {
        const response = await apiService.get('/models')
        this.models = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener los modelos:', error)
        throw error
      }
    },

    async getModelStructure(modelId) {
      try {
        const response = await apiService.get(`/models/${modelId}/json`)
        return response.data
      } catch (error) {
        console.error(`Error al obtener la estructura del modelo ${modelId}:`, error)
        throw error
      }
    },

    async getLatestData(modelId) {
      try {
        const response = await apiService.get(`/data/${modelId}/latest`)
        return response.data
      } catch (error) {
        console.error(`Error al obtener los últimos datos del modelo ${modelId}:`, error)
        throw error
      }
    },

    async updateModelFromAI(aiModel) {
      try {
        if (!aiModel) {
          console.error('Error: aiModel is undefined or null')
          return
        }
        
        this.currentModel.name = aiModel.name || ''
        this.currentModel.fields = (aiModel.fields || []).map(field => {
          // Manejar el caso donde field.type puede ser un objeto (con value y label) o un string
          let fieldType = field.type
          if (typeof field.type === 'object' && field.type !== null) {
            fieldType = field.type.value || 'String'
          }
          
          // Crear objeto base del campo con propiedades comunes
          const normalizedField = {
            name: field.name || '',
            type: fieldType || 'String',
            required: field.required || false,
            defaultValue: field.defaultValue || null
          }
          
          // Añadir campos adicionales específicos para cada tipo
          // Manejar campos de tipo Date
          if (fieldType === 'Date') {
            normalizedField.includeTime = field.includeTime || false
            normalizedField.dateFormat = field.dateFormat || 'ISO'
            normalizedField.minDate = field.minDate || null
            normalizedField.maxDate = field.maxDate || null
          }
          
          // Manejar campos numéricos
          if (fieldType === 'Number' || fieldType === 'Integer' || fieldType === 'Float') {
            normalizedField.min = field.min !== undefined ? field.min : null
            normalizedField.max = field.max !== undefined ? field.max : null
          }
          
          // Manejar campos de texto
          if (fieldType === 'String' || fieldType === 'Text') {
            normalizedField.minLength = field.minLength !== undefined ? field.minLength : null
            normalizedField.maxLength = field.maxLength !== undefined ? field.maxLength : null
            normalizedField.pattern = field.pattern || null
          }
          
          // Manejar campos de tipo Object con subcampos
          if (fieldType === 'Object') {
            normalizedField.fields = Array.isArray(field.fields) 
              ? field.fields.map(subField => {
                  // Normalizar el tipo del subcampo
                  let subFieldType = subField.type
                  if (typeof subField.type === 'object' && subField.type !== null) {
                    subFieldType = subField.type.value || 'String'
                  }
                  
                  // Crear objeto normalizado para el subcampo
                  const normalizedSubField = {
                    name: subField.name || '',
                    type: subFieldType || 'String',
                    required: subField.required || false,
                    defaultValue: subField.defaultValue || null
                  }
                  
                  // Añadir propiedades específicas según el tipo
                  if (subFieldType === 'Date') {
                    normalizedSubField.includeTime = subField.includeTime || false
                    normalizedSubField.dateFormat = subField.dateFormat || 'ISO'
                    normalizedSubField.minDate = subField.minDate || null
                    normalizedSubField.maxDate = subField.maxDate || null
                  }
                  
                  if (subFieldType === 'Number' || subFieldType === 'Integer' || subFieldType === 'Float') {
                    normalizedSubField.min = subField.min !== undefined ? subField.min : null
                    normalizedSubField.max = subField.max !== undefined ? subField.max : null
                  }
                  
                  if (subFieldType === 'String' || subFieldType === 'Text') {
                    normalizedSubField.minLength = subField.minLength !== undefined ? subField.minLength : null
                    normalizedSubField.maxLength = subField.maxLength !== undefined ? subField.maxLength : null
                    normalizedSubField.pattern = subField.pattern || null
                  }
                  
                  return normalizedSubField
                })
              : []
          }
          
          return normalizedField
        })
        
        console.log('Modelo actualizado desde IA:', this.currentModel)
      } catch (error) {
        console.error('Error al actualizar el modelo desde la IA:', error)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModelStore, import.meta.hot))
}