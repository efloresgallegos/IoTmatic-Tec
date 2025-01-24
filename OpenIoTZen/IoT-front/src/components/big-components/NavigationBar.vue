<template>
    <q-drawer 
        v-model="localActive" 
        side="left" 
        bordered 
        class="bg-white shadow-2" 
        :overlay="!isMobile"
    >
        <div class="text-center q-pa-md">
            <q-img src="/logo.png" class="q-mx-auto" style="max-width: 80px;" />
            <div class="text-primary text-bold text-h6">{{ t('navBar.logo') }}</div>
        </div>
        <q-list>
            <q-item 
                v-for="item in menuItems" 
                :key="item.name" 
                clickable 
                v-ripple 
                :to="item.link"
                @click="handleMenuItemClick"
            >
                <q-item-section avatar>
                    <q-icon :name="item.icon" class="text-primary" />
                </q-item-section>
                <q-item-section>{{ t(item.name) }}</q-item-section>
            </q-item>
        </q-list>
        <div class="q-pa-md">
            <select v-model="$i18n.locale">
                <option value="es-MX">Español</option>
                <option value="en-US">English</option>
            </select>
        </div>
    </q-drawer>
</template>

<script setup>
import { defineProps, ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    isActive: {
        type: Boolean,
        required: true,
    },
    toggleSidebar: {
        type: Function,
        required: true,
    },
});

const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const localActive = ref(props.isActive);
const isMobile = computed(() => $q.screen.lt.md);

const menuItems = [
    { name: 'navBar.home', link: '/', icon: 'home' },
    { name: 'navBar.devices', link: '/devices', icon: 'devices' },
    { name: 'navBar.modelGenerator', link: '/modelGenerator', icon: 'edit' },
    { name: 'navBar.settings', link: '#', icon: 'settings' },
    { name: 'navBar.users', link: '/settings', icon: 'people' },
    { name: 'navBar.about', link: '/about', icon: 'info' },
    { name: 'navBar.logout', link: '#', icon: 'logout' },
];

// Sincroniza la prop `isActive` con `localActive`
watch(() => props.isActive, (newVal) => {
    localActive.value = newVal;
});

// Notifica el cambio de estado al componente padre
watch(localActive, (newVal) => {
    if (newVal !== props.isActive) {
        props.toggleSidebar(newVal);
    }
});

// Cierra el drawer cuando cambia la ruta
watch(() => route.path, () => {
    localActive.value = false;
});

// Maneja el clic en un ítem del menú
function handleMenuItemClick() {
    if (isMobile.value) {
        localActive.value = false; // Cierra automáticamente en móviles
    }
}
</script>

<style>
.q-item {
    color: inherit;
    text-decoration: none;
}

.q-item.q-router-link-active {
    color: var(--q-primary);
}
</style>
