import './dashboard.css';
import { t } from '../../i18n/i18n.js';

export function render() {
  return `
    <section class="dashboard-page">
      <h1 class="mb-4">${t('pages.dashboard.title')}</h1>
      <div class="page-card">
        <p class="mb-3">${t('pages.dashboard.description')}</p>
        <div class="d-flex gap-2 flex-wrap">
          <a href="/apiary?id=123" data-link="spa" class="btn btn-outline-primary btn-sm">${t('pages.dashboard.apiaryLink')}</a>
          <a href="/hive?id=123" data-link="spa" class="btn btn-outline-secondary btn-sm">${t('pages.dashboard.hiveLink')}</a>
        </div>
      </div>
    </section>
  `;
}

export function init() {}