import '../../utils/appSetup.js';
import './notfound.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initNotFoundPage() {
  initI18n();
  renderNavbar({ active: '' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.notfound.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="notfound-page">
        <h1 class="mb-4">${t('pages.notfound.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.notfound.description')}</p>
        </div>
      </section>
    `
  );
}

initNotFoundPage();