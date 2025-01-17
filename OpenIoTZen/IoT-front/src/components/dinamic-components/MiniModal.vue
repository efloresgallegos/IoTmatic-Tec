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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%; /* Adjust width for mobile */
  max-width: 500px; /* Maximum width for larger screens */
  height: auto; /* Adjust height for content */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.close-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

header,
main {
  margin-bottom: 16px;
}

/* Media query for smaller screens */
@media (max-width: 600px) {
  .modal-content {
    width: 95%; /* Adjust width for smaller screens */
    padding: 10px; /* Adjust padding for smaller screens */
  }

  .close-button {
    top: 5px;
    right: 5px;
    font-size: 14px;
    width: 28px;
    height: 28px;
  }
}
</style>