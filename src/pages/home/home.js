import './home.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getPublicProfiles } from '../../services/profileService.js';

let allProfiles = [];
let visibleProfiles = [];
let searchTerm = '';
let isLoading = false;

const UNKNOWN_BEEKEEPER_LABEL = '—';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('configured')) {
    return t('home.errors.missingConfig');
  }

  return t('home.errors.generic');
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
}

function profileCardMarkup(profile) {
  const displayName = profile.display_name ? escapeHtml(profile.display_name) : UNKNOWN_BEEKEEPER_LABEL;
  const aboutMarkup = profile.about ? `<p class="mb-3">${escapeHtml(profile.about)}</p>` : '';
  const photoMarkup = profile.photo_url
    ? `
      <div class="home-profile-photo-wrap mb-3">
        <img src="${escapeHtml(profile.photo_url)}" alt="${t('home.directory.fields.photoAlt')}" class="home-profile-photo" />
      </div>
    `
    : '';

  const locationMarkup = profile.show_location && profile.location_text
    ? `<p class="mb-1"><span class="text-secondary">${t('home.directory.fields.location')}:</span> ${escapeHtml(profile.location_text)}</p>`
    : '';

  const contactsMarkup = profile.show_contacts && profile.contacts
    ? `<p class="mb-1"><span class="text-secondary">${t('home.directory.fields.contacts')}:</span> ${escapeHtml(profile.contacts)}</p>`
    : '';

  const hasHiveCount = profile.public_hive_count !== null && profile.public_hive_count !== undefined;
  const hiveCountMarkup = profile.show_hive_count && hasHiveCount && Number.isFinite(Number(profile.public_hive_count))
    ? `<p class="mb-0"><span class="text-secondary">${t('home.directory.fields.hiveCount')}:</span> ${Number(profile.public_hive_count)}</p>`
    : '';

  return `
    <div class="col">
      <article class="page-card h-100">
        ${photoMarkup}
        <h2 class="h5 mb-3">${displayName}</h2>
        ${aboutMarkup}
        <div class="small">
          ${locationMarkup}
          ${contactsMarkup}
          ${hiveCountMarkup}
        </div>
      </article>
    </div>
  `;
}

function directoryMarkup() {
  if (!visibleProfiles.length) {
    return `
      <div class="page-card">
        <p class="mb-0">${t('home.directory.empty')}</p>
      </div>
    `;
  }

  return `
    <div class="row row-cols-1 row-cols-lg-2 g-3">
      ${visibleProfiles.map((profile) => profileCardMarkup(profile)).join('')}
    </div>
  `;
}

function renderContent() {
  const contentEl = document.getElementById('home-directory-content');
  if (!contentEl) {
    return;
  }

  contentEl.innerHTML = isLoading ? loadingMarkup() : directoryMarkup();
}

function matchesSearch(profile, query) {
  if (!query) {
    return true;
  }

  const displayName = String(profile.display_name || '').toLowerCase();
  const publicLocation = profile.show_location ? String(profile.location_text || '').toLowerCase() : '';

  return displayName.includes(query) || publicLocation.includes(query);
}

function applySearchFilter() {
  const query = searchTerm.trim().toLowerCase();
  visibleProfiles = allProfiles.filter((profile) => matchesSearch(profile, query));
  renderContent();
}

async function loadDirectory() {
  isLoading = true;
  renderContent();

  try {
    allProfiles = await getPublicProfiles();
    applySearchFilter();
  } catch (error) {
    allProfiles = [];
    visibleProfiles = [];
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
    renderContent();
  }
}

export function render() {
  return `
    <section class="home-page">
      <h1 class="mb-4">${t('pages.home.title')}</h1>
      <p class="text-secondary mb-3">${t('pages.home.description')}</p>
      <div class="page-card mb-3">
        <label class="form-label" for="home-directory-search">${t('home.directory.searchLabel')}</label>
        <input
          id="home-directory-search"
          type="search"
          class="form-control"
          placeholder="${t('home.directory.searchPlaceholder')}"
          value="${escapeHtml(searchTerm)}"
        />
      </div>
      <div id="home-directory-content"></div>
    </section>
  `;
}

export function init() {
  allProfiles = [];
  visibleProfiles = [];
  searchTerm = '';
  isLoading = true;
  renderContent();
  void loadDirectory();

  const searchInput = document.getElementById('home-directory-search');
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('input', (event) => {
    searchTerm = String(event.target?.value || '');
    applySearchFilter();
  });
}