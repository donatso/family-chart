import { EditDatumFormCreator, NewRelFormCreator, SelectField } from '../types/form'
import * as icons from './icons'


export function getHtmlNew(form_creator: NewRelFormCreator) {
  return (` 
    <form id="familyForm" class="f3-form">
      ${closeBtn()}
      <h3 class="f3-form-title">${form_creator.title}</h3>
      ${genderRadio(form_creator)}

      ${fields(form_creator)}
      
      <div class="f3-form-buttons">
        <button type="button" class="f3-cancel-btn">Cancel</button>
        <button type="submit">Submit</button>
      </div>

      ${form_creator.linkExistingRelative ? addLinkExistingRelative(form_creator) : ''}
    </form>
  `)
}

export function getHtmlEdit(form_creator: EditDatumFormCreator) {
  return (` 
    <form id="familyForm" class="f3-form ${form_creator.editable ? '' : 'non-editable'}">
      ${closeBtn()}
      <div style="text-align: right; display: 'block'">
        ${!form_creator.no_edit ? addRelativeBtn(form_creator) : ''}
        ${form_creator.no_edit ? spaceDiv() : editBtn(form_creator)}
      </div>

      ${genderRadio(form_creator)}

      ${fields(form_creator)}
      
      <div class="f3-form-buttons">
        <button type="button" class="f3-cancel-btn">Cancel</button>
        <button type="submit">Submit</button>
      </div>

      ${form_creator.linkExistingRelative ? addLinkExistingRelative(form_creator) : ''}

      <hr>
      ${deleteBtn(form_creator)}

      ${removeRelativeBtn(form_creator)}
    </form>
  `)

  
}

function deleteBtn(form_creator: EditDatumFormCreator) {
  return (`
    <div>
      <button type="button" class="f3-delete-btn" ${form_creator.can_delete ? '' : 'disabled'}>
        Delete
      </button>
    </div>
  `)
}

function removeRelativeBtn(form_creator: EditDatumFormCreator) {
  return (`
    <div>
      <button type="button" class="f3-remove-relative-btn${form_creator.removeRelativeActive ? ' active' : ''}">
        ${form_creator.removeRelativeActive ? 'Cancel Remove Relation' : 'Remove Relation'}
      </button>
    </div>
  `)
}

function addRelativeBtn(form_creator: EditDatumFormCreator) {
  return (`
    <span class="f3-add-relative-btn">
      ${form_creator.addRelativeActive ? icons.userPlusCloseSvgIcon() : icons.userPlusSvgIcon()}
    </span>
  `)
}

function editBtn(form_creator: EditDatumFormCreator) {
  return (`
    <span class="f3-edit-btn">
      ${form_creator.editable ? icons.pencilOffSvgIcon() : icons.pencilSvgIcon()}
    </span>
  `)
}

function genderRadio(form_creator: EditDatumFormCreator | NewRelFormCreator) {
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

function fields(form_creator: EditDatumFormCreator | NewRelFormCreator) {
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
      const select_field = field as SelectField
      fields_html += `
      <div class="f3-form-field">
        <label>${select_field.label}</label>
        <select name="${select_field.id}" value="${select_field.initial_value || ''}">
          <option value="">${select_field.placeholder || `Select ${select_field.label}`}</option>
          ${select_field.options.map((option) => `<option ${option.value === select_field.initial_value ? 'selected' : ''} value="${option.value}">${option.label}</option>`).join('')}
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
        const select_field = field as SelectField
        if (!field.initial_value) return
        fields_html += `
        <div class="f3-info-field">
          <span class="f3-info-field-label">${select_field.label}</span>
          <span class="f3-info-field-value">${select_field.options.find(option => option.value === select_field.initial_value)?.label || ''}</span>
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

function addLinkExistingRelative(form_creator: EditDatumFormCreator | NewRelFormCreator) {
  const title = form_creator.linkExistingRelative.hasOwnProperty('title') ? form_creator.linkExistingRelative.title : 'Profile already exists?'
  const select_placeholder = form_creator.linkExistingRelative.hasOwnProperty('select_placeholder') ? form_creator.linkExistingRelative.select_placeholder : 'Select profile'
  const options = form_creator.linkExistingRelative.options as SelectField['options']
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
