import './admin.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { adminUnpublishProfile, getPublicProfiles } from '../../services/profileService.js';

let publicProfiles = [];
let visibleProfiles = [];
let searchTerm = '';
let isLoading = false;
let processingProfileId = '';

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

  if (message.includes('not authenticated')) {
    return t('admin.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('admin.errors.missingConfig');
  }

  return t('admin.errors.generic');
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
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
  visibleProfiles = publicProfiles.filter((profile) => matchesSearch(profile, query));
  renderContent();
}

function publicProfileCardMarkup(profile) {
  const hasHiveCount = profile.public_hive_count !== null && profile.public_hive_count !== undefined;
  const photoMarkup = profile.photo_url
    ? `
      <div class="admin-profile-photo-wrap mb-2">
        <img src="${escapeHtml(profile.photo_url)}" alt="${t('admin.publicDirectory.photoAlt')}" class="admin-profile-photo" />
      </div>
    `
    : '';

  return `
    <article class="page-card">
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          ${photoMarkup}
          <h2 class="h5 mb-2">${escapeHtml(profile.display_name || t('admin.publicDirectory.unknownName'))}</h2>
          ${profile.about ? `<p class="mb-2">${escapeHtml(profile.about)}</p>` : ''}
          <div class="small">
            ${profile.show_location && profile.location_text ? `<p class="mb-1"><span class="text-secondary">${t('home.directory.fields.location')}:</span> ${escapeHtml(profile.location_text)}</p>` : ''}
            ${profile.show_contacts && profile.contacts ? `<p class="mb-1"><span class="text-secondary">${t('home.directory.fields.contacts')}:</span> ${escapeHtml(profile.contacts)}</p>` : ''}
            ${profile.show_hive_count && hasHiveCount && Number.isFinite(Number(profile.public_hive_count)) ? `<p class="mb-0"><span class="text-secondary">${t('home.directory.fields.hiveCount')}:</span> ${Number(profile.public_hive_count)}</p>` : ''}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          data-action="unpublish"
          data-profile-id="${profile.id}"
          ${processingProfileId === profile.id ? 'disabled' : ''}
        >
          ${processingProfileId === profile.id ? t('admin.actions.processing') : t('admin.actions.unpublish')}
        </button>
      </div>
    </article>
  `;
}

function listMarkup() {
  if (!visibleProfiles.length) {
    return `
      <div class="page-card">
        <p class="mb-0">${t('admin.publicDirectory.empty')}</p>
      </div>
    `;
  }

  return `
    <div class="vstack gap-3">
      ${visibleProfiles.map((profile) => publicProfileCardMarkup(profile)).join('')}
    </div>
  `;
}

function renderContent() {
  const contentElement = document.getElementById('admin-public-profiles-content');
  if (!contentElement) {
    return;
  }

  contentElement.innerHTML = isLoading ? loadingMarkup() : listMarkup();
}

async function loadPublicProfiles() {
  isLoading = true;
  renderContent();

  try {
    publicProfiles = await getPublicProfiles();
    applySearchFilter();
  } catch (error) {
    publicProfiles = [];
    visibleProfiles = [];
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
    renderContent();
  }
}

async function handleUnpublish(profileId) {
  if (!profileId || processingProfileId) {
    return;
  }

  try {
    processingProfileId = profileId;
    renderContent();
    await adminUnpublishProfile(profileId);
    publicProfiles = publicProfiles.filter((item) => item.id !== profileId);
    applySearchFilter();
    showToast(t('admin.toasts.unpublishSuccess'), t('common.success'));
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    processingProfileId = '';
    renderContent();
  }
}

export function render() {
  return `
    <section class="admin-page">
      <h1 class="mb-4">${t('pages.admin.title')}</h1>
      <div class="page-card mb-3">
        <label class="form-label" for="admin-public-profiles-search">${t('home.directory.searchLabel')}</label>
        <input
          id="admin-public-profiles-search"
          type="search"
          class="form-control"
          placeholder="${t('home.directory.searchPlaceholder')}"
          value="${escapeHtml(searchTerm)}"
        />
      </div>
      <section class="mt-3">
        <h2 class="h5 mb-3">${t('admin.publicDirectory.title')}</h2>
        <div id="admin-public-profiles-content"></div>
      </section>
    </section>
  `;
}

export function init() {
  publicProfiles = [];
  visibleProfiles = [];
  searchTerm = '';
  isLoading = true;
  processingProfileId = '';
  renderContent();
  void loadPublicProfiles();

  const pageElement = document.querySelector('.admin-page');
  if (!pageElement) {
    return;
  }

  const searchInput = document.getElementById('admin-public-profiles-search');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      searchTerm = String(event.target?.value || '');
      applySearchFilter();
    });
  }

  pageElement.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action="unpublish"]');
    if (!actionButton || !pageElement.contains(actionButton)) {
      return;
    }

    const profileId = actionButton.getAttribute('data-profile-id') || '';
    void handleUnpublish(profileId);
  });
}