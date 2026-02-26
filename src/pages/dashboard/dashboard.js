import '../../utils/appSetup.js';
import './dashboard.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initDashboardPage() {
  initI18n();
  renderNavbar({ active: 'dashboard' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.dashboard.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="dashboard-page">
        <h1 class="mb-4">${t('pages.dashboard.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.dashboard.description')}</p>
        </div>
      </section>
    `
  );
}

initDashboardPage();