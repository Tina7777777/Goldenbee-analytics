import '../../utils/appSetup.js';
import './login.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initLoginPage() {
  initI18n();
  renderNavbar({ active: '' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.login.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="login-page">
        <h1 class="mb-4">${t('pages.login.title')}</h1>
        <div class="page-card">
          <p class="mb-0 text-secondary">${t('pages.login.description')}</p>
        </div>
      </section>
    `
  );
}

initLoginPage();