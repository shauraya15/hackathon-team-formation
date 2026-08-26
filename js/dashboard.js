function getSessionAccount(type) {
  const key = type === 'organizer' ? 'loggedInOrganizerId' : 'loggedInParticipantId';
  const accountsKey = type === 'organizer' ? 'organizers' : 'participantAccounts';
  const id = localStorage.getItem(key);
  try { return (JSON.parse(localStorage.getItem(accountsKey)) || []).find((account) => account.id === id); }
  catch (error) { return null; }
}

function requireSession(type) {
  const account = getSessionAccount(type);
  if (!account) { window.location.href = type === 'organizer' ? '../pages/organizer-login.html' : '../pages/participant-login.html'; return null; }
  return account;
}

function getHackathonDetails(id) {
  try { return (JSON.parse(localStorage.getItem('hackathonDetails')) || {})[id] || {}; }
  catch (error) { return {}; }
}

function saveHackathonDetails(id, details) {
  let all = {};
  try { all = JSON.parse(localStorage.getItem('hackathonDetails')) || {}; } catch (error) { all = {}; }
  all[id] = details; localStorage.setItem('hackathonDetails', JSON.stringify(all));
}

function countAllParticipants() { return getHackathons().reduce((total, hackathon) => total + getParticipants(hackathon.id).length, 0); }
function animateNumber(element, target) { let current = 0; const step = Math.max(1, Math.ceil(target / 20)); const timer = setInterval(() => { current = Math.min(target, current + step); element.textContent = current; if (current === target) clearInterval(timer); }, 30); }
function addActivity(message) { let activities = []; try { activities = JSON.parse(localStorage.getItem('activityLog')) || []; } catch (error) { activities = []; } activities.unshift({ message, createdAt: new Date().toISOString() }); localStorage.setItem('activityLog', JSON.stringify(activities.slice(0, 20))); }
function getDashboardTeamResults() { try { return JSON.parse(localStorage.getItem('teamResults')) || {}; } catch (error) { return {}; } }
function getDashboardTeam(hackathonId, participantId) { const result = getDashboardTeamResults()[hackathonId]; if (!result) return null; return result.teams.find((team) => team.members.some((member) => member.participantId === participantId)) || null; }
function countGeneratedTeams() { return Object.values(getDashboardTeamResults()).reduce((total, result) => total + result.teams.length, 0); }

