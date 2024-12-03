import * as icons from '../view/elements/Card.icons.js'

export function formInfoSetup(form_creator, closeCallback) {
  const formContainer = document.createElement('div')
  update()
  return formContainer

  function update() {
    const formHtml = getHtml(form_creator)

    formContainer.innerHTML = formHtml;
  
    setupEventListeners()

    return formContainer
  }

  function setupEventListeners() {
    const form = formContainer.querySelector('form');
    form.addEventListener('submit', form_creator.onSubmit);

    const cancel_btn = form.querySelector('.f3-cancel-btn');
    cancel_btn.addEventListener('click', onCancel)

    const edit_btn = form.querySelector('.f3-edit-btn');
    if (edit_btn) edit_btn.addEventListener('click', onEdit)

    const delete_btn = form.querySelector('.f3-delete-btn');
    if (delete_btn && form_creator.onDelete) {
      delete_btn.addEventListener('click', form_creator.onDelete);
    }

    const add_relative_btn = form.querySelector('.f3-add-relative-btn');
    if (add_relative_btn && form_creator.addRelative) {
      add_relative_btn.addEventListener('click', () => {
        if (form_creator.addRelativeActive) form_creator.addRelativeCancel()
        else form_creator.addRelative()
        form_creator.addRelativeActive = !form_creator.addRelativeActive
        update()
      });
    }

    const close_btn = form.querySelector('.f3-close-btn');
    close_btn.addEventListener('click', closeCallback)

    if (form_creator.other_parent_field) {
      cancel_btn.style.display = 'none'
    }

    function onCancel() {
      form_creator.editable = false
      if (form_creator.onCancel) form_creator.onCancel()
      update()
    }

    function onEdit() {
      form_creator.editable = !form_creator.editable
      update()
    }
  }
}

 function getHtml(form_creator) {
  return (` 
    <form id="familyForm" class="f3-form ${form_creator.editable ? '' : 'non-editable'}">
      ${closeBtn()}
      ${form_creator.title ? `<h3 class="f3-form-title">${form_creator.title}</h3>` : ''}
      <div style="text-align: right; display: ${form_creator.new_rel ? 'none' : 'block'}">
        ${form_creator.addRelative && !form_creator.no_edit ? addRelativeBtn() : ''}
        ${form_creator.no_edit ? spaceDiv() : editBtn()}
      </div>
      ${genderRadio()}

      ${fields()}

      ${form_creator.other_parent_field ? otherParentField() : ''}

      ${form_creator.onDelete ? deleteBtn() : ''}
      
      <div class="f3-form-buttons">
        <button type="button" class="f3-cancel-btn">Cancel</button>
        <button type="submit">Submit</button>
      </div>
    </form>
  `)

  function deleteBtn() {
    return (`
      <div>
        <button type="button" class="f3-delete-btn" ${form_creator.can_delete ? '' : 'disabled'}>
          Delete
        </button>
      </div>
    `)
  }

  function addRelativeBtn() {
    return (`
      <span class="f3-add-relative-btn">
        ${form_creator.addRelativeActive ? icons.userPlusCloseSvgIcon() : icons.userPlusSvgIcon()}
      </span>
    `)
  }

  function editBtn() {
    return (`
      <span class="f3-edit-btn">
        ${form_creator.editable ? icons.pencilOffSvgIcon() : icons.pencilSvgIcon()}
      </span>
    `)
  }

  function genderRadio() {
    if (!form_creator.editable) return ''
    return (`
      <div class="f3-radio-group">
        ${form_creator.gender_field.options.map(option => (`
          <label>
            <input type="radio" name="${form_creator.gender_field.id}" 
              value="${option.value}" 
              ${option.value === form_creator.gender_field.initial_value ? 'checked' : ''}
            >
            ${option.label}
          </label>
        `)).join('')}
      </div>
    `)
  }

  function fields() {
    if (!form_creator.editable) return infoField()
    return form_creator.fields.map(field => (`
      ${field.type === 'text' ? `
        <div class="f3-form-field">
          <label>${field.label}</label>
          <input type="${field.type}" 
            name="${field.id}" 
            value="${field.initial_value || ''}"
            placeholder="${field.label}">
        </div>
      ` : field.type === 'textarea' ? `
        <div class="f3-form-field">
          <label>${field.label}</label>
          <textarea name="${field.id}" 
            placeholder="${field.label}">${field.initial_value || ''}</textarea>
        </div>
      ` : ''}
    `)).join('')

    function infoField() {
      return form_creator.fields.map(field => (`
        <div class="f3-info-field">
          <span class="f3-info-field-label">${field.label}</span>
          <span class="f3-info-field-value">${field.initial_value || ''}</span>
        </div>
      `)).join('')
    }
  }

  function otherParentField() {
    return (`
      <div class="f3-form-field">
        <label>${form_creator.other_parent_field.label}</label>
        <select name="${form_creator.other_parent_field.id}">
          ${form_creator.other_parent_field.options.map(option => `
            <option value="${option.value}" 
              ${option.value === form_creator.other_parent_field.initial_value ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      </div>
    `)
  }

  function closeBtn() {
    return (`
      <span class="f3-close-btn">
        ×
      </span>
    `)
  }

  function spaceDiv() {
    return `<div style="height: 24px;"></div>`
  }
}

