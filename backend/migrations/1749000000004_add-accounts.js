export const up = (pgm) => {
  pgm.createTable('accounts', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
  })
}

export const down = (pgm) => {
  pgm.dropTable('accounts')
}