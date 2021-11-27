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

    addChild('Name', 'son', 'Ben')
    addChild('Name', 'daughter', 'Becky')
    addRelative('Name', 'spouse', 'Andrea')
    getCardByName('Ben')
    getCardByName('Becky')
  })

  it('Add sp s d', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'spouse', 'Andrea')
    addChild('Name', 'son', 'Ben')
    addChild('Name', 'daughter', 'Becky')
    getCardByName('Ben')
    getCardByName('Becky')
  })

  it('Add sp s d_sp_new', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addRelative('Name', 'spouse', 'Andrea')
    addChild('Name', 'son', 'Ben')
    addChild('Name', 'daughter', 'Becky', 'NEW')
    getCardByName('Ben')
    getCardByName('Becky')
  })

  it('Add s d ss sd', () => {
    cy.visit('http://localhost:8080/examples/create-tree')

    addChild('Name', 'son', 'Ben')
    addChild('Name', 'daughter', 'Becky')
    addChild('Ben', 'son', 'Carlos')
    addChild('Ben', 'daughter', 'Carla')
  })
})

function addRelative(person_name, rel_type, rel_name) {
  getCardByName(person_name).find('.card_add_relative').click()
  cy.get(`.card[data-rel_type="${rel_type}"]`).click()
  cy.get('input[name="first name"]').type(rel_name)
  cy.get('button[type="submit"]').click()
}

function addChild(person_name, rel_type, rel_name, other_parent_name) {
  getCardByName(person_name).find('.card_add_relative').click()
  cy.get(`.card[data-rel_type="${rel_type}"]`).click()
  cy.get('input[name="first name"]').type(rel_name)
  if (other_parent_name) cy.get('select[name="other_parent"]').select(other_parent_name)
  cy.get('button[type="submit"]').click()
}

function getCardByName(name) {
  return cy.contains('tspan', name).closest('[data-cy="card"]')
}
