import type { GetTodoPageRequest, TodoDetailResponse, TodoPaginationResponse, TodoUpdateRequest, TodoCreateRequest  } from '@/types/todos'
import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import apiClient from '@/configs/apiClient'
import Constant from '@/utils/constant'

interface TodoState {
  loading: boolean
  error: AxiosError | null
  todoPaginationState: TodoPaginationResponse | null
  todoDetailState: TodoDetailResponse | null
  todoUpdateState: boolean
  todoArchiveState: boolean
  todoUnarchiveState: boolean
  todoDeleteState: boolean
  todoDeletePermanentlyState: boolean
  todoCompletedState: boolean
  todoUnDeleteState: boolean
  todoCreateState: boolean
}

const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    loading: false,
    error: null,
    todoPaginationState: null,
    todoUpdateState: false,
    todoDetailState: null,
    todoArchiveState: false,
    todoUnarchiveState: false,
    todoDeleteState: false,
    todoDeletePermanentlyState: false,
    todoCompletedState: false,
    todoUnDeleteState: false,
    todoCreateState: false,
  }),
  actions: {
    async getTodoPaginationAction(params: GetTodoPageRequest) {
      this.loading = true
      try {
        const response = await apiClient.get(Constant.API_GET_PAGINATION_TODO, { params })
        this.todoPaginationState = response.data['metadata']
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async getTodoDetailAction(todoId: string) {
      this.loading = true
      try {
        const response = await apiClient.get(Constant.API_GET_TODO_BY_ID(todoId))
        this.todoDetailState = response.data['metadata']
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async updateTodoAction(todoId: string, todo: TodoUpdateRequest) {
      this.loading = true
      try {
        await apiClient.patch(Constant.API_UPDATE_TODO(todoId), todo)
        this.todoUpdateState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async archiveTodoAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.patch(Constant.API_ARCHIVE_TODO(todoId))
        this.todoArchiveState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async unarchiveTodoAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.patch(Constant.API_UNARCHIVE_TODO(todoId))
        this.todoUnarchiveState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async deleteTodoAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.delete(Constant.API_DELETE_TODO(todoId))
        this.todoDeleteState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async deleteTodoPermanentlyAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.delete(Constant.API_DELETE_TODO_PERMANENTLY(todoId))
        this.todoDeletePermanentlyState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async completedTodoAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.patch(Constant.API_COMPLETE_TODO(todoId))
        this.todoCompletedState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async unDeleteTodoAction(todoId: string) {
      this.loading = true
      try {
        await apiClient.patch(Constant.API_RESTORE_TODO(todoId))
        this.todoUnDeleteState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
    async createTodoAction(todo: TodoCreateRequest) {
      this.loading = true
      try {
        await apiClient.post(Constant.API_CREATE_TODO, todo)
        this.todoCreateState = true
      } catch (error) {
        this.error = error as AxiosError
      } finally {
        this.loading = false
      }
    },
  },
  getters: {
    todoPaginationGetter: (state: TodoState) => state.todoPaginationState,
    todoDetailGetter: (state: TodoState) => state.todoDetailState,
    loadingGetter: (state: TodoState) => state.loading,
    errorGetter: (state: TodoState) => state.error,
    todoUpdateGetter: (state: TodoState) => state.todoUpdateState,
    todoArchiveGetter: (state: TodoState) => state.todoArchiveState,
    todoUnarchiveGetter: (state: TodoState) => state.todoUnarchiveState,
    todoDeleteGetter: (state: TodoState) => state.todoDeleteState,
    todoDeletePermanentlyGetter: (state: TodoState) => state.todoDeletePermanentlyState,
    todoCompletedGetter: (state: TodoState) => state.todoCompletedState,
    todoUnDeleteGetter: (state: TodoState) => state.todoUnDeleteState,
    todoCreateGetter: (state: TodoState) => state.todoCreateState,
  },
})

export default useTodoStore
