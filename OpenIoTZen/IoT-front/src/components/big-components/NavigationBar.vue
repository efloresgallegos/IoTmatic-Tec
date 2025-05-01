<template>
    <q-drawer v-model="localActive" side="left" bordered class="bg-white shadow-2" :overlay="!isMobile">
        <div class="text-center q-pa-md">
            <q-img src="/logo.png" class="q-mx-auto" style="max-width: 80px;" />
            <div class="text-primary text-bold text-h6">{{ t('navBar.logo') }}</div>
        </div>
        <q-list>
            <!-- Elementos de menú normales -->
            <template v-for="item in menuItems" :key="item.name">
                <!-- Elemento desplegable para modelos -->
                <template v-if="item.hasSubmenu">
                    <q-expansion-item
                        :icon="item.icon"
                        :label="t(item.name)"
                        header-class="text-primary"
                        expand-icon-class="text-primary"
                    >
                        <q-list padding class="q-pl-lg">
                            <q-item 
                                v-for="subItem in item.submenu" 
                                :key="subItem.name" 
                                clickable 
                                v-ripple 
                                :to="subItem.link"
                                @click="handleMenuItemClick(subItem)"
                            >
                                <q-item-section avatar>
                                    <q-icon :name="subItem.icon" class="text-primary" />
                                </q-item-section>
                                <q-item-section>{{ t(subItem.name) }}</q-item-section>
                            </q-item>
                        </q-list>
                    </q-expansion-item>
                </template>
                <!-- Elementos normales sin submenú -->
                <q-item 
                    v-else 
                    clickable 
                    v-ripple 
                    :to="item.link"
                    @click="handleMenuItemClick(item)"
                >
                    <q-item-section avatar>
                        <q-icon :name="item.icon" class="text-primary" />
                    </q-item-section>
                    <q-item-section>{{ t(item.name) }}</q-item-section>
                </q-item>
            </template>
        </q-list>
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
    { 
        name: 'navBar.models', 
        icon: 'dataset', 
        hasSubmenu: true,
        submenu: [
            { 
                name: 'navBar.modelGenerator', 
                link: '/modelGenerator', 
                icon: 'edit' 
            },
            { 
                name: 'navBar.modelsList', 
                link: '/models', 
                icon: 'list' 
            }
        ]
    },
    { name: 'navBar.settings', link: '/settings', icon: 'settings' },
    { name: 'navBar.users', link: '/users', icon: 'people' },
    { name: 'navBar.about', link: '/about', icon: 'info' },
    { name: 'navBar.alerts', link: '/alerts', icon: 'warning' },    
    {
        name: 'navBar.logout',
        link: '/login',
        icon: 'logout',
        action: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/#/login';
        }
    }
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
function handleMenuItemClick(item) {
    if (item.action) {
        item.action(); // Ejecuta la acción personalizada del ítem
    }
    if (isMobile.value) {
        localActive.value = false; // Cierra automáticamente en móviles
    }
}

</script>

<style>
@import '../../css/big-components/NavigationBar.css';
</style>
