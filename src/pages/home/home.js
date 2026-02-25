import '../../utils/appSetup.js';
import { mountShell } from '../../components/shell.js';
import { setHtml } from '../../utils/dom.js';

export function initHomePage() {
  mountShell({ active: 'home', isAdmin: false, authLabel: 'Guest' });

  setHtml(
    '#page-content',
    `
      <div class="page-card">
        <p class="mb-0">Welcome to GoldenBee Analytics starter project.</p>
      </div>
    `
  );
}

initHomePage();