import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getApiaryCurrentHoneyKg } from '../../services/apiaryAnalyticsService.js';
import { formatDateTime } from '../../utils/dateTime.js';
import { formatKg } from '../../utils/numberFormat.js';

let currentApiaryId = '';
let isHoneyEstimateLoading = true;
let honeyEstimate = createDefaultHoneyEstimate();
let hiveSearchQuery = '';

function createDefaultHoneyEstimate() {
  return {
    totalKg: 0,
    supersCount: 0,
    supersWithSnapshotsCount: 0,
    lastSnapshotAt: null
  };
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

function emitHiveSearchEvent() {
  window.dispatchEvent(
    new CustomEvent('gba:hives-search-changed', {
      detail: {
        query: hiveSearchQuery
      }
    })
  );
}

function bindSearchInput() {
  const searchInput = document.getElementById('apiary-hives-search-input');
  if (!searchInput || searchInput.dataset.bound === 'true') {
    return;
  }

  searchInput.dataset.bound = 'true';
  searchInput.addEventListener('input', (event) => {
    hiveSearchQuery = String(event.target.value || '').trim();
    emitHiveSearchEvent();
  });
}

function honeySummaryMarkup() {
  return `
    <div class="page-card mb-3">
      <div class="mb-3">
        <label for="apiary-hives-search-input" class="form-label mb-1">${t('apiaries.hives.search.label')}</label>
        <input
          id="apiary-hives-search-input"
          type="search"
          class="form-control"
          value="${hiveSearchQuery}"
          placeholder="${t('apiaries.hives.search.placeholder')}"
        />
      </div>

      ${
        isHoneyEstimateLoading
          ? ''
          : `
            <h2 class="h6 mb-2">${t('apiaries.honeySummary.title')}</h2>
            <p class="display-6 mb-2">${formatTotalKg(honeyEstimate.totalKg)} ${t('apiaries.hives.supers.kgUnit')}</p>
            <p class="small text-secondary mb-1">${t('apiaries.honeySummary.activeSupers')}: ${honeyEstimate.supersCount}</p>
            <p class="small text-secondary mb-1">${t('apiaries.honeySummary.withData')}: ${honeyEstimate.supersWithSnapshotsCount}</p>
            <p class="small text-secondary mb-0">${t('apiaries.honeySummary.lastUpdated')}: ${formatLastUpdated(honeyEstimate.lastSnapshotAt)}</p>
          `
      }
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
  bindSearchInput();
  emitHiveSearchEvent();
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