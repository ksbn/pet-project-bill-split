import express from "express";
import userRoutes from "./routes/users.js";
import { authRoutes } from './routes/auth.js'
import { groupRoutes } from "./routes/groups.js";
import expenseRoutes from './routes/expenses.js'  
import settlementRoutes from './routes/settlements.js'
import { donationRoutes } from './routes/donations.js'
import { pool } from "./db/pool.js";
import { requireAuth } from './middleware/auth.js'

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.options(/.*/, (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.sendStatus(204);
});

// Never let the browser cache API responses — avoids stale data after DB resets
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ── Public routes (no auth) ──────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/donations', donationRoutes)

// Public group viewing routes

app.get('/api/groups/my', requireAuth, async (req, res) => {
  const { pool } = await import('./db/pool.js')
  try {
    const { rows } = await pool.query(
      'SELECT * FROM groups WHERE account_id = $1 ORDER BY created_at DESC',
      [req.account.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

app.get('/api/groups/:inviteCode', async (req, res) => {
  const { getGroupByInviteCode } = await import('./services/groups.js')
  try {
    const group = await getGroupByInviteCode(req.params.inviteCode)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

app.get('/api/groups/id/:id', async (req, res) => {
  const { getGroupById } = await import('./services/groups.js')
  try {
    const group = await getGroupById(Number(req.params.id))
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

app.get('/api/groups/:id/users', async (req, res) => {
  const { getUsersByGroup } = await import('./services/users.js')
  try {
    const users = await getUsersByGroup(Number(req.params.id))
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.get('/api/groups/:id/expenses', async (req, res) => {
  const { getExpensesByGroup } = await import('./services/expenses.js')
  try {
    const expenses = await getExpensesByGroup(Number(req.params.id))
    res.json(expenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

app.get('/api/groups/:id/settlements', async (req, res) => {
  const { getSettlements } = await import('./services/settlements.js')
  try {
    const settlements = await getSettlements(Number(req.params.id))
    res.json(settlements)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch settlements' })
  }
})


// ── Protected Routes (auth required) ──────────────────────────────────────────────────────────────────
// Mount route files here. Keep index.ts clean – one line per feature.
app.use("/api/groups/:id/users", requireAuth, userRoutes);
app.use("/api/groups", requireAuth, groupRoutes);
app.use('/api/groups/:id/expenses', requireAuth, expenseRoutes);
app.use('/api/groups/:id/settlements', requireAuth, settlementRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  // Check DB connection on startup
  try {
    const client = await pool.connect();
    console.log("🐘 PostgreSQL connected");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
});
