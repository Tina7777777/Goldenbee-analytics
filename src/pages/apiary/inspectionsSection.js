import { Modal } from 'bootstrap';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { createInspection, deleteInspection, listInspectionsByHive } from '../../services/inspectionsService.js';
import { formatDateTime } from '../../utils/dateTime.js';

const INSPECTIONS_LIMIT = 5;
const stateByHive = {};
const containersByHive = new Map();
const callbacksByHive = new Map();

let inspectionModalInstance = null;
let currentInspectionHiveId = '';
let isInspectionSaving = false;
let isModalInitialized = false;

function createDefaultHiveState() {
  return {
    inspectionsLoading: false,
    hasLoadedInspections: false,
    inspections: [],
    deletingInspectionById: {}
  };
}

function getHiveState(hiveId) {
  if (!stateByHive[hiveId]) {
    stateByHive[hiveId] = createDefaultHiveState();
  }

  return stateByHive[hiveId];
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  return formatDateTime(value, { empty: '-' });
}

function getSwarmingStateLabel(value) {
  const state = String(value || 'none');
  return t(`apiaries.hives.inspections.swarming.${state}`);
}

function getInspectionsFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('apiaries.hives.inspections.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('apiaries.hives.inspections.errors.missingConfig');
  }

  return t('apiaries.hives.inspections.errors.generic');
}

function inspectionsSummaryMarkup(inspection) {
  return `${t('apiaries.hives.inspections.summary.brood')}: ${inspection.brood_frames ?? '-'} • ${t('apiaries.hives.inspections.summary.honeyPollen')}: ${inspection.honey_pollen_frames ?? '-'} • ${t('apiaries.hives.inspections.summary.total')}: ${inspection.total_frames ?? '-'}`;
}

