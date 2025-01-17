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
  .footer {
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1.5rem 1rem;
  }
  
  .footer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  
  .footer-content {
    text-align: center;
  }
  
  .footer-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .footer-description {
    font-size: 1rem;
    margin: 0.5rem 0 1rem;
  }
  
  .social-icons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .icon-link {
    color: white;
    font-size: 1.8rem;
    transition: color 0.3s ease;
  }
  
  .icon-link:hover {
    color: #42a5f5;
  }
  
  .footer-bottom {
    font-size: 0.9rem;
    text-align: center;
    margin-top: 1rem;
  }
  
  @media (min-width: 768px) {
    .footer-container {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  
    .footer-content {
      text-align: left;
    }
  
    .footer-bottom {
      text-align: right;
    }
  }
  </style>
  