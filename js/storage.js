// storage.js
// Handles reading and writing hackathons and their participants
// to LocalStorage. Each hackathon has its own isolated list of
// participants, keyed by the hackathon's id.

const HACKATHONS_KEY = "hackathons";

// ---------- Hackathon-level storage ----------

function getHackathons() {
  const raw = localStorage.getItem(HACKATHONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Could not read hackathons from storage:", err);
    return [];
  }
}

function saveHackathon(name) {
  const hackathons = getHackathons();
  const newHackathon = {
    id: Date.now().toString(), // simple unique id, good enough for LocalStorage
    name: name.trim(),
  };
  hackathons.push(newHackathon);
  localStorage.setItem(HACKATHONS_KEY, JSON.stringify(hackathons));
  return newHackathon;
}

// ---------- Participant storage, scoped per hackathon ----------

function participantsKeyFor(hackathonId) {
  return `participants_${hackathonId}`;
}

function getParticipants(hackathonId) {
  const raw = localStorage.getItem(participantsKeyFor(hackathonId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Could not read participants from storage:", err);
    return [];
  }
}

function saveParticipant(hackathonId, participant) {
  const participants = getParticipants(hackathonId);
  participants.push(participant);
  localStorage.setItem(participantsKeyFor(hackathonId), JSON.stringify(participants));
}

function clearParticipants(hackathonId) {
  localStorage.removeItem(participantsKeyFor(hackathonId));
}