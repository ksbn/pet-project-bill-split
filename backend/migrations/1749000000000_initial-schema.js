export const up = (pgm) => {
  pgm.createTable('groups', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    invite_code: { type: 'text', notNull: true, unique: true },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
  })

  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    group_id: { type: 'integer', references: 'groups', onDelete: 'CASCADE' },
    name: { type: 'text', notNull: true },
    email: { type: 'text' },
  })

  pgm.createTable('expenses', {
    id: { type: 'serial', primaryKey: true },
    group_id: { type: 'integer', references: 'groups', onDelete: 'CASCADE' },
    paid_by: { type: 'integer', references: 'users' },
    title: { type: 'text', notNull: true },
    amount: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
  })

  pgm.createTable('expense_splits', {
    id: { type: 'serial', primaryKey: true },
    expense_id: { type: 'integer', references: 'expenses', onDelete: 'CASCADE' },
    user_id: { type: 'integer', references: 'users' },
    amount: { type: 'numeric(10,2)', notNull: true },
  })
}

export const down = (pgm) => {
  pgm.dropTable('expense_splits')
  pgm.dropTable('expenses')
  pgm.dropTable('users')
  pgm.dropTable('groups')
}