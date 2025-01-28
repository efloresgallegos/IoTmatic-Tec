<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{{ $t('views.login.welcome') }}</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="label">{{ $t('views.login.username') }}</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            class="input" 
            :placeholder="$t('views.login.enterUsername')" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="password" class="label">{{ $t('views.login.password') }}</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="input" 
            :placeholder="$t('views.login.enterPassword')" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="language" class="label">{{ $t('views.login.selectLanguage') }}</label>
          <select v-model="$i18n.locale" id="language" class="language-select">
            <option value="es-MX">Español</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <button type="submit" class="btn-submit">{{ $t('views.login.login') }}</button>
      </form>
    </div>
  </div>
</template>


<script>
import { api } from 'src/boot/axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await api.post('/users/login', {
          username: this.username,
          password: this.password
        });
        console.log('Login successful:', response.data);
        this.$q.notify({
          message: this.$t('views.login.loginSuccess'),
          color: 'positive'
        });
        // Guardar datos en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);

        // Redirigir al inicio
        this.$router.push('/');
      } catch (error) {
        console.error('Login error:', error);

        // Mostrar mensaje de error
        this.$toast.open({
          message: this.$t('views.login.loginError'),
          type: 'error'
        });
      }
    },
    checkLoggedIn() {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (user && token) {
        this.$router.push('/');
      }
    }
  },
  mounted() {
    this.checkLoggedIn();
  }
};
</script>


<style scoped>
@import '../../css/pages/auth/LoginView.css';
</style>
