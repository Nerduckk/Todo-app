type CreateTodoRequest = {
  title: string
  description: string
  experies_at: string
}

type GetTodoPageRequest = {
  page: number
  page_size: number
  status_type?: string
}

type TodoResponseBase = {
  id: string
  title: string
  description: string
  status: string
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

type TodoPaginationResponse = {
  total_page: number
  total_records: number
  value: TodoResponseBase[]
}

type TodoDetailResponse = {
  id: string
  title: string
  description: string
  status: string
  expires_at: Date
  completed_at: Date
  created_at: Date
  updated_at: Date
}

type TodoUpdateRequest = {
  title: string
  description: string
  status: string
  expires_at: string
  completed_at: string
} 

type TodoCreateRequest = {
  title: string
  description: string
  expires_at: string
}

export type { CreateTodoRequest, GetTodoPageRequest, TodoPaginationResponse, TodoDetailResponse, TodoUpdateRequest, TodoCreateRequest }
