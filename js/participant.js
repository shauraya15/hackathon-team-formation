// participant.js
// Participant dashboard logic: browse hackathons, self-registration with skill
// selection, "My Hackathons" lifecycle status, "My Team" view, and profile management.

let currentParticipant = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Enforce participant authentication
  currentParticipant = requireParticipantAuth("participant-login.html");
  if (!currentParticipant) return;

  // 2. Initialize Dashboard UI
  initParticipantHeader();
  renderParticipantDashboard();
  bindParticipantEvents();
});

// ==========================================================================
// HEADER & STATS
// ==========================================================================

function initParticipantHeader() {
  const nameEl = document.getElementById("header-user-name");
  const navNameEl = document.getElementById("nav-participant-name");
  const collegeBadge = document.getElementById("header-college-badge");
  const yearBadge = document.getElementById("header-year-badge");
  const bioEl = document.getElementById("header-bio");

  if (nameEl) nameEl.textContent = currentParticipant.name;
  if (navNameEl) navNameEl.textContent = currentParticipant.name;
  if (collegeBadge) collegeBadge.textContent = `🎓 ${currentParticipant.college || "Student"}`;
  if (yearBadge) yearBadge.textContent = currentParticipant.year || "3rd Year";
  if (bioEl) bioEl.textContent = currentParticipant.bio || "Participant on Synapse Teams.";
}

function renderParticipantDashboard() {
  const joinedEvents = getParticipantJoinedHackathons(currentParticipant.id);
  const allHackathons = getHackathons();

  // Update Stats
  const statJoined = document.getElementById("stat-joined-count");
  const statAssigned = document.getElementById("stat-teams-assigned-count");
  const statSkills = document.getElementById("stat-skills-count");

  const teamsAssignedCount = joinedEvents.filter(j => j.teamAssigned).length;
  const verifiedSkillsCount = joinedEvents.length > 0 ? (joinedEvents[0].registration.skills || []).length : 2;

  if (statJoined) animateCounter(statJoined, joinedEvents.length, 600);
  if (statAssigned) animateCounter(statAssigned, teamsAssignedCount, 700);
  if (statSkills) animateCounter(statSkills, Math.max(verifiedSkillsCount, 2), 500);

  // Render Sections
  renderMyTeamSection(joinedEvents);
  renderMyHackathonsTable(joinedEvents);
  renderBrowseHackathons(allHackathons, joinedEvents);
}

// ==========================================================================
// MY TEAM SECTION (CELEBRATORY PAYOFF VIEW)
// ==========================================================================

