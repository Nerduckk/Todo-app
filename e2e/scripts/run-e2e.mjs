import { createDB } from 'mysql-memory-server'
import mysql from 'mysql2/promise'
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const e2eDir = path.resolve(__dirname, '..')
const todoRoot = path.resolve(e2eDir, '..')
const backendDir = path.join(todoRoot, 'backend')
const frontendDir = path.join(todoRoot, 'frontend', 'todos')

const isWindows = process.platform === 'win32'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let db
let backend
let frontend

function log(message) {
  console.log(`[e2e] ${message}`)
}

function run(command, args, cwd, env) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

async function waitFor(url, timeoutMs = 180_000, label = url) {
  const startedAt = Date.now()
  let lastError

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.status < 500) {
        log(`${label} is ready (${response.status})`)
        return
      }
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(500)
  }

  throw new Error(`Timed out waiting for ${label}: ${lastError?.message}`)
}

function killTree(child) {
  if (!child || child.killed) return

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
  }
}

async function seedDatabase(database) {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: database.port,
    user: database.username,
    password: '',
    database: database.dbName,
  })

  await connection.query('DELETE FROM todos')

  const now = Date.now()
  const future = new Date(now + 7 * 24 * 60 * 60 * 1000)
  const past = new Date(now - 24 * 60 * 60 * 1000)
  const rows = []

  for (let index = 1; index <= 12; index += 1) {
    const createdAt = new Date(now - index * 60_000)
    rows.push([
      `Pending task ${String(index).padStart(2, '0')}`,
      `Seed pending task ${index}`,
      'pending',
      0,
      0,
      future,
      null,
      createdAt,
      createdAt,
    ])
  }

  rows.push([
    'Completed task',
    'Seed completed task',
    'completed',
    0,
    0,
    future,
    past,
    new Date(now + 60_000),
    new Date(now + 60_000),
  ])

  rows.push([
    'Archived task',
    'Seed archived task',
    'archived',
    0,
    1,
    future,
    null,
    new Date(now + 120_000),
    new Date(now + 120_000),
  ])

  rows.push([
    'Deleted task',
    'Seed deleted task',
    'pending',
    1,
    0,
    future,
    null,
    new Date(now + 180_000),
    new Date(now + 180_000),
  ])

  await connection.query(
    `INSERT INTO todos
      (title, description, status, is_deleted, is_archived, expires_at, completed_at, created_at, updated_at)
     VALUES ?`,
    [rows],
  )

  await connection.end()
  log(`Seeded ${rows.length} todos`)
}

async function main() {
  log('Starting ephemeral MySQL...')
  db = await createDB({ version: '8.0.x', dbName: 'todos_test', logLevel: 'ERROR' })
  log(`MySQL ready on port ${db.port}`)

  const dbEnv = {
    NODE_ENV: 'development',
    DB_HOST: '127.0.0.1',
    DB_PORT: String(db.port),
    DB_USER: db.username,
    DB_PASSWORD: '',
    DB_DATABASE_NAME: db.dbName,
  }

  log('Running migrations...')
  run(process.execPath, [path.join(backendDir, 'node_modules', 'knex', 'bin', 'cli.js'), 'migrate:latest'], backendDir, dbEnv)

  log('Seeding deterministic data...')
  await seedDatabase(db)

  log('Starting backend on port 3000...')
  backend = spawn(process.execPath, ['main.js'], {
    cwd: backendDir,
    env: { ...process.env, ...dbEnv, PORT: '3000' },
    stdio: 'pipe',
  })
  backend.stdout.on('data', (data) => process.stdout.write(`[backend] ${data}`))
  backend.stderr.on('data', (data) => process.stderr.write(`[backend] ${data}`))
  await waitFor('http://127.0.0.1:3000/api/v1/todos/get-page?page=1&page_size=1&status_type=all', 60_000, 'backend')

  log('Starting frontend on port 5173...')
  frontend = spawn(process.execPath, [
    path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
  ], {
    cwd: frontendDir,
    env: { ...process.env },
    stdio: 'pipe',
  })
  frontend.stdout.on('data', (data) => process.stdout.write(`[frontend] ${data}`))
  frontend.stderr.on('data', (data) => process.stderr.write(`[frontend] ${data}`))
  await waitFor('http://127.0.0.1:5173', 120_000, 'frontend')

  log('Running Playwright tests...')
  const result = spawnSync(process.execPath, [
    path.join(e2eDir, 'node_modules', '@playwright', 'test', 'cli.js'),
    'test',
    ...process.argv.slice(2),
  ], {
    cwd: e2eDir,
    env: {
      ...process.env,
      BASE_URL: 'http://127.0.0.1:5173',
      API_URL: 'http://127.0.0.1:3000/api/v1',
    },
    stdio: 'inherit',
  })

  log(`Playwright exited with code ${result.status}`)
  process.exitCode = result.status ?? 1
}

async function cleanup() {
  log('Cleaning up...')
  killTree(frontend)
  killTree(backend)
  if (db) {
    try {
      await db.stop()
    } catch (error) {
      console.error(`[e2e] Failed to stop MySQL: ${error.message}`)
    }
  }
}

process.on('SIGINT', async () => {
  await cleanup()
  process.exit(130)
})

main()
  .catch((error) => {
    console.error(`[e2e] ${error.stack || error.message}`)
    process.exitCode = 1
  })
  .finally(cleanup)
