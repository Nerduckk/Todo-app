<template>
  <TodoTable
    title="Danh sách công việc đã xoá"
    :todos="todoPagination?.value || []"
    :page="page"
    :totalPages="totalPages"
    @update:page="onChangePage"
    @deletedPermanently="reload"
    @undeleted="reload"
  />
</template>

<script setup lang="ts">
import TodoTable from '@/components/table/TodoTable.vue'
import useTodoStore from '@/stores/todo'
import { computed, onMounted, ref } from 'vue'

const todoStore = useTodoStore()

const page = ref(1)
const totalPages = ref(0)
const status = ref('deleted')

const todoPagination = computed(() => todoStore.todoPaginationState)

const getTodoPagination = async () => {
  await todoStore.getTodoPaginationAction({
    page: page.value,
    page_size: 10,
    status_type: status.value,
  })
  totalPages.value = todoPagination.value?.total_page || 0
}

const onChangePage = (newPage: number) => {
  page.value = newPage
  getTodoPagination()
}

const reload = () => {
  getTodoPagination()
}

onMounted(() => {
  getTodoPagination()
})
</script>
