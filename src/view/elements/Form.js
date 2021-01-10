import {getLabel} from "../../handlers.js"

export function Form({datum, rel_datum, data_stash, rel_type, card_edit, postSubmit}) {
  const modal_el = document.querySelector('#form_modal'),
    modal = M.Modal.getInstance(modal_el);

  setupFromHtml();
  modal.open();

  function setupFromHtml() {
    modal_el.innerHTML = (`
      <div class="modal-content">
        <form>
          <label><input type="radio" name="gender" value="M" ${datum.data.gender === 'M' ? 'checked' : ''}><span>male</span></label><br>
          <label><input type="radio" name="gender" value="F" ${datum.data.gender === 'F' ? 'checked' : ''}><span>female</span></label><br>
          ${getEditFields(card_edit)}
          ${(rel_type === "son" || rel_type === "daughter") ? otherParentSelect() : ''}
          <br><br>
          <div style="text-align: right; display: ${datum.to_add || !!rel_datum ? 'none' : 'block'}">
            <span class="btn delete">delete</span>
          </div>
          <button type="submit" class="btn">submit</button>
        </form>
      </div>
    `)
    modal_el.querySelector("form").addEventListener('submit', submitFormChanges)
    modal_el.querySelector(".btn.delete").addEventListener('click', deletePerson)
    M.FormSelect.init(modal_el.querySelectorAll("select"));
  }

  function otherParentSelect() {
    return (`
      <div class="input-field">
        <select name="other_parent">
          ${(!rel_datum.rels.spouses || rel_datum.rels.spouses.length === 0) 
              ? '' 
              : rel_datum.rels.spouses.map((sp_id, i) => {
                  const spouse = data_stash.find(d => d.id === sp_id)
                  return (`<option value="${sp_id}" ${i === 0 ? 'selected' : ''}>${getLabel(spouse)}</option>`)
                }).join("\n")}
          <option value="${'_new'}">NEW</option>
        </select>
        <label>Select other parent</label>
      </div>
    `)
  }

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)

    modal.close()
    postSubmit()
  }

  function deletePerson() {
    modal.close()
    postSubmit({delete: true})
  }

  function getEditFields(card_edit) {
    return card_edit.map(d => (
      d.type === 'text'
        ? `<input type="text" name="${d.key}" placeholder="${d.placeholder}" value="${datum.data[d.key] || ''}">`
        : d.type === 'textarea'
        ? `<textarea class="materialize-textarea" name="${d.key}" placeholder="${d.placeholder}">${datum.data[d.key] || ''}</textarea>`
        : ''
    )).join('\n')
  }
}