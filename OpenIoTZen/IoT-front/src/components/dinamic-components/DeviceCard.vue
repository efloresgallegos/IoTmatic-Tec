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
@import '../../css/dinamic-components/DeviceCard.css';
</style>
