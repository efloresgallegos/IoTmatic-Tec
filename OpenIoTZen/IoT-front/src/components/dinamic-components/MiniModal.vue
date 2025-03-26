<template>
  <div 
    class="modal-overlay" 
    @click.self="emitClose"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div 
      class="modal-content"
      :id="contentId"
      tabindex="-1"
      @keydown.esc="emitClose"
    >
      <button 
        @click="emitClose" 
        class="close-button"
        aria-label="Cerrar"
      >×</button>
      <header :id="titleId">
        <slot name="header"></slot>
      </header>
      <main>
        <slot name="body"></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(["close"]);
const emitClose = () => emit("close");

const titleId = ref('modal-title-' + Math.random().toString(36).substr(2, 9));
const contentId = ref('modal-content-' + Math.random().toString(36).substr(2, 9));
let previousFocus = null;

onMounted(() => {
  // Guardar el elemento que tenía el foco antes de abrir el modal
  previousFocus = document.activeElement;
  
  // Enfocar el contenido del modal
  const modalContent = document.getElementById(contentId.value);
  if (modalContent) {
    modalContent.focus();
  }
});

onBeforeUnmount(() => {
  // Restaurar el foco al elemento anterior cuando se cierra el modal
  if (previousFocus) {
    previousFocus.focus();
  }
});
</script>

<style scoped>
@import '../../css/dinamic-components/MiniModal.css';
</style>