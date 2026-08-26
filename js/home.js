// home.js
// Landing page interactive features, live balancer simulation, and stat animations.

document.addEventListener("DOMContentLoaded", () => {
  initHomeStats();
  initLiveBalancerWidget();
});

// ---------- Animated Global Metrics ----------
function initHomeStats() {
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

  const statHackathons = document.getElementById("home-stat-hackathons");
  const statParticipants = document.getElementById("home-stat-participants");
  const statTeams = document.getElementById("home-stat-teams");

  if (statHackathons) animateCounter(statHackathons, Math.max(hackathons.length, 1), 800);
  if (statParticipants) animateCounter(statParticipants, Math.max(totalParticipants, 12), 1000);
  if (statTeams) animateCounter(statTeams, Math.max(totalTeams, 3), 900);
}

// ---------- Interactive Balancer Widget on Landing Page ----------
// Live interactive demonstration calling balancer.js directly
function initLiveBalancerWidget() {
  const runBtn = document.getElementById("preview-simulate-btn");
  const teamCountSelect = document.getElementById("preview-team-count");
  const resultsContainer = document.getElementById("preview-results-container");

  if (!runBtn || !resultsContainer) return;

  const sampleRoster = [
    { name: "Maya (DevOps)", skills: ["DevOps/Cloud", "Backend"], primarySkill: "DevOps/Cloud" },
    { name: "Dev (Frontend)", skills: ["Frontend", "Design"], primarySkill: "Frontend" },
    { name: "Sara (Backend)", skills: ["Backend", "Data/ML"], primarySkill: "Backend" },
    { name: "Liam (Data/ML)", skills: ["Data/ML", "Backend"], primarySkill: "Data/ML" },
    { name: "Zoe (Design)", skills: ["Design", "Frontend"], primarySkill: "Design" },
    { name: "Ken (Frontend)", skills: ["Frontend", "Backend"], primarySkill: "Frontend" }
  ];

  function runSimulation() {
    const numTeams = parseInt(teamCountSelect.value, 10) || 2;
    
    // Call balancer.js functions directly!
    const feasibility = canFormTeams(sampleRoster.length, numTeams);
    if (!feasibility.valid) {
      resultsContainer.innerHTML = `<p style="color:var(--brand-rose);font-size:0.85rem;">${escapeHtml(feasibility.message)}</p>`;
      return;
    }

    const teams = generateTeams(sampleRoster, numTeams);
    
    resultsContainer.innerHTML = "";
    teams.forEach((team, idx) => {
      const card = document.createElement("div");
      card.style.background = "var(--bg-surface-raised)";
      card.style.border = "1px solid var(--border-medium)";
      card.style.borderRadius = "var(--radius-sm)";
      card.style.padding = "0.85rem";
      card.style.marginBottom = "0.6rem";
      card.style.animation = `popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.1}s forwards`;
      
      const memberBadges = team.members.map(m => 
        `<span style="display:inline-block;background:var(--bg-surface);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.775rem;margin:2px;">${escapeHtml(m.name)}</span>`
      ).join(" ");

      const spreadBadges = Object.entries(team.skillCounts)
        .filter(([_, count]) => count > 0)
        .map(([skill, count]) => `<span style="font-size:0.75rem;color:var(--text-tertiary);margin-right:6px;">${skill}: <strong>${count}</strong></span>`)
        .join("");

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <strong style="font-size:0.9rem;color:var(--brand-primary);">Team ${team.id} (${team.members.length} members)</strong>
          <span style="font-size:0.75rem;color:var(--brand-cyan);background:rgba(6,182,212,0.1);padding:2px 6px;border-radius:4px;">Optimal</span>
        </div>
        <div style="margin-bottom:0.4rem;">${memberBadges}</div>
        <div style="border-top:1px solid var(--border-subtle);padding-top:0.35rem;">${spreadBadges}</div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  runBtn.addEventListener("click", runSimulation);
  teamCountSelect.addEventListener("change", runSimulation);
  
  // Initial run
  runSimulation();
}
