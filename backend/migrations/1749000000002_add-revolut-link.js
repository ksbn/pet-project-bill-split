export const up = (pgm) => {
  pgm.addColumn('users', {
    revolut_link: { type: 'text' },
  })
}

export const down = (pgm) => {
  pgm.dropColumn('users', 'revolut_link')
}