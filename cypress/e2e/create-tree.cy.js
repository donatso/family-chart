import { LOCAL_HOST } from './utils'
import { 
  addRelative, 
  addChild, 
  getCardByName, 
  deleteCardByName, 
  closeAddRelativeButton, 
  openAddRelativeButton, 
  editCard, 
} from './create-tree-utils'

const create_tree_url = LOCAL_HOST + '/examples/create-tree'

describe('Create simple trees', () => {
  before(() => {
  })

  it('Add f m', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'father', 'Zen')
      addRelative('Name', 'mother', 'Zebra')
      getCardByName('Zen')
      getCardByName('Zebra')
      closeAddRelativeButton()
    }
  })

  it('Add s d sp', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky')
      addRelative('Name', 'spouse', 'Andrea')
      closeAddRelativeButton()

      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add s d', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky')
      closeAddRelativeButton()

      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add s d for specific other parent', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')
      addChild('Name', 'son', 'Ben', 'Andrea')
      addChild('Name', 'daughter', 'Becky', 'Andrea')
      closeAddRelativeButton()
  
      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add sp s d', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky')
      closeAddRelativeButton()
  
      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add sp s d_sp_new', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky', '_new')
      closeAddRelativeButton()

      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add sp s d_sp_new then m', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn(is_single) {
      addRelative('Name', 'spouse', 'Andrea')
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky', '_new')
      closeAddRelativeButton()
      cy.wait(100)

      if (is_single) {
        getCardByName('Becky').click()
        cy.wait(1000)
        addRelative('Becky', 'mother', 'Aniston')
      } else {
        getCardByName('Becky').click()
        cy.wait(1000)
        editCard('ADD', 'Aniston')
      }

      getCardByName('Name').click()

      getCardByName('Aniston')
      getCardByName('Ben')
      getCardByName('Becky')
    }
  })

  it('Add s d ss sd', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky')
      addChild('Ben', 'son', 'Carlos')
      addChild('Ben', 'daughter', 'Carla')
      closeAddRelativeButton()
    }
  })


  it('Add s d ss sd and delete all', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addChild('Name', 'son', 'Ben')
      addChild('Name', 'daughter', 'Becky')
      addChild('Ben', 'son', 'Carlos')
      addChild('Ben', 'daughter', 'Carla')
      deleteCardByName('Carlos')
      deleteCardByName('Carla')
      getCardByName('Name').click()
      deleteCardByName('Becky')
      deleteCardByName('Ben')
      deleteCardByName('Name')
      closeAddRelativeButton()
    }
  })

  it('Add d sp and count cards', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addChild('Name', 'daughter', 'Becky')
      addRelative('Name', 'spouse', 'Andrea')

      closeAddRelativeButton()

      cy.get('.card_cont').should('have.length', 3)
    }
  })

  it('Add sp d and count cards', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')
      addChild('Name', 'daughter', 'Becky', 'Andrea')
      closeAddRelativeButton()
  
      cy.get('.card_cont').should('have.length', 3)
    }
  })

  it('Add m and check history', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      addRelative('Name', 'mother', 'Zebra')
      getCardByName('Zebra').click()
      cy.get('.f3-back-button').click()
      cy.get('.f3-forward-button').click()
      getCardByName('Zebra').click()
    }
  })

  it('Add d and check history', () => {
    cy.visit(create_tree_url)
    testFn()

    // no single parent empty card test

    function testFn() {
      addChild('Name', 'daughter', 'Becky')
      closeAddRelativeButton()
      editCard('ADD', 'Andrea')
      getCardByName('Name').click()
      openAddRelativeButton()
  
      addChild('Name', 'daughter', 'Becca', '_new')
      closeAddRelativeButton()
      editCard('ADD', 'Aniston')
      getCardByName('Aniston').click()
      openAddRelativeButton()
    }
  })

  it('Add change main and check history', () => {
    cy.visit(create_tree_url)
    testFn()

    function testFn() {
      editCard('Name', 'Nameee', {no_click: true})
      cy.get('.f3-back-button').click()
      cy.get('.f3-forward-button').click()
      getCardByName('Nameee')
      closeAddRelativeButton()
      getCardByName('Nameee')
    }
  })

  it('Add spouse and then spouse of spouse that should be male by default', () => {
    cy.visit(create_tree_url)
    testFn()


    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')

      getCardByName('Andrea').click()
      addRelative('Andrea', 'spouse', 'Antony')
      getCardByName('Antony').click()

      // radio element should have value M
      cy.get('#familyForm .f3-radio-group input[value="M"]').should('be.checked')

      addChild('Andrea', 'son', 'Brad', 'Antony')

      closeAddRelativeButton()
    }
  })

  it('Add spouse and then child of spouse with new parent', () => {
    cy.visit(create_tree_url)
    testFn()


    function testFn() {
      addRelative('Name', 'spouse', 'Andrea')

      getCardByName('Andrea').click()

      addChild('Andrea', 'son', 'Brad', '_new')

      closeAddRelativeButton()
    }
  })

  it('Change gender of main should change gender of spouse', () => {
    cy.visit(create_tree_url)
    testFn()


    function testFn() {
      getCardByName('Name').click()
      openAddRelativeButton()

      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('not.exist')
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-female').should('exist')

      cy.get('#familyForm .f3-radio-group input[value="F"]').click()
      cy.get('[type="submit"]').click()
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('exist')

      cy.get('#familyForm .f3-radio-group input[value="M"]').click()
      cy.get('[type="submit"]').click()
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('not.exist')

      closeAddRelativeButton()
      openAddRelativeButton()

      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('not.exist')
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-female').should('exist')

      cy.get('#familyForm .f3-radio-group input[value="F"]').click()
      cy.get('[type="submit"]').click()
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('exist')

      cy.get('#familyForm .f3-radio-group input[value="M"]').click()
      cy.get('[type="submit"]').click()
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('not.exist')
    }
  })

  it('Changing gender of main and adding child should appropriately assign mother/father to main', () => {
    cy.visit(create_tree_url)
    testFn()


    function testFn() {
      getCardByName('Name').click()
      openAddRelativeButton()

      cy.get('#familyForm .f3-radio-group input[value="F"]').click()
      cy.get('[type="submit"]').click()
      cy.get(`.f3 [data-rel-type="spouse"]`).closest('.card-male').should('exist')

      addChild('Name', 'son', 'Ben')
      getCardByName('Ben').click()
      cy.wait(1000)

      cy.get('#FamilyChart .card').then(async $cards => {
        const momRect = $cards.filter(':contains("Name")')[0].getBoundingClientRect()
        const dadRect = $cards.filter(':contains("ADD")')[0].getBoundingClientRect()

        expect(momRect.left).to.be.greaterThan(dadRect.left)
      })
    }
  })

})
