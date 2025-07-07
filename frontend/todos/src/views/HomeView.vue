<template>
  <v-card class="p-4 h-full rounded-none mx-auto">
    <v-row class="h-full">
      <v-col cols="12" md="12" lg="2" class="border-r border-gray-200 h-full rounded-none">
        <v-card-title class="text-2xl !font-bold !text-gray-500">Filter</v-card-title>
        <v-card-text class="mt-4">
          <v-select
            label="Trạng thái"
            :items="[
              { title: 'Tất cả', value: 'all' },
              { title: 'Đang thực hiện', value: 'pending' },
              { title: 'Hoàn thành', value: 'completed' },
            ]"
            variant="outlined"
            color="blue"
            item-title="title"
            item-value="value"
            density="compact"
            v-model="status"
            hide-details
            class="rounded-lg"
          />
        </v-card-text>
      </v-col>

      <v-col cols="12" md="12" lg="10" class="rounded-none h-full">
        <v-card-text>
          <TodoTable
            title="Danh sách công việc"
            :todos="todoPagination?.value || []"
            :page="page"
            :totalPages="totalPages"
            @update:page="onChangePage"
            @archived="reload"
            @unarchived="reload"
            @completed="reload"
            @deleted="reload"
            @undeleted="reload"
            @deletedPermanently="reload"
            @created="reload"
          />
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TodoTable from '@/components/table/TodoTable.vue'
import useTodoStore from '@/stores/todo'

const page = ref(1)
const status = ref('all')
const totalPages = ref(0)

const todoStore = useTodoStore()
const todoPagination = computed(() => todoStore.todoPaginationState)

const getTodoPagination = async () => {
  await todoStore.getTodoPaginationAction({
    page: page.value,
    page_size: 10,
    status_type: status.value,
  })
  totalPages.value = todoPagination.value?.total_page || 0
}

watch(status, () => {
  page.value = 1
  getTodoPagination()
})

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
