// organizer.js
// Organizer dashboard logic: hackathon management, participant CRUD,
// filtering/search, and team generation wrapping balancer.js & validation.js.

let currentOrganizer = null;
let activeHackathonId = null;
let currentRosterFilter = "ALL";
let currentSearchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Enforce session authentication
  currentOrganizer = requireOrganizerAuth("organizer-login.html");
  if (!currentOrganizer) return;

  // 2. Initialize UI & event handlers
  initOrganizerHeader();
  loadHackathonDropdown();
  initActivityLogs();
  bindOrganizerEvents();
  updateGlobalStats();
});

// ==========================================================================
// HEADER & STATS
// ==========================================================================

function initOrganizerHeader() {
  const nameEl = document.getElementById("header-user-name");
  const navNameEl = document.getElementById("nav-organizer-name");
  const orgEl = document.getElementById("header-org-name");

  if (nameEl) nameEl.textContent = currentOrganizer.name;
  if (navNameEl) navNameEl.textContent = currentOrganizer.name;
  if (orgEl) orgEl.textContent = currentOrganizer.org || "Organizer Account";
}

function updateGlobalStats() {
  const hackathons = getHackathons();
  let totalParticipants = 0;
  let totalTeams = 0;

  hackathons.forEach(h => {
    const participants = getParticipants(h.id);
    totalParticipants += participants.length;
    if (h.teamsGenerated && h.generatedTeams) {
      totalTeams += h.generatedTeams.length;
    }
  });

  const statHk = document.getElementById("stat-total-hackathons");
  const statPt = document.getElementById("stat-total-participants");
  const statTm = document.getElementById("stat-total-teams");

  if (statHk) animateCounter(statHk, hackathons.length, 600);
  if (statPt) animateCounter(statPt, totalParticipants, 800);
  if (statTm) animateCounter(statTm, totalTeams, 700);
}

// ==========================================================================
// HACKATHON SELECTION & BANNER
// ==========================================================================

function loadHackathonDropdown() {
  const select = document.getElementById("hackathon-selector");
  if (!select) return;

  const hackathons = getHackathons();
  select.innerHTML = "";

  if (hackathons.length === 0) {
    select.innerHTML = `<option value="">-- No hackathons yet. Create one! --</option>`;
    setActiveHackathon(null);
    return;
  }

  hackathons.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h.id;
    opt.textContent = `${h.name} (${h.mode || "Online"})`;
    select.appendChild(opt);
  });

  // Preserve active selection or default to first
  if (!activeHackathonId || !hackathons.some(h => h.id === activeHackathonId)) {
    activeHackathonId = hackathons[0].id;
  }

  select.value = activeHackathonId;
  setActiveHackathon(activeHackathonId);
}

