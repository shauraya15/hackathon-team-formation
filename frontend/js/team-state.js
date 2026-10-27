const TEAM_RESULTS_KEY = 'teamResults';

function addActivity(message) {
  let activities = [];
  try { activities = JSON.parse(localStorage.getItem('activityLog')) || []; }
  catch (error) { activities = []; }
  activities.unshift({ message, createdAt: new Date().toISOString() });
  localStorage.setItem('activityLog', JSON.stringify(activities.slice(0, 20)));
}

function getTeamResults() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_RESULTS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function getSavedTeams(hackathonId) {
  return getTeamResults()[hackathonId] || null;
}

function saveTeams(hackathonId, teams) {
  const results = getTeamResults();
  results[hackathonId] = {
    generatedAt: new Date().toISOString(),
    teams,
  };
  localStorage.setItem(TEAM_RESULTS_KEY, JSON.stringify(results));
}

function getSavedTeamsForParticipant(hackathonId, participantId) {
  const result = getSavedTeams(hackathonId);
  if (!result) return null;
  return result.teams.find((team) => team.members.some((member) => member.participantId === participantId)) || null;
}

function getGeneratedTeamCount() {
  return Object.values(getTeamResults()).reduce((total, result) => total + result.teams.length, 0);
}
