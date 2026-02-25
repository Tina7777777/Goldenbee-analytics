import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initProfilePage() {
  mountShell({ active: 'profile', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Profile placeholder with opt-in public visibility controls.</p>
      </div>
    `
  );
}

initProfilePage();