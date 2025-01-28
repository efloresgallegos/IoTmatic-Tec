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
@import '../../css/dinamic-components/DeviceCard.css';
</style>
