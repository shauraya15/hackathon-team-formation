// storage.js
// Handles reading and writing participants to LocalStorage.
// This file doesn't decide teams - it's just the "notepad" the
// rest of the app reads from and writes to.

const STORAGE_KEY = "hackathonParticipants";

function getParticipants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Could not read participants from storage:", err);
    return [];
  }
}

function saveParticipant(participant) {
  const participants = getParticipants();
  participants.push(participant);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
}

function clearParticipants() {
  localStorage.removeItem(STORAGE_KEY);
}