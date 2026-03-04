export function Form({datum, rel_datum, store, rel_type, card_edit, postSubmit, card_display, edit: {el, open, close}}) {
  setupFromHtml();
  open();

  function setupFromHtml() {
    el.innerHTML = (`
      <form>
        <div class="radio-group">
          <label><input type="radio" name="gender" value="M" ${datum.data.gender === 'M' ? 'checked' : ''}><span>Male</span></label>
          <label><input type="radio" name="gender" value="F" ${datum.data.gender === 'F' ? 'checked' : ''}><span>Female</span></label>
        </div>
        ${getEditFields(card_edit)}
        ${(rel_type === "son" || rel_type === "daughter") ? otherParentSelect() : ''}
        <div class="form-actions">
          <span style="display: ${datum.to_add || !!rel_datum ? 'none' : 'inline-flex'}; cursor: pointer" class="fc-btn fc-btn-danger delete">Delete</span>
          <button type="submit" class="fc-btn fc-btn-primary">Save</button>
        </div>
      </form>
    `)
    el.querySelector("form").addEventListener('submit', submitFormChanges)
    el.querySelector(".delete").addEventListener('click', deletePerson)
  }

  function otherParentSelect() {
    const data_stash = store.getData();
    return (`
      <div>
        <label style="font-size: 13px; color: var(--fc-text-secondary, #aaa)">Other parent</label>
        <select name="other_parent">
          ${(!rel_datum.rels.spouses || rel_datum.rels.spouses.length === 0)
              ? ''
              : rel_datum.rels.spouses.map((sp_id, i) => {
                  const spouse = data_stash.find(d => d.id === sp_id)
                  return (`<option value="${sp_id}" ${i === 0 ? 'selected' : ''}>${card_display[0](spouse)}</option>`)
                }).join("\n")}
          <option value="${'_new'}">NEW</option>
        </select>
      </div>
    `)
  }

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)

    close()
    postSubmit()
  }

  function deletePerson() {
    close()
    postSubmit({delete: true})
  }

  function getEditFields(card_edit) {
    return card_edit.map(d => (
      d.type === 'text'
        ? `<input type="text" name="${d.key}" placeholder="${d.placeholder}" value="${datum.data[d.key] || ''}">`
        : d.type === 'textarea'
        ? `<textarea name="${d.key}" placeholder="${d.placeholder}">${datum.data[d.key] || ''}</textarea>`
        : ''
    )).join('\n')
  }
}