function renderMyTeamSection(joinedEvents) {
  const teamSection = document.getElementById("my-team-section");
  const eventNameEl = document.getElementById("my-team-event-name");
  const titleEl = document.getElementById("my-team-title");
  const membersGrid = document.getElementById("my-team-members-grid");
  const matrixTags = document.getElementById("my-team-skill-matrix-tags");

  if (!teamSection) return;

  // Find the most recent joined hackathon with generated teams
  const activeTeamEvent = joinedEvents.find(j => j.teamAssigned && j.myTeam);

  if (!activeTeamEvent || !activeTeamEvent.myTeam) {
    teamSection.style.display = "none";
    return;
  }

  teamSection.style.display = "block";
  const team = activeTeamEvent.myTeam;
  const hackathon = activeTeamEvent.hackathon;

  if (eventNameEl) eventNameEl.textContent = `• ${hackathon.name}`;
  if (titleEl) titleEl.textContent = `⚡ Team ${team.id} (${team.members.length} Members)`;

  // Render Teammates Grid
  if (membersGrid) {
    membersGrid.innerHTML = "";
    team.members.forEach(member => {
      const isMe = (member.participantId === currentParticipant.id) || 
                   (member.name.toLowerCase() === currentParticipant.name.toLowerCase());
      
      const card = document.createElement("div");
      card.className = `teammate-card ${isMe ? "is-you" : ""}`;
      
      const primaryBadge = getSkillBadgeHtml(member.primarySkill, true);
      const secondarySkills = (member.skills || [])
        .filter(s => s !== member.primarySkill)
        .map(s => getSkillBadgeHtml(s, false))
        .join(" ");

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:1.05rem;color:var(--text-primary);">${escapeHtml(member.name)}</strong>
          ${isMe ? '<span class="badge badge-primary-star">YOU</span>' : '<span style="font-size:0.8rem;color:var(--text-tertiary);">Teammate</span>'}
        </div>
        ${member.college ? `<div style="font-size:0.8rem;color:var(--text-tertiary);">${escapeHtml(member.college)}</div>` : ""}
        <div style="margin-top:0.25rem;">${primaryBadge}</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.25rem;">
          ${secondarySkills || ""}
        </div>
      `;
      membersGrid.appendChild(card);
    });
  }

  // Render Skill Spread Matrix
  if (matrixTags) {
    matrixTags.innerHTML = "";
    CATEGORIES.forEach(cat => {
      const count = team.skillCounts[cat] || 0;
      const pill = document.createElement("span");
      pill.className = `badge badge-skill ${getSkillBadgeClass(cat)}`;
      pill.style.opacity = count > 0 ? "1" : "0.35";
      pill.textContent = `${cat}: ${count}`;
      matrixTags.appendChild(pill);
    });
  }
}

// ==========================================================================
// MY HACKATHONS TABLE
// ==========================================================================

function renderMyHackathonsTable(joinedEvents) {
  const tbody = document.getElementById("my-hackathons-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (joinedEvents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
          You haven't joined any hackathons yet. Browse open events below to get started!
        </td>
      </tr>
    `;
    return;
  }

  joinedEvents.forEach(j => {
    const tr = document.createElement("tr");
    const h = j.hackathon;
    const reg = j.registration;

    const statusBadge = j.teamAssigned
      ? `<span class="badge badge-status-assigned">⚡ Team ${j.myTeam ? j.myTeam.id : "Assigned"}</span>`
      : `<span class="badge badge-status-waiting">⏳ Waiting for Teams</span>`;

    const skillsHtml = `
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem;align-items:center;">
        ${getSkillBadgeHtml(reg.primarySkill, true)}
        ${(reg.skills || []).filter(s => s !== reg.primarySkill).map(s => getSkillBadgeHtml(s, false)).join(" ")}
      </div>
    `;

    const actionBtns = j.teamAssigned
      ? `<a href="#my-team-section" class="btn btn-primary btn-sm">View Team</a>`
      : `
        <button class="btn btn-ghost btn-sm" onclick="openJoinModal('${h.id}', true)">✏️ Edit Skills</button>
        <button class="btn btn-danger btn-sm" onclick="handleLeaveHackathon('${h.id}')" title="Leave Event">✕</button>
      `;

    tr.innerHTML = `
      <td>
        <div style="font-weight:600;color:var(--text-primary);font-size:0.95rem;">${escapeHtml(h.name)}</div>
        <div style="font-size:0.8rem;color:var(--text-tertiary);">${escapeHtml(h.venue || "Online Platform")}</div>
      </td>
      <td>
        <div style="font-size:0.85rem;">${formatDate(h.startDate)} - ${formatDate(h.endDate)}</div>
        <span class="badge badge-mode" style="margin-top:0.25rem;">${escapeHtml(h.mode || "Online")}</span>
      </td>
      <td>${skillsHtml}</td>
      <td>${statusBadge}</td>
      <td style="text-align:right;">${actionBtns}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// BROWSE HACKATHONS GALLERY
// ==========================================================================

function renderBrowseHackathons(allHackathons, joinedEvents) {
  const grid = document.getElementById("browse-hackathons-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (allHackathons.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-tertiary);">No hackathons are currently open.</div>`;
    return;
  }

  allHackathons.forEach(h => {
    const card = document.createElement("div");
    card.className = "hackathon-card";

    const participants = getParticipants(h.id);
    const maxCap = h.maxParticipants || 40;
    const fillPercent = Math.min(Math.round((participants.length / maxCap) * 100), 100);

    const isJoined = joinedEvents.some(j => j.hackathon.id === h.id);

    let ctaButtonHtml = "";
    if (isJoined) {
      if (h.teamsGenerated) {
        ctaButtonHtml = `<a href="#my-team-section" class="btn btn-secondary btn-sm" style="width:100%;">✓ Team Assigned — View Team</a>`;
      } else {
        ctaButtonHtml = `<button class="btn btn-surface btn-sm" style="width:100%;" onclick="openJoinModal('${h.id}', true)">✓ Registered — Edit Skills</button>`;
      }
    } else {
      if (h.teamsGenerated) {
        ctaButtonHtml = `<button class="btn btn-ghost btn-sm" style="width:100%;" disabled>Registration Closed (Teams Formed)</button>`;
      } else if (participants.length >= maxCap) {
        ctaButtonHtml = `<button class="btn btn-ghost btn-sm" style="width:100%;" disabled>Capacity Full</button>`;
      } else {
        ctaButtonHtml = `<button class="btn btn-primary btn-sm btn-glow" style="width:100%;" onclick="openJoinModal('${h.id}', false)">⚡ Join Hackathon</button>`;
      }
    }

    card.innerHTML = `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
          <span class="badge badge-mode">📍 ${escapeHtml(h.mode || "Online")}</span>
          ${h.deadline ? `<span style="font-size:0.75rem;color:var(--text-tertiary);">Ends ${formatDate(h.deadline)}</span>` : ""}
        </div>

        <div class="hackathon-card-header">
          <h3>${escapeHtml(h.name)}</h3>
        </div>

        <p class="hackathon-card-desc">${escapeHtml(h.description || "Join fellow developers, designers, and engineers in this collaborative build sprint.")}</p>
      </div>

      <div>
        <div style="margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem;">
            <span>Roster Capacity</span>
            <span style="font-weight:600;color:var(--text-primary);">${participants.length} / ${maxCap} Joined</span>
          </div>
          <div class="capacity-bar-track">
            <div class="capacity-bar-fill" style="width:${fillPercent}%;"></div>
          </div>
        </div>

        ${ctaButtonHtml}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ==========================================================================
// REGISTRATION & SKILL SELECTION MODAL
// ==========================================================================

function openJoinModal(hackathonId, isEditing = false) {
  const h = getHackathons().find(item => item.id === hackathonId);
  if (!h) return;

  const participants = getParticipants(hackathonId);
  const myEntry = participants.find(p => p.participantId === currentParticipant.id || p.name.toLowerCase() === currentParticipant.name.toLowerCase());

  document.getElementById("modal-join-title").textContent = isEditing ? `Edit Skills — ${h.name}` : `Register — ${h.name}`;
  document.getElementById("join-hackathon-id").value = h.id;
  document.getElementById("join-participant-id").value = myEntry ? myEntry.id : "";
  document.getElementById("join-name").value = currentParticipant.name;
  document.getElementById("join-form-error").textContent = "";

  const lockWarning = document.getElementById("join-lock-warning");
  const submitBtn = document.getElementById("btn-submit-registration");

  if (h.teamsGenerated) {
    lockWarning.style.display = "block";
    submitBtn.disabled = true;
    submitBtn.textContent = "Skills Locked";
  } else {
    lockWarning.style.display = "none";
    submitBtn.disabled = false;
    submitBtn.textContent = isEditing ? "Update Skills" : "Confirm Registration";
  }

  // Pre-populate existing skills if available
  if (myEntry) {
    document.getElementById("join-primary-skill").value = myEntry.primarySkill || "";
    document.querySelectorAll('input[name="join-skill"]').forEach(cb => {
      cb.checked = (myEntry.skills || []).includes(cb.value);
    });
  } else {
    document.getElementById("join-primary-skill").value = "";
    document.querySelectorAll('input[name="join-skill"]').forEach(cb => cb.checked = false);
  }

  openModal("modal-join-hackathon");
}

function handleLeaveHackathon(hackathonId) {
  const h = getHackathons().find(item => item.id === hackathonId);
  if (!h) return;

  if (h.teamsGenerated) {
    showToast("Cannot leave after teams have been generated.", "error");
    return;
  }

  if (confirm(`Are you sure you want to withdraw registration from "${h.name}"?`)) {
    deleteParticipantFromHackathon(hackathonId, currentParticipant.id);
    showToast("Registration cancelled.", "info");
    renderParticipantDashboard();
  }
}

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================

function bindParticipantEvents() {
  // Join / Edit Form Submission
  document.getElementById("form-join-hackathon").addEventListener("submit", (e) => {
    e.preventDefault();
    const hackathonId = document.getElementById("join-hackathon-id").value;
    const participantId = document.getElementById("join-participant-id").value;
    const name = currentParticipant.name;
    const primarySkill = document.getElementById("join-primary-skill").value;
    const checked = document.querySelectorAll('input[name="join-skill"]:checked');
    const selectedSkills = Array.from(checked).map(c => c.value);
    const errEl = document.getElementById("join-form-error");

    // Call validation.js directly!
    const result = validateParticipant(name, selectedSkills, primarySkill);
    if (!result.valid) {
      errEl.textContent = result.message;
      return;
    }

    errEl.textContent = "";

    if (participantId) {
      // Update existing registration
      updateParticipantInHackathon(hackathonId, participantId, {
        skills: selectedSkills,
        primarySkill: primarySkill,
        college: currentParticipant.college
      });
      showToast("Updated your skills for this hackathon!", "success");
    } else {
      // Add new registration linked to currentParticipant.id
      addParticipantToHackathon(hackathonId, {
        name: name,
        skills: selectedSkills,
        primarySkill: primarySkill,
        participantId: currentParticipant.id,
        college: currentParticipant.college
      });
      showToast("Successfully registered for hackathon!", "success");
    }

    closeModal("modal-join-hackathon");
    renderParticipantDashboard();
  });

  // Profile Modal & Edit
  document.getElementById("open-profile-btn").addEventListener("click", () => {
    document.getElementById("profile-name").value = currentParticipant.name;
    document.getElementById("profile-college").value = currentParticipant.college || "";
    document.getElementById("profile-year").value = currentParticipant.year || "3rd Year";
    document.getElementById("profile-email").value = currentParticipant.email;
    document.getElementById("profile-phone").value = currentParticipant.phone || "";
    document.getElementById("profile-bio").value = currentParticipant.bio || "";
    document.getElementById("profile-password").value = "";
    openModal("modal-participant-profile");
  });

  document.getElementById("form-participant-profile").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("profile-name").value.trim();
    const college = document.getElementById("profile-college").value.trim();
    const year = document.getElementById("profile-year").value;
    const email = document.getElementById("profile-email").value.trim().toLowerCase();
    const phone = document.getElementById("profile-phone").value.trim();
    const bio = document.getElementById("profile-bio").value.trim();
    const pass = document.getElementById("profile-password").value;

    const updates = { name, college, year, email, phone, bio };
    if (pass.trim() !== "") updates.password = pass;

    currentParticipant = updateParticipantProfile(currentParticipant.id, updates);
    initParticipantHeader();
    showToast("Profile settings saved!", "success");
    closeModal("modal-participant-profile");
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (confirm("Log out of participant account?")) {
      logoutParticipant();
    }
  });
}
