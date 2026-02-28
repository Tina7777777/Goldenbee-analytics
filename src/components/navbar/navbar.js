import './navbar.css';
import { t } from '../../i18n/i18n.js';
import { signOut } from '../../services/authService.js';
import { showToast } from '../toast/toast.js';
import { setHtml } from '../../utils/dom.js';

export function renderNavbar({ active = 'home', isAdmin = false, isAuthed = false, userEmail = '' } = {}) {
  const links = [
    { key: 'home', href: '/', label: t('nav.home') },
    { key: 'dashboard', href: '/dashboard', label: t('nav.dashboard') },
    { key: 'analytics', href: '/analytics', label: t('nav.analytics') },
    { key: 'profile', href: '/profile', label: t('nav.profile') }
  ];

  const navItems = links
    .map(
      ({ key, href, label }) => `
        <li class="nav-item">
          <a class="nav-link ${active === key ? 'active' : ''}" href="${href}" data-link="spa">${label}</a>
        </li>
      `
    )
    .join('');

  const adminItem = isAdmin
    ? `
      <li class="nav-item">
        <a class="nav-link ${active === 'admin' ? 'active' : ''}" href="/admin" data-link="spa">${t('nav.admin')}</a>
      </li>
    `
    : '';

  const authControls = isAuthed
    ? `
      <span class="badge text-bg-secondary">${t('common.user')}</span>
      ${userEmail ? `<span class="small text-secondary auth-email">${userEmail}</span>` : ''}
      <button type="button" class="btn btn-sm btn-outline-secondary" data-action="logout">${t('nav.logout')}</button>
    `
    : `
      <a href="/login" data-link="spa" class="link-secondary text-decoration-none">${t('nav.login')}</a>
      <span class="text-secondary">/</span>
      <a href="/register" data-link="spa" class="link-secondary text-decoration-none">${t('nav.register')}</a>
    `;

  setHtml(
    '#navbar-slot',
    `
      <nav class="navbar navbar-expand-lg app-navbar">
        <div class="container">
          <a class="navbar-brand fw-semibold" href="/" data-link="spa">${t('app.name')}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${navItems}
              ${adminItem}
            </ul>
            <div class="d-flex align-items-center gap-2 small flex-wrap">
              ${authControls}
            </div>
          </div>
        </div>
      </nav>
    `
  );
}

export function wireNavbarInteractions({ navigate, rerender }) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');

    if (action === 'logout') {
      signOut()
        .then(() => {
          showToast(t('auth.logoutSuccess'), t('common.success'));
          navigate('/login', { replace: true });
          rerender();
        })
        .catch(() => {
          showToast(t('auth.genericError'), t('common.error'));
        });
    }
  });
}