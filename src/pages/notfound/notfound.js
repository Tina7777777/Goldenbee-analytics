import './notfound.css';
import { t } from '../../i18n/i18n.js';

export function render() {
  return `
    <section class="notfound-page">
      <h1 class="mb-4">${t('pages.notfound.title')}</h1>
      <div class="page-card">
        <p class="mb-0">${t('pages.notfound.description')}</p>
      </div>
    </section>
  `;
}

export function init() {}