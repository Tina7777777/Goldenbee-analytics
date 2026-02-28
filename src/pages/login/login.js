import './login.css';
import { t } from '../../i18n/i18n.js';
import { signIn } from '../../services/authService.js';
import { showToast } from '../../components/toast/toast.js';

function getSafeReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl') || params.get('return');

  if (!returnUrl) {
    return '/dashboard';
  }

  if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
    return '/dashboard';
  }

  return returnUrl;
}

function getFriendlyLoginError(error) {
  const message = (error?.message || '').toLowerCase();

  if (message.includes('invalid login credentials')) {
    return t('auth.errors.invalidCredentials');
  }

  if (message.includes('email not confirmed')) {
    return t('auth.errors.emailNotConfirmed');
  }

  if (message.includes('configured')) {
    return t('auth.errors.missingConfig');
  }

  return t('auth.genericError');
}

export function render() {
  return `
    <section class="login-page">
      <h1 class="mb-4">${t('pages.login.title')}</h1>
      <div class="page-card">
        <form id="login-form" class="vstack gap-3" novalidate>
          <div>
            <label for="login-email" class="form-label">${t('auth.email')}</label>
            <input id="login-email" name="email" type="email" class="form-control" required autocomplete="email" />
          </div>

          <div>
            <label for="login-password" class="form-label">${t('auth.password')}</label>
            <input id="login-password" name="password" type="password" class="form-control" required autocomplete="current-password" />
          </div>

          <button type="submit" class="btn btn-primary align-self-start">${t('auth.login')}</button>
        </form>
      </div>
    </section>
  `;
}

export function init() {
  const form = document.getElementById('login-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      showToast(t('auth.errors.requiredFields'), t('common.error'));
      return;
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      await signIn(email, password);
      showToast(t('auth.loginSuccess'), t('common.success'));

      window.history.pushState({}, '', getSafeReturnUrl());
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      showToast(getFriendlyLoginError(error), t('common.error'));
    } finally {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}