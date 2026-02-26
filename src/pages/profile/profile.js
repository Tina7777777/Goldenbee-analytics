import '../../utils/appSetup.js';
import './profile.css';
import { renderFooter } from '../../components/footer/footer.js';
import { renderNavbar } from '../../components/navbar/navbar.js';
import { initI18n, t } from '../../i18n/i18n.js';
import { setHtml } from '../../utils/dom.js';

export function initProfilePage() {
  initI18n();
  renderNavbar({ active: 'profile' });
  renderFooter();
  document.title = `${t('app.name')} - ${t('pages.profile.title')}`;

  setHtml(
    '#page-root',
    `
      <section class="profile-page">
        <h1 class="mb-4">${t('pages.profile.title')}</h1>
        <div class="page-card">
          <p class="mb-0">${t('pages.profile.description')}</p>
        </div>
      </section>
    `
  );
}

initProfilePage();