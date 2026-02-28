import './register.css';
import { t } from '../../i18n/i18n.js';
import { signUp } from '../../services/authService.js';
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

function getFriendlyRegisterError(error) {
  const message = (error?.message || '').toLowerCase();

  if (message.includes('already registered')) {
    return t('auth.errors.userExists');
  }

  if (message.includes('password')) {
    return t('auth.errors.weakPassword');
  }

  if (message.includes('configured')) {
    return t('auth.errors.missingConfig');
  }

  return t('auth.genericError');
}

export function render() {
  return `
    <section class="register-page">
      <h1 class="mb-4">${t('pages.register.title')}</h1>
      <div class="page-card">
        <form id="register-form" class="vstack gap-3" novalidate>
          <div>
            <label for="register-email" class="form-label">${t('auth.email')}</label>
            <input id="register-email" name="email" type="email" class="form-control" required autocomplete="email" />
          </div>

          <div>
            <label for="register-password" class="form-label">${t('auth.password')}</label>
            <input id="register-password" name="password" type="password" class="form-control" required minlength="6" autocomplete="new-password" />
          </div>

          <div>
            <label for="register-confirm-password" class="form-label">${t('auth.confirmPassword')}</label>
            <input id="register-confirm-password" name="confirmPassword" type="password" class="form-control" required minlength="6" autocomplete="new-password" />
          </div>

          <button type="submit" class="btn btn-primary align-self-start">${t('auth.createAccount')}</button>
        </form>
      </div>
    </section>
  `;
}

export function init() {
  const form = document.getElementById('register-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (!email || !password || !confirmPassword) {
      showToast(t('auth.errors.requiredFields'), t('common.error'));
      return;
    }

    if (password.length < 6) {
      showToast(t('auth.errors.passwordMinLength'), t('common.error'));
      return;
    }

    if (password !== confirmPassword) {
      showToast(t('auth.errors.passwordsMismatch'), t('common.error'));
      return;
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      await signUp(email, password);

      showToast(
        t('auth.registerSuccess'),
        t('common.success')
      );

      window.history.pushState({}, '', getSafeReturnUrl());
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      showToast(getFriendlyRegisterError(error), t('common.error'));
    } finally {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}