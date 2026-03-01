import './apiary.css';
import { Modal } from 'bootstrap';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { deleteApiary, getApiaryById, updateApiary } from '../../services/apiaryService.js';
import { createHive, deleteHive, listHivesByApiary, updateHive } from '../../services/hivesService.js';
import { navigate } from '../../utils/navigation.js';
import { initApiarySummary, renderApiarySummary } from './apiarySummary.js';
import { initInspectionsSection, renderInspectionsSection } from './inspectionsSection.js';
import { initSupersSection, renderSupersSection } from './supersSection.js';

let currentApiaryId = '';
let currentApiary = null;
let isEditMode = false;
let isLoading = false;

let hives = [];
let isHivesLoading = false;
let editingHiveId = null;
let hiveModalInstance = null;
let isHiveSaving = false;

let hivePanelsState = {};
let requestedHiveId = '';

function createDefaultHivePanelState() {
  return {
    expanded: false
  };
}

function getHivePanelState(hiveId) {
  if (!hivePanelsState[hiveId]) {
    hivePanelsState[hiveId] = createDefaultHivePanelState();
  }

  return hivePanelsState[hiveId];
}

function reconcileHivePanels() {
  const nextState = {};

  hives.forEach((hive) => {
    nextState[hive.id] = hivePanelsState[hive.id] || createDefaultHivePanelState();
  });

  hivePanelsState = nextState;
}

