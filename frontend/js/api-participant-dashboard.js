function participantEscape(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

async function loadParticipantDashboard() {
  const participant = getApiAccount();
  if (!getApiToken() || !participant || participant.role !== "participant") {
    window.location.href = "../pages/participant-login.html";
    return;
  }
  document.getElementById("account-name").textContent = participant.name;
  document.getElementById("logout").addEventListener("click", () => {
    clearApiSession();
    window.location.href = "index.html";
  });

  const list = document.getElementById("event-list");
  const detail = document.getElementById("event-detail");
  const status = document.getElementById("joined-events");
  const events = (await apiGet("/hackathons")).hackathons;
  const registrations = new Map();

  async function loadRegistration(event) {
    try {
      const result = await apiGet(`/hackathons/${event._id}/participants`);
      const registration = result.participants.find(item => String(item.accountId) === String(participant.id));
      if (registration) registrations.set(event._id, registration);
    } catch (error) {
      console.error(error);
    }
  }

  async function renderJoined() {
    const joined = events.filter(event => registrations.has(event._id));
    if (!joined.length) {
      status.textContent = "You have not joined an event yet.";
      return;
    }
    const items = [];
    for (const event of joined) {
      let team = null;
      try {
        const result = await apiGet(`/hackathons/${event._id}/teams`);
        team = result.result.teams.find(item => item.members.some(member => String(member.accountId) === String(participant.id)));
      } catch (error) {
        if (!error.message.includes("not been generated")) console.error(error);
      }
      items.push(`<div class="joined-item"><strong>${participantEscape(event.name)}</strong><span>${team ? `Team ${team.id} assigned` : "Registered — waiting for teams"}</span></div>`);
      if (team) {
        const block = document.createElement("div");
        block.className = "assigned-team";
        block.innerHTML = `<p class="kicker">${participantEscape(event.name)} / Team ${team.id}</p><h3>Your team is ready.</h3><div class="team-member-list">${team.members.map(member => `<span>${participantEscape(member.name)} · ${participantEscape(member.primarySkill)}</span>`).join("")}</div><p class="team-spread">Skill spread: ${Object.entries(team.skillCounts).filter(([, count]) => count).map(([skill, count]) => `${skill} ${count}`).join(" · ")}</p>`;
        document.getElementById("my-events").appendChild(block);
      }
    }
    status.innerHTML = items.join("");
  }

  async function showEvent(event) {
    const registration = registrations.get(event._id);
    detail.innerHTML = `<p class="kicker">Open for registration</p><h3>${participantEscape(event.name)}</h3><p>${participantEscape(event.description || "Bring your strengths and find a balanced team.")}</p><div class="detail-meta"><span>${participantEscape(event.startDate || "Date to be set")}</span><span>${participantEscape(event.mode)}</span><span>${event.participantCount} participants</span></div><button class="primary-link" type="button" id="join-event">${registration ? "Registration complete" : "Join this hackathon"}</button>`;
    const joinButton = document.getElementById("join-event");
    if (registration) {
      joinButton.disabled = true;
      return;
    }
    joinButton.addEventListener("click", () => {
      detail.insertAdjacentHTML("beforeend", `<form class="join-form" id="join-form"><p class="kicker">Your contribution</p><strong>Map your strengths</strong><div class="join-skills">${["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"].map(skill => `<label><input type="checkbox" name="join-skill" value="${skill}"> ${skill}</label>`).join("")}</div><select id="join-primary" required><option value="">Primary skill</option>${["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"].map(skill => `<option>${skill}</option>`).join("")}</select><p class="auth-error" id="join-error"></p><button class="primary-link" type="submit">Confirm registration</button></form>`);
      document.getElementById("join-form").addEventListener("submit", async submitEvent => {
        submitEvent.preventDefault();
        const selected = Array.from(document.querySelectorAll("input[name=join-skill]:checked")).map(input => input.value);
        const primarySkill = document.getElementById("join-primary").value;
        if (selected.length < 2 || selected.length > 4 || !selected.includes(primarySkill)) {
          document.getElementById("join-error").textContent = "Choose 2–4 skills and select one of them as primary.";
          return;
        }
        try {
          await apiPost(`/hackathons/${event._id}/participants`, { name: participant.name, skills: selected, primarySkill });
          await loadRegistration(event);
          await renderJoined();
          await showEvent(event);
        } catch (error) {
          document.getElementById("join-error").textContent = error.message;
        }
      });
    });
  }

  events.forEach((event, index) => {
    const row = document.createElement("div");
    row.className = `event-row${index === 0 ? " active" : ""}`;
    row.innerHTML = `<div><strong>${participantEscape(event.name)}</strong><span>${participantEscape(event.mode)} · ${event.participantCount} joined</span></div><button class="event-arrow" type="button">↗</button>`;
    row.addEventListener("click", () => showEvent(event));
    list.appendChild(row);
    if (index === 0) showEvent(event);
  });
  await Promise.all(events.map(loadRegistration));
  await renderJoined();
  if (!events.length) list.innerHTML = '<div class="empty-state">No hackathons are open yet.</div>';
}

loadParticipantDashboard().catch(error => {
  document.getElementById("event-list").innerHTML = `<div class="empty-state">${participantEscape(error.message)}</div>`;
});
