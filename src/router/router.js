import { render as renderAdmin, init as initAdmin } from '../pages/admin/admin.js';
import { render as renderAnalytics, init as initAnalytics } from '../pages/analytics/analytics.js';
import { render as renderApiary, init as initApiary } from '../pages/apiary/apiary.js';
import { render as renderDashboard, init as initDashboard } from '../pages/dashboard/dashboard.js';
import { render as renderHive, init as initHive } from '../pages/hive/hive.js';
import { render as renderHome, init as initHome } from '../pages/home/home.js';
import { render as renderLogin, init as initLogin } from '../pages/login/login.js';
import { render as renderNotFound, init as initNotFound } from '../pages/notfound/notfound.js';
import { render as renderProfile, init as initProfile } from '../pages/profile/profile.js';
import { render as renderRegister, init as initRegister } from '../pages/register/register.js';
import { getMockSession } from '../services/mockAuth.js';
import { qs } from '../utils/dom.js';

const routes = {
  '/': {
    navKey: 'home',
    titleKey: 'pages.home.title',
    guard: 'public',
    render: renderHome,
    init: initHome
  },
  '/login': {
    navKey: '',
    titleKey: 'pages.login.title',
    guard: 'guest',
    render: renderLogin,
    init: initLogin
  },
  '/register': {
    navKey: '',
    titleKey: 'pages.register.title',
    guard: 'guest',
    render: renderRegister,
    init: initRegister
  },
  '/dashboard': {
    navKey: 'dashboard',
    titleKey: 'pages.dashboard.title',
    guard: 'auth',
    render: renderDashboard,
    init: initDashboard
  },
  '/profile': {
    navKey: 'profile',
    titleKey: 'pages.profile.title',
    guard: 'auth',
    render: renderProfile,
    init: initProfile
  },
  '/apiary': {
    navKey: 'dashboard',
    titleKey: 'pages.apiary.title',
    guard: 'auth',
    requireId: true,
    render: renderApiary,
    init: initApiary
  },
  '/hive': {
    navKey: 'dashboard',
    titleKey: 'pages.hive.title',
    guard: 'auth',
    requireId: true,
    render: renderHive,
    init: initHive
  },
  '/analytics': {
    navKey: 'analytics',
    titleKey: 'pages.analytics.title',
    guard: 'auth',
    render: renderAnalytics,
    init: initAnalytics
  },
  '/admin': {
    navKey: 'admin',
    titleKey: 'pages.admin.title',
    guard: 'admin',
    render: renderAdmin,
    init: initAdmin
  }
};

const notFoundRoute = {
  navKey: '',
  titleKey: 'pages.notfound.title',
  guard: 'public',
  render: renderNotFound,
  init: initNotFound
};

function isValidEntityId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}

function resolveRoute(pathname, searchParams) {
  const route = routes[pathname];

  if (!route) {
    return { route: notFoundRoute, params: {} };
  }

  const params = Object.fromEntries(searchParams.entries());

  if (route.requireId && !isValidEntityId(params.id ?? '')) {
    return { route: notFoundRoute, params: {} };
  }

  return { route, params };
}

function guardRedirectPath(guard, session) {
  if (guard === 'guest' && session.isAuthed) {
    return '/dashboard';
  }

  if (guard === 'auth' && !session.isAuthed) {
    return '/login';
  }

  if (guard === 'admin') {
    if (!session.isAuthed) {
      return '/login';
    }

    if (!session.isAdmin) {
      return '/dashboard';
    }
  }

  return null;
}

export function createRouter({ appSelector, onRouteResolved }) {
  const appElement = qs(appSelector);
  if (!appElement) {
    throw new Error(`Missing app root: ${appSelector}`);
  }

  function normalizePath(path) {
    const rawPath = String(path ?? '').trim();
    if (!rawPath) {
      return '/';
    }

    return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  }

  function renderCurrent() {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const resolved = resolveRoute(pathname, searchParams);
    const session = getMockSession();
    const redirectPath = guardRedirectPath(resolved.route.guard, session);

    if (redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }

    appElement.innerHTML = resolved.route.render(resolved.params);
    onRouteResolved?.({ route: resolved.route, params: resolved.params, session });
    resolved.route.init(resolved.params);
  }

  function navigate(path, options = {}) {
    const { replace = false } = options;
    const method = replace ? 'replaceState' : 'pushState';
    const normalizedPath = normalizePath(path);

    window.history[method]({}, '', normalizedPath);
    renderCurrent();
  }

  function start() {
    window.addEventListener('popstate', renderCurrent);
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[data-link="spa"]');
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http')) {
        return;
      }

      event.preventDefault();
      navigate(href);
    });

    renderCurrent();
  }

  return {
    start,
    navigate,
    renderCurrent
  };
}