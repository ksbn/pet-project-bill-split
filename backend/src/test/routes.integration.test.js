import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { authRoutes } from '../routes/auth.js'
import { groupRoutes } from '../routes/groups.js'
import { requireAuth } from '../middleware/auth.js'

// Build a minimal test app
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/groups', requireAuth, groupRoutes)

let token = ''
let groupId = null

describe('Auth routes', () => {
  it('POST /api/auth/register — creates account and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: `test_${Date.now()}@test.com`, password: 'password1' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.account.email).toContain('@test.com')
    token = res.body.token
  })

  it('POST /api/auth/register — rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'notanemail', password: 'password1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('email')
  })

  it('POST /api/auth/register — rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test2@test.com', password: 'abc' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Password')
  })

  it('POST /api/auth/login — returns token for valid credentials', async () => {
    const email = `login_${Date.now()}@test.com`
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login Test', email, password: 'password1' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password1' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('POST /api/auth/login — rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})

describe('Groups routes', () => {
  it('POST /api/groups — creates group when authenticated', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Group' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Group')
    expect(res.body.invite_code).toBeTruthy()
    groupId = res.body.id
  })

  it('POST /api/groups — rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/groups')
      .send({ name: 'Test Group' })

    expect(res.status).toBe(401)
  })

  it('POST /api/groups — rejects short group name', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ab' })

    expect(res.status).toBe(400)
  })

  it('GET /api/groups/id/:id — returns group by id', async () => {
    const res = await request(app)
      .get(`/api/groups/id/${groupId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(groupId)
  })
})