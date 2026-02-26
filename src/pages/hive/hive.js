import '../../utils/appSetup.js';
import './hive.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { getQueryParam, setHtml } from '../../utils/dom.js';

export function initHivePage() {
  initI18n();
  renderNavbar({ active: 'dashboard' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.hive.title')}`;

  const hiveId = getQueryParam('id') ?? 'missing';

  setHtml(
    '#page-root',
    `
      <section class="hive-page">
        <h1 class="mb-4">${t('pages.hive.title')}</h1>
        <div class="page-card">
          <p class="mb-1">${t('pages.hive.description')}</p>
          <p class="mb-0 text-secondary">id: ${hiveId}</p>
        </div>
      </section>
    `
  );
}

initHivePage();