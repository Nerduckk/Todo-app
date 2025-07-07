<template>
  <v-card class="p-4 h-full rounded-none mx-auto">
    <v-card-text>
      <TodoTable
        title="Danh sách công việc đã lưu trữ"
        :todos="todoPagination?.value || []"
        :page="page"
        :totalPages="totalPages"
        @update:page="onChangePage"
        @archived="reload"
        @unarchived="reload"
        @deleted="reload"
        @deletedPermanently="reload"
        @completed="reload"
        @undeleted="reload"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import TodoTable from '@/components/table/TodoTable.vue'
import useTodoStore from '@/stores/todo'
import { computed, onMounted, ref } from 'vue'

const todoStore = useTodoStore()

const page = ref(1)
const totalPages = ref(0)
const status = ref('archived')

const todoPagination = computed(() => todoStore.todoPaginationState)

const getTodoPagination = async () => {
  await todoStore.getTodoPaginationAction({
    page: page.value,
    page_size: 10,
    status_type: status.value,
  })
  totalPages.value = todoPagination.value?.total_page || 0
}

const reload = () => {
  getTodoPagination()
}

const onChangePage = (newPage: number) => {
  page.value = newPage
  getTodoPagination()
}

onMounted(() => {
  getTodoPagination()
})
</script>
