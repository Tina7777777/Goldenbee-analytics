import { setHtml } from '../utils/dom.js';
import { Toast } from 'bootstrap';

export function showToast(message, title = 'Info') {
  const toastId = `toast-${Date.now()}`;

  setHtml(
    '#app-toast-root',
    `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-info-circle-fill me-2"></i>
          <strong class="me-auto">${title}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>
    `
  );

  const toastElement = document.getElementById(toastId);
  if (!toastElement) {
    return;
  }

  const toast = new Toast(toastElement, { delay: 2500 });
  toast.show();
}