function setActiveHackathon(id) {
  activeHackathonId = id;
  const hackathons = getHackathons();
  const hackathon = hackathons.find(h => h.id === id);

  const bannerTitle = document.getElementById("banner-title");
  const bannerDesc = document.getElementById("banner-desc");
  const bannerTags = document.getElementById("banner-tags");
  const bannerCapBadge = document.getElementById("banner-capacity-badge");
  const resultsActionBar = document.getElementById("results-action-bar");
  const teamCardsContainer = document.getElementById("team-cards-container");
  const feasibilityNotice = document.getElementById("feasibility-notice");

  if (!hackathon) {
    if (bannerTitle) bannerTitle.textContent = "No Hackathon Selected";
    if (bannerDesc) bannerDesc.textContent = "Create or choose a hackathon to manage participants and generate teams.";
    if (bannerTags) bannerTags.innerHTML = "";
    if (bannerCapBadge) bannerCapBadge.textContent = "0 Registered";
    renderParticipantTable([]);
    if (teamCardsContainer) {
      teamCardsContainer.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);"><p>Select a hackathon to get started.</p></div>`;
    }
    if (resultsActionBar) resultsActionBar.style.display = "none";
    if (feasibilityNotice) feasibilityNotice.innerHTML = "";
    return;
  }

  // Populate Banner
  if (bannerTitle) bannerTitle.textContent = hackathon.name;
  if (bannerDesc) bannerDesc.textContent = hackathon.description || "No description provided.";
  
  const participants = getParticipants(hackathon.id);
  const maxCap = hackathon.maxParticipants || 40;
  
  if (bannerCapBadge) {
    bannerCapBadge.textContent = `${participants.length} / ${maxCap} Registered`;
    bannerCapBadge.className = participants.length >= maxCap ? "badge badge-status-waiting" : "badge badge-status-assigned";
  }

  if (bannerTags) {
    bannerTags.innerHTML = `
      <span class="badge badge-mode">📍 ${escapeHtml(hackathon.mode || "Online")}</span>
      ${hackathon.venue ? `<span class="badge badge-mode">🏛️ ${escapeHtml(hackathon.venue)}</span>` : ""}
      ${hackathon.startDate ? `<span class="badge badge-mode">📅 ${formatDate(hackathon.startDate)} - ${formatDate(hackathon.endDate)}</span>` : ""}
      ${hackathon.deadline ? `<span class="badge badge-mode">⏰ Deadline: ${formatDate(hackathon.deadline)}</span>` : ""}
    `;
  }

  // Render Roster
  renderParticipantTable(participants);

  // Render Saved Teams if already generated
  if (hackathon.teamsGenerated && hackathon.generatedTeams && hackathon.generatedTeams.length > 0) {
    renderGeneratedTeamsWithAnimation(hackathon.generatedTeams);
    if (resultsActionBar) resultsActionBar.style.display = "flex";
  } else {
    if (teamCardsContainer) {
      teamCardsContainer.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">⚖️</div>
          <p>Ready to balance teams! Enter team count and click <strong>Generate Teams</strong>.</p>
        </div>
      `;
    }
    if (resultsActionBar) resultsActionBar.style.display = "none";
  }

  // Live feasibility feedback
  checkAndDisplayFeasibility();
}

// ==========================================================================
// PARTICIPANT ROSTER (TABLE, SEARCH & CATEGORY FILTER)
// ==========================================================================

function renderParticipantTable(participantsList) {
  const tbody = document.getElementById("participant-table-body");
  const countLabel = document.getElementById("roster-count-label");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!participantsList) {
    participantsList = activeHackathonId ? getParticipants(activeHackathonId) : [];
  }

  // Filter by category
  let filtered = participantsList;
  if (currentRosterFilter !== "ALL") {
    filtered = filtered.filter(p => p.primarySkill === currentRosterFilter || (p.skills && p.skills.includes(currentRosterFilter)));
  }

  // Filter by search term
  if (currentSearchQuery.trim() !== "") {
    const q = currentSearchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.primarySkill.toLowerCase().includes(q) || 
      (p.skills && p.skills.some(s => s.toLowerCase().includes(q))) ||
      (p.college && p.college.toLowerCase().includes(q))
    );
  }

  if (countLabel) {
    countLabel.textContent = `${filtered.length} of ${participantsList.length} participants displayed`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:2.5rem 1rem;color:var(--text-tertiary);">
          ${participantsList.length === 0 ? "No participants registered in this hackathon yet." : "No participants match your search/filter criteria."}
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement("tr");

    const primaryBadge = getSkillBadgeHtml(p.primarySkill, true);
    const secondaryBadges = (p.skills || [])
      .filter(s => s !== p.primarySkill)
      .map(s => getSkillBadgeHtml(s, false))
      .join(" ");

    tr.innerHTML = `
      <td>
        <div style="font-weight:600;color:var(--text-primary);">${escapeHtml(p.name)}</div>
        ${p.college ? `<div style="font-size:0.775rem;color:var(--text-tertiary);">${escapeHtml(p.college)}</div>` : ""}
      </td>
      <td>${primaryBadge}</td>
      <td><div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${secondaryBadges || '<span style="color:var(--text-muted);font-size:0.8rem;">—</span>'}</div></td>
      <td style="text-align:right;">
        <button class="btn btn-ghost btn-sm" onclick="openEditParticipantModal('${p.id}')" title="Edit Participant">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteParticipant('${p.id}')" title="Delete Participant">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// PARTICIPANT ADD / EDIT / DELETE MODAL
// ==========================================================================

function openAddParticipantModal() {
  if (!activeHackathonId) {
    showToast("Please select or create a hackathon first.", "error");
    return;
  }
  document.getElementById("modal-participant-title").textContent = "Add Participant";
  document.getElementById("participant-edit-id").value = "";
  document.getElementById("pt-name").value = "";
  document.getElementById("pt-college").value = "";
  document.getElementById("pt-primary-skill").value = "";
  document.querySelectorAll('input[name="crud-skill"]').forEach(cb => cb.checked = false);
  document.getElementById("pt-form-error").textContent = "";
  openModal("modal-participant");
}

function openEditParticipantModal(participantId) {
  if (!activeHackathonId) return;
  const participants = getParticipants(activeHackathonId);
  const p = participants.find(item => item.id === participantId);
  if (!p) return;

  document.getElementById("modal-participant-title").textContent = "Edit Participant";
  document.getElementById("participant-edit-id").value = p.id;
  document.getElementById("pt-name").value = p.name;
  document.getElementById("pt-college").value = p.college || "";
  document.getElementById("pt-primary-skill").value = p.primarySkill;
  
  document.querySelectorAll('input[name="crud-skill"]').forEach(cb => {
    cb.checked = (p.skills || []).includes(cb.value);
  });
  
  document.getElementById("pt-form-error").textContent = "";
  openModal("modal-participant");
}

function handleDeleteParticipant(participantId) {
  if (!activeHackathonId) return;
  if (confirm("Are you sure you want to remove this participant from the hackathon?")) {
    deleteParticipantFromHackathon(activeHackathonId, participantId);
    showToast("Participant removed.", "info");
    setActiveHackathon(activeHackathonId);
    updateGlobalStats();
    initActivityLogs();
  }
}

// ==========================================================================
// TEAM GENERATION ENGINE (WRAPPING BALANCER.JS)
// ==========================================================================

function checkAndDisplayFeasibility() {
  const noticeEl = document.getElementById("feasibility-notice");
  if (!noticeEl || !activeHackathonId) return;

  const participants = getParticipants(activeHackathonId);
  const teamCountInput = document.getElementById("input-team-count");
  const numTeams = parseInt(teamCountInput.value, 10);

  if (!numTeams || numTeams < 1 || participants.length === 0) {
    noticeEl.innerHTML = "";
    return;
  }

  // Call balancer.js function directly!
  const feasibility = canFormTeams(participants.length, numTeams);
  if (feasibility.valid) {
    const avgSize = (participants.length / numTeams).toFixed(1);
    noticeEl.innerHTML = `
      <span style="color:var(--brand-primary);font-weight:600;">
        ✓ Feasible: ${participants.length} participants split across ${numTeams} teams (~${avgSize} members/team within bounds [${MIN_TEAM_SIZE}–${MAX_TEAM_SIZE}]).
      </span>
    `;
  } else {
    noticeEl.innerHTML = `
      <span style="color:var(--brand-rose);font-weight:600;">
        ⚠️ ${escapeHtml(feasibility.message)}
      </span>
    `;
  }
}

function handleGenerateTeams() {
  if (!activeHackathonId) {
    showToast("Please select a hackathon first.", "error");
    return;
  }

  const teamCountInput = document.getElementById("input-team-count");
  const numTeams = parseInt(teamCountInput.value, 10);
  const participants = getParticipants(activeHackathonId);

  if (!numTeams || numTeams < 1) {
    showToast("Please enter a valid number of teams.", "error");
    return;
  }

  if (participants.length === 0) {
    showToast("No participants added yet for this hackathon.", "error");
    return;
  }

  // 1. Feasibility check via balancer.js
  const feasibility = canFormTeams(participants.length, numTeams);
  if (!feasibility.valid) {
    showToast(feasibility.message, "error", 5000);
    checkAndDisplayFeasibility();
    return;
  }

  // 2. Generate balanced teams via balancer.js
  const teams = generateTeams(participants, numTeams);

  // 3. Persist generated teams into hackathon record
  updateHackathon(activeHackathonId, {
    teamsGenerated: true,
    generatedTeams: teams
  });

  logActivity(`Generated ${teams.length} balanced teams`, activeHackathonId, "generate");

  // 4. Render with payoff reveal animation
  renderGeneratedTeamsWithAnimation(teams);
  
  const resultsActionBar = document.getElementById("results-action-bar");
  if (resultsActionBar) resultsActionBar.style.display = "flex";

  updateGlobalStats();
  initActivityLogs();
  showToast(`Successfully balanced ${participants.length} participants into ${teams.length} teams!`, "success");
}

function renderGeneratedTeamsWithAnimation(teams) {
  const container = document.getElementById("team-cards-container");
  const countEl = document.getElementById("results-count");
  if (!container) return;

  container.innerHTML = "";
  if (countEl) countEl.textContent = teams.length;

  teams.forEach((team, index) => {
    const card = document.createElement("div");
    card.className = "team-card-revealed";
    card.style.animationDelay = `${index * 0.12}s`; // Staggered reveal animation

    // Team Header
    const header = document.createElement("div");
    header.className = "team-card-header";
    header.innerHTML = `
      <div class="team-card-title">
        <span style="color:var(--brand-primary);">⚡</span>
        <span>Team ${team.id}</span>
      </div>
      <span class="badge badge-surface">${team.members.length} Members</span>
    `;
    card.appendChild(header);

    // Members list
    const memberList = document.createElement("ul");
    memberList.className = "team-members-list";

    team.members.forEach(member => {
      const item = document.createElement("li");
      item.className = "team-member-item";
      
      const badge = getSkillBadgeHtml(member.primarySkill, true);
      item.innerHTML = `
        <span class="team-member-name">${escapeHtml(member.name)}</span>
        <div>${badge}</div>
      `;
      memberList.appendChild(item);
    });
    card.appendChild(memberList);

    // Skill Spread Matrix
    const matrix = document.createElement("div");
    matrix.className = "team-skill-matrix";
    
    const matrixTitle = document.createElement("div");
    matrixTitle.className = "team-skill-matrix-title";
    matrixTitle.textContent = "Team Skill Spread";
    matrix.appendChild(matrixTitle);

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "skill-spread-tags";

    CATEGORIES.forEach(category => {
      const count = team.skillCounts[category] || 0;
      const pill = document.createElement("span");
      pill.className = `badge badge-skill ${getSkillBadgeClass(category)}`;
      pill.style.opacity = count > 0 ? "1" : "0.35";
      pill.textContent = `${category}: ${count}`;
      tagsContainer.appendChild(pill);
    });

    matrix.appendChild(tagsContainer);
    card.appendChild(matrix);

    container.appendChild(card);
  });
}

// ==========================================================================
// COPY & EXPORT TEAM LIST
// ==========================================================================

function copyTeamListToClipboard() {
  if (!activeHackathonId) return;
  const hackathons = getHackathons();
  const hackathon = hackathons.find(h => h.id === activeHackathonId);
  if (!hackathon || !hackathon.generatedTeams || hackathon.generatedTeams.length === 0) {
    showToast("No teams generated to copy.", "error");
    return;
  }

  let text = `# ${hackathon.name} — Team Allocations\n\n`;
  hackathon.generatedTeams.forEach(team => {
    text += `## Team ${team.id} (${team.members.length} members)\n`;
    team.members.forEach(m => {
      text += `- ${m.name} [Primary: ${m.primarySkill}] (Skills: ${m.skills.join(", ")})\n`;
    });
    const spread = Object.entries(team.skillCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
    text += `Skill Spread: ${spread}\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    showToast("Team list copied to clipboard (Markdown format)!", "success");
  }).catch(() => {
    showToast("Could not copy to clipboard.", "error");
  });
}

function exportTeamListJson() {
  if (!activeHackathonId) return;
  const hackathons = getHackathons();
  const hackathon = hackathons.find(h => h.id === activeHackathonId);
  if (!hackathon || !hackathon.generatedTeams) {
    showToast("No teams generated to export.", "error");
    return;
  }

  const exportData = {
    hackathonName: hackathon.name,
    exportedAt: new Date().toISOString(),
    totalTeams: hackathon.generatedTeams.length,
    teams: hackathon.generatedTeams
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${hackathon.name.replace(/\s+/g, "_")}_teams.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Downloaded teams JSON file!", "success");
}

// ==========================================================================
// ACTIVITY LOG & EVENT BINDINGS
// ==========================================================================

function initActivityLogs() {
  const list = document.getElementById("activity-log-list");
  if (!list) return;
  list.innerHTML = "";

  const activities = getRecentActivities(8);
  if (activities.length === 0) {
    list.innerHTML = `<li class="activity-item" style="color:var(--text-tertiary);">No recent activity recorded yet.</li>`;
    return;
  }

  activities.forEach(act => {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `
      <span class="activity-dot"></span>
      <span style="color:var(--text-primary);">${escapeHtml(act.text)}</span>
      <span class="activity-time">${timeAgo(act.time)}</span>
    `;
    list.appendChild(li);
  });
}

function bindOrganizerEvents() {
  // Hackathon dropdown change
  const hkSelect = document.getElementById("hackathon-selector");
  if (hkSelect) {
    hkSelect.addEventListener("change", (e) => {
      setActiveHackathon(e.target.value);
    });
  }

  // Create Hackathon button
  document.getElementById("btn-create-hackathon").addEventListener("click", () => {
    document.getElementById("modal-hackathon-title").textContent = "Create New Hackathon";
    document.getElementById("hackathon-edit-id").value = "";
    document.getElementById("hk-name").value = "";
    document.getElementById("hk-desc").value = "";
    document.getElementById("hk-mode").value = "Online";
    document.getElementById("hk-venue").value = "";
    document.getElementById("hk-start-date").value = "";
    document.getElementById("hk-end-date").value = "";
    document.getElementById("hk-deadline").value = "";
    document.getElementById("hk-max-participants").value = "40";
    document.getElementById("hk-form-error").textContent = "";
    openModal("modal-hackathon");
  });

  // Edit Hackathon button
  document.getElementById("btn-edit-hackathon").addEventListener("click", () => {
    if (!activeHackathonId) {
      showToast("Select a hackathon to edit.", "error");
      return;
    }
    const h = getHackathons().find(item => item.id === activeHackathonId);
    if (!h) return;

    document.getElementById("modal-hackathon-title").textContent = "Edit Hackathon Details";
    document.getElementById("hackathon-edit-id").value = h.id;
    document.getElementById("hk-name").value = h.name;
    document.getElementById("hk-desc").value = h.description || "";
    document.getElementById("hk-mode").value = h.mode || "Online";
    document.getElementById("hk-venue").value = h.venue || "";
    document.getElementById("hk-start-date").value = h.startDate || "";
    document.getElementById("hk-end-date").value = h.endDate || "";
    document.getElementById("hk-deadline").value = h.deadline || "";
    document.getElementById("hk-max-participants").value = h.maxParticipants || "40";
    document.getElementById("hk-form-error").textContent = "";
    openModal("modal-hackathon");
  });

  // Delete Hackathon button
  document.getElementById("btn-delete-hackathon").addEventListener("click", () => {
    if (!activeHackathonId) return;
    if (confirm("Are you sure you want to delete this hackathon and all its participant data?")) {
      deleteHackathon(activeHackathonId);
      showToast("Hackathon deleted.", "info");
      loadHackathonDropdown();
      updateGlobalStats();
      initActivityLogs();
    }
  });

  // Save Hackathon Form
  document.getElementById("form-hackathon-crud").addEventListener("submit", (e) => {
    e.preventDefault();
    const editId = document.getElementById("hackathon-edit-id").value;
    const name = document.getElementById("hk-name").value.trim();
    const desc = document.getElementById("hk-desc").value.trim();
    const mode = document.getElementById("hk-mode").value;
    const venue = document.getElementById("hk-venue").value.trim();
    const startDate = document.getElementById("hk-start-date").value;
    const endDate = document.getElementById("hk-end-date").value;
    const deadline = document.getElementById("hk-deadline").value;
    const maxParticipants = document.getElementById("hk-max-participants").value;

    if (!name) {
      document.getElementById("hk-form-error").textContent = "Please enter a hackathon name.";
      return;
    }

    if (editId) {
      // Update
      updateHackathon(editId, { name, description: desc, mode, venue, startDate, endDate, deadline, maxParticipants });
      showToast("Hackathon updated successfully!", "success");
      activeHackathonId = editId;
    } else {
      // Create
      const newHk = createRichHackathon({
        name, description: desc, mode, venue, startDate, endDate, deadline, maxParticipants,
        createdBy: currentOrganizer.id
      });
      showToast(`Created hackathon: ${newHk.name}`, "success");
      activeHackathonId = newHk.id;
    }

    closeModal("modal-hackathon");
    loadHackathonDropdown();
    updateGlobalStats();
    initActivityLogs();
  });

  // Add Participant Modal Trigger
  document.getElementById("btn-add-participant-modal").addEventListener("click", openAddParticipantModal);

  // Save Participant Form (CRUD)
  document.getElementById("form-participant-crud").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!activeHackathonId) return;

    const editId = document.getElementById("participant-edit-id").value;
    const name = document.getElementById("pt-name").value;
    const college = document.getElementById("pt-college").value;
    const primarySkill = document.getElementById("pt-primary-skill").value;
    const checked = document.querySelectorAll('input[name="crud-skill"]:checked');
    const selectedSkills = Array.from(checked).map(c => c.value);
    const errEl = document.getElementById("pt-form-error");

    // Call validation.js directly!
    const result = validateParticipant(name, selectedSkills, primarySkill);
    if (!result.valid) {
      errEl.textContent = result.message;
      return;
    }

    errEl.textContent = "";

    if (editId) {
      updateParticipantInHackathon(activeHackathonId, editId, {
        name: name.trim(),
        college: college.trim(),
        skills: selectedSkills,
        primarySkill: primarySkill
      });
      showToast("Participant updated.", "success");
    } else {
      addParticipantToHackathon(activeHackathonId, {
        name: name.trim(),
        college: college.trim(),
        skills: selectedSkills,
        primarySkill: primarySkill
      });
      showToast("Participant added to roster.", "success");
    }

    closeModal("modal-participant");
    setActiveHackathon(activeHackathonId);
    updateGlobalStats();
    initActivityLogs();
  });

  // Search & Filter Events
  document.getElementById("roster-search").addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderParticipantTable();
  });

  document.querySelectorAll(".filter-chip-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRosterFilter = btn.dataset.category;
      renderParticipantTable();
    });
  });

  // Clear all participants
  document.getElementById("btn-clear-all-participants").addEventListener("click", () => {
    if (!activeHackathonId) return;
    if (confirm("Are you sure you want to clear ALL participants for this hackathon?")) {
      clearParticipants(activeHackathonId);
      updateHackathon(activeHackathonId, { teamsGenerated: false, generatedTeams: [] });
      showToast("Cleared all participants.", "info");
      setActiveHackathon(activeHackathonId);
      updateGlobalStats();
      initActivityLogs();
    }
  });

  // Team Generation Buttons
  document.getElementById("btn-generate-teams").addEventListener("click", handleGenerateTeams);
  document.getElementById("btn-regenerate-teams").addEventListener("click", handleGenerateTeams);
  document.getElementById("input-team-count").addEventListener("input", checkAndDisplayFeasibility);
  document.getElementById("btn-copy-teams").addEventListener("click", copyTeamListToClipboard);
  document.getElementById("btn-export-json").addEventListener("click", exportTeamListJson);

  // Profile Modal & Edit
  document.getElementById("open-profile-btn").addEventListener("click", () => {
    document.getElementById("profile-name").value = currentOrganizer.name;
    document.getElementById("profile-org").value = currentOrganizer.org || "";
    document.getElementById("profile-email").value = currentOrganizer.email;
    document.getElementById("profile-phone").value = currentOrganizer.phone || "";
    document.getElementById("profile-password").value = "";
    document.getElementById("profile-msg").textContent = "";
    openModal("modal-profile");
  });

  document.getElementById("form-organizer-profile").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("profile-name").value.trim();
    const org = document.getElementById("profile-org").value.trim();
    const email = document.getElementById("profile-email").value.trim().toLowerCase();
    const phone = document.getElementById("profile-phone").value.trim();
    const pass = document.getElementById("profile-password").value;

    const updates = { name, org, email, phone };
    if (pass.trim() !== "") updates.password = pass;

    currentOrganizer = updateOrganizerProfile(currentOrganizer.id, updates);
    initOrganizerHeader();
    showToast("Profile settings saved!", "success");
    closeModal("modal-profile");
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (confirm("Log out of organizer account?")) {
      logoutOrganizer();
    }
  });
}
