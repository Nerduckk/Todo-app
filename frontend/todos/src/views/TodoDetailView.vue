<template>
  <v-card>
    <v-card-title>
      <h1 class="text-2xl !font-bold !text-gray-500">Chi tiết công việc</h1>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Tên công việc</p>
          <v-text-field :value="todoDetail?.title" readonly />
        </v-col>

        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Trạng thái</p>
          <v-text-field
            :value="
              todoDetail?.status === 'completed'
                ? 'Hoàn thành'
                : todoDetail?.status === 'pending'
                  ? 'Đang thực hiện'
                  : 'Đã lưu trữ'
            "
            readonly
          />
        </v-col>
        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Ngày tạo</p>
          <v-text-field :value="Utils.formatDateTime(todoDetail?.created_at as Date)" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Ngày cập nhật</p>
          <v-text-field :value="Utils.formatDateTime(todoDetail?.updated_at as Date)" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Ngày hết hạn</p>
          <v-text-field :value="Utils.formatDateTime(todoDetail?.expires_at as Date)" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <p class="!font-bold !text-gray-500">Ngày hoàn thành</p>
          <v-text-field :value="todoDetail?.completed_at ? Utils.formatDateTime(todoDetail?.completed_at as Date) : 'Chưa hoàn thành'" readonly />
        </v-col>
        <v-col cols="12" md="12">
          <p class="!font-bold !text-gray-500">Mô tả</p>
          <v-textarea :value="todoDetail?.description" readonly />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import useTodoStore from '@/stores/todo'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Utils from '@/utils'

const todoStore = useTodoStore()
const route = useRoute()
const todoId = route.params.todoId

const todoDetail = computed(() => todoStore.todoDetailGetter)


onMounted(() => {
  todoStore.getTodoDetailAction(todoId as string)
  console.log(todoDetail.value)
})

watch(todoDetail, (newVal) => {
  console.log(newVal)
})
</script>

<style scoped></style>
