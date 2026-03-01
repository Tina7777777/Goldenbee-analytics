import { Modal } from 'bootstrap';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { createHarvestWithItems, deleteHarvest, listHarvestsByHive } from '../../services/harvestsService.js';

const HARVESTS_LIMIT = 3;
const FILL_LEVEL_COEFFICIENTS = {
  very_full: 1.3,
  full: 1.0,
  medium: 0.55,
  low: 0.35,
  almost_empty: 0.15
};

const stateByHive = {};
const containersByHive = new Map();
const callbacksByHive = new Map();

let harvestModalInstance = null;
let isModalInitialized = false;
let currentHarvestHiveId = '';
let isHarvestSaving = false;
let harvestFormState = createDefaultFormState();

function createDefaultFormState() {
  return {
    notes: '',
    actualKgTotal: '',
    items: [createDefaultFormItem()]
  };
}

function createDefaultFormItem() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    frames_count: '',
    fill_level: 'full',
    notes: ''
  };
}

function createDefaultHiveState() {
  return {
    loading: false,
    harvests: [],
    deletingById: {}
  };
}

function getHiveState(hiveId) {
  if (!stateByHive[hiveId]) {
    stateByHive[hiveId] = createDefaultHiveState();
  }

  return stateByHive[hiveId];
}

function estimateForItem(item) {
  const frames = Number(String(item?.frames_count || '').replaceAll(',', '.'));
  const coeff = FILL_LEVEL_COEFFICIENTS[item?.fill_level] ?? 0;
  if (Number.isNaN(frames) || frames <= 0) {
    return 0;
  }

  return frames * coeff;
}

function formatKg(value) {
  return Number(value || 0).toFixed(1);
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

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getHarvestsFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('apiaries.hives.harvests.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('apiaries.hives.harvests.errors.missingConfig');
  }

  return t('apiaries.hives.harvests.errors.generic');
}

function getHarvestEstimatedTotal(harvest) {
  return (harvest.harvest_items || []).reduce((sum, item) => {
    if (item.estimated_kg !== null && item.estimated_kg !== undefined) {
      return sum + Number(item.estimated_kg || 0);
    }

    const frames = Number(item.frames_count || 0);
    const coeff = FILL_LEVEL_COEFFICIENTS[item.fill_level] ?? 0;
    return sum + frames * coeff;
  }, 0);
}

function getNotesPreview(notes) {
  const text = String(notes || '').trim();
  if (!text) {
    return '-';
  }

  if (text.length <= 80) {
    return text;
  }

  return `${text.slice(0, 80)}...`;
}

