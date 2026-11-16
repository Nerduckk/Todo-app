import { test, expect } from '@playwright/test'
import {
  API_URL,
  createTodo,
  deletePermanently,
  listTodos,
  uniqueTitle,
} from '../helpers/api'

test.describe('Todo app UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Danh sách công việc')).toBeVisible()
  })

  test('shows the seeded list and pagination', async ({ page }) => {
    await expect(page.locator('tbody tr')).toHaveCount(10)
    await expect(page.getByText('Completed task', { exact: true })).toBeVisible()
    await expect(page.getByText('Pending task 01', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go to page 2' })).toBeVisible()
  })

  test('filters by completed status', async ({ page }) => {
    await page.locator('.v-select').click()
    await page.getByRole('option', { name: 'Hoàn thành' }).click()

    await expect(page.getByText('Completed task', { exact: true })).toBeVisible()
    await expect(page.getByText('Pending task 01', { exact: true })).not.toBeVisible()
  })

  test('paginates to the second page', async ({ page }) => {
    await page.getByRole('button', { name: 'Go to page 2' }).click()
    await expect(page.getByText('Pending task 10', { exact: true })).toBeVisible()
  })

  test('opens a todo detail', async ({ page }) => {
    const row = page.locator('tbody tr').filter({ hasText: 'Pending task 01' })
    await row.getByRole('button', { name: 'Xem chi tiết công việc' }).click()

    await expect(page.getByText('Chi tiết công việc')).toBeVisible()
    await expect(page.locator('.v-text-field input').first()).toHaveValue('Pending task 01')
    await expect(page.locator('textarea')).toHaveValue('Seed pending task 1')
  })

  test('creates a todo from the add dialog', async ({ page, request }) => {
    const title = uniqueTitle('UI created task')
    const today = new Date().toISOString().slice(0, 10)

    try {
      await page.getByRole('button', { name: /thêm công việc/i }).click()
      const dialog = page.locator('.v-dialog').filter({ hasText: 'Thêm công việc' })
      const inputs = dialog.locator('input')

      await inputs.nth(0).fill(title)
      await inputs.nth(1).fill('Created through the UI')
      await inputs.nth(2).click()
      await page.locator(`.v-date-picker [data-v-date="${today}"] button`).click()
      await dialog.getByRole('button', { name: /^thêm$/i }).click()

      await expect(dialog).not.toBeVisible()
      await expect(page.getByText(title, { exact: true })).toBeVisible()
    } finally {
      const body = await listTodos(request)
      const todo = body.metadata.value.find((item: { title: string }) => item.title === title)
      if (todo) await deletePermanently(request, todo.id)
    }
  })

  test('edits a todo title', async ({ page, request }) => {
    const todo = await createTodo(request, { title: uniqueTitle('UI edit task') })
    const newTitle = `${todo.title} edited`

    try {
      await page.reload()
      const row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Sửa công việc' }).click()

      await expect(page.getByText('Sửa công việc')).toBeVisible()
      const titleInput = page.locator('.v-text-field input').first()
      await expect(titleInput).toHaveValue(todo.title)
      await titleInput.fill(newTitle)
      await page.getByRole('button', { name: 'Lưu thay đổi' }).click()

      await expect(page.getByText('Danh sách công việc')).toBeVisible()
      await expect(page.getByText(newTitle, { exact: true })).toBeVisible()
    } finally {
      await deletePermanently(request, todo.id)
    }
  })

  test('completes a todo from the table', async ({ page, request }) => {
    const todo = await createTodo(request, { title: uniqueTitle('UI complete task') })

    try {
      await page.reload()
      const row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Hoàn thành công việc' }).click()

      const updatedRow = page.locator('tbody tr').filter({ hasText: todo.title })
      await expect(updatedRow.getByText('Hoàn thành', { exact: true })).toBeVisible()
    } finally {
      await deletePermanently(request, todo.id)
    }
  })

  test('archives and unarchives a todo', async ({ page, request }) => {
    const todo = await createTodo(request, { title: uniqueTitle('UI archive task') })

    try {
      await page.reload()
      let row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Lưu trữ công việc' }).click()
      await expect(page.locator('tbody tr').filter({ hasText: todo.title })).toHaveCount(0)

      await page.goto('/todo/archive')
      await expect(page.getByText(todo.title, { exact: true })).toBeVisible()

      row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Khôi phục công việc' }).click()
      await expect(page.locator('tbody tr').filter({ hasText: todo.title })).toHaveCount(0)
    } finally {
      await deletePermanently(request, todo.id)
    }
  })

  test('soft deletes and restores a todo', async ({ page, request }) => {
    const todo = await createTodo(request, { title: uniqueTitle('UI delete task') })

    try {
      await page.reload()
      let row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Xóa công việc' }).click()
      await expect(page.locator('tbody tr').filter({ hasText: todo.title })).toHaveCount(0)

      await page.goto('/todo/delete')
      await expect(page.getByText(todo.title, { exact: true })).toBeVisible()

      row = page.locator('tbody tr').filter({ hasText: todo.title })
      await row.getByRole('button', { name: 'Khôi phục công việc' }).click()
      await expect(page.locator('tbody tr').filter({ hasText: todo.title })).toHaveCount(0)

      await page.goto('/')
      await expect(page.getByText(todo.title, { exact: true })).toBeVisible()
    } finally {
      await deletePermanently(request, todo.id)
    }
  })
})
