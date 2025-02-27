<template>
  <q-page class="user-config">
    <div class="container">
      <!-- Formulario para modificar o agregar usuario -->
      <q-card class="form-card">
        <q-card-section>
          <div class="text-h6" >{{$t('views.users.title') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleSubmit">
            <q-input
              filled
              v-model="user.name"
              :label="$t('views.users.name')"
              required
              class="input-field"
            />
            <q-input
              filled
              v-model="user.username"
              :label="$t('views.users.username')"
              required
              class="input-field"
            />
            <q-input
              filled
              v-model="user.password"
              :label="$t('views.users.password')"
              type="password"
              required
              class="input-field"
            />
            <q-btn
              type="submit"
              :label="isEditing ? $t('views.users.saveButton') : $t('views.users.title')"
              color="primary"
              class="action-btn"
            />
            <q-btn
              v-if="isEditing"
              flat
              color="warning"
              label="Cancelar"
              @click="resetForm"
              class="action-btn"
            />
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Tabla de usuarios existentes -->
      <q-card class="table-card">
        <q-card-section>
          <div class="text-h6">{{ $t('views.users.existingUsers') }}</div>
        </q-card-section>

        <q-card-section>
          <q-table
            dense
            flat
            :rows="users"
            :columns="columns"
            row-key="user_id"
            class="user-table"
          >
            <template v-slot:body-cell-actions="props">
              <q-btn
                flat
                icon="edit"
                color="primary"
                @click="editUser(props.row)"
                :title="$t('views.users.table.edit')"
              />
              <q-btn
                flat
                icon="delete"
                color="negative"
                @click="deleteUser(props.row.user_id)"
                :title="$t('views.users.table.delete')"
              />
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { api } from "src/boot/axios";

export default {
  data() {
    return {
      user: {
        name: "",
        username: "",
        password: ""
      },
      users: [
        { user_id: 1, name: "Juan Pérez", username: "juanperez" },
        { user_id: 2, name: "Ana Gómez", username: "anagomez" },
        { user_id: 3, name: "Carlos López", username: "carloslopez" }
      ],
      isEditing: false,
      editingUserId: null,
      columns: [
        { name: "name", required: true, label: this.$t('views.users.table.name'), align: "left", field: "name" },
        { name: "username", required: true, label: this.$t('views.users.table.username'), align: "left", field: "username" },
        { name: "actions", label: this.$t('views.users.table.actions'), align: "center" }
      ]
    };
  },
  methods: {
    async fetchUsers() {
      try {
        // const response = await api.get('/api/users');
        // this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async handleSubmit() {
      try {
        if (this.isEditing) {
          await api.put(`/api/users/${this.editingUserId}`, this.user);
        } else {
          await api.post("/api/users", this.user);
        }
        this.resetForm();
        this.fetchUsers();
      } catch (error) {
        console.error("Error saving user:", error);
      }
    },
    editUser(user) {
      this.user = { ...user };
      this.isEditing = true;
      this.editingUserId = user.user_id;
    },
    async deleteUser(userId) {
      try {
        await api.delete(`/api/users/${userId}`);
        this.fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    },
    resetForm() {
      this.user = {
        name: "",
        username: "",
        password: ""
      };
      this.isEditing = false;
      this.editingUserId = null;
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
@import '../css/pages/UserConfiguration.css';
</style>
