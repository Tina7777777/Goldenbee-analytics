import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initRegisterPage() {
  mountShell({ active: '', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card col-md-6">
        <p class="text-secondary">Registration form placeholder.</p>
      </div>
    `
  );
}

initRegisterPage();