// orbit-3d.js
// 3D Rotating Cylinder Showcase for Available Hackathons
// Pure Vanilla JavaScript & CSS 3D Transforms (No external 3D libraries)

let hackathonsList = [];
let currentAngle = 0;
let targetAngle = 0;
let isDragging = false;
let startX = 0;
let dragAngleStart = 0;
let velocity = 0;
let isAutoSpin = true;
let spinSpeed = 0.2;
let activeFilter = "ALL";
let radius = 380;
let animFrameId = null;

document.addEventListener("DOMContentLoaded", () => {
  init3DShowcase();
});

function init3DShowcase() {
  hackathonsList = getHackathons();
  calculateRadius();
  window.addEventListener("resize", calculateRadius);

  render3DRing();
  renderFlatGrid();
  bind3DControls();
  startAnimationLoop();
}

function calculateRadius() {
  const w = window.innerWidth;
  if (w < 600) {
    radius = 240;
  } else if (w < 1000) {
    radius = 320;
  } else {
    radius = 420;
  }
  updateCardPositions();
}

// ==========================================================================
// 3D RING RENDERING
// ==========================================================================

function getFilteredHackathons() {
  if (activeFilter === "ALL") return hackathonsList;
  return hackathonsList.filter(h => (h.mode || "Online").toUpperCase() === activeFilter.toUpperCase());
}

function render3DRing() {
  const ring = document.getElementById("orbit-ring");
  if (!ring) return;

  ring.innerHTML = "";
  const items = getFilteredHackathons();

  if (items.length === 0) {
    ring.innerHTML = `<div style="color:var(--text-tertiary);position:absolute;top:-20px;left:-100px;width:200px;text-align:center;">No events match filter.</div>`;
    return;
  }

  const count = items.length;
  const angleStep = 360 / count;

  items.forEach((hk, index) => {
    const card = document.createElement("div");
    card.className = "orbit-card";
    card.dataset.index = index;
    card.dataset.id = hk.id;

    const participants = getParticipants(hk.id);
    const maxCap = hk.maxParticipants || 40;
    const badgeColor = hk.badgeColor || "#10b981";

    // Skill pills preview
    const skillsPreview = ["Frontend", "Backend", "Data/ML", "DevOps/Cloud", "Design"]
      .slice(0, 3)
      .map(s => `<span class="badge badge-skill ${getSkillBadgeClass(s)}" style="font-size:0.7rem;padding:2px 6px;">${s}</span>`)
      .join(" ");

    card.innerHTML = `
      <div>
        <div class="orbit-card-theme-bar" style="background:${badgeColor};box-shadow:0 0 12px ${badgeColor};"></div>
        <div class="orbit-card-header">
          <span class="badge badge-mode">📍 ${escapeHtml(hk.mode || "Online")}</span>
          <span style="font-size:0.75rem;color:var(--text-tertiary);font-family:var(--font-mono);">${formatDate(hk.startDate)}</span>
        </div>
        <h3 class="orbit-card-title">${escapeHtml(hk.name)}</h3>
        <p class="orbit-card-desc">${escapeHtml(hk.description || "Join this hackathon and build cross-functional projects.")}</p>
      </div>

      <div>
        <div class="orbit-card-skills">${skillsPreview}</div>
        <div class="orbit-card-footer">
          <span class="orbit-card-capacity">👥 ${participants.length}/${maxCap} Joined</span>
          <button class="orbit-card-btn" onclick="openHackathonInspector('${hk.id}')">Inspect & Join →</button>
        </div>
      </div>
    `;

    // Click to focus card in 3D
    card.addEventListener("click", (e) => {
      if (isDragging) return;
      focusCard(index, count);
    });

    ring.appendChild(card);
  });

  updateCardPositions();
}

function updateCardPositions() {
  const cards = document.querySelectorAll(".orbit-card");
  const count = cards.length;
  if (count === 0) return;

  const angleStep = 360 / count;

  cards.forEach((card, index) => {
    const itemAngle = angleStep * index;
    card.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
  });
}

function focusCard(index, totalCount) {
  const angleStep = 360 / totalCount;
  targetAngle = -index * angleStep;
  
  // Normalize angle difference to take the shortest turn
  let diff = (targetAngle - currentAngle) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  targetAngle = currentAngle + diff;

  highlightActiveCard(index);
}

