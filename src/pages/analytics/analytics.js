import './analytics.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { listRecentFullnessTrend, listRecentHarvestCalibration } from '../../services/analyticsService.js';

const HARVEST_CALIBRATION_LIMIT = 20;
const FULLNESS_TREND_DAYS = 14;

let isLoading = false;
let reportData = createDefaultReportData();

function createDefaultReportData() {
  return {
    calibrationRows: [],
    trendRows: []
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
    return t('analyticsReports.noData');
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
    return t('analyticsReports.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('analyticsReports.errors.missingConfig');
  }

  return t('analyticsReports.errors.generic');
}

function deltaBadgeMarkup(delta) {
  if (delta === null || delta === undefined) {
    return `<span class="badge text-bg-secondary">-</span>`;
  }

  if (delta > 0) {
    return `<span class="badge text-bg-success">+${formatKg(delta)}</span>`;
  }

  if (delta < 0) {
    return `<span class="badge text-bg-danger">${formatKg(delta)}</span>`;
  }

  return `<span class="badge text-bg-secondary">${formatKg(delta)}</span>`;
}

function calibrationTableMarkup() {
  const rows = reportData.calibrationRows || [];
  if (!rows.length) {
    return `<p class="mb-0 text-secondary">${t('analyticsReports.empty.calibration')}</p>`;
  }

  return `
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>${t('analyticsReports.columns.date')}</th>
            <th>${t('analyticsReports.columns.apiary')}</th>
            <th>${t('analyticsReports.columns.hive')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.estimatedKg')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.actualKg')}</th>
            <th>${t('analyticsReports.columns.deltaKg')}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const apiaryCell = row.apiary_id
                ? `<a href="/apiary?id=${row.apiary_id}" data-link="spa">${escapeHtml(row.apiary_name || t('analyticsReports.noData'))}</a>`
                : escapeHtml(row.apiary_name || t('analyticsReports.noData'));

              const hiveCell = row.hive_id
                ? `<a href="/hive?id=${row.hive_id}" data-link="spa">${escapeHtml(row.hive_code || t('analyticsReports.noData'))}</a>`
                : escapeHtml(row.hive_code || t('analyticsReports.noData'));

              return `
                <tr>
                  <td class="text-nowrap">${formatDate(row.harvested_at)}</td>
                  <td>${apiaryCell}</td>
                  <td>${hiveCell}</td>
                  <td class="text-nowrap">${formatKg(row.estimated_total_kg)} ${t('apiaries.hives.supers.kgUnit')}</td>
                  <td class="text-nowrap">${row.actual_kg_total === null ? '-' : `${formatKg(row.actual_kg_total)} ${t('apiaries.hives.supers.kgUnit')}`}</td>
                  <td>${deltaBadgeMarkup(row.delta_kg)}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function trendTableMarkup() {
  const rows = reportData.trendRows || [];
  if (!rows.length) {
    return `<p class="mb-0 text-secondary">${t('analyticsReports.empty.trend')}</p>`;
  }

  return `
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>${t('analyticsReports.columns.apiary')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.avgFullness')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.avgKgEstimate')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.snapshotsCount')}</th>
            <th class="text-nowrap">${t('analyticsReports.columns.lastUpdated')}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const apiaryCell = row.apiary_id
                ? `<a href="/apiary?id=${row.apiary_id}" data-link="spa">${escapeHtml(row.apiary_name || t('analyticsReports.noData'))}</a>`
                : escapeHtml(row.apiary_name || t('analyticsReports.noData'));

              return `
                <tr>
                  <td>${apiaryCell}</td>
                  <td class="text-nowrap">${Number(row.average_honey_fullness || 0).toFixed(1)}%</td>
                  <td class="text-nowrap">${formatKg(row.average_kg_estimate)} ${t('apiaries.hives.supers.kgUnit')}</td>
                  <td class="text-nowrap">${row.snapshots_count || 0}</td>
                  <td class="text-nowrap">${formatDate(row.last_updated_at)}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function reportsMarkup() {
  return `
    <section class="page-card mb-3">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <h2 class="h5 mb-0">${t('analyticsReports.calibration.title')}</h2>
        <span class="text-secondary small">${t('analyticsReports.calibration.caption')}</span>
      </div>
      ${calibrationTableMarkup()}
    </section>

    <section class="page-card">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <h2 class="h5 mb-0">${t('analyticsReports.trend.title')}</h2>
        <span class="text-secondary small">${t('analyticsReports.trend.caption')}</span>
      </div>
      ${trendTableMarkup()}
    </section>
  `;
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
}

function renderContent() {
  const contentEl = document.getElementById('analytics-content');
  if (!contentEl) {
    return;
  }

  contentEl.innerHTML = isLoading ? loadingMarkup() : reportsMarkup();
}

async function loadReports() {
  isLoading = true;
  renderContent();

  try {
    const [calibrationRows, trendRows] = await Promise.all([
      listRecentHarvestCalibration(HARVEST_CALIBRATION_LIMIT),
      listRecentFullnessTrend(FULLNESS_TREND_DAYS)
    ]);

    reportData = {
      calibrationRows,
      trendRows
    };
  } catch (error) {
    reportData = createDefaultReportData();
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
    renderContent();
  }
}

export function render() {
  return `
    <section class="analytics-page">
      <h1 class="mb-4">${t('pages.analytics.title')}</h1>
      <div id="analytics-content"></div>
    </section>
  `;
}

export function init() {
  reportData = createDefaultReportData();
  isLoading = true;
  renderContent();
  void loadReports();
}