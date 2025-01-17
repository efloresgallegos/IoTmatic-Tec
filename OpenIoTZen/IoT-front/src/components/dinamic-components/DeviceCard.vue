<template>
  <div 
    class="device-card" 
    :class="{ expanded: isExpanded }" 
    @click="toggleExpanded"
  >
    <img src="../../assets/img/device.png" alt="Device" class="device-image" />
    <div class="device-info">
      <p class="device-name">{{ data.name }}</p>
      <transition name="fade-slide">
        <div v-if="isExpanded" class="device-details">
          <p><strong>Nombre:</strong> {{ data.name }}</p>
          <p><strong>Type:</strong> {{ data.type }}</p>
          <p><strong>Description:</strong> {{ data.description }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>


<script>
export default {
  name: "DeviceCard",
  props: {
    data: {
      type: Object,
      required: true,
      validator(value) {
        return (
          "device_id" in value &&
          "name" in value &&
          "type" in value &&
          "description" in value
        );
      },
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style scoped>
.device-card {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  width: 300px;
  transition: width 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  overflow: hidden;
}

.device-card.expanded {
  width: 350px;
  padding: 15px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.device-image {
  width: 50px;
  height: auto;
  border-radius: 5px;
  margin-right: 10px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.device-card.expanded .device-image {
  transform: scale(1.1);
  opacity: 1; /* Aseguramos que la imagen no desaparezca a otro ritmo */
}

.device-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.device-card.expanded .device-info {
  opacity: 1;
  transform: translateY(0); /* Mantiene la sincronización */
}

.device-name {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

.device-details {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #555;
  transition: max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  overflow: hidden;
}

.device-card.expanded .device-details {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
}

/* Animaciones para transiciones */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}


</style>
