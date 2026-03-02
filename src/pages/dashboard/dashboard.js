import './dashboard.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getHomeDashboardData } from '../../services/dashboardService.js';

let dashboardData = null;
let isLoading = false;

function createDefaultDashboardData() {
  return {
    apiariesCount: 0,
    hivesCount: 0,
    currentHoneyKgTotal: 0,
    lastUpdatedAt: null,
    recentSnapshots: [],
    recentInspections: [],
    recentHarvests: []
  };
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
    return t('home.summary.noData');
  }

  return new Intl.DateTimeFormat('bg-BG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatKg(value) {
  return Number(value || 0).toFixed(1);
}

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('not authenticated')) {
    return t('home.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('home.errors.missingConfig');
  }

  return t('home.errors.generic');
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
}

function summaryCardsMarkup() {
  const data = dashboardData || createDefaultDashboardData();

  return `
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4">
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('home.summary.apiaries')}</p>
          <p class="h3 mb-0">${data.apiariesCount}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('home.summary.hives')}</p>
          <p class="h3 mb-0">${data.hivesCount}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('home.summary.currentHoney')}</p>
          <p class="h3 mb-0">${formatKg(data.currentHoneyKgTotal)} ${t('apiaries.hives.supers.kgUnit')}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('home.summary.lastUpdated')}</p>
          <p class="mb-0 fw-semibold">${formatDate(data.lastUpdatedAt)}</p>
        </article>
      </div>
    </div>
  `;
}

function locationText(item) {
  const apiaryName = item.apiary_name ? escapeHtml(item.apiary_name) : t('home.activity.unknownApiary');
  const hiveCode = item.hive_code ? ` • ${t('apiaries.hives.codeLabel')}: ${escapeHtml(item.hive_code)}` : '';
  return `${apiaryName}${hiveCode}`;
}

function snapshotsListMarkup() {
  const items = (dashboardData?.recentSnapshots || []).slice(0, 5);
  if (!items.length) {
    return `<p class="mb-0 text-secondary">${t('home.activity.empty')}</p>`;
  }

  return `
    <div class="list-group list-group-flush">
      ${items
        .map(
          (item) => `
        <article class="list-group-item px-0">
          <p class="mb-1 fw-semibold">${formatDate(item.snapshot_at)}</p>
          <p class="mb-1 small">${t('home.activity.snapshots.fullness')}: ${Number(item.honey_fullness ?? 0).toFixed(0)}%</p>
          <p class="mb-0 small text-secondary">${locationText(item)}</p>
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function inspectionsListMarkup() {
  const items = (dashboardData?.recentInspections || []).slice(0, 5);
  if (!items.length) {
    return `<p class="mb-0 text-secondary">${t('home.activity.empty')}</p>`;
  }

  return `
    <div class="list-group list-group-flush">
      ${items
        .map(
          (item) => `
        <article class="list-group-item px-0">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <p class="mb-0 fw-semibold">${formatDate(item.inspected_at)}</p>
            ${item.important ? `<span class="badge text-bg-warning">${t('apiaries.hives.inspections.importantBadge')}</span>` : ''}
          </div>
          <p class="mb-0 small text-secondary">${locationText(item)}</p>
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function harvestsListMarkup() {
  const items = (dashboardData?.recentHarvests || []).slice(0, 5);
  if (!items.length) {
    return `<p class="mb-0 text-secondary">${t('home.activity.empty')}</p>`;
  }

  return `
    <div class="list-group list-group-flush">
      ${items
        .map(
          (item) => `
        <article class="list-group-item px-0">
          <p class="mb-1 fw-semibold">${formatDate(item.harvested_at)}</p>
          <p class="mb-1 small">${t('home.activity.harvests.actualKg')}: ${item.actual_kg_total === null || item.actual_kg_total === undefined ? '-' : `${formatKg(item.actual_kg_total)} ${t('apiaries.hives.supers.kgUnit')}`}</p>
          <p class="mb-0 small text-secondary">${locationText(item)}</p>
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function activitySectionsMarkup() {
  return `
    <div class="row row-cols-1 row-cols-lg-3 g-3 mb-4">
      <div class="col">
        <section class="page-card h-100">
          <h2 class="h6 mb-3">${t('home.activity.snapshots.title')}</h2>
          ${snapshotsListMarkup()}
        </section>
      </div>
      <div class="col">
        <section class="page-card h-100">
          <h2 class="h6 mb-3">${t('home.activity.inspections.title')}</h2>
          ${inspectionsListMarkup()}
        </section>
      </div>
      <div class="col">
        <section class="page-card h-100">
          <h2 class="h6 mb-3">${t('home.activity.harvests.title')}</h2>
          ${harvestsListMarkup()}
        </section>
      </div>
    </div>
  `;
}

function quickActionsMarkup() {
  return `
    <section class="page-card">
      <h2 class="h6 mb-3">${t('home.quickActions.title')}</h2>
      <div class="d-flex flex-column flex-sm-row gap-2">
        <a class="btn btn-primary w-100 w-sm-auto" href="/apiaries" data-link="spa">${t('home.quickActions.openApiaries')}</a>
        <a class="btn btn-outline-primary w-100 w-sm-auto" href="/apiaries" data-link="spa">${t('home.quickActions.newApiary')}</a>
      </div>
    </section>
  `;
}

function dashboardMarkup() {
  return `${summaryCardsMarkup()}${activitySectionsMarkup()}${quickActionsMarkup()}`;
}

function renderContent() {
  const contentEl = document.getElementById('dashboard-content');
  if (!contentEl) {
    return;
  }

  contentEl.innerHTML = isLoading ? loadingMarkup() : dashboardMarkup();
}

async function loadDashboard() {
  isLoading = true;
  renderContent();

  try {
    dashboardData = await getHomeDashboardData();
  } catch (error) {
    dashboardData = createDefaultDashboardData();
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
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
  dashboardData = createDefaultDashboardData();
  isLoading = true;
  renderContent();
  void loadDashboard();
}