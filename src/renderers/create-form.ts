import { EditDatumFormCreator, NewRelFormCreator } from '../types/form'
import { getHtmlEdit, getHtmlNew } from './create-form-html'


export function createFormNew(form_creator: NewRelFormCreator, closeCallback: () => void) {
  return createForm(form_creator, closeCallback)
}

export function createFormEdit(form_creator: EditDatumFormCreator, closeCallback: () => void) {
  return createForm(form_creator, closeCallback)
}

function createForm(form_creator: EditDatumFormCreator | NewRelFormCreator, closeCallback: () => void) {
  const is_new = isNewRelFormCreator(form_creator)
  const formContainer = document.createElement('div')
  reload()
  return formContainer

  function reload() {
    const formHtml = is_new ? getHtmlNew(form_creator) : getHtmlEdit(form_creator)
    formContainer.innerHTML = formHtml;
    setupEventListenersBase(formContainer, form_creator, closeCallback, reload)
    if (is_new) setupEventListenersNew(formContainer, form_creator)
    else setupEventListenersEdit(formContainer, form_creator, reload)
    if (form_creator.onFormCreation) {
      form_creator.onFormCreation({
        cont: formContainer,
        form_creator: form_creator
      })
    }
  }

  function isNewRelFormCreator(form_creator: EditDatumFormCreator | NewRelFormCreator): form_creator is NewRelFormCreator {
    return 'new_rel' in form_creator
  }
}

function setupEventListenersBase(formContainer: HTMLElement, form_creator: EditDatumFormCreator | NewRelFormCreator, closeCallback: () => void, reload: () => void) {
  const form = formContainer.querySelector('form')!;
  form.addEventListener('submit', form_creator.onSubmit);

  const cancel_btn = form.querySelector('.f3-cancel-btn')!;
  cancel_btn.addEventListener('click', onCancel)

  const close_btn = form.querySelector('.f3-close-btn')!;
  close_btn.addEventListener('click', closeCallback)

  function onCancel() {
    form_creator.editable = false
    if (form_creator.onCancel) form_creator.onCancel()
    reload()
  }
}

function setupEventListenersNew(formContainer: HTMLElement, form_creator: NewRelFormCreator) {
  const form = formContainer.querySelector('form')!;
  const link_existing_relative_select = form.querySelector('.f3-link-existing-relative select')!;
  if (link_existing_relative_select) {
    link_existing_relative_select.addEventListener('change', form_creator.linkExistingRelative.onSelect);
  }
}

function setupEventListenersEdit(formContainer: HTMLElement, form_creator: EditDatumFormCreator, reload: () => void) {
  const form = formContainer.querySelector('form')!;

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
      reload()
    });
  }

  const remove_relative_btn = form.querySelector('.f3-remove-relative-btn');
  if (remove_relative_btn && form_creator.removeRelative) {
    remove_relative_btn.addEventListener('click', () => {
      if (form_creator.removeRelativeActive) form_creator.removeRelativeCancel()
      else form_creator.removeRelative()
      form_creator.removeRelativeActive = !form_creator.removeRelativeActive
      reload()
    });
  }

  const link_existing_relative_select = form.querySelector('.f3-link-existing-relative select');
  if (link_existing_relative_select) {
    link_existing_relative_select.addEventListener('change', form_creator.linkExistingRelative.onSelect);
  }

  function onEdit() {
    form_creator.editable = !form_creator.editable
    reload()
  }
}