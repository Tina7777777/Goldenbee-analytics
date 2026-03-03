import './profile.css';
import { t } from '../../i18n/i18n.js';
import { showToast } from '../../components/toast/toast.js';
import { getMyProfile, upsertMyProfile } from '../../services/profileService.js';
import { getMyLatestProfilePhotoUrl, uploadMyProfilePhoto } from '../../services/photoService.js';

let profile = null;
let isLoading = false;
let isSaving = false;
let isPhotoUploading = false;
let profilePhoto = null;

function createDefaultProfileState() {
  return {
    display_name: '',
    about: '',
    location_text: '',
    contacts: '',
    is_public_profile: false,
    show_location: false,
    show_hive_count: false,
    show_contacts: false
  };
}

function toInputValue(value) {
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
    return t('profile.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('profile.errors.missingConfig');
  }

  return t('profile.errors.generic');
}

function checkboxChecked(value) {
  return value ? 'checked' : '';
}

function loadingMarkup() {
  return `
    <div class="page-card">
      <p class="mb-0 text-secondary">${t('common.loading')}</p>
    </div>
  `;
}

function formMarkup() {
  const state = profile || createDefaultProfileState();
  const photoUrl = profilePhoto?.url || '';

  return `
    <div class="page-card">
      <div class="profile-photo-block mb-4">
        <h2 class="h6 mb-3">${t('profile.photo.title')}</h2>
        ${
          photoUrl
            ? `
              <div class="profile-photo-preview-wrap mb-3">
                <img src="${toInputValue(photoUrl)}" alt="${t('profile.photo.alt')}" class="profile-photo-preview" />
              </div>
              <a href="${toInputValue(photoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-secondary mb-3">${t('profile.photo.download')}</a>
            `
            : `<p class="text-secondary small mb-3">${t('profile.photo.noPhoto')}</p>`
        }

        <form id="profile-photo-form" class="vstack gap-2" novalidate>
          <input class="form-control" type="file" id="profile-photo-file" name="photo" accept="image/*" />
          <div>
            <button type="submit" class="btn btn-outline-primary" ${isPhotoUploading ? 'disabled' : ''}>
              ${isPhotoUploading ? t('profile.photo.uploading') : t('profile.photo.upload')}
            </button>
          </div>
        </form>
      </div>

      <form id="profile-form" class="vstack gap-3" novalidate>
        <div>
          <label class="form-label" for="profile-display-name">${t('profile.form.displayName')}</label>
          <input id="profile-display-name" name="display_name" class="form-control" value="${toInputValue(state.display_name)}" />
        </div>

        <div>
          <label class="form-label" for="profile-about">${t('profile.form.about')}</label>
          <textarea id="profile-about" name="about" class="form-control" rows="4">${toInputValue(state.about)}</textarea>
        </div>

        <div>
          <label class="form-label" for="profile-location">${t('profile.form.location')}</label>
          <input id="profile-location" name="location_text" class="form-control" value="${toInputValue(state.location_text)}" />
        </div>

        <div>
          <label class="form-label" for="profile-contacts">${t('profile.form.contacts')}</label>
          <textarea id="profile-contacts" name="contacts" class="form-control" rows="3">${toInputValue(state.contacts)}</textarea>
        </div>

        <div class="vstack gap-2 profile-switches">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="profile-is-public" name="is_public_profile" ${checkboxChecked(state.is_public_profile)} />
            <label class="form-check-label" for="profile-is-public">${t('profile.form.isPublicProfile')}</label>
          </div>

          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="profile-show-location" name="show_location" ${checkboxChecked(state.show_location)} />
            <label class="form-check-label" for="profile-show-location">${t('profile.form.showLocation')}</label>
          </div>

          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="profile-show-hive-count" name="show_hive_count" ${checkboxChecked(state.show_hive_count)} />
            <label class="form-check-label" for="profile-show-hive-count">${t('profile.form.showHiveCount')}</label>
          </div>

          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="profile-show-contacts" name="show_contacts" ${checkboxChecked(state.show_contacts)} />
            <label class="form-check-label" for="profile-show-contacts">${t('profile.form.showContacts')}</label>
          </div>
        </div>

        <div>
          <button type="submit" class="btn btn-primary" id="profile-submit" ${isSaving ? 'disabled' : ''}>
            ${
              isSaving
                ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${t('profile.actions.saving')}`
                : t('common.save')
            }
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderContent() {
  const contentEl = document.getElementById('profile-content');
  if (!contentEl) {
    return;
  }

  contentEl.innerHTML = isLoading ? loadingMarkup() : formMarkup();
}

