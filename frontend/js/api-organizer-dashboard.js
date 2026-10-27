function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

async function requireApiRole(role) {
  const account = getApiAccount();
  if (!getApiToken() || !account || account.role !== role) {
    window.location.href = role === "organizer" ? "../pages/organizer-login.html" : "../pages/participant-login.html";
    return null;
  }
  return account;
}

async function loadOrganizerDashboard() {
  const organizer = await requireApiRole("organizer");
  if (!organizer) return;
  document.getElementById("account-name").textContent = organizer.name;
  document.getElementById("logout").addEventListener("click", () => {
    clearApiSession();
    window.location.href = "index.html";
  });

  const list = document.getElementById("event-list");
  const detail = document.getElementById("event-detail");
  const participantBody = document.getElementById("participant-table-body");
  const participantCount = document.getElementById("participant-count");
  const search = document.getElementById("participant-search");
  const skillFilter = document.getElementById("skill-filter");
  let events = [];
  let activeEvent = null;
  let participants = [];

  async function refreshStats() {
    const results = await Promise.all(events.map(event => apiGet(`/hackathons/${event._id}/analytics`).catch(() => ({ participantCount: 0, teamCount: 0 }))));
    document.querySelectorAll("[data-stat]")[0].textContent = events.length;
    document.querySelectorAll("[data-stat]")[1].textContent = results.reduce((sum, item) => sum + item.participantCount, 0);
    document.querySelectorAll("[data-stat]")[2].textContent = results.reduce((sum, item) => sum + item.teamCount, 0);
  }

  async function renderParticipants() {
    if (!activeEvent) return;
    const result = await apiGet(`/hackathons/${activeEvent._id}/participants`);
    participants = result.participants;
    const query = search.value.trim().toLowerCase();
    const skill = skillFilter.value;
    const filtered = participants.filter(item => item.name.toLowerCase().includes(query) && (!skill || item.primarySkill === skill));
    participantCount.textContent = `${participants.length} participants in ${activeEvent.name}`;
    participantBody.innerHTML = filtered.length
      ? filtered.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.skills.join(", "))}</td><td>${escapeHtml(item.primarySkill)}</td><td>API-managed</td></tr>`).join("")
      : '<tr><td class="participant-empty" colspan="4">No matching participants.</td></tr>';
  }

  async function showDetail(event, row) {
    activeEvent = event;
    document.querySelectorAll(".event-row").forEach(item => item.classList.remove("active"));
    if (row) row.classList.add("active");
    detail.innerHTML = `<p class="kicker">Active event</p><h3>${escapeHtml(event.name)}</h3><p>${escapeHtml(event.description || "A new space for people and ideas to meet.")}</p><div class="detail-meta"><span>${escapeHtml(event.mode)}</span><span>${escapeHtml(event.startDate || "Date to be set")}</span><span>${event.participantCount} participants</span></div><a class="primary-link" href="../pages/organizer-tool.html?hackathon=${event._id}">Open formation workspace</a>`;
    await renderParticipants();
  }

  function renderEvents() {
    list.innerHTML = events.length ? "" : '<div class="empty-state">No events yet. Create the first one.</div>';
    events.forEach((event, index) => {
      const row = document.createElement("div");
      row.className = `event-row${index === 0 ? " active" : ""}`;
      row.innerHTML = `<div><strong>${escapeHtml(event.name)}</strong><span>${event.participantCount} participants</span></div><button class="event-arrow" type="button">↗</button>`;
      row.addEventListener("click", () => showDetail(event, row));
      list.appendChild(row);
      if (index === 0) showDetail(event, row);
    });
  }

  search.addEventListener("input", renderParticipants);
  skillFilter.addEventListener("change", renderParticipants);
  try {
    events = (await apiGet(`/hackathons?organizerId=${organizer.id}`)).hackathons;
    renderEvents();
    await refreshStats();
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

loadOrganizerDashboard();
