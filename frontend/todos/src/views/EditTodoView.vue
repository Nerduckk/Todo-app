<template>
    <v-card class="p-4 h-full rounded-none mx-auto">
      <v-card-title>
        <div class="flex items-center justify-between">
          <h1 class="text-2xl !font-bold !text-gray-500">Sửa công việc</h1>
          <v-btn
            variant="tonal"
            color="blue"
            class="rounded-full"
            @click="handleSave"
          >
            Lưu thay đổi
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <p class="!font-bold !text-gray-500">Tên công việc</p>
            <v-text-field
              v-model="todoDetail.title"
              variant="outlined"
              density="compact"
            />
          </v-col>
  
          <v-col cols="12" md="6">
            <p class="!font-bold !text-gray-500">Trạng thái</p>
            <v-select
              v-model="todoDetail.status"
              :items="[
                { title: 'Hoàn thành', value: 'completed' },
                { title: 'Đang thực hiện', value: 'pending' },
                { title: 'Lưu trữ', value: 'archived' }
              ]"
              item-title="title"
              item-value="value"
              color="primary"
              variant="outlined"
              density="compact"
              class="rounded-lg"
            />
          </v-col>
  
         
          <v-col cols="12" md="6">
            <p class="!font-bold !text-gray-500">Ngày hết hạn</p>
            <v-text-field
              v-model="displayExpiresAt"
              readonly
              variant="outlined"
              density="compact"
              @click="showExpiresPicker = true"
            />
            <v-dialog v-model="showExpiresPicker" width="320px" >
              <v-card>
                <v-date-picker
                  v-model="todoDetail.expires_at"
                  @update:model-value="updateExpiresAt"
                  color="primary"
                />
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click="showExpiresPicker = false">Đóng</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
  
       
          <v-col cols="12" md="6">
            <p class="!font-bold !text-gray-500">Ngày hoàn thành</p>
            <v-text-field
              v-model="displayCompletedAt"
              readonly
              variant="outlined"
              density="compact"
              @click="showCompletedPicker = true"
            />
            <v-dialog v-model="showCompletedPicker" >
              <v-card>
                <v-date-picker
                  v-model="todoDetail.completed_at"
                  @update:model-value="updateCompletedAt"
                  color="primary"
                />
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click="showCompletedPicker = false">Đóng</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
  
          <v-col cols="12" md="12">
            <p class="!font-bold !text-gray-500">Mô tả</p>
            <v-textarea
              v-model="todoDetail.description"
              variant="outlined"
              density="compact"
              rows="4"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar.show" :timeout="2000" :color="snackbar.color" location="top right" variant="tonal">
      {{ snackbar.message }}
    </v-snackbar>
  </template>
  
  
  <script setup lang="ts">
  import useTodoStore from '@/stores/todo'
  import { onMounted, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type { TodoDetailResponse } from '@/types/todos'
  import Utils from '@/utils'
  
  const todoStore = useTodoStore()
  const route = useRoute()
  const router = useRouter()
  const todoId = route.params.todoId
  const isSaving = computed(() => todoStore.todoUpdateGetter)
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
  })


  const todoDetail = ref<TodoDetailResponse>({
    id: '',
    title: '',
    description: '',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
    expires_at: new Date(),
    completed_at: new Date()
  })
  
  const showExpiresPicker = ref(false)
  const showCompletedPicker = ref(false)
  
  const displayExpiresAt = computed({
    get() {
      return todoDetail.value.expires_at
        ? Utils.formatDateTime(new Date(todoDetail.value.expires_at))
        : ''
    },
    set() {}
  })
  
  const displayCompletedAt = computed({
    get() {
      return todoDetail.value.completed_at
        ? Utils.formatDateTime(new Date(todoDetail.value.completed_at))
        : ''
    },
    set() {}
  })
  
  function updateExpiresAt(date: string | Date) {
    todoDetail.value.expires_at = new Date(date)
    showExpiresPicker.value = false
  }
  
  function updateCompletedAt(date: string | Date) {
    todoDetail.value.completed_at = new Date(date)
    showCompletedPicker.value = false
  }

  const handleSave = async () => {
    await todoStore.updateTodoAction(todoId as string, {
      title: todoDetail.value.title,
      description: todoDetail.value.description,
      status: todoDetail.value.status,
      expires_at: Utils.formatDateTime(todoDetail.value.expires_at),
      completed_at: Utils.formatDateTime(todoDetail.value.completed_at)
    })
    if (isSaving.value) {
      snackbar.value.show = true
      snackbar.value.message = 'Cập nhật công việc thành công! '
      snackbar.value.color = 'success'
      setTimeout(() => {
        router.push({ name: 'home' })
      }, 2000)
    } else {
      snackbar.value.show = true
      snackbar.value.message = 'Cập nhật công việc thất bại'
      snackbar.value.color = 'error'
    }
  }

  onMounted(async () => {
    await todoStore.getTodoDetailAction(todoId as string)
    const detail = todoStore.todoDetailGetter
    if (detail) {
      todoDetail.value = detail
    }
  })
  </script>
  