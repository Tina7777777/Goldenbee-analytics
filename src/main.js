import './utils/appSetup.js';
import { renderFooter } from './components/footer/footer.js';
import { renderNavbar, wireNavbarInteractions } from './components/navbar/navbar.js';
import { initI18n, t } from './i18n/i18n.js';
import { createRouter } from './router/router.js';
import { getMockSession, initMockSessionFromStorage } from './services/mockAuth.js';

initI18n();
initMockSessionFromStorage();

const router = createRouter({
  appSelector: '#app',
  onRouteResolved: ({ route }) => {
    const session = getMockSession();

    renderNavbar({
      active: route.navKey,
      isAdmin: session.isAdmin,
      isAuthed: session.isAuthed
    });
    renderFooter();
    document.title = `${t('app.name')} - ${t(route.titleKey)}`;
  }
});

wireNavbarInteractions({ navigate: router.navigate, rerender: router.renderCurrent });
router.start();