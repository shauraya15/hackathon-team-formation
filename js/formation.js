function renderFormationState() {
  const selected = getHackathons().find((hackathon) => hackathon.id === activeHackathonId);
  const name = document.getElementById('formation-hackathon-name');
  const description = document.getElementById('formation-hackathon-description');
  const meta = document.getElementById('formation-hackathon-meta');
  const participantList = document.getElementById('formation-participant-list');
  const noTeamsMessage = document.getElementById('no-teams-message');
  const teamContainer = document.getElementById('team-cards-container');

  if (!selected) {
    name.textContent = 'Choose an event';
    description.textContent = 'Select a hackathon to load its details and participants.';
    meta.innerHTML = '';
    participantList.innerHTML = '<p class="empty-state">Select a hackathon to load participants.</p>';
    noTeamsMessage.hidden = false;
    teamContainer.innerHTML = '';
    return;
  }

  const details = getHackathonDetails(selected.id);
  const participants = getParticipants(selected.id);
  const saved = getSavedTeams(selected.id);
  name.textContent = selected.name;
  description.textContent = details.description || 'No description added for this hackathon.';
  meta.innerHTML = `<span>${details.mode || 'Mode not set'}</span><span>${details.startDate || 'Start date not set'}</span><span>${details.endDate || 'End date not set'}</span><span>${participants.length} participants</span>`;
  participantList.innerHTML = participants.length ? participants.map((participant) => `<div class="formation-participant"><strong>${participant.name}</strong><span>${participant.skills.join(', ')}</span><b>${participant.primarySkill}</b></div>`).join('') : '<p class="empty-state">No participants registered yet.</p>';
  const savedTeams = saved ? saved.teams : null;
  noTeamsMessage.hidden = Boolean(savedTeams);
  teamContainer.innerHTML = savedTeams ? savedTeams.map((team) => createFormationTeamCard(team)).join('') : '';
  document.getElementById('formation-team-count').textContent = savedTeams ? savedTeams.length : document.getElementById('team-count').value || 'Not set';
  document.getElementById('generate-teams-btn').textContent = savedTeams ? 'Regenerate Teams' : 'Generate Teams';
}

function createFormationTeamCard(team) {
  const members = team.members.map((member) => `<li><strong>${member.name}</strong><span>Skills: ${member.skills.join(', ')}</span><em>Primary: ${member.primarySkill}</em></li>`).join('');
  const spread = Object.entries(team.skillCounts).filter(([, count]) => count).map(([skill, count]) => `${skill}: ${count}`).join(' · ');
  return `<article class="formation-team-card"><div class="formation-team-heading"><h3>Team ${team.id}</h3><span>${team.members.length} members</span></div><ul>${members}</ul><p>Skill distribution: ${spread || 'Not available'}</p></article>`;
}

hackathonSelect.addEventListener('change', renderFormationState);
generateBtn.addEventListener('click', () => setTimeout(renderFormationState, 0));
setTimeout(renderFormationState, 0);
