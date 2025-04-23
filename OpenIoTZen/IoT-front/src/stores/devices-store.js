import { defineStore, acceptHMRUpdate } from 'pinia'
import apiService from '../boot/ApiServices/api.service'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    devices: [],
    deviceTypes: [],
    currentDevice: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getDevices: (state) => state.devices,
    getDeviceTypes: (state) => state.deviceTypes,
    getCurrentDevice: (state) => state.currentDevice,
    getDeviceById: (state) => (id) => state.devices.find(device => device.device_id === id),
    getDevicesByType: (state) => (typeId) => state.devices.filter(device => device.type_id === typeId),
    getDeviceTypeName: (state) => (typeId) => {
      const type = state.deviceTypes.find(type => type.type_id === typeId)
      return type ? type.name : ''
    }
  },

  actions: {
    async fetchDevices() {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get('/devices')
        this.devices = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener los dispositivos:', error)
        this.error = error.message || 'Error al obtener los dispositivos'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchDeviceTypes() {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get('/types')
        this.deviceTypes = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener los tipos de dispositivos:', error)
        this.error = error.message || 'Error al obtener los tipos de dispositivos'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchDeviceById(id) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get(`/devices/byid/${id}`)
        this.currentDevice = response.data
        return response.data
      } catch (error) {
        console.error(`Error al obtener el dispositivo con ID ${id}:`, error)
        this.error = error.message || `Error al obtener el dispositivo con ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createDevice(deviceData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post('/devices', deviceData)
        // Actualizar la lista de dispositivos después de crear uno nuevo
        await this.fetchDevices()
        return response.data
      } catch (error) {
        console.error('Error al crear el dispositivo:', error)
        this.error = error.message || 'Error al crear el dispositivo'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createDeviceType(typeData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post('/types', typeData)
        // Actualizar la lista de tipos después de crear uno nuevo
        await this.fetchDeviceTypes()
        return response.data
      } catch (error) {
        console.error('Error al crear el tipo de dispositivo:', error)
        this.error = error.message || 'Error al crear el tipo de dispositivo'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateDevice(id, deviceData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.put(`/devices/${id}`, deviceData)
        // Actualizar el dispositivo en la lista local
        const index = this.devices.findIndex(device => device.device_id === id)
        if (index !== -1) {
          this.devices[index] = response.data
        }
        // Si es el dispositivo actual, actualizarlo también
        if (this.currentDevice && this.currentDevice.device_id === id) {
          this.currentDevice = response.data
        }
        return response.data
      } catch (error) {
        console.error(`Error al actualizar el dispositivo con ID ${id}:`, error)
        this.error = error.message || `Error al actualizar el dispositivo con ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteDevice(id) {
      this.isLoading = true
      this.error = null
      try {
        await apiService.delete(`/devices/${id}`)
        // Eliminar el dispositivo de la lista local
        this.devices = this.devices.filter(device => device.device_id !== id)
        // Si es el dispositivo actual, limpiarlo
        if (this.currentDevice && this.currentDevice.device_id === id) {
          this.currentDevice = null
        }
        return true
      } catch (error) {
        console.error(`Error al eliminar el dispositivo con ID ${id}:`, error)
        this.error = error.message || `Error al eliminar el dispositivo con ID ${id}`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Métodos para obtener datos específicos del dispositivo
    async fetchDeviceData(deviceId, moduleId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get(`/data/from-device/${deviceId}/${moduleId}`)
        return response.data
      } catch (error) {
        console.error(`Error al obtener datos del dispositivo ${deviceId} y módulo ${moduleId}:`, error)
        this.error = error.message || `Error al obtener datos del dispositivo`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchLatestDeviceData(deviceId, moduleId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get(`/data/latest/${deviceId}/${moduleId}`)
        return response.data
      } catch (error) {
        console.error(`Error al obtener los últimos datos del dispositivo ${deviceId} y módulo ${moduleId}:`, error)
        this.error = error.message || `Error al obtener los últimos datos del dispositivo`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchDeviceDataByDateRange(deviceId, moduleId, startDate, endDate, groupBy) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post(`/data/by-date-range/${deviceId}/${moduleId}`, {
          startDate,
          endDate,
          groupBy
        })
        return response.data
      } catch (error) {
        console.error(`Error al obtener datos por rango de fechas:`, error)
        this.error = error.message || `Error al obtener datos por rango de fechas`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getDeviceData(deviceId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.get(`/data/getByDevice?device=${deviceId}`)
        return response.data
      } catch (error) {
        console.error(`Error al obtener datos del dispositivo ${deviceId}:`, error)
        this.error = error.message || `Error al obtener datos del dispositivo`
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchGraphableFields(deviceId, moduleId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post(`/modules/graphable/${deviceId}`, { module: moduleId })
        return response.data
      } catch (error) {
        console.error(`Error al obtener campos graficables:`, error)
        this.error = error.message || `Error al obtener campos graficables`
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDevicesStore, import.meta.hot))
}