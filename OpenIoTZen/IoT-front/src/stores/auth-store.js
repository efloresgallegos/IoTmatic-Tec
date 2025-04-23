import { defineStore } from 'pinia'
import apiService from '../boot/ApiServices/api.service'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    getUser: (state) => state.user,
    getUserId: (state) => state.user?.user_id || null,
    getUsername: (state) => state.user?.username || '',
    getToken: (state) => state.token
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post('/users/login', credentials)
        this.user = response.data.user
        this.token = response.data.token
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
        return response.data
      } catch (error) {
        console.error('Error de inicio de sesión:', error)
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      // Limpiar el estado
      this.user = null
      this.token = null
      
      // Limpiar localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Redirigir al login usando window.location para evitar importación circular
      window.location.href = '/#/login'
    },

    checkAuth() {
      // Verificar si hay un usuario y token en localStorage
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (user && token) {
        this.user = JSON.parse(user)
        this.token = token
        return true
      }
      
      return false
    },

    // Método para actualizar el perfil del usuario
    async updateProfile(userData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.put(`/users/${this.user.user_id}`, userData)
        
        // Actualizar el usuario en el store y localStorage
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        
        return response.data
      } catch (error) {
        console.error('Error al actualizar el perfil:', error)
        this.error = error.response?.data?.message || 'Error al actualizar el perfil'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Método para cambiar la contraseña
    async changePassword(passwordData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiService.post(`/users/change-password`, {
          userId: this.user.user_id,
          ...passwordData
        })
        return response.data
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error)
        this.error = error.response?.data?.message || 'Error al cambiar la contraseña'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})