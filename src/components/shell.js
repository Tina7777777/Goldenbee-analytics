import { renderFooter } from './footer.js';
import { renderNavbar } from './navbar.js';

export function mountShell(options) {
  renderNavbar(options);
  renderFooter();
}