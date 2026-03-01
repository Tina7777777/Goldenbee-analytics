import './dashboard.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getBoardData } from '../../services/boardService.js';

let boardData = null;
let isLoading = false;

function createDefaultBoardData() {
  return {
    totals: {
      apiaries_count: 0,
      hives_count: 0,
      current_honey_kg_total: 0,
      important_inspections_14d_total: 0
    },
    apiaries: []
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
    return t('board.noData');
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
    return t('board.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('board.errors.missingConfig');
  }

  return t('board.errors.generic');
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
}

function summaryMarkup() {
  const totals = boardData?.totals || createDefaultBoardData().totals;

  return `
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-3">
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('board.summary.apiaries')}</p>
          <p class="h3 mb-0">${totals.apiaries_count}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('board.summary.hives')}</p>
          <p class="h3 mb-0">${totals.hives_count}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('board.summary.currentHoney')}</p>
          <p class="h3 mb-0">${formatKg(totals.current_honey_kg_total)} ${t('apiaries.hives.supers.kgUnit')}</p>
        </article>
      </div>
      <div class="col">
        <article class="page-card h-100">
          <p class="text-secondary small mb-1">${t('board.summary.importantInspections14d')}</p>
          <p class="h3 mb-0">${totals.important_inspections_14d_total}</p>
        </article>
      </div>
    </div>
  `;
}

function apiaryCardMarkup(item) {
  return `
    <article class="page-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-3">
        <h2 class="h5 mb-0">${escapeHtml(item.apiary_name)}</h2>
        <span class="badge text-bg-light border">${t('board.labels.hivesCount')}: ${item.hives_count}</span>
      </div>

      <div class="row row-cols-1 row-cols-sm-2 g-2 mb-3">
        <div class="col">
          <p class="mb-1 small text-secondary">${t('board.labels.currentHoney')}</p>
          <p class="mb-0 fw-semibold">${formatKg(item.current_honey_kg)} ${t('apiaries.hives.supers.kgUnit')}</p>
        </div>
        <div class="col">
          <p class="mb-1 small text-secondary">${t('board.labels.lastUpdated')}</p>
          <p class="mb-0 fw-semibold">${formatDate(item.last_updated_at)}</p>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row gap-2">
        <a class="btn btn-primary w-100 w-md-auto" href="/apiary?id=${item.apiary_id}" data-link="spa">${t('board.actions.open')}</a>
        <a class="btn btn-outline-secondary w-100 w-md-auto" href="/apiary?id=${item.apiary_id}" data-link="spa">${t('board.actions.addInspection')}</a>
        <a class="btn btn-outline-secondary w-100 w-md-auto" href="/apiary?id=${item.apiary_id}" data-link="spa">${t('board.actions.addSnapshot')}</a>
        <a class="btn btn-outline-secondary w-100 w-md-auto" href="/apiary?id=${item.apiary_id}" data-link="spa">${t('board.actions.addHarvest')}</a>
      </div>
    </article>
  `;
}

function emptyMarkup() {
  return `
    <div class="page-card">
      <p class="mb-3">${t('board.empty.message')}</p>
      <a class="btn btn-primary w-100 w-md-auto" href="/apiaries" data-link="spa">${t('board.empty.link')}</a>
    </div>
  `;
}

function boardMarkup() {
  const apiaries = boardData?.apiaries || [];

  if (!apiaries.length) {
    return `${summaryMarkup()}${emptyMarkup()}`;
  }

  return `
    ${summaryMarkup()}
    <div class="vstack gap-3">
      ${apiaries.map((item) => apiaryCardMarkup(item)).join('')}
    </div>
  `;
}

function renderContent() {
  const contentEl = document.getElementById('board-content');
  if (!contentEl) {
    return;
  }

  contentEl.innerHTML = isLoading ? loadingMarkup() : boardMarkup();
}

async function loadBoard() {
  isLoading = true;
  renderContent();

  try {
    boardData = await getBoardData();
  } catch (error) {
    boardData = createDefaultBoardData();
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
      <div id="board-content"></div>
    </section>
  `;
}

export function init() {
  boardData = createDefaultBoardData();
  isLoading = true;
  renderContent();
  void loadBoard();
}