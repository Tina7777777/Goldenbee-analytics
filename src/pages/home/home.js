import '../../utils/appSetup.js';
import './home.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initHomePage() {
  initI18n();
  renderNavbar({ active: 'home' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.home.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="home-page">
        <h1 class="mb-4">${t('pages.home.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.home.description')}</p>
        </div>
      </section>
    `
  );
}

initHomePage();