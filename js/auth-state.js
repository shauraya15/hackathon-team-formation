// auth-state.js
// Client-side authentication session state using LocalStorage.
// Simple, readable session guards and getters for multi-page routing.

const LOGGED_IN_ORGANIZER_KEY = "loggedInOrganizerId";
const LOGGED_IN_PARTICIPANT_KEY = "loggedInParticipantId";

// ==========================================================================
// ORGANIZER SESSION
// ==========================================================================

function getLoggedInOrganizer() {
  const id = localStorage.getItem(LOGGED_IN_ORGANIZER_KEY);
  if (!id) return null;
  return getOrganizerById(id);
}

function setLoggedInOrganizer(organizerId) {
  if (organizerId) {
    localStorage.setItem(LOGGED_IN_ORGANIZER_KEY, organizerId);
  } else {
    localStorage.removeItem(LOGGED_IN_ORGANIZER_KEY);
  }
}

function logoutOrganizer() {
  localStorage.removeItem(LOGGED_IN_ORGANIZER_KEY);
  window.location.href = "organizer-login.html";
}

function requireOrganizerAuth(redirect = "organizer-login.html") {
  const org = getLoggedInOrganizer();
  if (!org) {
    window.location.href = redirect;
    return null;
  }
  return org;
}

// ==========================================================================
// PARTICIPANT SESSION
// ==========================================================================

function getLoggedInParticipant() {
  const id = localStorage.getItem(LOGGED_IN_PARTICIPANT_KEY);
  if (!id) return null;
  return getParticipantAccountById(id);
}

function setLoggedInParticipant(participantId) {
  if (participantId) {
    localStorage.setItem(LOGGED_IN_PARTICIPANT_KEY, participantId);
  } else {
    localStorage.removeItem(LOGGED_IN_PARTICIPANT_KEY);
  }
}

function logoutParticipant() {
  localStorage.removeItem(LOGGED_IN_PARTICIPANT_KEY);
  window.location.href = "participant-login.html";
}

function requireParticipantAuth(redirect = "participant-login.html") {
  const pt = getLoggedInParticipant();
  if (!pt) {
    window.location.href = redirect;
    return null;
  }
  return pt;
}
