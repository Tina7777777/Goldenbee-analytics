import { Modal } from 'bootstrap';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { createHive, deleteHive, listHivesByApiary, updateHive } from '../../services/hivesService.js';
import { formatDateTime } from '../../utils/dateTime.js';
import { initHarvestsSection, renderHarvestsSection } from './harvestsSection.js';
import { initInspectionsSection, renderInspectionsSection } from './inspectionsSection.js';
import { initSupersSection, renderSupersSection } from './supersSection.js';

let currentApiaryId = '';
let hives = [];
let isHivesLoading = false;
let editingHiveId = null;
let hiveModalInstance = null;
let isHiveSaving = false;

let hivePanelsState = {};
let requestedHiveId = '';
let initializedApiaryId = '';

let currentContainerEl = null;
let onHiveChangedCallback = null;
let onDataChangedCallback = null;

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

function formatDate(value) {
  return formatDateTime(value, { empty: '-' });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

function normalizeHiveCode(value) {
  return String(value || '')
    .replaceAll(',', '.')
    .trim();
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

function hivesListMarkup() {
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

                  ${
                    panelState.expanded
                      ? `${renderSupersSection(hive.id)}${renderInspectionsSection(hive.id)}${renderHarvestsSection(hive.id)}`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderHivesListOnly() {
  const listContainer = document.getElementById('apiary-hives-list');
  if (!listContainer) {
    return;
  }

  listContainer.innerHTML = hivesListMarkup();

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
        onChanged: async () => {
          if (typeof onDataChangedCallback === 'function') {
            await onDataChangedCallback();
          }
        }
      });
    }

    const inspectionsContainerEl = document.getElementById(`hive-inspections-section-${hive.id}`);
    if (inspectionsContainerEl) {
      initInspectionsSection({
        hiveId: hive.id,
        containerEl: inspectionsContainerEl
      });
    }

    const harvestsContainerEl = document.getElementById(`hive-harvests-section-${hive.id}`);
    if (harvestsContainerEl) {
      initHarvestsSection({
        hiveId: hive.id,
        containerEl: harvestsContainerEl,
        onChanged: async () => {
          if (typeof onDataChangedCallback === 'function') {
            await onDataChangedCallback();
          }
        }
      });
    }
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

async function loadHives() {
  isHivesLoading = true;
  renderHivesListOnly();

  try {
    hives = await listHivesByApiary(currentApiaryId);
    reconcileHivePanels();
    await expandHiveFromRequested(true);
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isHivesLoading = false;
    renderHivesListOnly();
  }
}

async function expandHiveFromRequested(scroll = false) {
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

  renderHivesListOnly();

  const supersContainerEl = document.getElementById(`hive-supers-section-${requestedHiveId}`);
  if (supersContainerEl) {
    await initSupersSection({
      hiveId: requestedHiveId,
      containerEl: supersContainerEl,
      onChanged: async () => {
        if (typeof onDataChangedCallback === 'function') {
          await onDataChangedCallback();
        }
      }
    });
  }

  if (scroll) {
    setTimeout(() => {
      scrollHiveIntoView(requestedHiveId);
    }, 80);
  }
}

async function handleHiveSubmit(formElement) {
  const formData = new FormData(formElement);
  const code = normalizeHiveCode(formData.get('code'));

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
      if (typeof onHiveChangedCallback === 'function') {
        await onHiveChangedCallback({ type: 'update', hiveId: editingHiveId });
      }
    } else {
      await createHive({
        apiary_id: currentApiaryId,
        code,
        notes: formData.get('notes')
      });
      showToast(t('apiaries.hives.toasts.createSuccess'), t('common.success'));
      if (typeof onHiveChangedCallback === 'function') {
        await onHiveChangedCallback({ type: 'create' });
      }
    }

    hiveModalInstance?.hide();
    await loadHives();
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  } finally {
    setHiveSubmitState(false);
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
    if (typeof onHiveChangedCallback === 'function') {
      await onHiveChangedCallback({ type: 'delete', hiveId });
    }
    await loadHives();
  } catch (error) {
    showToast(getHivesFriendlyErrorMessage(error), t('common.error'));
  }
}

function attachListeners(containerEl) {
  if (containerEl.dataset.hivesBound === 'true') {
    return;
  }

  containerEl.dataset.hivesBound = 'true';

  containerEl.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement || !containerEl.contains(actionElement)) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

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

      renderHivesListOnly();
    }
  });

  containerEl.addEventListener('submit', (event) => {
    const hiveFormElement = event.target.closest('#hive-modal-form');
    if (!hiveFormElement || !containerEl.contains(hiveFormElement)) {
      return;
    }

    event.preventDefault();
    if (!isHiveSaving) {
      void handleHiveSubmit(hiveFormElement);
    }
  });
}

function initHiveModal(containerEl) {
  const modalElement = containerEl.querySelector('#hive-modal');
  if (!modalElement) {
    return;
  }

  hiveModalInstance = Modal.getOrCreateInstance(modalElement);

  if (modalElement.dataset.hiveModalBound === 'true') {
    return;
  }

  modalElement.dataset.hiveModalBound = 'true';
  modalElement.addEventListener('hidden.bs.modal', () => {
    editingHiveId = null;
    setHiveSubmitState(false);
  });
}

export function renderHivesSection() {
  return `
    <div id="apiary-hives-root">
      <div id="apiary-hives-list"></div>
      ${hiveModalMarkup()}
    </div>
  `;
}

export function initHivesSection({
  apiaryId,
  containerEl,
  onHiveChanged,
  onDataChanged
} = {}) {
  if (!apiaryId || !containerEl) {
    return;
  }

  const isApiaryChanged = initializedApiaryId !== apiaryId;
  initializedApiaryId = apiaryId;

  currentApiaryId = apiaryId;
  currentContainerEl = containerEl;
  onHiveChangedCallback = onHiveChanged || null;
  onDataChangedCallback = onDataChanged || null;

  if (isApiaryChanged) {
    hives = [];
    isHivesLoading = true;
    editingHiveId = null;
    isHiveSaving = false;
    hivePanelsState = {};
    requestedHiveId = new URLSearchParams(window.location.search).get('hive') || '';
  }

  containerEl.innerHTML = renderHivesSection();
  initHiveModal(containerEl);
  attachListeners(containerEl);
  renderHivesListOnly();

  if (isApiaryChanged) {
    void loadHives();
  }
}