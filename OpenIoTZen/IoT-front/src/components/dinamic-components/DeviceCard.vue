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
          <p><strong>{{ $t('views.devices.deviceCard.name') }}</strong> {{ data.name }}</p>
          <p><strong>{{ $t('views.devices.deviceCard.type') }}</strong> {{ data.type.name }}</p>
          <p><strong>{{ $t('views.devices.deviceCard.description') }}</strong> {{ data.description }}</p>
            <button @click.stop="goDevice" class="boton-secundario boton-chico">
            {{ $t('views.devices.deviceCard.action') }}
            </button>
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
    goDevice() {
      this.$router.push(`/devices/${this.data.device_id}`);
    },
  },
};
</script>

<style scoped>
.device-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.device-card.expanded {
  transform: scale(1.03);
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.device-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 8px;
}

.device-info {
  text-align: center;
}

.device-name {
  font-size: 0.9em;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #333;
}

.device-details {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 6px;
}

.device-details p {
  margin: 4px 0;
  font-size: 0.8em;
  color: #666;
}

.boton-secundario {
  background: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
  font-size: 0.8em;
}

.boton-secundario:hover {
  background: #5a6268;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .device-card {
    padding: 8px;
  }

  .device-image {
    height: 60px;
  }

  .device-name {
    font-size: 0.85em;
  }

  .device-details {
    padding: 6px;
  }

  .device-details p {
    font-size: 0.75em;
  }

  .boton-secundario {
    padding: 3px 6px;
    font-size: 0.75em;
  }
}
</style>
