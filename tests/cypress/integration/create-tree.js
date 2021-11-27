describe('Create simple trees', () => {
  it('Add f m', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'father', 'Zen')
    getCardByName('ADD')
    addRelative('Name', 'mother', 'Zebra')
    getCardByName('Zen')
    getCardByName('Zebra')
  })

  it('Add s d', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'son', 'Ben')
    addRelative('Name', 'daughter', 'Becky')
    addRelative('Name', 'spouse', 'Andrea')
    getCardByName('Ben')
    getCardByName('Becky')
  })

  it('Add sp s d', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'spouse', 'Andrea')
    addRelative('Name', 'son', 'Ben')
    addRelative('Name', 'daughter', 'Becky')
    getCardByName('Ben')
    getCardByName('Becky')
  })

  it('Add s d ss sd', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'son', 'Ben')
    addRelative('Name', 'daughter', 'Becky')
    addRelative('Ben', 'son', 'Carlos')
    addRelative('Ben', 'daughter', 'Carla')
  })
})

function addRelative(person_name, rel_type, rel_name) {
  getCardByName(person_name).find('.card_add_relative').click()
  cy.get(`.card[data-rel_type="${rel_type}"]`).click()
  cy.get('input[name="first name"]').type(rel_name)
  cy.get('button[type="submit"]').click()
}

function getCardByName(name) {
  return cy.contains('tspan', name).closest('[data-cy="card"]')
}
