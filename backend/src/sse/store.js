const clients = new Map()

export function addClient(groupId, res) {
  if (!clients.has(groupId)) {
    clients.set(groupId, new Set())
  }
  clients.get(groupId).add(res)
}

export function removeClient(groupId, res) {
  if (clients.has(groupId)) {
    clients.get(groupId).delete(res)
    if (clients.get(groupId).size === 0) {
      clients.delete(groupId)
    }
  }
}

export function broadcast(groupId, event, data) {
  if (!clients.has(groupId)) return
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const res of clients.get(groupId)) {
    try {
      res.write(message)
    } catch {
      clients.get(groupId).delete(res)
    }
  }
}

export function getClientCount(groupId) {
  return clients.has(groupId) ? clients.get(groupId).size : 0
}