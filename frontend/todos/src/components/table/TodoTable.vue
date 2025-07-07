<template>
  <v-card class="top-10 h-full">
    <v-card-title>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl !font-bold !text-gray-500">{{ title }}</h1>
        <v-btn
          v-if="title === 'Danh sách công việc'"
          variant="tonal"
          color="blue"
          class="rounded-full"
          @click="dialog.isOpen = true"
        >
          Thêm công việc
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text class="mt-4">
      <v-table class="rounded-lg">
        <thead>
          <tr>
            <th class="!font-bold w-1/25">STT</th>
            <th class="!font-bold w-1/7">Tên công việc</th>
            <th class="!font-bold w-1/3">Mô tả</th>
            <th class="!font-bold">Trạng thái</th>
            <th class="!font-bold w-1/7">Ngày tạo</th>
            <th class="!font-bold w-1/7">Ngày cập nhật</th>
            <th class="flex items-center !font-bold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(todo, index) in todos" :key="todo.id">
            <td>{{ (page - 1) * 10 + index + 1 }}</td>
            <td>
              <p class="line-clamp-1">{{ todo.title }}</p>
            </td>
            <td class="w-2.5">
              <p class="line-clamp-1">{{ todo.description }}</p>
            </td>
            <td>
              <v-chip
                label
                :color="
                  todo.status === 'completed'
                    ? 'green'
                    : todo.status === 'pending'
                      ? 'orange'
                      : 'red'
                "
                variant="tonal"
              >
                {{
                  todo.status === 'completed' && todo.is_deleted == 0
                    ? 'Hoàn thành'
                    : todo.status === 'pending' && todo.is_deleted == 0
                      ? 'Đang thực hiện'
                      : todo.status === 'archived' && todo.is_deleted == 0
                        ? 'Đã lưu trữ'
                      : todo.is_deleted == 1
                        ? 'Đã xoá'
                        : 'Đang thực hiện'
                }}
              </v-chip>
            </td>
            <td>
              <p class="line-clamp-1">{{ Utils.formatDateTime(todo.created_at) }}</p>
            </td>
            <td>
              <p class="line-clamp-1">{{ Utils.formatDateTime(todo.updated_at) }}</p>
            </td>
            <td class="flex items-center gap-2 justify-start">
              <v-tooltip
                :text="todo.status === 'pending' && todo.is_deleted == 0 ? 'Lưu trữ' : 'Khôi phục'"
                location="bottom"
                  v-if="todo.status === 'pending' && todo.is_deleted == 0 || todo.status === 'archived' && todo.is_deleted == 0"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    color="red"
                    class="rounded-full"
                    size="small"
                    @click="handleArchiveTodo(todo.id, todo.status)"
                  >
                    <ArchiveIcon />
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip :text="todo.status === 'pending' && todo.is_deleted == 0 ? 'Hoàn thành' : 'Khôi phục'" location="bottom" v-if="todo.status === 'pending' && todo.is_deleted == 0 || todo.is_deleted == 1">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    color="green"
                    class="rounded-full"
                    size="small"
                    @click="handleCompleteTodo(todo.id, todo.status, todo.is_deleted)"
                  >
                    <CheckIcon />
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Xem" location="bottom" v-if="todo.is_deleted == 0">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    color="green"
                    class="rounded-full"
                    @click="handleViewTodo(todo.id)"
                    size="small"
                  >
                    <EyeIcon />
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip
                text="Sửa"
                location="bottom"
                v-if="todo.status === 'pending' && todo.is_deleted == 0 || todo.status === 'completed' && todo.is_deleted == 0"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    color="blue"
                    class="rounded-full"
                    size="small"
                    @click="handleEditTodo(todo.id)"
                  >
                    <PencilIcon />
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Xóa" location="bottom" v-if="todo.is_deleted == 1 || todo.is_deleted == 0">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    color="red"
                    class="rounded-full"
                    size="small"
                    @click="handleDeleteTodo(todo.id, todo.is_deleted)"
                  >
                    <TrashIcon />
                  </v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-pagination
        :length="totalPages"
        v-model="internalPage"
        color="blue"
        @update:model-value="emitUpdatePage"
      />
    </v-card-text>
  </v-card>
  <v-dialog v-model="dialog.isOpen" width="500">
  <v-card>
    <v-card-title>Thêm công việc</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field label="Tên công việc" v-model="todo.title" required />
        <v-text-field label="Mô tả" v-model="todo.description" required />
        <v-text-field
          v-model="todo.expires_at"
          label="Ngày hết hạn"
          required
          readonly
          @click="showDatePicker = true"
        />
        <v-dialog v-model="showDatePicker" max-width="400">
          <v-date-picker
            v-model="rawExpiresAt"
            @update:model-value="onDateSelected"
          />
        </v-dialog>
      </v-form>
      <v-card-actions>
        <v-spacer />
        <v-btn color="red" variant="tonal" class="rounded-full" @click="dialog.isOpen = false">Hủy</v-btn>
        <v-btn color="blue" variant="tonal" class="rounded-full" @click="handleAddTodo">Thêm</v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</v-dialog>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EyeIcon, PencilIcon, TrashIcon, CheckIcon, ArchiveIcon } from 'vue-tabler-icons'