function highlightActiveCard(index) {
  document.querySelectorAll(".orbit-card").forEach((c, idx) => {
    if (idx === index) {
      c.classList.add("is-active-front");
    } else {
      c.classList.remove("is-active-front");
    }
  });
}

// ==========================================================================
// 3D ANIMATION LOOP & PHYSICS
// ==========================================================================

function startAnimationLoop() {
  function loop() {
    if (isAutoSpin && !isDragging) {
      currentAngle += spinSpeed;
    } else if (!isDragging) {
      // Smooth lerp towards target angle or apply velocity inertia
      if (Math.abs(velocity) > 0.01) {
        currentAngle += velocity;
        velocity *= 0.92; // friction
      }
    }

    const ring = document.getElementById("orbit-ring");
    if (ring) {
      ring.style.transform = `rotateY(${currentAngle}deg)`;
    }

    animFrameId = requestAnimationFrame(loop);
  }

  loop();
}

// ==========================================================================
// DRAG & CONTROLS BINDINGS
// ==========================================================================

function bind3DControls() {
  const viewport = document.getElementById("orbit-scene-viewport");
  if (!viewport) return;

  // Mouse & Touch Dragging
  viewport.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    dragAngleStart = currentAngle;
    velocity = 0;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    velocity = deltaX * 0.15;
    currentAngle = dragAngleStart + deltaX * 0.35;
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
    }
  });

  // Touch support for mobile
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      isDragging = true;
      startX = e.touches[0].clientX;
      dragAngleStart = currentAngle;
      velocity = 0;
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - startX;
    velocity = deltaX * 0.15;
    currentAngle = dragAngleStart + deltaX * 0.35;
  });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Pause auto-spin on hover over viewport
  viewport.addEventListener("mouseenter", () => { isAutoSpin = false; });
  viewport.addEventListener("mouseleave", () => { isAutoSpin = true; });

  // Navigation Buttons (Prev / Next)
  const prevBtn = document.getElementById("orbit-prev-btn");
  const nextBtn = document.getElementById("orbit-next-btn");
  const playBtn = document.getElementById("orbit-play-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const count = getFilteredHackathons().length || 1;
      currentAngle += (360 / count);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const count = getFilteredHackathons().length || 1;
      currentAngle -= (360 / count);
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      isAutoSpin = !isAutoSpin;
      playBtn.textContent = isAutoSpin ? "⏸ Pause Orbit" : "▶ Play Orbit";
    });
  }

  // Filter Buttons
  document.querySelectorAll(".filter-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render3DRing();
      renderFlatGrid();
    });
  });

  // View Switcher (3D Orbit vs Flat Grid)
  const toggle3DBtn = document.getElementById("view-toggle-3d");
  const toggleGridBtn = document.getElementById("view-toggle-grid");
  const scene3D = document.getElementById("orbit-scene-viewport");
  const flatGrid = document.getElementById("orbit-flat-grid-view");

  if (toggle3DBtn && toggleGridBtn && scene3D && flatGrid) {
    toggle3DBtn.addEventListener("click", () => {
      toggle3DBtn.classList.add("active");
      toggleGridBtn.classList.remove("active");
      scene3D.style.display = "block";
      flatGrid.style.display = "none";
    });

    toggleGridBtn.addEventListener("click", () => {
      toggleGridBtn.classList.add("active");
      toggle3DBtn.classList.remove("active");
      scene3D.style.display = "none";
      flatGrid.style.display = "grid";
    });
  }
}

// ==========================================================================
// FLAT GRID RENDER
// ==========================================================================

