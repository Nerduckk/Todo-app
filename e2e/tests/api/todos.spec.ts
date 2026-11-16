import { test, expect, type APIRequestContext } from '@playwright/test'
import {
  API_URL,
  createTodo,
  deletePermanently,
  isoInDays,
  listTodos,
  mysqlDateTime,
  uniqueTitle,
} from '../helpers/api'

async function getTodo(request: APIRequestContext, id: number | string) {
  const response = await request.get(`${API_URL}/todos/get-by-id/${id}`)
  return { response, body: await response.json() }
}

test.describe('Todos API', () => {
  test('returns pagination metadata', async ({ request }) => {
    const body = await listTodos(request, { page: 1, page_size: 5, status_type: 'all' })

    expect(body.message).toBe('Get paginated todos successfully')
    expect(body.metadata.total_records).toBeGreaterThan(0)
    expect(body.metadata.value.length).toBeLessThanOrEqual(5)
    expect(body.metadata.total_page).toBe(
      Math.ceil(body.metadata.total_records / 5),
    )
  })

  test('rejects a page request without page', async ({ request }) => {
    const response = await request.get(`${API_URL}/todos/get-page`, {
      params: { page_size: 10, status_type: 'all' },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.message).toContain('Page is required')
  })

  test('creates a todo and returns it in the list', async ({ request }) => {
    const todo = await createTodo(request)

    expect(todo.title).toContain('API task')
    expect(todo.status).toBe('pending')
    expect(Number(todo.id)).toBeGreaterThan(0)

    await deletePermanently(request, todo.id)
  })

  test('rejects create without title', async ({ request }) => {
    const response = await request.post(`${API_URL}/todos`, {
      data: { description: 'Missing title', expires_at: isoInDays(1) },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.message).toContain('Title is required')
  })

  test('rejects create without expires_at', async ({ request }) => {
    const response = await request.post(`${API_URL}/todos`, {
      data: { title: uniqueTitle('No expiry') },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.message).toContain('Expires at is required')
  })

  test('gets a todo by id', async ({ request }) => {
    const todo = await createTodo(request)
    const { response, body } = await getTodo(request, todo.id)

    expect(response.status()).toBe(200)
    expect(body.metadata.id).toBe(todo.id)
    expect(body.metadata.title).toBe(todo.title)
    expect(body.metadata.status).toBe('pending')

    await deletePermanently(request, todo.id)
  })

  test('returns 400 for an unknown id (known issue: should be 404)', async ({ request }) => {
    test.info().annotations.push({
      type: 'known-issue',
      description:
        'The service throws NotFoundError without importing it, so the API returns 400 instead of 404.',
    })

    const { response, body } = await getTodo(request, 99_999_999)

    expect(response.status()).toBe(400)
    expect(body.error.message).toContain('Failed to get todo by id')
  })

  test('updates a todo', async ({ request }) => {
    const todo = await createTodo(request)
    const newTitle = uniqueTitle('Updated task')

    const response = await request.patch(`${API_URL}/todos/update/${todo.id}`, {
      data: {
        title: newTitle,
        description: 'Updated by the Playwright API suite',
        status: 'completed',
        expires_at: isoInDays(14),
        completed_at: mysqlDateTime(new Date()),
      },
    })
    expect(response.status(), await response.text()).toBe(200)

    const { body } = await getTodo(request, todo.id)
    expect(body.metadata.title).toBe(newTitle)
    expect(body.metadata.description).toBe('Updated by the Playwright API suite')
    expect(body.metadata.status).toBe('completed')
    expect(body.metadata.completed_at).toBeTruthy()

    await deletePermanently(request, todo.id)
  })

  test('rejects update without title', async ({ request }) => {
    const todo = await createTodo(request)

    const response = await request.patch(`${API_URL}/todos/update/${todo.id}`, {
      data: { description: 'No title' },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.message).toContain('Title is required')

    await deletePermanently(request, todo.id)
  })

  test('completes a todo', async ({ request }) => {
    const todo = await createTodo(request)

    const response = await request.patch(`${API_URL}/todos/complete/${todo.id}`)
    expect(response.status(), await response.text()).toBe(200)

    const { body } = await getTodo(request, todo.id)
    expect(body.metadata.status).toBe('completed')
    expect(body.metadata.completed_at).toBeTruthy()

    await deletePermanently(request, todo.id)
  })

  test('unarchives a pending todo (known issue: status becomes completed)', async ({ request }) => {
    test.info().annotations.push({
      type: 'known-issue',
      description:
        'unarchiveTodo() reads completed_at from a Promise instead of awaiting the row, so a pending todo is restored as completed.',
    })

    const todo = await createTodo(request)

    const archiveResponse = await request.patch(`${API_URL}/todos/archive/${todo.id}`)
    expect(archiveResponse.status(), await archiveResponse.text()).toBe(200)

    let detail = await getTodo(request, todo.id)
    expect(detail.body.metadata.status).toBe('archived')

    let archived = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'archived',
    })
    expect(archived.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(true)

    const unarchiveResponse = await request.patch(`${API_URL}/todos/unarchive/${todo.id}`)
    expect(unarchiveResponse.status(), await unarchiveResponse.text()).toBe(200)

    detail = await getTodo(request, todo.id)
    expect(detail.body.metadata.status).toBe('completed')

    archived = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'archived',
    })
    expect(archived.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(false)

    await deletePermanently(request, todo.id)
  })

  test('soft deletes and restores a todo', async ({ request }) => {
    const todo = await createTodo(request)

    const deleteResponse = await request.delete(`${API_URL}/todos/delete/${todo.id}`)
    expect(deleteResponse.status(), await deleteResponse.text()).toBe(200)

    let deleted = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'deleted',
    })
    expect(deleted.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(true)

    let all = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'all',
    })
    expect(all.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(false)

    const restoreResponse = await request.patch(`${API_URL}/todos/restore/${todo.id}`)
    expect(restoreResponse.status(), await restoreResponse.text()).toBe(200)

    deleted = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'deleted',
    })
    expect(deleted.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(false)

    all = await listTodos(request, {
      page: 1,
      page_size: 100,
      status_type: 'all',
    })
    expect(all.metadata.value.some((item: { id: number }) => item.id === todo.id)).toBe(true)

    await deletePermanently(request, todo.id)
  })

  test('permanently deletes a todo', async ({ request }) => {
    const todo = await createTodo(request)

    const response = await request.delete(`${API_URL}/todos/delete-permanently/${todo.id}`)
    expect(response.status(), await response.text()).toBe(200)

    const { response: getResponse } = await getTodo(request, todo.id)
    expect(getResponse.status()).toBe(400)
  })

  test('filters todos by status', async ({ request }) => {
    for (const status of ['pending', 'completed', 'archived']) {
      const body = await listTodos(request, {
        page: 1,
        page_size: 100,
        status_type: status,
      })

      expect(body.metadata.value.length).toBeGreaterThan(0)
      for (const todo of body.metadata.value) {
        expect(todo.status).toBe(status)
        expect(Number(todo.is_deleted)).toBe(0)
      }
    }
  })

  test('paginates results without overlapping pages', async ({ request }) => {
    const all = await listTodos(request, { page: 1, page_size: 100, status_type: 'all' })
    const pageSize = 5
    const pageOne = await listTodos(request, { page: 1, page_size: pageSize, status_type: 'all' })
    const pageTwo = await listTodos(request, { page: 2, page_size: pageSize, status_type: 'all' })

    expect(pageOne.metadata.total_records).toBe(all.metadata.total_records)
    expect(pageOne.metadata.value.length).toBe(pageSize)
    expect(pageTwo.metadata.value.length).toBeGreaterThan(0)

    const pageOneIds = pageOne.metadata.value.map((todo: { id: number }) => todo.id)
    const pageTwoIds = pageTwo.metadata.value.map((todo: { id: number }) => todo.id)
    expect(pageOneIds.some((id: number) => pageTwoIds.includes(id))).toBe(false)
  })
})
