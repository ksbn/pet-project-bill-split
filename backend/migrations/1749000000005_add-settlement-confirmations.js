export const up = (pgm) => {
  pgm.createTable('settlement_confirmations', {
    id: { type: 'serial', primaryKey: true },
    group_id: { type: 'integer', references: 'groups', onDelete: 'CASCADE' },
    from_name: { type: 'text', notNull: true },
    to_name: { type: 'text', notNull: true },
    amount: { type: 'numeric(10,2)', notNull: true },
    confirmed_at: { type: 'timestamptz', default: pgm.func('now()') },
  })
}

export const down = (pgm) => {
  pgm.dropTable('settlement_confirmations')
}