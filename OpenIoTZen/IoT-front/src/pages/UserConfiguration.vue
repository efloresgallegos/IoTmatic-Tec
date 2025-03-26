<template>
  <q-page class="user-config">
    <div class="container">
      <!-- Formulario para modificar o agregar usuario -->
      <q-card class="form-card">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="person" class="q-mr-sm" />
            {{ isEditing ? $t('views.users.editUser') : $t('views.users.title') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="user.name"
              :label="$t('views.users.name')"
              :rules="[val => !!val || $t('views.users.validation.required')]"
              class="input-field"
              :hint="$t('views.users.hints.name')"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              filled
              v-model="user.username"
              :label="$t('views.users.username')"
              :rules="[
                val => !!val || $t('views.users.validation.required'),
                val => val.length >= 3 || $t('views.users.validation.usernameLength')
              ]"
              class="input-field"
              :hint="$t('views.users.hints.username')"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <q-input
              filled
              v-model="user.password"
              :label="$t('views.users.password')"
              :type="isPwd ? 'password' : 'text'"
              :rules="[
                val => !!val || $t('views.users.validation.required'),
                val => val.length >= 6 || $t('views.users.validation.passwordLength')
              ]"
              class="input-field"
              :hint="$t('views.users.hints.password')"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <div class="row q-gutter-sm justify-end">
              <q-btn
                v-if="isEditing"
                flat
                color="warning"
                :label="$t('views.users.cancelButton')"
                @click="resetForm"
                class="action-btn"
              >
                <q-icon name="cancel" class="q-mr-sm" />
              </q-btn>
              <q-btn
                type="submit"
                :label="isEditing ? $t('views.users.saveButton') : $t('views.users.createButton')"
                color="primary"
                class="action-btn"
              >
                <q-icon :name="isEditing ? 'save' : 'add'" class="q-mr-sm" />
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Tabla de usuarios existentes -->
      <q-card class="table-card">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="people" class="q-mr-sm" />
            {{ $t('views.users.existingUsers') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            dense
            flat
            :rows="users"
            :columns="columns"
            row-key="user_id"
            class="user-table"
            v-model:pagination="pagination"
            :loading="loading"
            :filter="filter"
            binary-state-sort
            virtual-scroll
            :virtual-scroll-sticky-size-start="48"
            :virtual-scroll-item-size="48"
            :virtual-scroll-slice-size="10"
            @virtual-scroll="onScroll"
          >
            <template v-slot:top>
              <div class="row full-width items-center q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    v-model="filter"
                    :placeholder="$t('views.users.searchPlaceholder')"
                    clearable
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </div>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    @click="editUser(props.row)"
                    :title="$t('views.users.table.edit')"
                  >
                    <q-tooltip>{{ $t('views.users.table.edit') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="confirmDelete(props.row)"
                    :title="$t('views.users.table.delete')"
                  >
                    <q-tooltip>{{ $t('views.users.table.delete') }}</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md">
                <q-icon name="inbox" size="2em" color="grey-5" class="q-mr-sm" />
                {{ $t('views.users.noData') }}
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de confirmación de eliminación -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('views.users.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('views.users.cancelButton')" color="primary" v-close-popup />
          <q-btn flat :label="$t('views.users.confirmDelete')" color="negative" @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import apiService from "src/boot/ApiServices/api.service";

export default {
  data() {
    return {
      user: {
        name: "",
        username: "",
        password: ""
      },
      users: [],
      isEditing: false,
      editingUserId: null,
      isPwd: true,
      loading: false,
      filter: "",
      deleteDialog: false,
      userToDelete: null,
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      columns: [
        { 
          name: "name", 
          required: true, 
          label: this.$t('views.users.table.name'), 
          align: "left", 
          field: "name",
          sortable: true
        },
        { 
          name: "username", 
          required: true, 
          label: this.$t('views.users.table.username'), 
          align: "left", 
          field: "username",
          sortable: true
        },
        { 
          name: "actions", 
          label: this.$t('views.users.table.actions'), 
          align: "center",
          field: row => row.user_id
        }
      ]
    };
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await apiService.get('/users');
        this.users = response.data;
        this.pagination.rowsNumber = this.users.length;
      } catch (error) {
        console.error("Error fetching users:", error);
        this.$q.notify({
          color: 'negative',
          message: this.$t('views.users.errors.fetchError')
        });
      } finally {
        this.loading = false;
      }
    },
    async handleSubmit() {
      try {
        if (this.isEditing) {
          await apiService.put(`/users/${this.editingUserId}`, this.user);
          this.$q.notify({
            color: 'positive',
            message: this.$t('views.users.success.update')
          });
        } else {
          await apiService.post("/users", this.user);
          this.$q.notify({
            color: 'positive',
            message: this.$t('views.users.success.create')
          });
        }
        this.resetForm();
        await this.fetchUsers();
      } catch (error) {
        console.error("Error saving user:", error);
        this.$q.notify({
          color: 'negative',
          message: this.$t('views.users.errors.saveError')
        });
      }
    },
    editUser(user) {
      this.user = { ...user };
      this.isEditing = true;
      this.editingUserId = user.user_id;
    },
    confirmDelete(user) {
      this.userToDelete = user;
      this.deleteDialog = true;
    },
    async deleteUser() {
      try {
        await apiService.delete(`/users/${this.userToDelete.user_id}`);
        this.$q.notify({
          color: 'positive',
          message: this.$t('views.users.success.delete')
        });
        await this.fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        this.$q.notify({
          color: 'negative',
          message: this.$t('views.users.errors.deleteError')
        });
      } finally {
        this.deleteDialog = false;
        this.userToDelete = null;
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
      this.isPwd = true;
    },
    onScroll() {
      // La paginación se maneja automáticamente con virtual-scroll
      // No necesitamos implementar lógica adicional aquí
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