function renderFlatGrid() {
  const grid = document.getElementById("orbit-flat-grid-view");
  if (!grid) return;

  grid.innerHTML = "";
  const items = getFilteredHackathons();

  items.forEach(hk => {
    const card = document.createElement("div");
    card.className = "card card-interactive";
    const participants = getParticipants(hk.id);
    const maxCap = hk.maxParticipants || 40;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
        <span class="badge badge-mode">📍 ${escapeHtml(hk.mode || "Online")}</span>
        <span style="font-size:0.75rem;color:var(--text-tertiary);">${formatDate(hk.startDate)}</span>
      </div>
      <h3 style="font-size:1.2rem;margin-bottom:0.4rem;">${escapeHtml(hk.name)}</h3>
      <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">${escapeHtml(hk.description || "Collaborative build sprint.")}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.75rem;border-top:1px solid var(--border-subtle);">
        <span style="font-size:0.8rem;color:var(--text-tertiary);">👥 ${participants.length}/${maxCap} Joined</span>
        <button class="btn btn-primary btn-sm" onclick="openHackathonInspector('${hk.id}')">View Details & Join</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ==========================================================================
// HACKATHON INSPECTOR & REGISTRATION MODAL
// ==========================================================================

function openHackathonInspector(hackathonId) {
  const hk = getHackathons().find(item => item.id === hackathonId);
  if (!hk) return;

  const participants = getParticipants(hk.id);
  const maxCap = hk.maxParticipants || 40;
  const fillPct = Math.min(Math.round((participants.length / maxCap) * 100), 100);

  document.getElementById("inspect-title").textContent = hk.name;
  document.getElementById("inspect-desc").textContent = hk.description || "No description provided.";
  document.getElementById("inspect-mode").textContent = `📍 Mode: ${hk.mode || "Online"}`;
  document.getElementById("inspect-venue").textContent = hk.venue ? `🏛️ Venue: ${hk.venue}` : "🌐 Virtual Platform";
  document.getElementById("inspect-dates").textContent = `📅 Dates: ${formatDate(hk.startDate)} - ${formatDate(hk.endDate)}`;
  document.getElementById("inspect-deadline").textContent = `⏰ Deadline: ${formatDate(hk.deadline)}`;
  document.getElementById("inspect-capacity").textContent = `${participants.length} / ${maxCap} Registered (${fillPct}%)`;
  document.getElementById("inspect-capacity-fill").style.width = `${fillPct}%`;

  // Join Action Button
  const joinBtn = document.getElementById("inspect-join-btn");
  const loggedInPt = getLoggedInParticipant();

  if (hk.teamsGenerated) {
    joinBtn.textContent = "Registration Closed (Teams Formed)";
    joinBtn.className = "btn btn-ghost";
    joinBtn.disabled = true;
    joinBtn.onclick = null;
  } else {
    joinBtn.textContent = loggedInPt ? "⚡ Register with Skills" : "⚡ Sign In & Join Hackathon";
    joinBtn.className = "btn btn-primary btn-glow";
    joinBtn.disabled = false;
    joinBtn.onclick = () => {
      closeModal("modal-inspector");
      if (!loggedInPt) {
        window.location.href = "participant-login.html";
      } else {
        openJoinModalFromInspector(hk.id);
      }
    };
  }

  openModal("modal-inspector");
}

function openJoinModalFromInspector(hackathonId) {
  const h = getHackathons().find(item => item.id === hackathonId);
  const loggedInPt = getLoggedInParticipant();
  if (!h || !loggedInPt) return;

  const participants = getParticipants(hackathonId);
  const myEntry = participants.find(p => p.participantId === loggedInPt.id || p.name.toLowerCase() === loggedInPt.name.toLowerCase());

  document.getElementById("modal-join-title").textContent = `Register — ${h.name}`;
  document.getElementById("join-hackathon-id").value = h.id;
  document.getElementById("join-participant-id").value = myEntry ? myEntry.id : "";
  document.getElementById("join-name").value = loggedInPt.name;
  document.getElementById("join-form-error").textContent = "";

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

// Bind registration form submission inside inspector
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-join-hackathon");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loggedInPt = getLoggedInParticipant();
      if (!loggedInPt) return;

      const hackathonId = document.getElementById("join-hackathon-id").value;
      const participantId = document.getElementById("join-participant-id").value;
      const name = loggedInPt.name;
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
        updateParticipantInHackathon(hackathonId, participantId, {
          skills: selectedSkills,
          primarySkill: primarySkill,
          college: loggedInPt.college
        });
        showToast("Skills updated!", "success");
      } else {
        addParticipantToHackathon(hackathonId, {
          name: name,
          skills: selectedSkills,
          primarySkill: primarySkill,
          participantId: loggedInPt.id,
          college: loggedInPt.college
        });
        showToast("Registered for hackathon successfully!", "success");
      }

      closeModal("modal-join-hackathon");
      render3DRing();
      renderFlatGrid();
    });
  }
});
