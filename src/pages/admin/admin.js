import '../../utils/appSetup.js';
import './admin.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initAdminPage() {
  initI18n();
  renderNavbar({ active: 'admin', isAdmin: true, authLabelKey: 'common.admin' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.admin.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="admin-page">
        <h1 class="mb-4">${t('pages.admin.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.admin.description')}</p>
        </div>
      </section>
    `
  );
}

initAdminPage();