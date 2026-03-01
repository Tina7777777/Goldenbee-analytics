import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { createSnapshot, listSnapshotsBySuper } from '../../services/superSnapshotsService.js';
import { installSuper, listSupersByHive, removeSuper } from '../../services/supersService.js';

const SNAPSHOT_LIMIT = 1;

const stateByHive = {};
const containersByHive = new Map();
const callbacksByHive = new Map();

function createDefaultHiveState() {
  return {
    supersLoading: false,
    hasLoadedSupers: false,
    supers: [],
    snapshotsBySuper: {},
    installFormOpen: false,
    installPosition: '',
    installNotes: '',
    savingInstall: false,
    savingRemoveBySuper: {},
    savingSnapshotBySuper: {}
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
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('bg-BG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatKgFromFullness(fullness) {
  if (fullness === null || fullness === undefined) {
    return '-';
  }

  return `${(Number(fullness) / 10).toFixed(1)} ${t('apiaries.hives.supers.kgUnit')}`;
}

function getSupersFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('apiaries.hives.supers.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('apiaries.hives.supers.errors.missingConfig');
  }

  return t('apiaries.hives.supers.errors.generic');
}

function getFreeSuperPositions(activeSupers) {
  const occupiedPositions = new Set(activeSupers.map((superItem) => Number(superItem.position)));

  return [1, 2, 3, 4, 5].filter((position) => !occupiedPositions.has(position));
}

function superInstallFormMarkup(hiveId, hiveState, freePositions) {
  if (!hiveState.installFormOpen) {
    return '';
  }

  return `
    <form class="border rounded p-3 mb-3" data-role="install-super-form" data-hive-id="${hiveId}" novalidate>
      <div class="vstack gap-3">
        <div>
          <label class="form-label" for="install-position-${hiveId}">${t('apiaries.hives.supers.install.position')}</label>
          <select id="install-position-${hiveId}" name="position" class="form-select" required>
            <option value="">${t('apiaries.hives.supers.install.choosePosition')}</option>
            ${freePositions
              .map(
                (position) =>
                  `<option value="${position}" ${String(hiveState.installPosition) === String(position) ? 'selected' : ''}>${t('apiaries.hives.supers.positionLabel')} ${position}</option>`
              )
              .join('')}
          </select>
        </div>

        <div>
          <label class="form-label" for="install-notes-${hiveId}">${t('apiaries.hives.supers.install.notes')}</label>
          <textarea id="install-notes-${hiveId}" name="notes" class="form-control" rows="2">${escapeHtml(hiveState.installNotes || '')}</textarea>
        </div>

        <div class="d-flex flex-column flex-md-row gap-2">
          <button type="submit" class="btn btn-primary w-100 w-md-auto" ${hiveState.savingInstall ? 'disabled' : ''}>
            ${
              hiveState.savingInstall
                ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.supers.actions.saving')}`
                : t('common.save')
            }
          </button>
          <button type="button" class="btn btn-outline-secondary w-100 w-md-auto" data-action="cancel-install-super" data-hive-id="${hiveId}" ${hiveState.savingInstall ? 'disabled' : ''}>${t('common.cancel')}</button>
        </div>
      </div>
    </form>
  `;
}

function activeSupersMarkup(hiveId, hiveState, activeSupers) {
  if (!activeSupers.length) {
    return `<p class="text-secondary mb-0">${t('apiaries.hives.supers.emptyActive')}</p>`;
  }

  return `
    <div class="vstack gap-2">
      ${activeSupers
        .map((superItem) => {
          const latestSnapshot = hiveState.snapshotsBySuper[superItem.id]?.[0] || null;
          const fullnessText = latestSnapshot ? `${Number(latestSnapshot.honey_fullness).toFixed(1)}%` : '-';
          const kgText = latestSnapshot ? formatKgFromFullness(latestSnapshot.honey_fullness) : '-';
          const savingSnapshot = Boolean(hiveState.savingSnapshotBySuper[superItem.id]);
          const savingRemove = Boolean(hiveState.savingRemoveBySuper[superItem.id]);

          return `
            <div class="border rounded p-3">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                <div>
                  <p class="mb-1 fw-semibold">${t('apiaries.hives.supers.positionLabel')} ${superItem.position}</p>
                  <p class="mb-0 small text-secondary">${t('apiaries.hives.supers.installedAt')}: ${formatDate(superItem.installed_at)}</p>
                </div>
                <div class="text-md-end">
                  <p class="mb-1 small">${t('apiaries.hives.supers.lastFullness')}: <strong>${fullnessText}</strong></p>
                  <p class="mb-0 small">${t('apiaries.hives.supers.estimatedKg')}: <strong>${kgText}</strong></p>
                </div>
              </div>

              <form class="vstack gap-2" data-role="super-snapshot-form" data-hive-id="${hiveId}" data-super-id="${superItem.id}" novalidate>
                <div>
                  <label class="form-label" for="snapshot-fullness-${superItem.id}">${t('apiaries.hives.supers.fullnessInput')}</label>
                  <input id="snapshot-fullness-${superItem.id}" name="honey_fullness" type="number" min="0" max="200" step="0.01" class="form-control" required />
                </div>
                <div>
                  <label class="form-label" for="snapshot-notes-${superItem.id}">${t('apiaries.hives.supers.snapshotNotes')}</label>
                  <input id="snapshot-notes-${superItem.id}" name="notes" class="form-control" />
                </div>
                <div class="d-flex flex-column flex-md-row gap-2">
                  <button type="submit" class="btn btn-outline-primary w-100 w-md-auto" ${savingSnapshot ? 'disabled' : ''}>
                    ${
                      savingSnapshot
                        ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.supers.actions.saving')}`
                        : t('apiaries.hives.supers.saveSnapshot')
                    }
                  </button>
                  <button type="button" class="btn btn-outline-danger w-100 w-md-auto" data-action="remove-super" data-hive-id="${hiveId}" data-super-id="${superItem.id}" ${savingRemove ? 'disabled' : ''}>
                    ${
                      savingRemove
                        ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('apiaries.hives.supers.actions.saving')}`
                        : t('apiaries.hives.supers.removeButton')
                    }
                  </button>
                </div>
              </form>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderSection(hiveId) {
  const hiveState = getHiveState(hiveId);

  if (hiveState.supersLoading) {
    return `
      <div class="pt-3">
        <div class="border rounded p-3">
          <p class="mb-0 text-secondary">${t('common.loading')}</p>
        </div>
      </div>
    `;
  }

  const activeSupers = hiveState.supers.filter((superItem) => !superItem.removed_at);
  const freePositions = getFreeSuperPositions(activeSupers);

  return `
    <div class="pt-3">
      <div class="border rounded p-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h3 class="h6 mb-0">${t('apiaries.hives.supers.title')}</h3>
          <button type="button" class="btn btn-outline-primary w-100 w-md-auto" data-action="toggle-install-super" data-hive-id="${hiveId}" ${freePositions.length ? '' : 'disabled'}>
            ${t('apiaries.hives.supers.addButton')}
          </button>
        </div>

        ${
          !freePositions.length
            ? `<p class="small text-secondary mb-3">${t('apiaries.hives.supers.noFreePositions')}</p>`
            : ''
        }

        ${superInstallFormMarkup(hiveId, hiveState, freePositions)}
        ${activeSupersMarkup(hiveId, hiveState, activeSupers)}
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

async function loadSupers(hiveId) {
  const hiveState = getHiveState(hiveId);
  hiveState.supersLoading = true;
  renderIntoContainer(hiveId);

  try {
    const supers = await listSupersByHive(hiveId);
    hiveState.supers = supers;

    const activeSupers = supers.filter((superItem) => !superItem.removed_at);
    const snapshotEntries = await Promise.all(
      activeSupers.map(async (superItem) => {
        const snapshots = await listSnapshotsBySuper(superItem.id, SNAPSHOT_LIMIT);
        return [superItem.id, snapshots];
      })
    );

    hiveState.snapshotsBySuper = Object.fromEntries(snapshotEntries);
    hiveState.hasLoadedSupers = true;
  } catch (error) {
    showToast(getSupersFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.supersLoading = false;
    renderIntoContainer(hiveId);
  }
}

async function triggerChanged(hiveId) {
  const onChanged = callbacksByHive.get(hiveId);
  if (typeof onChanged !== 'function') {
    return;
  }

  await onChanged();
}

async function handleInstallSuperSubmit(formElement) {
  const hiveId = formElement.getAttribute('data-hive-id');
  if (!hiveId) {
    return;
  }

  const hiveState = getHiveState(hiveId);
  if (hiveState.savingInstall) {
    return;
  }

  const formData = new FormData(formElement);
  const position = Number(formData.get('position'));
  const notes = formData.get('notes');

  if (!position || Number.isNaN(position)) {
    showToast(t('apiaries.hives.supers.errors.positionRequired'), t('common.error'));
    return;
  }

  const activeSupers = hiveState.supers.filter((superItem) => !superItem.removed_at);
  const freePositions = getFreeSuperPositions(activeSupers);
  if (!freePositions.includes(position)) {
    showToast(t('apiaries.hives.supers.errors.positionTaken'), t('common.error'));
    return;
  }

  try {
    hiveState.savingInstall = true;
    renderIntoContainer(hiveId);

    await installSuper({
      hive_id: hiveId,
      position,
      notes
    });

    hiveState.installFormOpen = false;
    hiveState.installPosition = '';
    hiveState.installNotes = '';

    showToast(t('apiaries.hives.supers.toasts.installSuccess'), t('common.success'));
    await loadSupers(hiveId);
    await triggerChanged(hiveId);
  } catch (error) {
    showToast(getSupersFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.savingInstall = false;
    renderIntoContainer(hiveId);
  }
}

async function handleSuperSnapshotSubmit(formElement) {
  const hiveId = formElement.getAttribute('data-hive-id');
  const superId = formElement.getAttribute('data-super-id');
  if (!hiveId || !superId) {
    return;
  }

  const hiveState = getHiveState(hiveId);
  if (hiveState.savingSnapshotBySuper[superId]) {
    return;
  }

  const formData = new FormData(formElement);
  const fullnessRaw = String(formData.get('honey_fullness') || '').trim();
  const honeyFullness = Number(fullnessRaw.replaceAll(',', '.'));

  if (!fullnessRaw || Number.isNaN(honeyFullness)) {
    showToast(t('apiaries.hives.supers.errors.fullnessRequired'), t('common.error'));
    return;
  }

  if (honeyFullness < 0 || honeyFullness > 200) {
    showToast(t('apiaries.hives.supers.errors.fullnessRange'), t('common.error'));
    return;
  }

  try {
    hiveState.savingSnapshotBySuper[superId] = true;
    renderIntoContainer(hiveId);

    await createSnapshot({
      super_id: superId,
      honey_fullness: honeyFullness,
      notes: formData.get('notes')
    });

    showToast(t('apiaries.hives.supers.toasts.snapshotSuccess'), t('common.success'));
    formElement.reset();
    await loadSupers(hiveId);
    await triggerChanged(hiveId);
  } catch (error) {
    showToast(getSupersFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.savingSnapshotBySuper[superId] = false;
    renderIntoContainer(hiveId);
  }
}

async function handleRemoveSuper(hiveId, superId) {
  const hiveState = getHiveState(hiveId);
  if (hiveState.savingRemoveBySuper[superId]) {
    return;
  }

  const confirmed = window.confirm(t('apiaries.hives.supers.confirmRemove'));
  if (!confirmed) {
    return;
  }

  try {
    hiveState.savingRemoveBySuper[superId] = true;
    renderIntoContainer(hiveId);

    await removeSuper(superId);

    showToast(t('apiaries.hives.supers.toasts.removeSuccess'), t('common.success'));
    await loadSupers(hiveId);
    await triggerChanged(hiveId);
  } catch (error) {
    showToast(getSupersFriendlyErrorMessage(error), t('common.error'));
  } finally {
    hiveState.savingRemoveBySuper[superId] = false;
    renderIntoContainer(hiveId);
  }
}

function attachSectionListeners(hiveId, containerEl) {
  if (containerEl.dataset.supersBound === 'true') {
    return;
  }

  containerEl.dataset.supersBound = 'true';

  containerEl.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement || !containerEl.contains(actionElement)) {
      return;
    }

    const action = actionElement.getAttribute('data-action');

    if (action === 'toggle-install-super') {
      const targetHiveId = actionElement.getAttribute('data-hive-id');
      if (!targetHiveId) {
        return;
      }

      const hiveState = getHiveState(targetHiveId);
      hiveState.installFormOpen = !hiveState.installFormOpen;
      renderIntoContainer(targetHiveId);
      return;
    }

    if (action === 'cancel-install-super') {
      const targetHiveId = actionElement.getAttribute('data-hive-id');
      if (!targetHiveId) {
        return;
      }

      const hiveState = getHiveState(targetHiveId);
      hiveState.installFormOpen = false;
      renderIntoContainer(targetHiveId);
      return;
    }

    if (action === 'remove-super') {
      const targetHiveId = actionElement.getAttribute('data-hive-id');
      const superId = actionElement.getAttribute('data-super-id');
      if (targetHiveId && superId) {
        void handleRemoveSuper(targetHiveId, superId);
      }
    }
  });

  containerEl.addEventListener('submit', (event) => {
    const installSuperFormElement = event.target.closest('form[data-role="install-super-form"]');
    if (installSuperFormElement && containerEl.contains(installSuperFormElement)) {
      event.preventDefault();
      void handleInstallSuperSubmit(installSuperFormElement);
      return;
    }

    const snapshotFormElement = event.target.closest('form[data-role="super-snapshot-form"]');
    if (snapshotFormElement && containerEl.contains(snapshotFormElement)) {
      event.preventDefault();
      void handleSuperSnapshotSubmit(snapshotFormElement);
    }
  });
}

export function renderSupersSection(hiveId) {
  return `
    <div id="hive-supers-section-${hiveId}" data-supers-host="${hiveId}">
      ${renderSection(hiveId)}
    </div>
  `;
}

export async function initSupersSection({ hiveId, containerEl, onChanged } = {}) {
  if (!hiveId || !containerEl) {
    return;
  }

  containersByHive.set(hiveId, containerEl);

  if (typeof onChanged === 'function') {
    callbacksByHive.set(hiveId, onChanged);
  }

  attachSectionListeners(hiveId, containerEl);
  renderIntoContainer(hiveId);

  const hiveState = getHiveState(hiveId);
  if (!hiveState.hasLoadedSupers && !hiveState.supersLoading) {
    await loadSupers(hiveId);
  }
}