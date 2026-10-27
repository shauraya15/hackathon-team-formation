function formationEscape(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

async function loadFormationWorkspace() {
  if (!getApiToken() || getApiAccount()?.role !== "organizer") {
    window.location.href = "../pages/organizer-login.html";
    return;
  }

  const hackathonId = new URLSearchParams(window.location.search).get("hackathon");
  const name = document.getElementById("formation-hackathon-name");
  const description = document.getElementById("formation-hackathon-description");
  const meta = document.getElementById("formation-hackathon-meta");
  const roster = document.getElementById("formation-participant-list");
  const teams = document.getElementById("team-cards-container");
  const noTeams = document.getElementById("no-teams-message");
  const status = document.getElementById("generation-status");
  let latestResult = null;

  document.getElementById("logout").addEventListener("click", () => {
    clearApiSession();
    window.location.href = "index.html";
  });

  if (!hackathonId) {
    name.textContent = "Choose an event";
    return;
  }

  try {
    const selector = document.getElementById("hackathon-select");
    const available = (await apiGet(`/hackathons?organizerId=${getApiAccount().id}`)).hackathons;
    selector.innerHTML = available.map(event => `<option value="${event._id}">${formationEscape(event.name)}</option>`).join("");
    selector.value = hackathonId;
    selector.addEventListener("change", () => {
      window.location.href = `organizer-tool.html?hackathon=${selector.value}`;
    });
    document.getElementById("create-hackathon-btn").addEventListener("click", () => {
      window.location.href = "create-hackathon.html";
    });

    const { hackathon } = await apiGet(`/hackathons/${hackathonId}`);
    const participants = (await apiGet(`/hackathons/${hackathonId}/participants`)).participants;
    name.textContent = hackathon.name;
    description.textContent = hackathon.description || "No description added for this hackathon.";
    meta.innerHTML = `<span>${formationEscape(hackathon.mode)}</span><span>${formationEscape(hackathon.startDate || "Start date not set")}</span><span>${formationEscape(hackathon.endDate || "End date not set")}</span><span>${participants.length} participants</span>`;
    roster.innerHTML = participants.length
      ? participants.map(participant => `<div class="formation-participant"><strong>${formationEscape(participant.name)}</strong><span>${formationEscape(participant.skills.join(", "))}</span><b>${formationEscape(participant.primarySkill)}</b></div>`).join("")
      : '<p class="empty-state">No participants registered yet.</p>';

    try {
      const saved = (await apiGet(`/hackathons/${hackathonId}/teams`)).result;
      renderTeams(saved);
    } catch (error) {
      if (!error.message.includes("not been generated")) throw error;
      noTeams.hidden = false;
    }

    document.getElementById("generate-teams-btn").addEventListener("click", async () => {
      const teamCount = Number(document.getElementById("team-count").value);
      status.textContent = "";
      try {
        const result = await apiPost(`/hackathons/${hackathonId}/teams/generate`, { teamCount });
        renderTeams(result.result);
        status.textContent = "Teams saved in MongoDB. Participants can now see their assignments.";
      } catch (generationError) {
        status.textContent = generationError.message;
      }
    });

    function renderTeams(result) {
      latestResult = result;
      noTeams.hidden = true;
      document.getElementById("formation-team-count").textContent = result.requestedTeams;
      document.getElementById("generate-teams-btn").textContent = "Regenerate Teams";
      teams.innerHTML = result.teams.map(team => `<article class="formation-team-card"><div class="formation-team-heading"><h3>Team ${team.id}</h3><span>${team.members.length} members</span></div><ul>${team.members.map(member => `<li><strong>${formationEscape(member.name)}</strong><span>Skills: ${formationEscape(member.skills.join(", "))}</span><em>Primary: ${formationEscape(member.primarySkill)}</em></li>`).join("")}</ul><p>Skill distribution: ${Object.entries(team.skillCounts).filter(([, count]) => count).map(([skill, count]) => `${formationEscape(skill)}: ${count}`).join(" · ")}</p></article>`).join("");
    }

    document.getElementById("copy-teams-btn").addEventListener("click", async () => {
      if (!latestResult) return;
      const text = latestResult.teams.map(team => `Team ${team.id}: ${team.members.map(member => `${member.name} (${member.primarySkill})`).join(", ")}`).join("\n");
      await navigator.clipboard.writeText(text);
      status.textContent = "Team list copied.";
    });

    document.getElementById("export-teams-btn").addEventListener("click", () => {
      if (!latestResult) return;
      const rows = ["Team,Name,Primary skill", ...latestResult.teams.flatMap(team => team.members.map(member => `${team.id},"${member.name.replaceAll('"', '""')}",${member.primarySkill}`))];
      const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "team-list.csv";
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    name.textContent = "Unable to load event";
    description.textContent = error.message;
  }
}

loadFormationWorkspace();
