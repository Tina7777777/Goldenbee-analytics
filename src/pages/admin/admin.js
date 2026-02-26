import './admin.css';
import { t } from '../../i18n/i18n.js';

export function render() {
  return `
    <section class="admin-page">
      <h1 class="mb-4">${t('pages.admin.title')}</h1>
      <div class="page-card">
        <p class="mb-0">${t('pages.admin.description')}</p>
      </div>
    </section>
  `;
}

export function init() {}