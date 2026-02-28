import './apiary.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { deleteApiary, getApiaryById, updateApiary } from '../../services/apiaryService.js';

let currentApiaryId = '';
let currentApiary = null;
let isEditMode = false;

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

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function detailsMarkup(apiary) {
  return `
    <div class="page-card mb-3">
      <h2 class="h5 mb-3">${escapeHtml(apiary.name)}</h2>
      <p class="mb-2"><span class="text-secondary">${t('apiaries.form.location')}:</span> ${escapeHtml(apiary.location_text || '-')}</p>
      <p class="mb-2"><span class="text-secondary">${t('apiaries.form.notes')}:</span> ${escapeHtml(apiary.notes || '-')}</p>
      <p class="small text-secondary mb-3">${t('apiaries.createdAt')}: ${formatDate(apiary.created_at)}</p>

      <div class="d-flex flex-column flex-md-row gap-2">
        <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="toggle-edit">${t('apiaries.actions.edit')}</button>
        <button type="button" class="btn btn-outline-danger w-100 w-md-auto" data-action="delete">${t('apiaries.actions.delete')}</button>
        <a href="/apiaries" data-link="spa" class="btn btn-outline-primary w-100 w-md-auto">${t('apiaries.actions.back')}</a>
      </div>
    </div>
  `;
}

function editMarkup(apiary) {
  return `
    <div class="page-card mb-3">
      <form id="apiary-edit-form" class="vstack gap-3" novalidate>
        <div>
          <label class="form-label" for="apiary-name">${t('apiaries.form.name')}</label>
          <input id="apiary-name" name="name" class="form-control" required value="${escapeHtml(apiary.name)}" />
        </div>
        <div>
          <label class="form-label" for="apiary-location">${t('apiaries.form.location')}</label>
          <input id="apiary-location" name="location_text" class="form-control" value="${escapeHtml(apiary.location_text || '')}" />
        </div>
        <div>
          <label class="form-label" for="apiary-notes">${t('apiaries.form.notes')}</label>
          <textarea id="apiary-notes" name="notes" rows="4" class="form-control">${escapeHtml(apiary.notes || '')}</textarea>
        </div>
        <div class="d-flex flex-column flex-md-row gap-2">
          <button type="submit" class="btn btn-primary w-100 w-md-auto">${t('common.save')}</button>
          <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="cancel-edit">${t('common.cancel')}</button>
        </div>
      </form>
    </div>
  `;
}

function hivePlaceholderMarkup() {
  return `
    <div class="page-card">
      <h2 class="h5 mb-3">${t('apiaries.hivesTitle')}</h2>
      <p class="text-secondary mb-3">${t('apiaries.hivesEmpty')}</p>
      <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" disabled>${t('apiaries.hivesAddButton')}</button>
    </div>
  `;
}

function renderContent() {
  const contentElement = document.getElementById('apiary-content');
  if (!contentElement) {
    return;
  }

  if (!currentApiary) {
    contentElement.innerHTML = `<div class="page-card"><p class="mb-0 text-secondary">${t('apiaries.errors.notFound')}</p></div>`;
    return;
  }

  contentElement.innerHTML = `${isEditMode ? editMarkup(currentApiary) : detailsMarkup(currentApiary)}${hivePlaceholderMarkup()}`;
}

async function loadApiary() {
  try {
    currentApiary = await getApiaryById(currentApiaryId);
    if (!currentApiary) {
      showToast(t('apiaries.errors.notFound'), t('common.error'));
      navigateTo('/apiaries');
      return;
    }

    renderContent();
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleEditSubmit(formElement) {
  const formData = new FormData(formElement);
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    showToast(t('apiaries.errors.nameRequired'), t('common.error'));
    return;
  }

  try {
    currentApiary = await updateApiary(currentApiaryId, {
      name,
      location_text: formData.get('location_text'),
      notes: formData.get('notes')
    });

    isEditMode = false;
    renderContent();
    showToast(t('apiaries.toasts.updateSuccess'), t('common.success'));
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleDelete() {
  const confirmed = window.confirm(t('apiaries.confirmDelete'));
  if (!confirmed) {
    return;
  }

  try {
    await deleteApiary(currentApiaryId);
    showToast(t('apiaries.toasts.deleteSuccess'), t('common.success'));
    navigateTo('/apiaries');
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

export function render(params = {}) {
  currentApiaryId = params.id || '';

  return `
    <section class="apiary-page">
      <h1 class="mb-4">${t('pages.apiary.title')}</h1>
      <div id="apiary-content"></div>
    </section>
  `;
}

export function init() {
  isEditMode = false;
  currentApiary = null;
  renderContent();
  void loadApiary();

  const pageElement = document.querySelector('.apiary-page');
  if (!pageElement) {
    return;
  }

  pageElement.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

    if (action === 'toggle-edit') {
      isEditMode = true;
      renderContent();
      return;
    }

    if (action === 'cancel-edit') {
      isEditMode = false;
      renderContent();
      return;
    }

    if (action === 'delete') {
      void handleDelete();
    }
  });

  pageElement.addEventListener('submit', (event) => {
    const formElement = event.target.closest('#apiary-edit-form');
    if (!formElement) {
      return;
    }

    event.preventDefault();
    void handleEditSubmit(formElement);
  });
}