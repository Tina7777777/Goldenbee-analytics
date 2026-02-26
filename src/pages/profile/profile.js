import './profile.css';
import { t } from '../../i18n/i18n.js';

export function render() {
  return `
    <section class="profile-page">
      <h1 class="mb-4">${t('pages.profile.title')}</h1>
      <div class="page-card">
        <p class="mb-0">${t('pages.profile.description')}</p>
      </div>
    </section>
  `;
}

export function init() {}