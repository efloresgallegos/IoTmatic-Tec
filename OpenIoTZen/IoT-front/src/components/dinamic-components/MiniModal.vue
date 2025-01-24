<template>
  <div class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <button @click="emitClose" class="close-button">×</button>
      <header>
        <slot name="header"></slot>
      </header>
      <main>
        <slot name="body"></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"]);
const emitClose = () => emit("close");
</script>

<style scoped>
@import '../../css/dinamic-components/MiniModal.css';
</style>