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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2196f3;
}

.login-form {
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

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 5px;
}

.btn-submit {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #2196f3;
  color: white;
  font-weight: bold;
  margin-top: 10px;
}
</style>
