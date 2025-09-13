export function addRelative(person_name, rel_type, rel_name) {
  cy.wait(100)
  openNewRelativeForm(person_name, rel_type)
  cy.get('input[name="first name"]').type(rel_name)
  cy.get('button[type="submit"]').click()
  cy.wait(100)
}

export function addChild(person_name, rel_type, rel_name, other_parent_name) {
  openNewRelativeFormChild(person_name, rel_type, other_parent_name)
  cy.get('input[name="first name"]').type(rel_name)
  cy.get('button[type="submit"]').click()
}

export function openNewRelativeFormChild(person_name, rel_type, other_parent_name) {
  setMainPerson(person_name)
  cy.wait(100)
  openAddRelativeButton()
  if (other_parent_name && other_parent_name !== '_new') {
    getCardByName(other_parent_name)
      .then($el => {
        const other_parent_id = $el.attr('data-id')
        cy.get(`.f3 [data-rel-type="${rel_type}"][data-other-parent-id="${other_parent_id}"]`).closest(`.card`).first().click()
      })
  } else if (other_parent_name === '_new') {
    closeAddRelativeButton()
    openAddRelativeButton()
    cy.wait(1500) // wait to the new add relative tree to renders
    cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card')
      .then($el => {
        const other_parent_id = $el.attr('data-id')
        cy.get(`.f3 [data-rel-type="${rel_type}"][data-other-parent-id="${other_parent_id}"]`).closest(`.card`).first().click()
      })
  } else {
    cy.get(`.f3 [data-rel-type="${rel_type}"]`).closest('.card').first().click()
  }
}

export function getCardByName(name) {
  return cy.contains('.card-label div', name).closest('.card')
}

export function checkCardByName(name, exists) {
  return cy.contains('.card-label div', name).should(exists ? 'exist' : 'not.exist')
}

export function deleteCardByName(name) {
  getCardByName(name).click()
  cy.wait(300)
  cy.get('.f3-form .f3-delete-btn').click()
}

export function openAddRelativeButton() {
  cy.get('.f3-add-relative-btn')
  .then($el => {
    if ($el.find('[data-icon="user-plus"]').length) cy.wrap($el).click()
  })
}

export function closeAddRelativeButton() {
  cy.get('.f3-add-relative-btn')
  .then($el => {
    if ($el.find('[data-icon="user-plus-close"]').length) cy.wrap($el).click()
  })
}

export function editCard(person_name, new_name, {no_click = false} = {}) {
  if (!no_click) getCardByName(person_name).click()
  cy.get('input[name="first name"]').clear().type(new_name)
  cy.get('button[type="submit"]').click()
}

export function changeField(field_label, value, {no_submit = false} = {}) {
  cy.get('label').contains(field_label).closest('.f3-form-field').find('input').clear().type(value)
  if (!no_submit) cy.get('button[type="submit"]').click()
}

export function changeSelectField(field_label, value, {no_submit = false} = {}) {
  cy.get('label').contains(field_label).closest('.f3-form-field').find('select').select(value)
  if (!no_submit) cy.get('button[type="submit"]').click()
}

export function checkField(field_label, value) {
  cy.get('label').contains(field_label).closest('.f3-form-field').find('input').should('have.value', value)
}

export function checkSelectField(field_label, value) {
  cy.get('label').contains(field_label).closest('.f3-form-field').find('select option[selected]').should('contain.text', value)
}

export function toggleSingleParentEmptyCard() {
  cy.wait(500)
  cy.get(`[data-test="single-parent-empty-card-switch"] label`).click()
  cy.wait(1000)
}

function setMainPerson(person_name) {
  cy.contains('.card-label div', person_name).closest('.card')
    .then($el => {
      if (!$el.hasClass('card-main')) {
        cy.wrap($el).click()
        cy.wait(300)
      }
    })
}

export function openNewRelativeForm(person_name, rel_type) {
  cy.wait(100)
  setMainPerson(person_name)
  cy.wait(100)
  openAddRelativeButton()
  cy.wait(300)
  if (['son', 'daughter'].includes(rel_type)) console.error('openNewRelativeFormChild should be used instead')
  cy.get(`.f3 [data-rel-type="${rel_type}"]`).closest('.card').first().click()
  cy.wait(100)
}

export function updateMainWin(name) {
  // chart needs to load first to get win.f3Chart
  cy.window().then(win => {
    const f3Chart = win.f3Chart
    f3Chart.updateMainId(f3Chart.store.getData().find(d => d.data['first name'] === name).id)
    f3Chart.updateTree({})
  })
}

export function linkExistingRel(rel_name) {
  cy.get('.f3-link-existing-relative').find('select').select(rel_name)
}

export function getToAddCard(name) {
  return cy.get(`[data-to-add="${name}"]`)
}