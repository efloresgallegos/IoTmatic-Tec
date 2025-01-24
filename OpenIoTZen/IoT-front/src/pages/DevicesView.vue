<template>
  <div class="sisdai-grid">
    <div class="div1 sisdai-card">
      <button class="sisdai-button-primary" @click="openModal">
        {{ t('views.devices.createDevice.createButton') }}
      </button>
    </div>
    <div class="div2 sisdai-card">
      <div class="filters">
        <input
          type="text"
          class="sisdai-input"
          :placeholder="t('views.devices.filters.searchPlaceholder')"
          v-model="searchQuery"
        />
        <select
          class="sisdai-select"
          v-model="selectedType"
          aria-label="t('views.devices.filters.filterByType')"
        >
          <option value="">{{ t('views.devices.filters.allTypes') }}</option>
          <option v-for="type in deviceTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <input
          type="date"
          class="sisdai-input"
          v-model="selectedDate"
          :aria-label="t('views.devices.filters.filterByDate')"
          :lang="$i18n.locale"
        />
      </div>
    </div>
    <div class="div3 devices-container">
      <div class="devices-grid">
        <DeviceCard
          v-for="device in filteredDevices"
          :key="device.id"
          :data="device"
        />
      </div>
    </div>
    <Modal v-if="isModalOpen" @close="closeModal">
      <!-- Header -->
      <template #header>
        <h3>{{ t('views.devices.createDevice.title') }}</h3>
      </template>

      <!-- Body -->
      <template #body>
        <form @submit.prevent="createDevice" class="form-grid">
          <div class="form-group">
            <label for="device-name"><strong>{{ t('views.devices.createDevice.namePlaceholder') }}</strong></label>
            <input
              id="device-name"
              type="text"
              v-model="newDevice.name"
              :placeholder="t('views.devices.createDevice.namePlaceholder')"
              class="sisdai-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="device-type"><strong>{{ t('views.devices.createDevice.typePlaceholder') }}</strong></label>
            <input
              id="device-type"
              type="text"
              v-model="newDevice.type"
              :placeholder="t('views.devices.createDevice.typePlaceholder')"
              class="sisdai-input"
              required
            />
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label for="device-description"><strong>{{ t('views.devices.createDevice.descriptionPlaceholder') }}</strong></label>
            <textarea
              id="device-description"
              v-model="newDevice.description"
              :placeholder="t('views.devices.createDevice.descriptionPlaceholder')"
              class="sisdai-input"
              required
            ></textarea>
          </div>

          <!-- Botón Crear -->
          <div class="form-group">
            <br>
            <button type="submit" class="sisdai-button-primary">{{ t('views.devices.createDevice.createButton') }}</button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import DeviceCard from "../components/dinamic-components/DeviceCard.vue";
import Modal from "../components/dinamic-components/MiniModal.vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const isModalOpen = ref(false);
const searchQuery = ref("");
const selectedType = ref("");
const selectedDate = ref("");
const devices = ref([]);
const newDevice = ref({ name: "", type: "", description: "" });
const deviceTypes = ref(["Sensor", "Actuador", "Controlador"]);
const test = [
  {
    id: 1,
    name: "Sensor de Temperatura",
    type: "Sensor",
    description: "Mide la temperatura del ambiente en tiempo real.",
    createdAt: "2024-12-01T10:30:00Z",
  },
  {
    id: 2,
    name: "Actuador de Ventilación",
    type: "Actuador",
    description: "Controla el sistema de ventilación.",
    createdAt: "2024-12-05T08:15:00Z",
  },
];

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const createDevice = () => {
  const newId = devices.value.length + 1;
  const createdAt = new Date().toISOString();
  devices.value.push({ ...newDevice.value, id: newId, createdAt });
  newDevice.value = { name: "", type: "", description: "" };
  closeModal();
};

devices.value = test;

const filteredDevices = computed(() =>
  devices.value.filter((device) => {
    const matchesQuery = device.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesType =
      !selectedType.value || device.type === selectedType.value;
    const matchesDate =
      !selectedDate.value ||
      new Date(device.createdAt).toDateString() ===
      new Date(selectedDate.value).toDateString();
    return matchesQuery && matchesType && matchesDate;
  })
);
</script>

<style scoped>
@import '../css/pages/DevicesView.css';
</style>
