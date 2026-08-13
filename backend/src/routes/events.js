import { Router } from 'express'
import { addClient, removeClient, broadcast, getClientCount } from '../sse/store.js'

const router = Router({ mergeParams: true })

router.get('/', (req, res) => {
  const groupId = Number(req.params.id)

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // for Render/nginx
  res.flushHeaders()

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ groupId })}\n\n`)

  // Register client
  addClient(groupId, res)

  // Broadcast updated viewer count to group
  broadcast(groupId, 'viewers', { count: getClientCount(groupId) })

  // Send heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n')
    } catch {
      clearInterval(heartbeat)
    }
  }, 30000)

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient(groupId, res)
    broadcast(groupId, 'viewers', { count: getClientCount(groupId) })
  })
})

export default router