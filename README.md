# Split-It

Split-It is a simple expense-sharing app that helps groups track shared costs and settle up fairly. Add expenses, split them between friends, roommates, or travel companions, and see who owes what at a glance.

## Features

- **Create groups** — organize expenses by trip, household, or event
- **Add expenses** — split evenly, by percentage, or by custom shares
- **Track balances** — see who owes whom 
- **Settle up** — record payments and clear balances
- **Activity history** — full log of expenses and settlements per group

## Tech Stack

- Frontend: React
- Backend: Node.js / Express
- Database: PostgreSQL
- Auth: JWT

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A running database instance (see `.env.example`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ksbn/pet-project-split-it.git
cd split-it

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```


## Usage

1. Sign up or log in
2. Create a group and invite members
3. Add an expense and choose how to split it
4. View real-time balances and settle up when ready

## Project Structure

```
split-it/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # App pages/routes
│   ├── api/            # API routes / controllers
│   ├── models/         # Database models
│   └── utils/          # Helper functions
├── public/              # Static assets
├── tests/               # Test suites
├── .env.example
└── package.json
```

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