function inspectionsListMarkup(hiveId, hiveState) {
  if (hiveState.inspectionsLoading) {
    return `<p class="mb-0 text-secondary">${t('common.loading')}</p>`;
  }

  if (!hiveState.inspections.length) {
    return `<p class="mb-0 text-secondary">${t('apiaries.hives.inspections.empty')}</p>`;
  }

  return `
    <div class="vstack gap-2">
      ${hiveState.inspections
        .slice(0, 3)
        .map((inspection) => {
          const isImportant = Boolean(inspection.important);
          const deleting = Boolean(hiveState.deletingInspectionById[inspection.id]);

          return `
            <article class="rounded p-3 ${isImportant ? 'border border-warning-subtle bg-warning-subtle' : 'border'}">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-1">
                <p class="mb-0 fw-semibold">${formatDate(inspection.inspected_at || inspection.created_at)}</p>
                ${
                  isImportant
                    ? `<span class="badge text-bg-warning align-self-start align-self-md-center">${t('apiaries.hives.inspections.importantBadge')}</span>`
                    : ''
                }
              </div>
              <p class="mb-1 small">${inspectionsSummaryMarkup(inspection)}</p>
              <p class="mb-1 small text-secondary">${t('apiaries.hives.inspections.summary.swarming')}: ${getSwarmingStateLabel(inspection.swarming_state)}</p>
              <p class="mb-2 small text-secondary">${t('apiaries.hives.inspections.summary.flags')}: ${inspection.eggs_present ? t('apiaries.hives.inspections.summary.yes') : t('apiaries.hives.inspections.summary.no')} / ${inspection.queen_seen ? t('apiaries.hives.inspections.summary.yes') : t('apiaries.hives.inspections.summary.no')}</p>
              ${inspection.notes ? `<p class="mb-2 small">${escapeHtml(inspection.notes)}</p>` : ''}
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-inspection" data-hive-id="${hiveId}" data-inspection-id="${inspection.id}" ${deleting ? 'disabled' : ''}>
                  ${
                    deleting
                      ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.inspections.actions.saving')}`
                      : t('apiaries.hives.inspections.deleteButton')
                  }
                </button>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function inspectionModalMarkup() {
  return `
    <div class="modal fade" id="inspection-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <form id="inspection-modal-form" novalidate>
            <div class="modal-header">
              <h2 class="modal-title fs-5">${t('apiaries.hives.inspections.newButton')}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body vstack gap-3">
              <div class="row g-2">
                <div class="col-12 col-md-4">
                  <label class="form-label" for="inspection-brood-frames">${t('apiaries.hives.inspections.form.broodFrames')}</label>
                  <input id="inspection-brood-frames" name="brood_frames" type="number" min="0" class="form-control" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label" for="inspection-honey-pollen-frames">${t('apiaries.hives.inspections.form.honeyPollenFrames')}</label>
                  <input id="inspection-honey-pollen-frames" name="honey_pollen_frames" type="number" min="0" class="form-control" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label" for="inspection-total-frames">${t('apiaries.hives.inspections.form.totalFrames')}</label>
                  <input id="inspection-total-frames" name="total_frames" type="number" min="0" class="form-control" />
                </div>
              </div>

              <div>
                <label class="form-label" for="inspection-swarming-state">${t('apiaries.hives.inspections.form.swarmingState')}</label>
                <select id="inspection-swarming-state" name="swarming_state" class="form-select">
                  <option value="none">${t('apiaries.hives.inspections.swarming.none')}</option>
                  <option value="suspected">${t('apiaries.hives.inspections.swarming.suspected')}</option>
                  <option value="swarmed">${t('apiaries.hives.inspections.swarming.swarmed')}</option>
                  <option value="split">${t('apiaries.hives.inspections.swarming.split')}</option>
                </select>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="true" id="inspection-eggs-present" name="eggs_present" />
                <label class="form-check-label" for="inspection-eggs-present">${t('apiaries.hives.inspections.form.eggsPresent')}</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="true" id="inspection-queen-seen" name="queen_seen" />
                <label class="form-check-label" for="inspection-queen-seen">${t('apiaries.hives.inspections.form.queenSeen')}</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="true" id="inspection-important" name="important" />
                <label class="form-check-label" for="inspection-important">${t('apiaries.hives.inspections.form.important')}</label>
              </div>

              <div>
                <label class="form-label" for="inspection-notes">${t('apiaries.hives.inspections.form.notes')}</label>
                <textarea id="inspection-notes" name="notes" rows="3" class="form-control"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${t('common.cancel')}</button>
              <button type="submit" class="btn btn-primary" id="inspection-modal-submit">
                <span data-role="inspection-submit-text">${t('common.save')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function setInspectionSubmitState(saving) {
  isInspectionSaving = saving;

  const submitButton = document.getElementById('inspection-modal-submit');
  const submitText = document.querySelector('[data-role="inspection-submit-text"]');
  if (!submitButton || !submitText) {
    return;
  }

  submitButton.disabled = saving;
  submitText.innerHTML = saving
    ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.inspections.actions.saving')}`
    : t('common.save');
}

function renderSection(hiveId) {
  const hiveState = getHiveState(hiveId);
  return `
    <div class="pt-3" data-inspections-container="${hiveId}">
      <div class="border rounded p-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h3 class="h6 mb-0">${t('apiaries.hives.inspections.title')}</h3>
          <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="open-inspection-create" data-hive-id="${hiveId}">
            ${t('apiaries.hives.inspections.newButton')}
          </button>
        </div>

        ${inspectionsListMarkup(hiveId, hiveState)}
      </div>
    </div>
  `;
}

function renderIntoContainer(hiveId) {
  const containerEl = containersByHive.get(hiveId);
  if (!containerEl) {
    return;
  }

  containerEl.innerHTML = renderSection(hiveId);
}

async function loadInspections(hiveId) {
  const hiveState = getHiveState(hiveId);
  hiveState.inspectionsLoading = true;
  renderIntoContainer(hiveId);

  try {
    hiveState.inspections = await listInspectionsByHive(hiveId, INSPECTIONS_LIMIT);
    hiveState.hasLoadedInspections = true;
  } catch (error) {
    showToast(getInspectionsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.inspectionsLoading = false;
    renderIntoContainer(hiveId);
  }
}

function openInspectionModal(hiveId) {
  if (!inspectionModalInstance || !hiveId) {
    return;
  }

  const formElement = document.getElementById('inspection-modal-form');
  if (!formElement) {
    return;
  }

  currentInspectionHiveId = hiveId;
  formElement.reset();

  const swarmingSelect = document.getElementById('inspection-swarming-state');
  if (swarmingSelect) {
    swarmingSelect.value = 'none';
  }

  setInspectionSubmitState(false);
  inspectionModalInstance.show();
}

async function handleInspectionSubmit(formElement) {
  if (!currentInspectionHiveId) {
    return;
  }

  const formData = new FormData(formElement);

  const parseOptionalNumber = (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized.replaceAll(',', '.'));
    return Number.isNaN(parsed) ? null : parsed;
  };

  try {
    setInspectionSubmitState(true);

    await createInspection({
      hive_id: currentInspectionHiveId,
      brood_frames: parseOptionalNumber(formData.get('brood_frames')),
      honey_pollen_frames: parseOptionalNumber(formData.get('honey_pollen_frames')),
      total_frames: parseOptionalNumber(formData.get('total_frames')),
      swarming_state: formData.get('swarming_state') || 'none',
      eggs_present: formData.get('eggs_present') !== null,
      queen_seen: formData.get('queen_seen') !== null,
      important: formData.get('important') !== null,
      notes: String(formData.get('notes') || '').trim() || null
    });

    const hiveId = currentInspectionHiveId;
    inspectionModalInstance?.hide();
    showToast(t('apiaries.hives.inspections.toasts.createSuccess'), t('common.success'));
    await loadInspections(hiveId);
    callbacksByHive.get(hiveId)?.();
  } catch (error) {
    showToast(getInspectionsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    setInspectionSubmitState(false);
  }
}

async function handleInspectionDelete(hiveId, inspectionId) {
  const hiveState = getHiveState(hiveId);
  if (hiveState.deletingInspectionById[inspectionId]) {
    return;
  }

  const confirmed = window.confirm(t('apiaries.hives.inspections.confirmDelete'));
  if (!confirmed) {
    return;
  }

  try {
    hiveState.deletingInspectionById[inspectionId] = true;
    renderIntoContainer(hiveId);

    await deleteInspection(inspectionId);
    showToast(t('apiaries.hives.inspections.toasts.deleteSuccess'), t('common.success'));
    await loadInspections(hiveId);
    callbacksByHive.get(hiveId)?.();
  } catch (error) {
    showToast(getInspectionsFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.deletingInspectionById[inspectionId] = false;
    renderIntoContainer(hiveId);
  }
}

function ensureInspectionModal() {
  let modalElement = document.getElementById('inspection-modal');
  if (!modalElement) {
    document.body.insertAdjacentHTML('beforeend', inspectionModalMarkup());
    modalElement = document.getElementById('inspection-modal');
  }

  if (!modalElement) {
    return;
  }

  inspectionModalInstance = Modal.getOrCreateInstance(modalElement);

  if (isModalInitialized) {
    return;
  }

  modalElement.addEventListener('hidden.bs.modal', () => {
    currentInspectionHiveId = '';
    setInspectionSubmitState(false);
  });

  modalElement.addEventListener('submit', (event) => {
    const inspectionFormElement = event.target.closest('#inspection-modal-form');
    if (!inspectionFormElement) {
      return;
    }

    event.preventDefault();
    if (!isInspectionSaving) {
      void handleInspectionSubmit(inspectionFormElement);
    }
  });

  isModalInitialized = true;
}

function attachSectionListeners(hiveId, containerEl) {
  if (containerEl.dataset.inspectionsBound === 'true') {
    return;
  }

  containerEl.dataset.inspectionsBound = 'true';
  containerEl.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement || !containerEl.contains(actionElement)) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

    if (action === 'open-inspection-create') {
      openInspectionModal(hiveId);
      return;
    }

    if (action === 'delete-inspection') {
      const targetHiveId = actionElement.getAttribute('data-hive-id');
      const inspectionId = actionElement.getAttribute('data-inspection-id');
      if (targetHiveId && inspectionId) {
        void handleInspectionDelete(targetHiveId, inspectionId);
      }
    }
  });
}

export function renderInspectionsSection(hiveId) {
  return `
    <div id="hive-inspections-section-${hiveId}" data-inspections-host="${hiveId}">
      ${renderSection(hiveId)}
    </div>
  `;
}

export function initInspectionsSection({ hiveId, containerEl, onChanged } = {}) {
  if (!hiveId || !containerEl) {
    return;
  }

  ensureInspectionModal();

  containersByHive.set(hiveId, containerEl);
  if (typeof onChanged === 'function') {
    callbacksByHive.set(hiveId, onChanged);
  }

  attachSectionListeners(hiveId, containerEl);
  renderIntoContainer(hiveId);

  const hiveState = getHiveState(hiveId);
  if (!hiveState.hasLoadedInspections && !hiveState.inspectionsLoading) {
    void loadInspections(hiveId);
  }
}