import Utils from '@/utils'
import { useRouter } from 'vue-router'
import useTodoStore from '@/stores/todo'

const todoStore = useTodoStore()
const router = useRouter()
const dialog = ref({
  isOpen: false
})
const rawExpiresAt = ref<Date | null>(null); 

const showDatePicker = ref(false)

const todo = ref({
  title: '',
  description: '',
  expires_at: ''
})

const props = defineProps<{
  todos: any[]
  page: number
  totalPages: number
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'archived', todoId: string): void
  (e: 'unarchived', todoId: string): void
  (e: 'completed', todoId: string): void
  (e: 'undeleted', todoId: string): void
  (e: 'deleted', todoId: string): void
  (e: 'deletedPermanently', todoId: string): void
  (e: 'created', todo: any): void
}>()

const internalPage = ref(props.page)

watch(() => props.page, (newPage) => {
  internalPage.value = newPage
})

const emitUpdatePage = (value: number) => {
  emit('update:page', value)
}

const handleViewTodo = (todoId: string) => {
  router.push({ name: 'todo.view', params: { todoId } })
}

const handleEditTodo = (todoId: string) => {
  router.push({ name: 'todo.edit', params: { todoId } })
}

const handleCompleteTodo = async (todoId: string, status: string, deleted: number) => {
  if (status === 'pending' && deleted === 0) {
    await todoStore.completedTodoAction(todoId)
    if (todoStore.todoCompletedState) emit('completed', todoId)
  } else if (deleted === 1) {
    await todoStore.unDeleteTodoAction(todoId)
    if (todoStore.todoUnDeleteState) emit('undeleted', todoId)
  }
}

const handleArchiveTodo = async (todoId: string, status: string) => {
  if (status === 'pending') {
    await todoStore.archiveTodoAction(todoId)
    if (todoStore.todoArchiveState) emit('archived', todoId)
  } else if (status === 'archived') {
    await todoStore.unarchiveTodoAction(todoId)
    if (todoStore.todoUnarchiveState) emit('unarchived', todoId)
  }
}

const handleDeleteTodo = async (todoId: string, deleted: number) => {
  if (deleted === 0) {
    await todoStore.deleteTodoAction(todoId)
    if (todoStore.todoDeleteState) emit('deleted', todoId)
  } else {
    await todoStore.deleteTodoPermanentlyAction(todoId)
    if (todoStore.todoDeletePermanentlyState) emit('deletedPermanently', todoId)
  }
}

const onDateSelected = (date: Date | null) => {
  if (date) {
    todo.value.expires_at = Utils.formatDate(date); 
  }
  showDatePicker.value = false;
};

const handleAddTodo = async () => {
  console.log(todo.value)
  await todoStore.createTodoAction({
    title: todo.value.title,
    description: todo.value.description,
    expires_at: todo.value.expires_at, 
  });
  if (todoStore.todoCreateState) {
    dialog.value.isOpen = false;
    emit('created', todo.value);
  } else {
    dialog.value.isOpen = true;
  }
};
</script>
