import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getApiaryCurrentHoneyKg } from '../../services/apiaryAnalyticsService.js';
import { formatDateTime } from '../../utils/dateTime.js';

let currentApiaryId = '';
let isHoneyEstimateLoading = true;
let honeyEstimate = createDefaultHoneyEstimate();

function createDefaultHoneyEstimate() {
  return {
    totalKg: 0,
    supersCount: 0,
    supersWithSnapshotsCount: 0,
    lastSnapshotAt: null
  };
}

function formatTotalKg(value) {
  return Number(value || 0).toFixed(1);
}

function formatLastUpdated(value) {
  return formatDateTime(value, { empty: t('apiaries.honeySummary.noData') });
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

function honeySummaryMarkup() {
  if (isHoneyEstimateLoading) {
    return `
      <div class="page-card mb-3">
        <p class="mb-0 text-secondary">${t('common.loading')}</p>
      </div>
    `;
  }

  return `
    <div class="page-card mb-3">
      <h2 class="h6 mb-2">${t('apiaries.honeySummary.title')}</h2>
      <p class="display-6 mb-2">${formatTotalKg(honeyEstimate.totalKg)} ${t('apiaries.hives.supers.kgUnit')}</p>
      <p class="small text-secondary mb-1">${t('apiaries.honeySummary.activeSupers')}: ${honeyEstimate.supersCount}</p>
      <p class="small text-secondary mb-1">${t('apiaries.honeySummary.withData')}: ${honeyEstimate.supersWithSnapshotsCount}</p>
      <p class="small text-secondary mb-0">${t('apiaries.honeySummary.lastUpdated')}: ${formatLastUpdated(honeyEstimate.lastSnapshotAt)}</p>
    </div>
  `;
}

export function renderApiarySummary(apiaryId = currentApiaryId) {
  if (apiaryId) {
    currentApiaryId = apiaryId;
  }

  const summaryElement = document.getElementById('apiary-honey-summary');
  if (!summaryElement) {
    return;
  }

  summaryElement.innerHTML = honeySummaryMarkup();
}

export async function initApiarySummary(apiaryId) {
  currentApiaryId = apiaryId || currentApiaryId;
  if (!currentApiaryId) {
    return;
  }

  isHoneyEstimateLoading = true;
  renderApiarySummary(currentApiaryId);

  try {
    honeyEstimate = await getApiaryCurrentHoneyKg(currentApiaryId);
  } catch (error) {
    showToast(getSupersFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isHoneyEstimateLoading = false;
    renderApiarySummary(currentApiaryId);
  }
}