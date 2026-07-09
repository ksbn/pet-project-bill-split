import express from "express";
import userRoutes from "./routes/users.js";
import { authRoutes } from './routes/auth.js'
import { groupRoutes } from "./routes/groups.js";
import expenseRoutes from './routes/expenses.js'
import settlementRoutes from './routes/settlements.js'
import { donationRoutes } from './routes/donations.js'
import { pool } from "./db/pool.js";
import { requireAuth } from './middleware/auth.js'
import { getGroupByInviteCode, getGroupById } from './services/groups.js'
import { getUsersByGroup } from './services/users.js'
import { getExpensesByGroup } from './services/expenses.js'
import { getSettlements } from './services/settlements.js'

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Middleware (MUST BE FIRST) ───────────────────────────────────────────
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.options(/.*/, (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.sendStatus(204);
});

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ── Public routes (no auth) ──────────────────────────────────────────────
app.use('/api/auth', authRoutes)

app.get('/api/groups/id/:id', async (req, res) => {
  try {
    const group = await getGroupById(Number(req.params.id))
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

app.get('/api/groups/:inviteCode', async (req, res) => {
  try {
    const group = await getGroupByInviteCode(req.params.inviteCode)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

app.get('/api/groups/:id/users', async (req, res) => {
  try {
    const users = await getUsersByGroup(Number(req.params.id))
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.get('/api/groups/:id/expenses', async (req, res) => {
  try {
    const expenses = await getExpensesByGroup(Number(req.params.id))
    res.json(expenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

app.get('/api/groups/:id/settlements', async (req, res) => {
  try {
    const settlements = await getSettlements(Number(req.params.id))
    res.json(settlements)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch settlements' })
  }
})

// ── Protected routes (auth required) ────────────────────────────────────
app.use("/api/groups/:id/users", requireAuth, userRoutes)
app.use("/api/groups", requireAuth, groupRoutes)
app.use('/api/groups/:id/expenses', requireAuth, expenseRoutes)
app.use('/api/groups/:id/settlements', requireAuth, settlementRoutes)
app.use('/api/donations', requireAuth, donationRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  try {
    const client = await pool.connect();
    console.log("🐘 PostgreSQL connected");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
});