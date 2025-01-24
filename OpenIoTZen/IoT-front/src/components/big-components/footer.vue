<template>
    <q-footer class="footer bg-grey-9 text-white">
      <div class="footer-container">
        <div class="footer-content">
          <h4 class="footer-title">IoT Framework - Open Source</h4>
        </div>
        <div class="footer-bottom">
          <p class="footer-year">© {{ currentYear }} IoT Framework. Todos los derechos reservados.</p>
        </div>
      </div>
    </q-footer>
  </template>
  
  <script>
  export default {
    name: "AppFooter",
    data() {
      return {
        currentYear: new Date().getFullYear(),
      };
    },
  };
  </script>
  
  <style scoped>
@import '../../css/big-components/footer.css';
  </style>
  