async function loadProfile() {
  isLoading = true;
  renderContent();

  try {
    const [result, latestPhoto] = await Promise.all([getMyProfile(), getMyLatestProfilePhotoUrl()]);
    profile = {
      ...createDefaultProfileState(),
      ...(result || {})
    };
    profilePhoto = latestPhoto;
  } catch (error) {
    profile = createDefaultProfileState();
    profilePhoto = null;
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isLoading = false;
    renderContent();
  }
}

function getFriendlyPhotoErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('exceeds max size')) {
    return t('profile.photo.errors.fileTooLarge');
  }

  if (message.includes('invalid image file type')) {
    return t('profile.photo.errors.invalidType');
  }

  if (message.includes('not authenticated')) {
    return t('profile.errors.notAuthenticated');
  }

  if (message.includes('configured')) {
    return t('profile.errors.missingConfig');
  }

  return t('profile.photo.errors.generic');
}

async function handlePhotoUpload(formElement) {
  const fileInput = formElement.querySelector('input[name="photo"]');
  const photoFile = fileInput?.files?.[0] || null;

  if (!photoFile) {
    showToast(t('profile.photo.errors.required'), t('common.error'));
    return;
  }

  try {
    isPhotoUploading = true;
    renderContent();
    await uploadMyProfilePhoto(photoFile);
    profilePhoto = await getMyLatestProfilePhotoUrl();
    showToast(t('profile.photo.toasts.uploadSuccess'), t('common.success'));
  } catch (error) {
    showToast(getFriendlyPhotoErrorMessage(error), t('common.error'));
  } finally {
    isPhotoUploading = false;
    renderContent();
  }
}

async function handleProfileSubmit(formElement) {
  const formData = new FormData(formElement);

  try {
    isSaving = true;
    renderContent();

    const result = await upsertMyProfile({
      display_name: formData.get('display_name'),
      about: formData.get('about'),
      location_text: formData.get('location_text'),
      contacts: formData.get('contacts'),
      is_public_profile: formData.get('is_public_profile') !== null,
      show_location: formData.get('show_location') !== null,
      show_hive_count: formData.get('show_hive_count') !== null,
      show_contacts: formData.get('show_contacts') !== null
    });

    profile = {
      ...createDefaultProfileState(),
      ...(result || {})
    };

    showToast(t('profile.toasts.saveSuccess'), t('common.success'));
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), t('common.error'));
  } finally {
    isSaving = false;
    renderContent();
  }
}

export function render() {
  return `
    <section class="profile-page">
      <h1 class="mb-4">${t('pages.profile.title')}</h1>
      <div id="profile-content"></div>
    </section>
  `;
}

export function init() {
  const pageElement = document.querySelector('.profile-page');
  if (!pageElement) {
    return;
  }

  profile = createDefaultProfileState();
  isLoading = true;
  isSaving = false;
  isPhotoUploading = false;
  profilePhoto = null;
  renderContent();
  void loadProfile();

  pageElement.addEventListener('submit', (event) => {
    const photoFormElement = event.target.closest('#profile-photo-form');
    if (photoFormElement && pageElement.contains(photoFormElement)) {
      event.preventDefault();
      if (!isPhotoUploading) {
        void handlePhotoUpload(photoFormElement);
      }

      return;
    }

    const formElement = event.target.closest('#profile-form');
    if (!formElement || !pageElement.contains(formElement)) {
      return;
    }

    event.preventDefault();
    if (!isSaving) {
      void handleProfileSubmit(formElement);
    }
  });
}