<template>
  <div>
    <AccessibilityButton />
    <router-view />
  </div>
</template>

<script setup>
import AccessibilityButton from './components/big-components/AccessibilityButton.vue';
import '@centrogeomx/sisdai-css'
import '@centrogeomx/sisdai-componentes'

</script>
