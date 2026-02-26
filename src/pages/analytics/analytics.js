import './analytics.css';
import { t } from '../../i18n/i18n.js';

export function render() {
  return `
    <section class="analytics-page">
      <h1 class="mb-4">${t('pages.analytics.title')}</h1>
      <div class="page-card">
        <p class="mb-0">${t('pages.analytics.description')}</p>
      </div>
    </section>
  `;
}

export function init() {}