<template>
  <q-layout view="lHh Lpr lFf">
    <Sidebar :isActive="isActive" :toggleSidebar="toggleSidebar" />
    <q-btn flat round dense @click="toggleSidebar" class="toggle-btn bg-white text-primary shadow-2"
      style="position: fixed; top: 10px; left: 10px; z-index: 9999;" :aria-label="$t('navBar.toggleSidebar')">
      <q-icon :name="isActive ? 'chevron_left' : 'chevron_right'" />
    </q-btn>

    <!-- Botón de usuario y logout -->
    <div class="user-menu" v-if="isAuthenticated">
      <q-btn flat round dense class="bg-white text-primary shadow-2" style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
        <q-icon name="person" />
        <q-menu>
          <q-list style="min-width: 150px">
            <q-item>
              <q-item-section>{{ username }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="handleLogout">
              <q-item-section>Cerrar sesión</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-page-container>
      <router-view />
    </q-page-container>

    <AppFooter />
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import Sidebar from 'src/components/big-components/NavigationBar.vue';
import AppFooter from 'src/components/big-components/footer.vue';

const router = useRouter();
const authStore = useAuthStore();

const isActive = ref(false);

// Computed properties para acceder al estado de autenticación
const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.getUsername);

const toggleSidebar = () => {
  isActive.value = !isActive.value;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
