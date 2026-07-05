export const up = (pgm) => {
  pgm.createTable('donations', {
    id: { type: 'serial', primaryKey: true },
    org_name: { type: 'text', notNull: true },
    org_url: { type: 'text', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
  })
}

export const down = (pgm) => {
  pgm.dropTable('donations')
}