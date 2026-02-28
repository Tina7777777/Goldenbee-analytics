import './apiaries.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { createApiary, deleteApiary, listMyApiaries, updateApiary } from '../../services/apiaryService.js';

let apiaries = [];
let isCreateVisible = false;
let editingApiaryId = null;

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('bg-BG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('apiaries.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('apiaries.errors.missingConfig');
  }

  return t('apiaries.errors.generic');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getCreateFormMarkup() {
  if (!isCreateVisible) {
    return '';
  }

  return `
    <div class="page-card mb-3">
      <form id="apiary-create-form" class="vstack gap-3" novalidate>
        <div>
          <label class="form-label" for="create-name">${t('apiaries.form.name')}</label>
          <input id="create-name" name="name" class="form-control" required />
        </div>
        <div>
          <label class="form-label" for="create-location">${t('apiaries.form.location')}</label>
          <input id="create-location" name="location_text" class="form-control" />
        </div>
        <div>
          <label class="form-label" for="create-notes">${t('apiaries.form.notes')}</label>
          <textarea id="create-notes" name="notes" class="form-control" rows="3"></textarea>
        </div>
        <div class="d-flex flex-column flex-md-row gap-2">
          <button type="submit" class="btn btn-primary w-100 w-md-auto">${t('common.save')}</button>
          <button type="button" data-action="cancel-create" class="btn btn-outline-secondary w-100 w-md-auto">${t('common.cancel')}</button>
        </div>
      </form>
    </div>
  `;
}

function getEditFormMarkup(apiary) {
  return `
    <form class="vstack gap-3" data-role="edit-form" data-id="${apiary.id}" novalidate>
      <div>
        <label class="form-label" for="edit-name-${apiary.id}">${t('apiaries.form.name')}</label>
        <input id="edit-name-${apiary.id}" name="name" class="form-control" required value="${escapeHtml(apiary.name)}" />
      </div>
      <div>
        <label class="form-label" for="edit-location-${apiary.id}">${t('apiaries.form.location')}</label>
        <input id="edit-location-${apiary.id}" name="location_text" class="form-control" value="${escapeHtml(apiary.location_text || '')}" />
      </div>
      <div>
        <label class="form-label" for="edit-notes-${apiary.id}">${t('apiaries.form.notes')}</label>
        <textarea id="edit-notes-${apiary.id}" name="notes" class="form-control" rows="3">${escapeHtml(apiary.notes || '')}</textarea>
      </div>
      <div class="d-flex flex-column flex-md-row gap-2">
        <button type="submit" class="btn btn-primary w-100 w-md-auto">${t('common.save')}</button>
        <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="cancel-edit" data-id="${apiary.id}">${t('common.cancel')}</button>
      </div>
    </form>
  `;
}

function getApiaryCardMarkup(apiary) {
  const isEditing = editingApiaryId === apiary.id;

  return `
    <div class="col">
      <article class="page-card h-100 d-flex flex-column">
        ${
          isEditing
            ? getEditFormMarkup(apiary)
            : `
          <h2 class="h5 mb-2">${escapeHtml(apiary.name)}</h2>
          ${apiary.location_text ? `<p class="mb-2 text-secondary">${escapeHtml(apiary.location_text)}</p>` : ''}
          <p class="small text-secondary mb-3">${t('apiaries.createdAt')}: ${formatDate(apiary.created_at)}</p>
          <div class="mt-auto d-flex flex-column flex-md-row gap-2">
            <a class="btn btn-outline-primary w-100 w-md-auto" href="/apiary?id=${apiary.id}" data-link="spa">${t('apiaries.actions.open')}</a>
            <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="edit" data-id="${apiary.id}">${t('apiaries.actions.edit')}</button>
            <button type="button" class="btn btn-outline-danger w-100 w-md-auto" data-action="delete" data-id="${apiary.id}">${t('apiaries.actions.delete')}</button>
          </div>
        `
        }
      </article>
    </div>
  `;
}

