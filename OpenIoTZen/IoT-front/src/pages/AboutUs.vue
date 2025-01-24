<template>
    <q-page class="about-us-page">
      <q-card flat bordered class="q-pa-md about-card">
        <q-card-section class="q-mb-md">
          <div class="text-h5 sisdai-text-primary text-center q-mb-sm">
            Sobre Nosotros
          </div>
          <p class="sisdai-text-secondary text-center">
            Nuestro objetivo es revolucionar la interacción con dispositivos IoT mediante un framework de código abierto. 
            Facilitamos la integración, monitoreo y análisis de datos IoT con herramientas robustas y amigables, ideales para estudiantes, investigadores y empresas.
          </p>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <q-img
            src="../assets/community.jpg"
            alt="Nuestra misión"
            class="q-mb-md about-image"
            contain
          />
          <div class="text-h6 sisdai-text-primary text-center q-mb-sm">
            Nuestra Misión
          </div>
          <p class="sisdai-text-secondary text-center">
            Crear soluciones accesibles y escalables que promuevan el uso de dispositivos IoT 
            mediante modelos de datos personalizados, visualizaciones en tiempo real y capacidades de inteligencia artificial.
          </p>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <div class="text-h6 sisdai-text-primary text-center q-mb-sm">
            ¿Por qué Elegirnos?
          </div>
          <q-list bordered class="q-pa-md about-list">
            <q-item>
              <q-item-section avatar>
                <q-icon name="integration_instructions" color="primary" />
              </q-item-section>
              <q-item-section>
                <div class="text-subtitle1">Integración Flexible</div>
                <div class="sisdai-text-secondary">
                  Diseñamos un framework modular que permite conectar dispositivos IoT fácilmente.
                </div>
              </q-item-section>
            </q-item>
  
            <q-item>
              <q-item-section avatar>
                <q-icon name="analytics" color="teal" />
              </q-item-section>
              <q-item-section>
                <div class="text-subtitle1">Visualización de Datos</div>
                <div class="sisdai-text-secondary">
                  Dashboards en tiempo real para analizar y monitorear información clave de tus dispositivos.
                </div>
              </q-item-section>
            </q-item>
  
            <q-item>
              <q-item-section avatar>
                <q-icon name="smart_toy" color="indigo" />
              </q-item-section>
              <q-item-section>
                <div class="text-subtitle1">Inteligencia Artificial</div>
                <div class="sisdai-text-secondary">
                  Capacidades de IA que optimizan configuraciones y análisis predictivo.
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <q-btn
            label="Contáctanos"
            color="primary"
            class="full-width sisdai-button"
            @click="navigateToContact"
          />
        </q-card-section>
      </q-card>
    </q-page>
  </template>
  
  <script>
  export default {
    methods: {
      navigateToContact() {
        this.$router.push('/contact'); // Navegar a la página de contacto
      }
    }
  };
  </script>
  
  <style scoped>
  .about-us-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background: #f5f5f5; /* Fondo claro */
  }
  
  .about-card {
    max-width: 800px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: white;
  }
  
  .about-image {
    max-height: 400px;
    border-radius: 4px;
  }
  
  .about-list .q-item {
    margin-bottom: 16px;
  }
  
  .sisdai-text-primary {
    font-weight: bold;
    color: #0d47a1; /* Azul oscuro */
  }
  
  .sisdai-text-secondary {
    font-size: 1rem;
    color: #616161; /* Gris intermedio */
  }
  
  .sisdai-button {
    font-size: 1.2rem;
    font-weight: bold;
  }
  </style>
  