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
          /> <br> <br>
          <select v-model="$i18n.locale" class="language-select">
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
export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    handleLogin() {
      // Lógica de inicio de sesión
      console.log('Usuario:', this.username);
      console.log('Contraseña:', this.password);
      alert(this.$t('views.login.success'));
    }
  }
};
</script>

<style scoped>
@import '../../css/pages/auth/LoginView.css';
</style>