function harvestsListMarkup(hiveId, hiveState) {
  if (hiveState.loading) {
    return `<p class="mb-0 text-secondary">${t('common.loading')}</p>`;
  }

  if (!hiveState.harvests.length) {
    return `<p class="mb-0 text-secondary">${t('apiaries.hives.harvests.empty')}</p>`;
  }

  return `
    <div class="vstack gap-2">
      ${hiveState.harvests.slice(0, HARVESTS_LIMIT).map((harvest) => {
        const deleting = Boolean(hiveState.deletingById[harvest.id]);
        const estimatedTotal = getHarvestEstimatedTotal(harvest);
        const hasActual = harvest.actual_kg_total !== null && harvest.actual_kg_total !== undefined;

        return `
          <article class="border rounded p-3">
            <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
              <p class="mb-0 fw-semibold">${formatDate(harvest.harvested_at)}</p>
              <button type="button" class="btn btn-sm btn-outline-danger align-self-start" data-action="delete-harvest" data-hive-id="${hiveId}" data-harvest-id="${harvest.id}" ${deleting ? 'disabled' : ''}>
                ${
                  deleting
                    ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.harvests.actions.saving')}`
                    : t('apiaries.hives.harvests.deleteButton')
                }
              </button>
            </div>
            <p class="mb-1 small">${t('apiaries.hives.harvests.estimatedTotal')}: <strong>${formatKg(estimatedTotal)} ${t('apiaries.hives.supers.kgUnit')}</strong></p>
            <p class="mb-1 small">${t('apiaries.hives.harvests.actualTotal')}: <strong>${hasActual ? `${formatKg(harvest.actual_kg_total)} ${t('apiaries.hives.supers.kgUnit')}` : '-'}</strong></p>
            <p class="mb-0 small text-secondary">${t('apiaries.hives.harvests.notes')}: ${escapeHtml(getNotesPreview(harvest.notes))}</p>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderSectionContent(hiveId) {
  const hiveState = getHiveState(hiveId);

  return `
    <div class="pt-3">
      <div class="border rounded p-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h3 class="h6 mb-0">${t('apiaries.hives.harvests.title')}</h3>
          <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="open-harvest-create" data-hive-id="${hiveId}">${t('apiaries.hives.harvests.newButton')}</button>
        </div>

        ${harvestsListMarkup(hiveId, hiveState)}
      </div>
    </div>
  `;
}

function renderIntoContainer(hiveId) {
  const containerEl = containersByHive.get(hiveId);
  if (!containerEl) {
    return;
  }

  containerEl.innerHTML = renderSectionContent(hiveId);
}

async function loadHarvests(hiveId) {
  const hiveState = getHiveState(hiveId);
  hiveState.loading = true;
  renderIntoContainer(hiveId);

  try {
    hiveState.harvests = await listHarvestsByHive(hiveId, HARVESTS_LIMIT);
  } catch (error) {
    showToast(getHarvestsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.loading = false;
    renderIntoContainer(hiveId);
  }
}

function fillLevelOptionsMarkup(selected) {
  const options = ['very_full', 'full', 'medium', 'low', 'almost_empty'];
  return options
    .map((value) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${t(`apiaries.hives.harvests.fillLevels.${value}`)}</option>`)
    .join('');
}

function harvestModalMarkup() {
  return `
    <div class="modal fade" id="harvest-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
        <div class="modal-content">
          <form id="harvest-modal-form" novalidate>
            <div class="modal-header">
              <h2 class="modal-title fs-5">${t('apiaries.hives.harvests.newButton')}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="harvest-modal-body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${t('common.cancel')}</button>
              <button type="submit" class="btn btn-primary" id="harvest-modal-submit">
                <span data-role="harvest-submit-text">${t('common.save')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function modalItemsMarkup() {
  return harvestFormState.items
    .map((item, index) => {
      const estimatedKg = estimateForItem(item);

      return `
        <div class="border rounded p-2 mb-2" data-role="harvest-item-row" data-item-id="${item.id}">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <p class="mb-0 small fw-semibold">${t('apiaries.hives.harvests.itemLabel')} ${index + 1}</p>
            <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-harvest-item" data-item-id="${item.id}" ${harvestFormState.items.length <= 1 ? 'disabled' : ''}>${t('apiaries.hives.harvests.removeRow')}</button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-4">
              <label class="form-label" for="harvest-frames-${item.id}">${t('apiaries.hives.harvests.framesCount')}</label>
              <input id="harvest-frames-${item.id}" class="form-control" type="number" min="1" step="1" data-field="frames_count" data-item-id="${item.id}" value="${escapeHtml(item.frames_count)}" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label" for="harvest-fill-${item.id}">${t('apiaries.hives.harvests.fillLevel')}</label>
              <select id="harvest-fill-${item.id}" class="form-select" data-field="fill_level" data-item-id="${item.id}">
                ${fillLevelOptionsMarkup(item.fill_level)}
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">${t('apiaries.hives.harvests.rowEstimated')}</label>
              <p class="form-control-plaintext fw-semibold mb-0">${formatKg(estimatedKg)} ${t('apiaries.hives.supers.kgUnit')}</p>
            </div>
          </div>

          <div class="mt-2">
            <label class="form-label" for="harvest-item-notes-${item.id}">${t('apiaries.hives.harvests.itemNotes')}</label>
            <input id="harvest-item-notes-${item.id}" class="form-control" data-field="notes" data-item-id="${item.id}" value="${escapeHtml(item.notes)}" />
          </div>
        </div>
      `;
    })
    .join('');
}

function renderModalBody() {
  const modalBody = document.getElementById('harvest-modal-body');
  if (!modalBody) {
    return;
  }

  const totalEstimatedKg = harvestFormState.items.reduce((sum, item) => sum + estimateForItem(item), 0);

  modalBody.innerHTML = `
    <div class="vstack gap-3">
      <div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label mb-0">${t('apiaries.hives.harvests.groupedItems')}</label>
          <button type="button" class="btn btn-sm btn-outline-primary" data-action="add-harvest-item">${t('apiaries.hives.harvests.addRow')}</button>
        </div>
        ${modalItemsMarkup()}
      </div>

      <div class="border rounded p-2 bg-light-subtle">
        <p class="mb-0 fw-semibold">${t('apiaries.hives.harvests.computedTotal')}: ${formatKg(totalEstimatedKg)} ${t('apiaries.hives.supers.kgUnit')}</p>
      </div>

      <div>
        <label class="form-label" for="harvest-actual-total">${t('apiaries.hives.harvests.actualTotalOptional')}</label>
        <input id="harvest-actual-total" class="form-control" type="number" min="0" step="0.01" data-role="harvest-actual-total" value="${escapeHtml(harvestFormState.actualKgTotal)}" />
      </div>

      <div>
        <label class="form-label" for="harvest-notes">${t('apiaries.hives.harvests.notes')}</label>
        <textarea id="harvest-notes" class="form-control" rows="3" data-role="harvest-notes">${escapeHtml(harvestFormState.notes)}</textarea>
      </div>
    </div>
  `;
}

function setHarvestSubmitState(saving) {
  isHarvestSaving = saving;

  const submitButton = document.getElementById('harvest-modal-submit');
  const submitText = document.querySelector('[data-role="harvest-submit-text"]');
  if (!submitButton || !submitText) {
    return;
  }

  submitButton.disabled = saving;
  submitText.innerHTML = saving
    ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.harvests.actions.saving')}`
    : t('common.save');
}

function updateFormItem(itemId, field, value) {
  harvestFormState.items = harvestFormState.items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      [field]: value
    };
  });
}

function ensureHarvestModal() {
  let modalElement = document.getElementById('harvest-modal');
  if (!modalElement) {
    document.body.insertAdjacentHTML('beforeend', harvestModalMarkup());
    modalElement = document.getElementById('harvest-modal');
  }

  if (!modalElement) {
    return;
  }

  harvestModalInstance = Modal.getOrCreateInstance(modalElement);

  if (isModalInitialized) {
    return;
  }

  modalElement.addEventListener('hidden.bs.modal', () => {
    setHarvestSubmitState(false);
    currentHarvestHiveId = '';
    harvestFormState = createDefaultFormState();
    renderModalBody();
  });

  modalElement.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement || !modalElement.contains(actionElement)) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

    if (action === 'add-harvest-item') {
      harvestFormState.items.push(createDefaultFormItem());
      renderModalBody();
      return;
    }

    if (action === 'remove-harvest-item') {
      const itemId = actionElement.getAttribute('data-item-id');
      if (!itemId || harvestFormState.items.length <= 1) {
        return;
      }

      harvestFormState.items = harvestFormState.items.filter((item) => item.id !== itemId);
      renderModalBody();
    }
  });

  modalElement.addEventListener('input', (event) => {
    const itemFieldEl = event.target.closest('[data-field]');
    if (itemFieldEl && modalElement.contains(itemFieldEl)) {
      const itemId = itemFieldEl.getAttribute('data-item-id');
      const field = itemFieldEl.getAttribute('data-field');
      if (itemId && field) {
        updateFormItem(itemId, field, itemFieldEl.value);
        renderModalBody();
      }
      return;
    }

    const actualTotalEl = event.target.closest('[data-role="harvest-actual-total"]');
    if (actualTotalEl && modalElement.contains(actualTotalEl)) {
      harvestFormState.actualKgTotal = actualTotalEl.value;
      return;
    }

    const notesEl = event.target.closest('[data-role="harvest-notes"]');
    if (notesEl && modalElement.contains(notesEl)) {
      harvestFormState.notes = notesEl.value;
    }
  });

  modalElement.addEventListener('submit', (event) => {
    const formElement = event.target.closest('#harvest-modal-form');
    if (!formElement || !modalElement.contains(formElement)) {
      return;
    }

    event.preventDefault();
    if (!isHarvestSaving) {
      void handleHarvestSubmit();
    }
  });

  isModalInitialized = true;
}

