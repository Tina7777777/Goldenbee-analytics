import '../../utils/appSetup.js';
import './analytics.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initAnalyticsPage() {
  initI18n();
  renderNavbar({ active: 'analytics' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.analytics.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="analytics-page">
        <h1 class="mb-4">${t('pages.analytics.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.analytics.description')}</p>
        </div>
      </section>
    `
  );
}

initAnalyticsPage();