const organizer = document.body.dataset.dashboard === 'organizer' ? requireSession('organizer') : null;
if (organizer) {
  const nameTarget = document.getElementById('account-name'); if (nameTarget) nameTarget.textContent = organizer.name;
  const stats = document.querySelectorAll('[data-stat]'); if (stats[0]) animateNumber(stats[0], getHackathons().length); if (stats[1]) animateNumber(stats[1], countAllParticipants()); if (stats[2]) animateNumber(stats[2], countGeneratedTeams());
  const logout = document.getElementById('logout'); if (logout) logout.addEventListener('click', () => { localStorage.removeItem('loggedInOrganizerId'); window.location.href = '../pages/index.html'; });
  const list = document.getElementById('event-list'); const detail = document.getElementById('event-detail');
  let activeEvent = null;
  const participantBody = document.getElementById('participant-table-body');
  const participantCount = document.getElementById('participant-count');
  const participantSearch = document.getElementById('participant-search');
  const skillFilter = document.getElementById('skill-filter');
  function renderParticipants() {
    if (!activeEvent) return;
    const query = participantSearch.value.trim().toLowerCase();
    const skill = skillFilter.value;
    const participants = getParticipants(activeEvent.id).filter((participant) => {
      return participant.name.toLowerCase().includes(query) && (!skill || participant.primarySkill === skill);
    });
    participantCount.textContent = `${getParticipants(activeEvent.id).length} participants in ${activeEvent.name}`;
    participantBody.innerHTML = '';
    if (!participants.length) { participantBody.innerHTML = '<tr><td class="participant-empty" colspan="4">No matching participants.</td></tr>'; return; }
    participants.forEach((participant) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${participant.name}</td><td>${participant.skills.join(', ')}</td><td>${participant.primarySkill}</td><td><button class="participant-delete" type="button">Delete</button></td>`;
      row.querySelector('.participant-delete').addEventListener('click', () => {
        const remaining = getParticipants(activeEvent.id).filter((item) => item !== participant);
        localStorage.setItem(`participants_${activeEvent.id}`, JSON.stringify(remaining));
        renderParticipants();
        showEvents();
      });
      participantBody.appendChild(row);
    });
  }
  participantSearch.addEventListener('input', renderParticipants);
  skillFilter.addEventListener('change', renderParticipants);
  function showEvents() { const events = getHackathons(); list.innerHTML = ''; if (!events.length) { list.innerHTML = '<div class="empty-state">No events yet. Create the first one.</div>'; detail.innerHTML = '<h3>Your first room starts here.</h3><p>Create a hackathon to begin collecting the strengths in it.</p>'; return; } events.forEach((event, index) => { const row = document.createElement('div'); row.className = `event-row${index === 0 ? ' active' : ''}`; row.innerHTML = `<div><strong>${event.name}</strong><span>${getParticipants(event.id).length} participants</span></div><button class="event-arrow" type="button" aria-label="Show ${event.name} participants">↗</button>`; row.addEventListener('click', () => showDetail(event, row)); row.querySelector('.event-arrow').addEventListener('click', (clickEvent) => { clickEvent.stopPropagation(); showDetail(event, row); document.getElementById('participants').scrollIntoView({ behavior: 'smooth', block: 'start' }); }); list.appendChild(row); }); showDetail(events[0], list.firstChild); }
  function showDetail(event, row) { activeEvent = event; document.querySelectorAll('.event-row').forEach((item) => item.classList.remove('active')); if (row) row.classList.add('active'); const info = getHackathonDetails(event.id); detail.innerHTML = `<p class="kicker">Active event</p><h3>${event.name}</h3><p>${info.description || 'A new space for people and ideas to meet.'}</p><div class="detail-meta"><span>${info.mode || 'Mode to be set'}</span><span>${info.startDate || 'Date to be set'}</span><span>${getParticipants(event.id).length} participants</span></div><a class="primary-link" href="../pages/organizer-tool.html?hackathon=${event.id}">Open formation workspace</a> <button class="text-button" id="edit-event" type="button">Edit details</button> <button class="text-button danger" id="delete-event" type="button">Delete event</button>`; document.getElementById('edit-event').addEventListener('click', () => { const name = prompt('Hackathon name', event.name); if (!name || !name.trim()) return; const hackathons = getHackathons().map((item) => item.id === event.id ? { ...item, name: name.trim() } : item); localStorage.setItem('hackathons', JSON.stringify(hackathons)); addActivity(`${name.trim()} was updated`); showEvents(); }); document.getElementById('delete-event').addEventListener('click', () => { if (!confirm(`Delete ${event.name}?`)) return; removeHackathon(event.id); addActivity(`${event.name} was deleted`); showEvents(); renderParticipants(); }); renderParticipants(); }
  showEvents();
}

const createForm = document.getElementById('create-hackathon-form');
if (createForm) {
  const account = requireSession('organizer');
  if (account) createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('hackathon-name').value.trim();
    const newEvent = saveHackathon(name);
    saveHackathonDetails(newEvent.id, {
      description: document.getElementById('description').value.trim(),
      startDate: document.getElementById('start-date').value,
      endDate: document.getElementById('end-date').value,
      mode: document.getElementById('mode').value,
      venue: document.getElementById('venue').value.trim(),
      deadline: document.getElementById('deadline').value,
      maxParticipants: document.getElementById('max-participants').value,
    });
    addActivity(`${newEvent.name} was created`);
    window.location.href = '../pages/organizer-dashboard.html';
  });
}