function setHiveQueryParam(hiveId) {
  const url = new URL(window.location.href);

  if (hiveId) {
    url.searchParams.set('hive', hiveId);
  } else {
    url.searchParams.delete('hive');
  }

  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function scrollHiveIntoView(hiveId) {
  if (!window.matchMedia('(max-width: 767.98px)').matches) {
    return;
  }

  const hiveElement = document.getElementById(`hive-item-${hiveId}`);
  if (!hiveElement) {
    return;
  }

  hiveElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function expandHiveFromUrl(scroll = false) {
  if (!requestedHiveId) {
    return;
  }

  const hiveExists = hives.some((hive) => hive.id === requestedHiveId);
  if (!hiveExists) {
    requestedHiveId = '';
    setHiveQueryParam(null);
    return;
  }

  Object.keys(hivePanelsState).forEach((hiveId) => {
    hivePanelsState[hiveId].expanded = hiveId === requestedHiveId;
  });

  const panelState = getHivePanelState(requestedHiveId);
  panelState.expanded = true;
  renderHivesSection();

  const supersContainerEl = document.getElementById(`hive-supers-section-${requestedHiveId}`);
  if (supersContainerEl) {
    await initSupersSection({
      hiveId: requestedHiveId,
      containerEl: supersContainerEl,
      onChanged: () => initApiarySummary(currentApiaryId)
    });
  }

  if (scroll) {
    setTimeout(() => {
      scrollHiveIntoView(requestedHiveId);
    }, 80);
  }
}

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

function getHivesFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (error?.code === '23505' || message.includes('duplicate key')) {
    return t('apiaries.hives.errors.codeExists');
  }

  if (message.includes('not authenticated')) {
    return t('apiaries.hives.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('apiaries.hives.errors.missingConfig');
  }

  return t('apiaries.hives.errors.generic');
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

function hiveModalMarkup() {
  return `
    <div class="modal fade" id="hive-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form id="hive-modal-form" novalidate>
            <div class="modal-header">
              <h2 class="modal-title fs-5" id="hive-modal-title">${t('apiaries.hives.addButton')}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body vstack gap-3">
              <div>
                <label class="form-label" for="hive-code">${t('apiaries.hives.form.code')}</label>
                <input id="hive-code" name="code" class="form-control" required />
              </div>
              <div>
                <label class="form-label" for="hive-notes">${t('apiaries.hives.form.notes')}</label>
                <textarea id="hive-notes" name="notes" class="form-control" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${t('common.cancel')}</button>
              <button type="submit" class="btn btn-primary" id="hive-modal-submit">
                <span data-role="hive-submit-text">${t('common.save')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function hiveSupersPanelMarkup(hive, panelState) {
  if (!panelState.expanded) {
    return '';
  }

  return renderSupersSection(hive.id);
}

function hiveInspectionsPanelMarkup(hive, panelState) {
  if (!panelState.expanded) {
    return '';
  }

  return renderInspectionsSection(hive.id);
}

function hivesSectionMarkup() {
  if (isHivesLoading) {
    return `<div class="page-card"><p class="mb-0 text-secondary">${t('common.loading')}</p></div>`;
  }

  if (!hives.length) {
    return `
      <div class="page-card">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h2 class="h5 mb-0">${t('apiaries.hives.title')}</h2>
          <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="open-hive-create">${t('apiaries.hives.addButton')}</button>
        </div>
        <p class="text-secondary mb-0">${t('apiaries.hives.empty')}</p>
      </div>
    `;
  }

  return `
    <div class="page-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <h2 class="h5 mb-0">${t('apiaries.hives.title')}</h2>
        <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="open-hive-create">${t('apiaries.hives.addButton')}</button>
      </div>
      <div class="list-group">
        ${hives
          .map((hive) => {
            const panelState = getHivePanelState(hive.id);

            return `
              <div class="list-group-item" id="hive-item-${hive.id}">
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div>
                      <p class="mb-1 fw-semibold">${t('apiaries.hives.codeLabel')}: ${escapeHtml(hive.code)}</p>
                      <p class="mb-1 text-secondary">${escapeHtml(hive.notes || '-')}</p>
                      <p class="mb-0 small text-secondary">${t('apiaries.createdAt')}: ${formatDate(hive.created_at)}</p>
                    </div>
                    <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                      <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="toggle-hive-panel" data-hive-id="${hive.id}">
                        ${panelState.expanded ? t('apiaries.hives.supers.actions.collapse') : t('apiaries.hives.supers.actions.expand')}
                      </button>
                      <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="open-hive-edit" data-hive-id="${hive.id}">${t('apiaries.hives.editButton')}</button>
                      <button type="button" class="btn btn-outline-danger w-100 w-md-auto" data-action="delete-hive" data-hive-id="${hive.id}">${t('apiaries.hives.deleteButton')}</button>
                    </div>
                  </div>

                  ${hiveSupersPanelMarkup(hive, panelState)}
                  ${hiveInspectionsPanelMarkup(hive, panelState)}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderHivesSection() {
  const hivesElement = document.getElementById('apiary-hives-section');
  if (!hivesElement) {
    return;
  }

  hivesElement.innerHTML = hivesSectionMarkup();

  hives.forEach((hive) => {
    const panelState = getHivePanelState(hive.id);
    if (!panelState.expanded) {
      return;
    }

    const supersContainerEl = document.getElementById(`hive-supers-section-${hive.id}`);
    if (supersContainerEl) {
      void initSupersSection({
        hiveId: hive.id,
        containerEl: supersContainerEl,
        onChanged: () => initApiarySummary(currentApiaryId)
      });
    }

    const containerEl = document.getElementById(`hive-inspections-section-${hive.id}`);
    if (!containerEl) {
      return;
    }

    initInspectionsSection({
      hiveId: hive.id,
      containerEl
    });
  });
}

function setHiveSubmitState(saving) {
  isHiveSaving = saving;

  const submitButton = document.getElementById('hive-modal-submit');
  const submitText = document.querySelector('[data-role="hive-submit-text"]');
  if (!submitButton || !submitText) {
    return;
  }

  submitButton.disabled = saving;
  submitText.innerHTML = saving
    ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.actions.saving')}`
    : t('common.save');
}

function openHiveModal(mode, hive = null) {
  const titleElement = document.getElementById('hive-modal-title');
  const formElement = document.getElementById('hive-modal-form');
  const codeInput = document.getElementById('hive-code');
  const notesInput = document.getElementById('hive-notes');

  if (!titleElement || !formElement || !codeInput || !notesInput || !hiveModalInstance) {
    return;
  }

  editingHiveId = mode === 'edit' ? hive?.id || null : null;
  titleElement.textContent = mode === 'edit' ? t('apiaries.hives.editButton') : t('apiaries.hives.addButton');
  formElement.reset();

  codeInput.value = hive?.code || '';
  notesInput.value = hive?.notes || '';

  setHiveSubmitState(false);
  hiveModalInstance.show();
}

function renderContent() {
  const contentElement = document.getElementById('apiary-content');
  if (!contentElement) {
    return;
  }

  if (isLoading) {
    contentElement.innerHTML = `<div class="page-card"><p class="mb-0 text-secondary">${t('common.loading')}</p></div>`;
    return;
  }

  if (!currentApiary) {
    contentElement.innerHTML = `<div class="page-card"><p class="mb-0 text-secondary">${t('apiaries.errors.notFound')}</p></div>`;
    return;
  }

  contentElement.innerHTML = `
    <div id="apiary-honey-summary"></div>
    ${isEditMode ? editMarkup(currentApiary) : detailsMarkup(currentApiary)}
    <div id="apiary-hives-section"></div>
  `;

  renderApiarySummary(currentApiaryId);
  renderHivesSection();
}

async function loadApiary() {
  isLoading = true;
  renderContent();

  try {
    currentApiary = await getApiaryById(currentApiaryId);
    if (!currentApiary) {
      showToast(t('apiaries.errors.notFound'), t('common.error'));
      navigate('/apiaries', { replace: true });
      return;
    }
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
    renderContent();
  }
}

async function loadHives() {
  isHivesLoading = true;
  renderHivesSection();

  try {
    hives = await listHivesByApiary(currentApiaryId);
    reconcileHivePanels();
    await expandHiveFromUrl(true);
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isHivesLoading = false;
    renderHivesSection();
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
    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

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
  } finally {
    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

async function handleHiveSubmit(formElement) {
  const formData = new FormData(formElement);
  const code = String(formData.get('code') || '').trim();

  if (!code) {
    showToast(t('apiaries.hives.errors.codeRequired'), t('common.error'));
    return;
  }

  try {
    setHiveSubmitState(true);

    if (editingHiveId) {
      await updateHive(editingHiveId, {
        code,
        notes: formData.get('notes')
      });
      showToast(t('apiaries.hives.toasts.updateSuccess'), t('common.success'));
    } else {
      await createHive({
        apiary_id: currentApiaryId,
        code,
        notes: formData.get('notes')
      });
      showToast(t('apiaries.hives.toasts.createSuccess'), t('common.success'));
    }

    hiveModalInstance?.hide();
    await loadHives();
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  } finally {
    setHiveSubmitState(false);
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
    navigate('/apiaries', { replace: true });
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  }
}

async function handleHiveDelete(hiveId) {
  const confirmed = window.confirm(t('apiaries.hives.confirmDelete'));
  if (!confirmed) {
    return;
  }

  try {
    await deleteHive(hiveId);
    if (requestedHiveId === hiveId) {
      requestedHiveId = '';
      setHiveQueryParam(null);
    }
    showToast(t('apiaries.hives.toasts.deleteSuccess'), t('common.success'));
    await loadHives();
    await initApiarySummary(currentApiaryId);
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  }
}

export function render(params = {}) {
  currentApiaryId = params.id || '';
  requestedHiveId = params.hive || '';

  return `
    <section class="apiary-page">
      <h1 class="mb-4">${t('pages.apiary.title')}</h1>
      <div id="apiary-content"></div>
      ${hiveModalMarkup()}
    </section>
  `;
}

export function init() {
  isEditMode = false;
  currentApiary = null;
  isLoading = true;

  hives = [];
  isHivesLoading = true;
  editingHiveId = null;
  isHiveSaving = false;

  hivePanelsState = {};

  if (!requestedHiveId) {
    requestedHiveId = new URLSearchParams(window.location.search).get('hive') || '';
  }

  void initApiarySummary(currentApiaryId);
  renderContent();
  void loadApiary();

  const pageElement = document.querySelector('.apiary-page');
  if (!pageElement) {
    return;
  }

  const modalElement = document.getElementById('hive-modal');
  if (modalElement) {
    hiveModalInstance = Modal.getOrCreateInstance(modalElement);
    modalElement.addEventListener('hidden.bs.modal', () => {
      editingHiveId = null;
      setHiveSubmitState(false);
    });
  }

  void loadHives();

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
      return;
    }

    if (action === 'open-hive-create') {
      openHiveModal('create');
      return;
    }

    if (action === 'open-hive-edit') {
      const hiveId = actionElement.getAttribute('data-hive-id');
      const hive = hives.find((item) => item.id === hiveId);
      if (!hive) {
        return;
      }

      openHiveModal('edit', hive);
      return;
    }

    if (action === 'delete-hive') {
      const hiveId = actionElement.getAttribute('data-hive-id');
      if (hiveId) {
        void handleHiveDelete(hiveId);
      }
      return;
    }

    if (action === 'toggle-hive-panel') {
      const hiveId = actionElement.getAttribute('data-hive-id');
      if (!hiveId) {
        return;
      }

      const panelState = getHivePanelState(hiveId);
      const nextExpanded = !panelState.expanded;

      Object.keys(hivePanelsState).forEach((id) => {
        hivePanelsState[id].expanded = false;
      });

      panelState.expanded = nextExpanded;

      if (nextExpanded) {
        requestedHiveId = hiveId;
        setHiveQueryParam(hiveId);
      } else {
        requestedHiveId = '';
        setHiveQueryParam(null);
      }

      renderHivesSection();
      return;
    }
  });

  pageElement.addEventListener('submit', (event) => {
    const hiveFormElement = event.target.closest('#hive-modal-form');
    if (hiveFormElement) {
      event.preventDefault();
      if (!isHiveSaving) {
        void handleHiveSubmit(hiveFormElement);
      }
      return;
    }

    const apiaryFormElement = event.target.closest('#apiary-edit-form');
    if (apiaryFormElement) {
      event.preventDefault();
      void handleEditSubmit(apiaryFormElement);
      return;
    }

  });
}