function renderList() {
  const listElement = document.getElementById('apiaries-list');
  if (!listElement) {
    return;
  }

  if (!apiaries.length) {
    listElement.innerHTML = `<div class="page-card"><p class="mb-0 text-secondary">${t('apiaries.empty')}</p></div>`;
    return;
  }

  listElement.innerHTML = `
    <div class="row row-cols-1 row-cols-md-2 g-3">
      ${apiaries.map((apiary) => getApiaryCardMarkup(apiary)).join('')}
    </div>
  `;
}

function renderCreateSection() {
  const createElement = document.getElementById('apiary-create-slot');
  if (!createElement) {
    return;
  }

  createElement.innerHTML = getCreateFormMarkup();
}

function renderState() {
  renderCreateSection();
  renderList();
}

async function loadApiaries() {
  try {
    apiaries = await listMyApiaries();
    renderList();
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleCreateSubmit(form) {
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    showToast(t('apiaries.errors.nameRequired'), t('common.error'));
    return;
  }

  try {
    await createApiary({
      name,
      location_text: formData.get('location_text'),
      notes: formData.get('notes')
    });

    showToast(t('apiaries.toasts.createSuccess'), t('common.success'));
    isCreateVisible = false;
    await loadApiaries();
    renderCreateSection();
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleEditSubmit(form) {
  const apiaryId = form.getAttribute('data-id');
  if (!apiaryId) {
    return;
  }

  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    showToast(t('apiaries.errors.nameRequired'), t('common.error'));
    return;
  }

  try {
    await updateApiary(apiaryId, {
      name,
      location_text: formData.get('location_text'),
      notes: formData.get('notes')
    });

    editingApiaryId = null;
    showToast(t('apiaries.toasts.updateSuccess'), t('common.success'));
    await loadApiaries();
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleDelete(apiaryId) {
  const confirmed = window.confirm(t('apiaries.confirmDelete'));
  if (!confirmed) {
    return;
  }

  try {
    await deleteApiary(apiaryId);
    showToast(t('apiaries.toasts.deleteSuccess'), t('common.success'));
    await loadApiaries();
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

export function render() {
  return `
    <section class="apiaries-page">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <h1 class="mb-0">${t('pages.apiaries.title')}</h1>
        <button id="toggle-create-apiary" class="btn btn-primary w-100 w-md-auto">${t('apiaries.addButton')}</button>
      </div>

      <div id="apiary-create-slot"></div>
      <div id="apiaries-list"></div>
    </section>
  `;
}

export function init() {
  const pageElement = document.querySelector('.apiaries-page');
  if (!pageElement) {
    return;
  }

  apiaries = [];
  isCreateVisible = false;
  editingApiaryId = null;
  renderState();
  void loadApiaries();

  pageElement.querySelector('#toggle-create-apiary')?.addEventListener('click', () => {
    isCreateVisible = !isCreateVisible;
    renderCreateSection();
  });

  pageElement.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');
    const apiaryId = button.getAttribute('data-id');

    if (action === 'cancel-create') {
      isCreateVisible = false;
      renderCreateSection();
      return;
    }

    if (action === 'edit' && apiaryId) {
      editingApiaryId = apiaryId;
      renderList();
      return;
    }

    if (action === 'cancel-edit') {
      editingApiaryId = null;
      renderList();
      return;
    }

    if (action === 'delete' && apiaryId) {
      void handleDelete(apiaryId);
    }
  });

  pageElement.addEventListener('submit', (event) => {
    const createForm = event.target.closest('#apiary-create-form');
    if (createForm) {
      event.preventDefault();
      void handleCreateSubmit(createForm);
      return;
    }

    const editForm = event.target.closest('form[data-role="edit-form"]');
    if (editForm) {
      event.preventDefault();
      void handleEditSubmit(editForm);
    }
  });
}