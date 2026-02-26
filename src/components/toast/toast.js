import './toast.css';
import { Toast } from 'bootstrap';
import { t } from '../../i18n/i18n.js';

function ensureToastContainer() {
  let container = document.getElementById('app-toast-root');

  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-root';
    container.className = 'toast-container position-fixed top-0 end-0 p-3 gba-toast-container';
    document.body.appendChild(container);
  }

  return container;
}

export function showToast(message, title = t('common.info')) {
  const container = ensureToastContainer();
  const toastId = `toast-${Date.now()}`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="bi bi-info-circle-fill me-2"></i>
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;

  const toastElement = wrapper.firstElementChild;
  if (!toastElement) {
    return;
  }

  container.appendChild(toastElement);
  const toast = new Toast(toastElement, { delay: 2500 });
  toast.show();
}