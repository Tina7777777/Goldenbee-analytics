import './analytics.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { listApiaryHiveYieldSummary } from '../../services/analyticsService.js';
import { formatDateTime } from '../../utils/dateTime.js';
import { formatKg } from '../../utils/numberFormat.js';

const FULLNESS_TREND_DAYS = 14;
const PERIOD_OPTIONS = ['1', '7', '14', '30', '365', 'all'];

let isLoading = false;
let reportData = createDefaultReportData();
let selectedPeriod = String(FULLNESS_TREND_DAYS);
let selectedApiaryId = '';

function createDefaultReportData() {
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
  return formatDateTime(value, { empty: t('analyticsReports.noData') });
}

function getSelectedPeriodDays() {
  if (selectedPeriod === 'all') {
    return null;
  }

  const parsed = Number(selectedPeriod);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return FULLNESS_TREND_DAYS;
  }

  return parsed;
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

function resolveSelectedApiaryGroup() {
  const groups = reportData || [];
  if (!groups.length) {
    return null;
  }

  const selectedGroup = groups.find((group) => group.apiary_id === selectedApiaryId);
  return selectedGroup || groups[0] || null;
}

function apiaryOptionsMarkup() {
  const groups = reportData || [];
  if (!groups.length) {
    return `<option value="">${t('analyticsReports.empty.apiaryHiveYield')}</option>`;
  }

  return groups
    .map((group) => `<option value="${group.apiary_id}" ${group.apiary_id === selectedApiaryId ? 'selected' : ''}>${escapeHtml(group.apiary_name || t('analyticsReports.noData'))}</option>`)
    .join('');
}

function apiaryYieldTableMarkup() {
  const group = resolveSelectedApiaryGroup();
  if (!group) {
    return `<div class="page-card"><p class="mb-0 text-secondary">${t('analyticsReports.empty.apiaryHiveYield')}</p></div>`;
  }

  const apiaryLink = group.apiary_id
    ? `<a href="/apiary?id=${group.apiary_id}" data-link="spa">${escapeHtml(group.apiary_name || t('analyticsReports.noData'))}</a>`
    : escapeHtml(group.apiary_name || t('analyticsReports.noData'));

  const rowsMarkup = (group.rows || [])
    .map((row) => {
      const hiveCell = group.apiary_id && row.hive_id
        ? `<a href="/apiary?id=${group.apiary_id}&hive=${row.hive_id}" data-link="spa">${escapeHtml(row.hive_code || t('analyticsReports.noData'))}</a>`
        : escapeHtml(row.hive_code || t('analyticsReports.noData'));

      const isInactive = Number(row.total_yield_kg || 0) <= 0;

      return `
        <tr class="${isInactive ? 'analytics-row--inactive' : ''}">
          <td>${hiveCell}</td>
          <td class="text-nowrap">${row.harvests_count || 0}</td>
          <td class="text-nowrap">${formatKg(row.total_yield_kg || 0)} ${t('apiaries.hives.supers.kgUnit')}</td>
          <td class="text-nowrap">${row.harvests_count ? `${formatKg(row.average_yield_kg || 0)} ${t('apiaries.hives.supers.kgUnit')}` : '-'}</td>
          <td class="text-nowrap">${row.last_harvested_at ? formatDate(row.last_harvested_at) : '-'}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <section class="page-card mb-3">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <h2 class="h5 mb-0">${apiaryLink}</h2>
        <div class="text-md-end">
          <p class="mb-0 small text-secondary">${t('analyticsReports.apiarySummary.totalYield')}: <strong>${formatKg(group.apiary_total_yield_kg || 0)} ${t('apiaries.hives.supers.kgUnit')}</strong></p>
          <p class="mb-0 small text-secondary">${t('analyticsReports.apiarySummary.totalHarvests')}: <strong>${group.apiary_harvests_count || 0}</strong></p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>${t('analyticsReports.columns.hive')}</th>
              <th class="text-nowrap">${t('analyticsReports.columns.harvestsCount')}</th>
              <th class="text-nowrap">${t('analyticsReports.columns.totalYieldKg')}</th>
              <th class="text-nowrap">${t('analyticsReports.columns.avgYieldKg')}</th>
              <th class="text-nowrap">${t('analyticsReports.columns.lastHarvest')}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsMarkup}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function reportsMarkup() {
  const hasGroups = (reportData || []).length > 0;

  return `
    <section class="page-card mb-3">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
        <h2 class="h6 mb-0">${t('analyticsReports.filters.title')}</h2>
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
          <label class="small text-secondary mb-0" for="analytics-period-select">${t('analyticsReports.filters.period')}</label>
          <select id="analytics-period-select" class="form-select form-select-sm">
            ${PERIOD_OPTIONS.map((option) => `<option value="${option}" ${selectedPeriod === option ? 'selected' : ''}>${t(`analyticsReports.filters.${option === 'all' ? 'all' : `days${option}`}`)}</option>`).join('')}
          </select>

          <label class="small text-secondary mb-0" for="analytics-apiary-select">${t('analyticsReports.filters.apiary')}</label>
          <select id="analytics-apiary-select" class="form-select form-select-sm" ${hasGroups ? '' : 'disabled'}>
            ${apiaryOptionsMarkup()}
          </select>
        </div>
      </div>
    </section>
    ${apiaryYieldTableMarkup()}
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
    const selectedDays = getSelectedPeriodDays();
    reportData = await listApiaryHiveYieldSummary(selectedDays);

    const hasSelection = reportData.some((group) => group.apiary_id === selectedApiaryId);
    if (!hasSelection) {
      selectedApiaryId = reportData[0]?.apiary_id || '';
    }
  } catch (error) {
    reportData = createDefaultReportData();
    selectedApiaryId = '';
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
  selectedPeriod = String(FULLNESS_TREND_DAYS);
  selectedApiaryId = '';
  renderContent();
  void loadReports();

  const pageElement = document.querySelector('.analytics-page');
  if (!pageElement) {
    return;
  }

  pageElement.addEventListener('change', (event) => {
    const periodSelectElement = event.target.closest('#analytics-period-select');
    if (periodSelectElement && pageElement.contains(periodSelectElement)) {
      const nextValue = String(periodSelectElement.value || '');
      if (!PERIOD_OPTIONS.includes(nextValue) || nextValue === selectedPeriod) {
        return;
      }

      selectedPeriod = nextValue;
      void loadReports();
      return;
    }

    const apiarySelectElement = event.target.closest('#analytics-apiary-select');
    if (apiarySelectElement && pageElement.contains(apiarySelectElement)) {
      const nextApiaryId = String(apiarySelectElement.value || '');
      if (!nextApiaryId || nextApiaryId === selectedApiaryId) {
        return;
      }

      selectedApiaryId = nextApiaryId;
      renderContent();
    }
  });
}