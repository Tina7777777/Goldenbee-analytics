export const MOCK_AUTHED_KEY = 'gba_mock_authed';
export const MOCK_ADMIN_KEY = 'gba_mock_admin';

let mockSession = {
  isAuthed: false,
  isAdmin: false
};

function readBooleanStorage(key) {
  return localStorage.getItem(key) === 'true';
}

function writeBooleanStorage(key, value) {
  localStorage.setItem(key, value ? 'true' : 'false');
}

function persistSession() {
  writeBooleanStorage(MOCK_AUTHED_KEY, mockSession.isAuthed);
  writeBooleanStorage(MOCK_ADMIN_KEY, mockSession.isAdmin);
}

export function initMockSessionFromStorage() {
  const isAuthed = readBooleanStorage(MOCK_AUTHED_KEY);
  const isAdmin = isAuthed ? readBooleanStorage(MOCK_ADMIN_KEY) : false;

  mockSession = {
    isAuthed,
    isAdmin
  };

  persistSession();
}

export function getMockSession() {
  return { ...mockSession };
}

export function setMockAuthed(value) {
  const isAuthed = Boolean(value);
  mockSession = {
    isAuthed,
    isAdmin: isAuthed ? mockSession.isAdmin : false
  };

  persistSession();
}

export function toggleMockAdmin() {
  if (!mockSession.isAuthed) {
    return;
  }

  mockSession = {
    ...mockSession,
    isAdmin: !mockSession.isAdmin
  };

  persistSession();
}