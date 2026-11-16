import { test, expect } from '@playwright/test'

const API_URL = process.env.API_URL || 'http://127.0.0.1:3000/api/v1'

test('API health: paginated todos are available', async ({ request }) => {
  const response = await request.get(`${API_URL}/todos/get-page`, {
    params: { page: 1, page_size: 5, status_type: 'all' },
  })

  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.metadata.total_records).toBeGreaterThan(0)
  expect(body.metadata.value.length).toBeLessThanOrEqual(5)
})
