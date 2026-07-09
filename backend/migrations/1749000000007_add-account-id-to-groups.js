export const up = (pgm) => {
  pgm.addColumn('groups', {
    account_id: { type: 'integer', references: 'accounts', onDelete: 'SET NULL' },
  })
}

export const down = (pgm) => {
  pgm.dropColumn('groups', 'account_id')
}