<template>
    <q-drawer v-model="localActive" side="left" bordered class="bg-white shadow-2" :overlay="!isMobile">
        <div class="text-center q-pa-md">
            <q-img src="/logo.png" class="q-mx-auto" style="max-width: 80px;" />
            <div class="text-primary text-bold text-h6">{{ t('navBar.logo') }}</div>
        </div>
        <q-list>
            <q-item v-for="item in menuItems" :key="item.name" clickable v-ripple :to="item.link">
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
import { defineProps, computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
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

const localActive = ref(props.isActive);

watch(() => props.isActive, (newVal) => {
    localActive.value = newVal;
});

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);

const menuItems = [
    { name: 'navBar.home', link: '/', icon: 'home' },
    { name: 'navBar.devices', link: '/devices', icon: 'devices' },
    { name: 'navBar.modelGenerator', link: '/modelGenerator', icon: 'edit' },
    { name: 'navBar.settings', link: '#', icon: 'settings' },
    { name: 'navBar.logout', link: '#', icon: 'logout' },
];

const { t } = useI18n();
</script>

<style>

</style>