import './apiary.css';
import { t } from '../../i18n/i18n.js';

export function render(params = {}) {
  return `
    <section class="apiary-page">
      <h1 class="mb-4">${t('pages.apiary.title')}</h1>
      <div class="page-card">
        <p class="mb-1">${t('pages.apiary.description')}</p>
        <p class="mb-0 text-secondary">id: ${params.id}</p>
      </div>
    </section>
  `;
}

export function init() {}