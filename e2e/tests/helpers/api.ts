import { expect, type APIRequestContext } from '@playwright/test'

export const API_URL = process.env.API_URL || 'http://127.0.0.1:3000/api/v1'

export const uniqueTitle = (prefix: string) =>
  `${prefix} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`

export const mysqlDateTime = (date: Date) =>
  date.toISOString().slice(0, 19).replace('T', ' ')

export const isoInDays = (days: number) =>
  mysqlDateTime(new Date(Date.now() + days * 24 * 60 * 60 * 1000))

export async function listTodos(
  request: APIRequestContext,
  params: Record<string, string | number> = { page: 1, page_size: 100, status_type: 'all' },
) {
  const response = await request.get(`${API_URL}/todos/get-page`, { params })
  expect(response.status(), await response.text()).toBe(200)
  return response.json()
}

export async function createTodo(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) {
  const title = (overrides.title as string) || uniqueTitle('API task')
  const payload = {
    title,
    description: 'Created by the Playwright suite',
    expires_at: isoInDays(7),
    ...overrides,
  }

  const response = await request.post(`${API_URL}/todos`, { data: payload })
  expect(response.status(), await response.text()).toBe(200)

  const body = await listTodos(request)
  const todo = body.metadata.value.find((item: { title: string }) => item.title === title)
  expect(todo, `created todo "${title}" should appear in the list`).toBeTruthy()
  return todo as { id: number; title: string; description: string; status: string }
}

export async function deletePermanently(request: APIRequestContext, id: number | string) {
  const response = await request.delete(`${API_URL}/todos/delete-permanently/${id}`)
  expect(response.status(), await response.text()).toBe(200)
}
