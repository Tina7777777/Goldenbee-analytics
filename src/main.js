import './utils/appSetup.js';
import { renderFooter } from './components/footer/footer.js';
import { renderNavbar, wireNavbarInteractions } from './components/navbar/navbar.js';
import { initI18n, t } from './i18n/i18n.js';
import { createRouter } from './router/router.js';
import { onAuthStateChange } from './services/authService.js';

initI18n();

function localizeInitialLoader() {
  const loaderText = document.getElementById('app-shell-loader-text');
  if (loaderText) {
    loaderText.textContent = t('app.loading');
  }
}

function removeInitialLoader() {
  const loaderElement = document.getElementById('app-shell-loader');
  if (loaderElement) {
    loaderElement.remove();
  }
}

localizeInitialLoader();

const router = createRouter({
  appSelector: '#app',
  onRouteResolved: ({ route, session }) => {
    removeInitialLoader();

    renderNavbar({
      active: route.navKey,
      isAdmin: session.isAdmin,
      isAuthed: session.isAuthed,
      userEmail: session.userEmail
    });
    renderFooter();
    document.title = `${t('app.name')} - ${t(route.titleKey)}`;
  }
});

wireNavbarInteractions({ navigate: router.navigate, rerender: router.renderCurrent });
onAuthStateChange(() => {
  router.renderCurrent();
});
router.start();