function openHarvestModal(hiveId) {
  if (!harvestModalInstance || !hiveId) {
    return;
  }

  currentHarvestHiveId = hiveId;
  harvestFormState = createDefaultFormState();
  setHarvestSubmitState(false);
  renderModalBody();
  harvestModalInstance.show();
}

async function handleHarvestSubmit() {
  if (!currentHarvestHiveId) {
    return;
  }

  const validItems = harvestFormState.items.filter((item) => {
    const frames = Number(String(item.frames_count || '').replaceAll(',', '.'));
    return !Number.isNaN(frames) && frames > 0 && Object.hasOwn(FILL_LEVEL_COEFFICIENTS, item.fill_level);
  });

  if (!validItems.length) {
    showToast(t('apiaries.hives.harvests.errors.itemRequired'), t('common.error'));
    return;
  }

  try {
    setHarvestSubmitState(true);

    await createHarvestWithItems({
      hive_id: currentHarvestHiveId,
      notes: harvestFormState.notes,
      actual_kg_total: harvestFormState.actualKgTotal,
      items: validItems.map((item) => ({
        frames_count: item.frames_count,
        fill_level: item.fill_level,
        notes: item.notes
      }))
    });

    harvestModalInstance?.hide();
    showToast(t('apiaries.hives.harvests.toasts.createSuccess'), t('common.success'));
    await loadHarvests(currentHarvestHiveId);
    await callbacksByHive.get(currentHarvestHiveId)?.();
  } catch (error) {
    showToast(getHarvestsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    setHarvestSubmitState(false);
  }
}

async function handleHarvestDelete(hiveId, harvestId) {
  const hiveState = getHiveState(hiveId);
  if (hiveState.deletingById[harvestId]) {
    return;
  }

  const confirmed = window.confirm(t('apiaries.hives.harvests.confirmDelete'));
  if (!confirmed) {
    return;
  }

  try {
    hiveState.deletingById[harvestId] = true;
    renderIntoContainer(hiveId);

    await deleteHarvest(harvestId);
    showToast(t('apiaries.hives.harvests.toasts.deleteSuccess'), t('common.success'));
    await loadHarvests(hiveId);
    await callbacksByHive.get(hiveId)?.();
  } catch (error) {
    showToast(getHarvestsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.deletingById[harvestId] = false;
    renderIntoContainer(hiveId);
  }
}

function attachSectionListeners(hiveId, containerEl) {
  if (containerEl.dataset.harvestsBound === 'true') {
    return;
  }

  containerEl.dataset.harvestsBound = 'true';

  containerEl.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement || !containerEl.contains(actionElement)) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

    if (action === 'open-harvest-create') {
      openHarvestModal(hiveId);
      return;
    }

    if (action === 'delete-harvest') {
      const targetHiveId = actionElement.getAttribute('data-hive-id');
      const harvestId = actionElement.getAttribute('data-harvest-id');
      if (targetHiveId && harvestId) {
        void handleHarvestDelete(targetHiveId, harvestId);
      }
    }
  });
}

export function renderHarvestsSection(hiveId) {
  return `
    <div id="hive-harvests-section-${hiveId}" data-harvests-host="${hiveId}">
      ${renderSectionContent(hiveId)}
    </div>
  `;
}

export function initHarvestsSection({ hiveId, containerEl, onChanged } = {}) {
  if (!hiveId || !containerEl) {
    return;
  }

  ensureHarvestModal();
  containersByHive.set(hiveId, containerEl);

  if (typeof onChanged === 'function') {
    callbacksByHive.set(hiveId, onChanged);
  }

  attachSectionListeners(hiveId, containerEl);
  renderIntoContainer(hiveId);

  const hiveState = getHiveState(hiveId);
  if (!hiveState.loading && !hiveState.harvests.length) {
    void loadHarvests(hiveId);
  }
}
