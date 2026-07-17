# Split-It

Split-It is a fullstack expense-splitting app for groups. Create a group, invite people to join, log shared expenses, and see who owes what. It also supports settling up directly (with Revolut payment links) and tracking donations within a group.

Built with:

- **Frontend:** Vite 8 + React 19 + CSS Modules (JavaScript)
- **Backend:** Node.js + Express 5 (JavaScript)
- **Database:** PostgreSQL 17 (Docker)
- **Testing:** Vitest 4 + Testing Library
- **Linting:** oxlint
- **Formatting:** oxfmt
- **CI:** GitHub Actions

## Features

- **Accounts & auth** — register, log in, and manage a personal account (JWT-based auth, bcrypt password hashing)
- **Groups** — create groups, join via invite link, and view all your groups
- **Expenses** — log shared expenses within a group and track balances
- **Settlements** — settle up between members, with confirmation and an optional Revolut payment link attached to a group
- **Donations** — track donations made within a group

## Getting started

### 1. Start everything

```bash
docker compose up -d   # start PostgreSQL first
```

```bash
npm run dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |
| Postgres | localhost:5432        |

## PostgreSQL

**First-time setup:**

```bash
docker compose up -d                       # start PostgreSQL in Docker
cp backend/.env.example backend/.env       # create your local env file
cd backend && npm run migrate              # create tables and seed demo data
```

The schema is built up through migrations in `backend/migrations/`:

- `initial-schema` — core tables (users, groups, expenses, etc.)
- `add-revolut-link` — Revolut payment link on a group
- `add-accounts` — user accounts
- `add-settlement-confirmations` — confirmation step when settling up
- `add-donations` — donation tracking
- `add-account-id-to-groups` — links accounts to groups

### Adding a new table

Say you want to add a `posts` table. Here are the exact steps:

**1. Create a new migration file:**

```bash
cd backend
npm run migrate:create -- add-posts-table
```

This creates a file like `backend/migrations/1749823642869_add-posts-table.js` (the number is a timestamp). Open it — it looks like this:

```js
export const shorthands = undefined;

export const up = (pgm) => {
  // TODO: write your changes here
};

export const down = (pgm) => {
  // TODO: write how to undo the changes here
};
```

**2. Fill in `up` and `down`:**

```js
export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("posts", {
    id: { type: "serial", primaryKey: true },
    title: { type: "text", notNull: true },
    body: { type: "text", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("NOW()"), notNull: true },
  });
};

export const down = (pgm) => {
  pgm.dropTable("posts");
};
```

- `up` — what to do when migrating forward (create table, add column, etc.)
- `down` — how to undo it (used by `migrate:down` to roll back)

**3. Run the migration:**

```bash
npm run migrate
```

node-pg-migrate tracks which migrations have already run (in a `pgmigrations` table), so it only applies new ones.

### Resetting the database

To wipe everything and start fresh:

```bash
docker compose down -v         # stop PostgreSQL and delete the data volume
docker compose up -d           # restart with a clean database
cd backend && npm run migrate  # recreate all tables and seed data
```

### Other database commands

```bash
npm run migrate:down           # roll back the last migration (run from backend/)
docker exec -it split-it-db psql -U postgres -d splitit  # open a psql shell
docker compose down            # stop PostgreSQL (keeps data)
```

## Testing

Run all tests from the project root:

```bash
npm run test
```

Or per workspace:

```bash
cd frontend && npm run test          # run once
cd frontend && npm run test:watch    # watch mode
cd backend  && npm run test
```

Backend tests cover services (auth, expenses, groups, settlements, donations, users) and route integration. Frontend tests cover the main pages (login, register, join, groups, group view, donations) and shared validation utilities.

## Architecture

The project enforces a strict separation of concerns — keeping each layer focused on one job:

**Frontend** (`frontend/src`)

- `components/` — small, reusable UI pieces (e.g. `Navbar`, `UserCard`)
- `pages/` — full-page views (`HomePage`, `LoginPage`, `RegisterPage`, `JoinPage`, `MyGroupsPage`, `GroupPage`, `GroupViewPage`, `DonationsPage`)
- `services/` — API client and token handling
- `utils/` — shared helpers like input validation

**Backend** (`backend/src`)

- `routes/` — HTTP only: read the request, call a service, send the response (`auth`, `users`, `groups`, `expenses`, `settlements`, `donations`)
- `services/` — all business logic; no knowledge of HTTP or Express
- `middleware/` — request middleware (e.g. `auth` for JWT verification)
- `db/` — database connection pool and migrations

Keeping routes thin and services pure means you can test services without spinning up a server, and swap the framework without rewriting logic.

## Scripts

**From the project root:**

| Command                | What it does                                  |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start frontend + backend in parallel          |
| `npm run build`        | Build both apps for production                |
| `npm run lint`         | Lint all source files with oxlint             |
| `npm run format`       | Format all files with oxfmt                   |
| `npm run format:check` | Check formatting without writing (used in CI) |
| `npm run test`         | Run all tests                                 |

**From inside `frontend/` or `backend/`:**

| Command              | What it does                     |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start only this app              |
| `npm run build`      | Build only this app              |
| `npm run lint`       | Lint only this app               |
| `npm run test`       | Run tests                        |
| `npm run test:watch` | Watch mode — reruns on file save |

## CI

GitHub Actions runs automatically on every push and pull request to `dev`:

- Installs dependencies
- Runs the linter
- Checks formatting
- Runs all tests
- Builds both apps

See `.github/workflows/ci.yml` for the full pipeline.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For questions or feedback, open an issue on the repository.
