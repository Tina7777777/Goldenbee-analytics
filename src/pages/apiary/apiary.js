import '../../utils/appSetup.js';
import './apiary.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { getQueryParam, setHtml } from '../../utils/dom.js';

export function initApiaryPage() {
  initI18n();
  renderNavbar({ active: 'dashboard' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.apiary.title')}`;

  const apiaryId = getQueryParam('id') ?? 'missing';

  setHtml(
    '#page-root',
    `
      <section class="apiary-page">
        <h1 class="mb-4">${t('pages.apiary.title')}</h1>
        <div class="page-card">
          <p class="mb-1">${t('pages.apiary.description')}</p>
          <p class="mb-0 text-secondary">id: ${apiaryId}</p>
        </div>
      </section>
    `
  );
}

initApiaryPage();