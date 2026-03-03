import './dashboard.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getApiaryHivesLatestState, listOwnedApiariesForDashboard } from '../../services/dashboardService.js';
import { formatDateTime } from '../../utils/dateTime.js';
import { formatKg } from '../../utils/numberFormat.js';

let apiaries = [];
let selectedApiaryId = '';
let hiveRows = [];
let isPageLoading = false;
let isTableLoading = false;

function createDefaultState() {
  return [];
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
  return formatDateTime(value, { empty: t('home.summary.noData') });
}

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('board.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('board.errors.missingConfig');
  }

  return t('board.errors.generic');
}

function formatNullable(value) {
  return value === null || value === undefined ? '-' : escapeHtml(value);
}

function formatBoolean(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return value ? t('apiaries.hives.inspections.summary.yes') : t('apiaries.hives.inspections.summary.no');
}

function setApiaryQueryParam(apiaryId) {
  const url = new URL(window.location.href);

  if (apiaryId) {
    url.searchParams.set('apiary', apiaryId);
  } else {
    url.searchParams.delete('apiary');
  }

  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function tableRowsMarkup() {
  if (isTableLoading) {
    return `
      <tr>
        <td colspan="9" class="text-secondary">${t('common.loading')}</td>
      </tr>
    `;
  }

  if (!hiveRows.length) {
    return `
      <tr>
        <td colspan="9" class="text-secondary">${t('board.table.emptyRows')}</td>
      </tr>
    `;
  }

  return hiveRows
    .map(
      (row) => `
      <tr>
        <td class="fw-semibold">${escapeHtml(row.hive_code || '-')}</td>
        <td>${formatNullable(row.brood_frames)}</td>
        <td>${formatNullable(row.honey_pollen_frames)}</td>
        <td>${formatNullable(row.total_frames)}</td>
        <td>${formatBoolean(row.eggs_present)}</td>
        <td>${formatBoolean(row.queen_seen)}</td>
        <td>${formatNullable(row.supers_count)}</td>
        <td>${formatKg(row.honey_kg_total || 0)} ${t('apiaries.hives.supers.kgUnit')}</td>
        <td>
          <p class="mb-0">${row.snapshots_count || 0}</p>
          <p class="small text-secondary mb-0">${formatDate(row.snapshots_last_at)}</p>
        </td>
      </tr>
    `
    )
    .join('');
}

function controlsMarkup() {
  if (!apiaries.length) {
    return `
      <div class="page-card mb-3">
        <p class="mb-0 text-secondary">${t('board.empty.message')}</p>
      </div>
    `;
  }

  return `
    <div class="page-card mb-3">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <label class="form-label mb-0" for="dashboard-apiary-select">${t('board.table.apiaryFilter')}</label>
        <select id="dashboard-apiary-select" class="form-select w-100 w-md-auto">
          ${apiaries
            .map((apiary) => `<option value="${apiary.id}" ${selectedApiaryId === apiary.id ? 'selected' : ''}>${escapeHtml(apiary.name)}</option>`)
            .join('')}
        </select>
      </div>
    </div>
  `;
}

function tableMarkup() {
  if (!apiaries.length) {
    return '';
  }

  return `
    <section class="page-card dashboard-table-card">
      <h2 class="h5 mb-3">${t('board.table.title')}</h2>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0 dashboard-state-table">
          <thead>
            <tr>
              <th>${t('board.table.columns.hiveCode')}</th>
              <th>${t('board.table.columns.broodFrames')}</th>
              <th>${t('board.table.columns.honeyPollenFrames')}</th>
              <th>${t('board.table.columns.totalFrames')}</th>
              <th>${t('board.table.columns.eggsPresent')}</th>
              <th>${t('board.table.columns.queenSeen')}</th>
              <th>${t('board.table.columns.supersCount')}</th>
              <th>${t('board.table.columns.totalHoneyKg')}</th>
              <th>${t('board.table.columns.superSnapshots')}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsMarkup()}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function dashboardMarkup() {
  return `
    ${controlsMarkup()}
    ${tableMarkup()}
  `;
}

function renderContent() {
  const contentEl = document.getElementById('dashboard-content');
  if (!contentEl) {
    return;
  }

  if (isPageLoading) {
    contentEl.innerHTML = `<div class="page-card"><p class="mb-0 text-secondary">${t('common.loading')}</p></div>`;
    return;
  }

  contentEl.innerHTML = dashboardMarkup();

  const selectEl = document.getElementById('dashboard-apiary-select');
  if (!selectEl || selectEl.dataset.bound === 'true') {
    return;
  }

  selectEl.dataset.bound = 'true';
  selectEl.addEventListener('change', (event) => {
    const nextApiaryId = String(event.target.value || '');
    if (!nextApiaryId || nextApiaryId === selectedApiaryId) {
      return;
    }

    selectedApiaryId = nextApiaryId;
    setApiaryQueryParam(selectedApiaryId);
    void loadApiaryTable();
  });
}

async function loadApiaryTable() {
  isTableLoading = true;
  renderContent();

  try {
    hiveRows = await getApiaryHivesLatestState(selectedApiaryId);
  } catch (error) {
    hiveRows = createDefaultState();
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isTableLoading = false;
    renderContent();
  }
}

async function loadDashboard() {
  isPageLoading = true;
  renderContent();

  try {
    apiaries = await listOwnedApiariesForDashboard();

    const requestedApiaryId = new URLSearchParams(window.location.search).get('apiary') || '';
    const hasRequestedApiary = apiaries.some((apiary) => apiary.id === requestedApiaryId);

    selectedApiaryId = hasRequestedApiary ? requestedApiaryId : apiaries[0]?.id || '';
    setApiaryQueryParam(selectedApiaryId);

    if (selectedApiaryId) {
      hiveRows = await getApiaryHivesLatestState(selectedApiaryId);
    } else {
      hiveRows = createDefaultState();
    }
  } catch (error) {
    apiaries = [];
    hiveRows = createDefaultState();
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isPageLoading = false;
    isTableLoading = false;
    renderContent();
  }
}

export function render() {
  return `
    <section class="dashboard-page">
      <h1 class="mb-4">${t('pages.dashboard.title')}</h1>
      <div id="dashboard-content"></div>
    </section>
  `;
}

export function init() {
  apiaries = [];
  selectedApiaryId = '';
  hiveRows = createDefaultState();
  isPageLoading = true;
  isTableLoading = false;
  renderContent();
  void loadDashboard();
}