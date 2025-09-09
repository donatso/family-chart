import { getLinkRelOptions } from "../store/add-existing-rel"
import { submitFormData } from "../store/edit"
import { Data, Datum } from "../types/data"
import { EditTree } from "./edit"
import {
  FormCreatorSetupProps,
  FormCreator,
  BaseFormCreator,
  RelReferenceFieldCreator,
  SelectFieldCreator,
  RelReferenceField,
  SelectField
} from "../types/form"


export function formCreatorSetup({
  datum,
  store,
  fields,
  postSubmitHandler,
  addRelative,
  removeRelative,
  deletePerson,
  onCancel,
  editFirst,
  link_existing_rel_config,
  getKinshipInfo,
  onFormCreation,
  no_edit,
  onSubmit,
  onDelete,
}: FormCreatorSetupProps) {
  let form_creator: FormCreator;
  const base_form_creator: BaseFormCreator = {
    datum_id: datum.id,
    fields: [],
    onSubmit: submitFormChanges,
    onCancel: onCancel,
    getKinshipInfo: getKinshipInfo,
    onFormCreation: onFormCreation,
    no_edit: no_edit,
    gender_field: getGenderField(),
  }

  // Existing datum form creator
  if (!datum._new_rel_data) {
    if (!addRelative) throw new Error('addRelative is required')
    if (!removeRelative) throw new Error('removeRelative is required')
    form_creator = {
      ...base_form_creator,
      onDelete: deletePersonWithPostSubmit,
      addRelative: () => addRelative.activate(datum),
      addRelativeCancel: () => addRelative.onCancel!(),
      addRelativeActive: addRelative.is_active,
      removeRelative: () => removeRelative.activate(datum),
      removeRelativeCancel: () => removeRelative.onCancel!(),
      removeRelativeActive: removeRelative.is_active,
      editable: false,
      can_delete: true,
    }
  }

  // New rel form creator
  else {
    form_creator = {
      ...base_form_creator,
      title: datum._new_rel_data.label,
      new_rel: true,
      editable: true
    }
  }
  if (datum._new_rel_data || datum.to_add || datum.unknown) {
    if (link_existing_rel_config) form_creator.linkExistingRelative = createLinkExistingRelative(datum, store.getData(), link_existing_rel_config)
  }

  if (no_edit) form_creator.editable = false
  else if (editFirst) form_creator.editable = true

  fields.forEach(field => {
    if (field.type === 'rel_reference') addRelReferenceField(field)
    else if (field.type === 'select') addSelectField(field)

    else form_creator.fields.push({
      id: field.id,
      type: field.type,
      label: field.label,
      initial_value: datum.data[field.id],
    })
  })

  return form_creator

  function getGenderField(): BaseFormCreator['gender_field'] {
    return {
      id: 'gender', 
      type: 'switch',
      label: 'Gender',
      initial_value: datum.data.gender,
      disabled: ['father', 'mother'].some(rel => rel === datum._new_rel_data?.rel_type) || childrenAdded(),
      options: [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}]
    }
  }

  function addRelReferenceField(field: RelReferenceFieldCreator) {
    if (!field.getRelLabel) console.error('getRelLabel is not set')

    if (field.rel_type === 'spouse') {
      (datum.rels.spouses || []).forEach(spouse_id => {
        const spouse = store.getDatum(spouse_id)
        if (!spouse) throw new Error('Spouse not found')
        const marriage_date_id = `${field.id}__ref__${spouse_id}`
        const rel_reference_field: RelReferenceField = {
          id: marriage_date_id,
          type: 'rel_reference',
          label: field.label,
          rel_id: spouse_id,
          rel_label: field.getRelLabel(spouse),
          initial_value: datum.data[marriage_date_id],
          rel_type: field.rel_type,
        }
        form_creator.fields.push(rel_reference_field)
      })
    }
  }

  function addSelectField(field: SelectFieldCreator) {
    if (!field.options && !field.optionCreator) return console.error('optionCreator or options is not set for field', field)
    const select_field: SelectField = {
      id: field.id,
      type: field.type,
      label: field.label,
      initial_value: datum.data[field.id],
      placeholder: field.placeholder,
      options: field.options || field.optionCreator!(datum),
    }
    form_creator.fields.push(select_field)
  }

  function createLinkExistingRelative(datum: Datum, data: Data, link_existing_rel_config: EditTree['link_existing_rel_config']) {
    const obj = {
      label: link_existing_rel_config.label,
      options: getLinkRelOptions(datum, data)
        .map((d: Datum) => ({value: d.id, label: link_existing_rel_config.linkRelLabel(d)}))
        .sort((a: {label: string}, b: {label: string}) => {
          if (typeof a.label === 'string' && typeof b.label === 'string') return a.label.localeCompare(b.label)
          else return a.label < b.label ? -1 : 1
        }),
      onSelect: submitLinkExistingRelative
    }
    return obj
  }

  function childrenAdded() {
    return (datum.rels.children || []).some(c_id => {const child = store.getDatum(c_id); return !child!._new_rel_data})
  }

  function submitFormChanges(e: Event) {
    if (onSubmit) {
      onSubmit(e, datum, applyChanges, () => postSubmitHandler({}))
    } else {
      e.preventDefault()
      applyChanges()
      postSubmitHandler({})
    }

    function applyChanges() {
      const form_data = new FormData(e.target as HTMLFormElement)
      submitFormData(datum, store.getData(), form_data)
    }
  }

  function submitLinkExistingRelative(e: Event) {
    const link_rel_id = (e.target as HTMLSelectElement).value
    postSubmitHandler({link_rel_id: link_rel_id})
  }

  function deletePersonWithPostSubmit() {
    if (onDelete) {
      onDelete(datum, () => deletePerson!(), () => postSubmitHandler({delete: true}))
    } else {
      deletePerson!()
      postSubmitHandler({delete: true})
    }
  }
}