function getActivities() {
  try { return JSON.parse(localStorage.getItem('activityLog')) || []; }
  catch (error) { return []; }
}

function addActivity(message) {
  const activities = getActivities();
  activities.unshift({ message, createdAt: new Date().toISOString() });
  localStorage.setItem('activityLog', JSON.stringify(activities.slice(0, 20)));
}

function hasGeneratedTeams(hackathonId) {
  return Boolean(getDashboardTeamResults()[hackathonId]);
}

function getJoinedHackathons(participantId) {
  return getHackathons().filter((hackathon) => getParticipants(hackathon.id).some((participant) => participant.participantId === participantId));
}

function updateParticipantSkills(hackathonId, participantId, skills, primarySkill) {
  if (hasGeneratedTeams(hackathonId)) return false;
  const participants = getParticipants(hackathonId).map((participant) => {
    if (participant.participantId !== participantId) return participant;
    return { ...participant, skills, primarySkill };
  });
  localStorage.setItem(`participants_${hackathonId}`, JSON.stringify(participants));
  return true;
}

function removeHackathon(hackathonId) {
  const hackathons = getHackathons().filter((hackathon) => hackathon.id !== hackathonId);
  localStorage.setItem('hackathons', JSON.stringify(hackathons));
  localStorage.removeItem(`participants_${hackathonId}`);
  const details = getHackathonDetailsMap();
  delete details[hackathonId];
  localStorage.setItem('hackathonDetails', JSON.stringify(details));
  const results = getDashboardTeamResults();
  delete results[hackathonId];
  localStorage.setItem('teamResults', JSON.stringify(results));
}

function getHackathonDetailsMap() {
  try { return JSON.parse(localStorage.getItem('hackathonDetails')) || {}; }
  catch (error) { return {}; }
}

function formatActivityTime(isoDate) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
}
