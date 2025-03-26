<template>
  <div class="sisdai-grid">
    <div class="div1 sisdai-card">
      <button class="sisdai-button-primary" @click="openModalDevice">
        {{ t('views.devices.createDevice.createButton') }}
      </button>
      <button class="sisdai-button-primary" @click="openModalType">
        {{ t('views.devices.createType.createButton') }}
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
            <option v-for="type in deviceTypes" :key="type.type_id" :value="type.type_id">
            {{ type.name }}
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

    <!-- Modal para dispositivos -->
    <Modal v-if="isModalDeviceOpen" @close="closeModalDevice">
      <template #header>
        <h3>{{ t('views.devices.createDevice.title') }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="createDevice" class="form-grid">
          <div class="form-group">
            <label for="device-name">{{ t('views.devices.createDevice.namePlaceholder') }}</label>
            <input
              id="device-name"
              type="text"
              v-model="newDevice.name"
              :placeholder="t('views.devices.createDevice.namePlaceholder')"
              required
            />
          </div>
          <div class="form-group">
            <label for="device-type">{{ t('views.devices.createDevice.selectType') }}</label>
            <select
              id="device-type"
              v-model="newDevice.type_id"
              required
            >
              <option value="">{{ t('views.devices.createDevice.selectType') }}</option>
              <option v-for="type in deviceTypes" :key="type.type_id" :value="type.type_id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="device-description">{{ t('views.devices.createDevice.descriptionPlaceholder') }}</label>
            <textarea
              id="device-description"
              v-model="newDevice.description"
              :placeholder="t('views.devices.createDevice.descriptionPlaceholder')"
              required
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="sisdai-button-primary">{{ t('views.devices.createDevice.createButton') }}</button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Modal para tipos -->
    <Modal v-if="isModalTypeOpen" @close="closeModalType">
      <template #header>
        <h3>{{ t('views.devices.createType.title') }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="createType" class="form-grid">
          <div class="form-group">
            <label for="type-name"><strong>{{ t('views.devices.createType.namePlaceholder') }}</strong></label>
            <input
              id="type-name"
              type="text"
              v-model="newType.name"
              :placeholder="t('views.devices.createType.namePlaceholder')"
              class="sisdai-input"
              required
            />
          </div>
          <div class="form-group">
            <br />
            <button type="submit" class="sisdai-button-primary">{{ t('views.devices.createType.createButton') }}</button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DeviceCard from "../components/dinamic-components/DeviceCard.vue";
import Modal from "../components/dinamic-components/MiniModal.vue";
import { useI18n } from "vue-i18n";
import apiService from "src/boot/ApiServices/api.service";

const { t } = useI18n();
const isModalDeviceOpen = ref(false);
const isModalTypeOpen = ref(false);

const searchQuery = ref("");
const selectedType = ref("");
const selectedDate = ref("");
const devices = ref([]);
const newDevice = ref({ name: "", type_id: "", description: "" });
const deviceTypes = ref([]);
const newType = ref({ name: "" });

const openModalDevice = () => {
  isModalDeviceOpen.value = true;
};

const closeModalDevice = () => {
  isModalDeviceOpen.value = false;
};

const openModalType = () => {
  isModalTypeOpen.value = true;
};

const closeModalType = () => {
  isModalTypeOpen.value = false;
};

const createDevice = async () => {
  const response = await apiService.post("/devices", newDevice.value);
  if (response.status === 201) {
    fetchDevices();
    closeModalDevice();
  }
};

const createType = async () => {
  const response = await apiService.post("/types", newType.value);
  if (response.status === 201) {
    fetchTypes();
    closeModalType();
  }
};

const fetchDevices = async () => {
  const response = await apiService.get("/devices");
  console.log(response.data);
  if (response.status === 200) {
    devices.value = response.data;
  }
};

const fetchTypes = async () => {
  const response = await apiService.get("/types");
  console.log(response);
  if (response.status === 200) {
    console.log("aaaaaaa:",response.data);
    deviceTypes.value = response.data
  }
};


const filteredDevices = computed(() =>
  devices.value.filter((device) => {
    const matchesQuery = device.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesType =
      !selectedType.value || device.type_id === selectedType.value;
    const matchesDate =
      !selectedDate.value ||
      new Date(device.createdAt).toDateString() ===
        new Date(selectedDate.value).toDateString();
    return matchesQuery && matchesType && matchesDate;
  })
);

onMounted(() => {
  fetchDevices();
  fetchTypes();
});

</script>

<style scoped>
@import '../css/pages/DevicesView.css';
</style>
