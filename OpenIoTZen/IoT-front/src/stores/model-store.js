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

    updateCurrentModelId(id) {
      this.lastCreatedModelId = id;
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
          // Manejar el caso donde field.type puede ser un objeto o un string
          let fieldType = field.type
          if (typeof field.type === 'object' && field.type !== null) {
            fieldType = field.type.value || 'String'
          }
          
          return {
            name: field.name || '',
            type: fieldType || 'String',
            required: field.required || false,
            defaultValue: field.defaultValue || null,
            fields: fieldType === 'Object' ? (field.fields || []).map(subField => {
              // Manejar el caso donde subField.type puede ser un objeto o un string
              let subFieldType = subField.type
              if (typeof subField.type === 'object' && subField.type !== null) {
                subFieldType = subField.type.value || 'String'
              }
              
              return {
                name: subField.name || '',
                type: subFieldType || 'String',
                required: subField.required || false,
                defaultValue: subField.defaultValue || null
              }
            }) : []
          }
        })
      } catch (error) {
        console.error('Error al actualizar el modelo desde la IA:', error)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModelStore, import.meta.hot))
}