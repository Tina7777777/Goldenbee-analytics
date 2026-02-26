import '../../utils/appSetup.js';
import './register.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initRegisterPage() {
  initI18n();
  renderNavbar({ active: '' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.register.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="register-page">
        <h1 class="mb-4">${t('pages.register.title')}</h1>
        <div class="page-card">
          <p class="mb-0 text-secondary">${t('pages.register.description')}</p>
        </div>
      </section>
    `
  );
}

initRegisterPage();