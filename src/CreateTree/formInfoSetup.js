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

    const remove_relative_btn = form.querySelector('.f3-remove-relative-btn');
    if (remove_relative_btn && form_creator.removeRelative) {
      remove_relative_btn.addEventListener('click', () => {
        if (form_creator.removeRelativeActive) form_creator.removeRelativeCancel()
        else form_creator.removeRelative()
        form_creator.removeRelativeActive = !form_creator.removeRelativeActive
        update()
      });
    }

    const close_btn = form.querySelector('.f3-close-btn');
    close_btn.addEventListener('click', closeCallback)

    const link_existing_relative_select = form.querySelector('.f3-link-existing-relative select');
    if (link_existing_relative_select) {
      link_existing_relative_select.addEventListener('change', form_creator.linkExistingRelative.onSelect);
    }

    if (form_creator.onFormCreation) {
      form_creator.onFormCreation({
        cont: formContainer,
        form_creator: form_creator
      })
    }

    if (form_creator.getKinshipInfo) {
      const kinship_info = form_creator.getKinshipInfo()
      if (kinship_info) formContainer.appendChild(kinship_info)
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
      
      <div class="f3-form-buttons">
        <button type="button" class="f3-cancel-btn">Cancel</button>
        <button type="submit">Submit</button>
      </div>

      ${form_creator.linkExistingRelative ? addLinkExistingRelative() : ''}

      <hr>

      ${form_creator.onDelete ? deleteBtn() : ''}

      ${form_creator.removeRelative ? removeRelativeBtn() : ''}
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

  function removeRelativeBtn() {
    return (`
      <div>
        <button type="button" class="f3-remove-relative-btn${form_creator.removeRelativeActive ? ' active' : ''}">
          ${form_creator.removeRelativeActive ? 'Cancel Remove Relation' : 'Remove Relation'}
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
              ${form_creator.gender_field.disabled ? 'disabled' : ''}
            >
            ${option.label}
          </label>
        `)).join('')}
      </div>
    `)
  }

  function fields() {
    if (!form_creator.editable) return infoField()
    let fields_html = ''
    form_creator.fields.forEach(field => {
      if (field.type === 'text') {
        fields_html += `
        <div class="f3-form-field">
          <label>${field.label}</label>
          <input type="${field.type}" 
            name="${field.id}" 
            value="${field.initial_value || ''}"
            placeholder="${field.label}">
        </div>`
      } else if (field.type === 'textarea') {
        fields_html += `
        <div class="f3-form-field">
          <label>${field.label}</label>
          <textarea name="${field.id}" 
            placeholder="${field.label}">${field.initial_value || ''}</textarea>
        </div>`
      } else if (field.type === 'select') {
        fields_html += `
        <div class="f3-form-field">
          <label>${field.label}</label>
          <select name="${field.id}" value="${field.initial_value || ''}">
            <option value="">${field.placeholder || `Select ${field.label}`}</option>
            ${field.options.map(option => `<option ${option.value === field.initial_value ? 'selected' : ''} value="${option.value}">${option.label}</option>`).join('')}
          </select>
        </div>`
      } else if (field.type === 'rel_reference') {
        fields_html += `
        <div class="f3-form-field">
          <label>${field.label} - <i>${field.rel_label}</i></label>
          <input type="text" 
            name="${field.id}" 
            value="${field.initial_value || ''}"
            placeholder="${field.label}">
        </div>`
      }
    })
    return fields_html

    function infoField() {
      let fields_html = ''
      form_creator.fields.forEach(field => {
        if (field.type === 'rel_reference') {
          if (!field.initial_value) return
          fields_html += `
          <div class="f3-info-field">
            <span class="f3-info-field-label">${field.label} - <i>${field.rel_label}</i></span>
            <span class="f3-info-field-value">${field.initial_value || ''}</span>
          </div>`
        } else if (field.type === 'select') {
          if (!field.initial_value) return
          fields_html += `
          <div class="f3-info-field">
            <span class="f3-info-field-label">${field.label}</span>
            <span class="f3-info-field-value">${field.options.find(option => option.value === field.initial_value)?.label || ''}</span>
          </div>`
        } else {
          fields_html += `
          <div class="f3-info-field">
            <span class="f3-info-field-label">${field.label}</span>
            <span class="f3-info-field-value">${field.initial_value || ''}</span>
          </div>`
        }
      })
      return fields_html
    }
  }

  function addLinkExistingRelative() {
    const title = form_creator.linkExistingRelative.hasOwnProperty('title') ? form_creator.linkExistingRelative.title : 'Profile already exists?'
    const select_placeholder = form_creator.linkExistingRelative.hasOwnProperty('select_placeholder') ? form_creator.linkExistingRelative.select_placeholder : 'Select profile'
    const options = form_creator.linkExistingRelative.options
    return (`
      <div>
        <hr>
        <div class="f3-link-existing-relative">
          <label>${title}</label>
          <select>
            <option value="">${select_placeholder}</option>
            ${options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
          </select>
        </div>
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

