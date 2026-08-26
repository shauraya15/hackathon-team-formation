// data-store.js
// Extended data management layer for Phase 1 (Vanilla JS + LocalStorage).
// Wraps and complements storage.js without modifying or breaking any existing functions.

const ORGANIZERS_KEY = "organizers";
const PARTICIPANT_ACCOUNTS_KEY = "participantAccounts";
const ACTIVITY_LOG_KEY = "activity_log";

// ==========================================================================
// ORGANIZER ACCOUNTS
// ==========================================================================

function getOrganizers() {
  const raw = localStorage.getItem(ORGANIZERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveOrganizerAccount(organizer) {
  const organizers = getOrganizers();
  const newOrganizer = {
    id: organizer.id || `org_${Date.now()}`,
    name: organizer.name.trim(),
    org: (organizer.org || "").trim(),
    email: organizer.email.trim().toLowerCase(),
    phone: (organizer.phone || "").trim(),
    username: organizer.username.trim().toLowerCase(),
    password: organizer.password, // Phase 1 mock auth
    createdAt: Date.now()
  };
  organizers.push(newOrganizer);
  localStorage.setItem(ORGANIZERS_KEY, JSON.stringify(organizers));
  return newOrganizer;
}

function getOrganizerById(id) {
  return getOrganizers().find(o => o.id === id) || null;
}

function updateOrganizerProfile(id, updates) {
  const organizers = getOrganizers();
  const index = organizers.findIndex(o => o.id === id);
  if (index === -1) return null;
  organizers[index] = { ...organizers[index], ...updates };
  localStorage.setItem(ORGANIZERS_KEY, JSON.stringify(organizers));
  return organizers[index];
}

// ==========================================================================
// PARTICIPANT ACCOUNTS
// ==========================================================================

function getParticipantAccounts() {
  const raw = localStorage.getItem(PARTICIPANT_ACCOUNTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveParticipantAccount(account) {
  const accounts = getParticipantAccounts();
  const newAccount = {
    id: account.id || `pt_${Date.now()}`,
    name: account.name.trim(),
    email: account.email.trim().toLowerCase(),
    phone: (account.phone || "").trim(),
    college: (account.college || "").trim(),
    year: account.year || "3rd Year",
    username: account.username.trim().toLowerCase(),
    password: account.password, // Phase 1 mock auth
    bio: (account.bio || "").trim(),
    createdAt: Date.now()
  };
  accounts.push(newAccount);
  localStorage.setItem(PARTICIPANT_ACCOUNTS_KEY, JSON.stringify(accounts));
  return newAccount;
}

function getParticipantAccountById(id) {
  return getParticipantAccounts().find(p => p.id === id) || null;
}

function updateParticipantProfile(id, updates) {
  const accounts = getParticipantAccounts();
  const index = accounts.findIndex(p => p.id === id);
  if (index === -1) return null;
  accounts[index] = { ...accounts[index], ...updates };
  localStorage.setItem(PARTICIPANT_ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts[index];
}

// ==========================================================================
// EXTENDED HACKATHON MANAGEMENT
// ==========================================================================

function getHackathonsExtended() {
  return getHackathons(); // reads from storage.js
}

function createRichHackathon(data) {
  const hackathons = getHackathons();
  const newHackathon = {
    id: data.id || `hk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: data.name.trim(),
    description: (data.description || "").trim(),
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    mode: data.mode || "Online", // Online, Offline, Hybrid
    venue: (data.venue || "").trim(),
    deadline: data.deadline || "",
    maxParticipants: parseInt(data.maxParticipants, 10) || 50,
    createdBy: data.createdBy || null,
    teamsGenerated: data.teamsGenerated || false,
    generatedTeams: data.generatedTeams || [],
    badgeColor: data.badgeColor || "#10b981",
    theme: data.theme || "General",
    createdAt: Date.now()
  };
  hackathons.push(newHackathon);
  localStorage.setItem(HACKATHONS_KEY, JSON.stringify(hackathons));
  logActivity(`Created hackathon "${newHackathon.name}"`, newHackathon.id, "create");
  return newHackathon;
}

function updateHackathon(id, updates) {
  const hackathons = getHackathons();
  const index = hackathons.findIndex(h => h.id === id);
  if (index === -1) return null;
  hackathons[index] = { ...hackathons[index], ...updates };
  localStorage.setItem(HACKATHONS_KEY, JSON.stringify(hackathons));
  return hackathons[index];
}

function deleteHackathon(id) {
  let hackathons = getHackathons();
  const target = hackathons.find(h => h.id === id);
  hackathons = hackathons.filter(h => h.id !== id);
  localStorage.setItem(HACKATHONS_KEY, JSON.stringify(hackathons));
  clearParticipants(id); // from storage.js
  if (target) {
    logActivity(`Deleted hackathon "${target.name}"`, null, "delete");
  }
}

// ==========================================================================
// PARTICIPANT ROSTER HELPERS
// ==========================================================================

function addParticipantToHackathon(hackathonId, participant) {
  const participants = getParticipants(hackathonId);
  const entry = {
    id: participant.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: participant.name.trim(),
    skills: participant.skills || [],
    primarySkill: participant.primarySkill,
    participantId: participant.participantId || null, // links to participantAccount if logged in
    college: participant.college || "",
    registeredAt: Date.now()
  };
  participants.push(entry);
  localStorage.setItem(participantsKeyFor(hackathonId), JSON.stringify(participants));
  logActivity(`${entry.name} joined hackathon`, hackathonId, "join");
  return entry;
}

function updateParticipantInHackathon(hackathonId, participantId, updates) {
  const participants = getParticipants(hackathonId);
  const index = participants.findIndex(p => p.id === participantId || p.participantId === participantId);
  if (index === -1) return null;
  participants[index] = { ...participants[index], ...updates };
  localStorage.setItem(participantsKeyFor(hackathonId), JSON.stringify(participants));
  return participants[index];
}

function deleteParticipantFromHackathon(hackathonId, participantId) {
  let participants = getParticipants(hackathonId);
  const removed = participants.find(p => p.id === participantId || p.participantId === participantId);
  participants = participants.filter(p => p.id !== participantId && p.participantId !== participantId);
  localStorage.setItem(participantsKeyFor(hackathonId), JSON.stringify(participants));
  if (removed) {
    logActivity(`Removed participant ${removed.name}`, hackathonId, "leave");
  }
}

function getParticipantJoinedHackathons(participantAccountId) {
  const hackathons = getHackathons();
  const joined = [];

  hackathons.forEach(h => {
    const participants = getParticipants(h.id);
    const myEntry = participants.find(p => p.participantId === participantAccountId || (p.name && p.name.toLowerCase() === getParticipantAccountById(participantAccountId)?.name?.toLowerCase()));
    if (myEntry) {
      joined.push({
        hackathon: h,
        registration: myEntry,
        teamAssigned: h.teamsGenerated || false,
        myTeam: h.teamsGenerated && h.generatedTeams ? h.generatedTeams.find(t => t.members.some(m => m.id === myEntry.id || m.name === myEntry.name)) : null
      });
    }
  });

  return joined;
}

// ==========================================================================
// ACTIVITY LOGGING
// ==========================================================================

function logActivity(text, hackathonId = null, type = "info") {
  const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
  let logs = [];
  if (raw) {
    try { logs = JSON.parse(raw); } catch { logs = []; }
  }
  const entry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    text: text,
    hackathonId: hackathonId,
    type: type,
    time: Date.now()
  };
  logs.unshift(entry);
  if (logs.length > 50) logs = logs.slice(0, 50); // keep last 50 activities
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
}

function getRecentActivities(limit = 10) {
  const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
  if (!raw) return [];
  try {
    const logs = JSON.parse(raw);
    return logs.slice(0, limit);
  } catch {
    return [];
  }
}

// ==========================================================================
// SEED INITIAL DEMO DATA (FOR QUICK LIVE EVALUATION & 3D RING CAROUSEL)
// ==========================================================================
function seedInitialDemoData() {
  const existingHackathons = getHackathons();
  if (existingHackathons.length >= 4) return; // already has sufficient data

  // 1. Seed Demo Organizer
  let demoOrganizer = getOrganizers().find(o => o.username === "organizer");
  if (!demoOrganizer) {
    demoOrganizer = saveOrganizerAccount({
      id: "org_demo_1",
      name: "Dr. Alan Turing",
      org: "ACM Student Chapter",
      email: "organizer@hackathon.edu",
      phone: "+1 555-0199",
      username: "organizer",
      password: "password123"
    });
  }

  // 2. Seed Demo Participant Account
  let demoParticipant = getParticipantAccounts().find(p => p.username === "participant");
  if (!demoParticipant) {
    demoParticipant = saveParticipantAccount({
      id: "pt_demo_1",
      name: "Alex Rivera",
      email: "alex@student.edu",
      phone: "+1 555-0144",
      college: "Institute of Technology",
      year: "3rd Year",
      username: "participant",
      password: "password123",
      bio: "Full stack enthusiast passionate about cloud systems and interactive UI design."
    });
  }

  // Clear to reseed rich set if less than 4
  if (existingHackathons.length < 4) {
    const richHackathons = [
      {
        id: "hk_demo_1",
        name: "Antigravity Global Hackathon 2026",
        description: "48-hour collaborative build sprint challenging students to build intelligent agentic web platforms and accessible tools.",
        startDate: "2026-09-15",
        endDate: "2026-09-17",
        mode: "Hybrid",
        venue: "Main Auditorium & Discord",
        deadline: "2026-09-10",
        maxParticipants: 30,
        createdBy: demoOrganizer.id,
        theme: "Agentic AI",
        badgeColor: "#10b981"
      },
      {
        id: "hk_demo_2",
        name: "Cyberpunk Web3 Sprint",
        description: "Decentralized applications, smart contract security, and zero-knowledge identity protocols built over a weekend.",
        startDate: "2026-10-02",
        endDate: "2026-10-04",
        mode: "Online",
        venue: "Global Virtual Discord",
        deadline: "2026-09-28",
        maxParticipants: 24,
        createdBy: demoOrganizer.id,
        theme: "Web3 & Security",
        badgeColor: "#6366f1"
      },
      {
        id: "hk_demo_3",
        name: "Cloud Native DevOps Arena",
        description: "Deploy fault-tolerant microservices, continuous delivery pipelines, and container orchestrations on live infrastructure.",
        startDate: "2026-10-18",
        endDate: "2026-10-20",
        mode: "Offline",
        venue: "Tech Innovation Hub (Lab 4)",
        deadline: "2026-10-12",
        maxParticipants: 20,
        createdBy: demoOrganizer.id,
        theme: "DevOps & Cloud",
        badgeColor: "#f59e0b"
      },
      {
        id: "hk_demo_4",
        name: "Neural Nexus AI Challenge",
        description: "Computer vision, multimodal LLMs, and real-time audio synthesis solutions for high-impact social accessibility.",
        startDate: "2026-11-05",
        endDate: "2026-11-07",
        mode: "Hybrid",
        venue: "AI Research Center",
        deadline: "2026-10-30",
        maxParticipants: 35,
        createdBy: demoOrganizer.id,
        theme: "Data & ML",
        badgeColor: "#8b5cf6"
      },
      {
        id: "hk_demo_5",
        name: "DesignCraft UI/UX Summit",
        description: "Product design sprint focusing on micro-interactions, motion design systems, spatial computing, and high usability.",
        startDate: "2026-11-20",
        endDate: "2026-11-22",
        mode: "Online",
        venue: "Figma & Slack Workspace",
        deadline: "2026-11-15",
        maxParticipants: 25,
        createdBy: demoOrganizer.id,
        theme: "Design & UX",
        badgeColor: "#ec4899"
      },
      {
        id: "hk_demo_6",
        name: "Edge Computing & IoT Jam",
        description: "Low-latency embedded software, sensor telemetry, and hardware prototypes connecting physical systems to web apps.",
        startDate: "2026-12-01",
        endDate: "2026-12-03",
        mode: "Offline",
        venue: "Hardware Maker Lab",
        deadline: "2026-11-25",
        maxParticipants: 20,
        createdBy: demoOrganizer.id,
        theme: "IoT & Hardware",
        badgeColor: "#06b6d4"
      }
    ];

    localStorage.setItem(HACKATHONS_KEY, JSON.stringify(richHackathons));

    // Seed diverse participants for the first hackathon
    const sampleParticipants = [
      { name: "Alex Rivera", skills: ["Frontend", "Design"], primarySkill: "Frontend", participantId: demoParticipant.id, college: "Institute of Technology" },
      { name: "Elena Rostova", skills: ["Backend", "DevOps/Cloud"], primarySkill: "Backend", college: "State Engineering College" },
      { name: "Marcus Chen", skills: ["Frontend", "Backend", "Data/ML"], primarySkill: "Data/ML", college: "National University" },
      { name: "Priya Sharma", skills: ["Design", "Frontend"], primarySkill: "Design", college: "Design Academy" },
      { name: "Liam O'Connor", skills: ["DevOps/Cloud", "Backend"], primarySkill: "DevOps/Cloud", college: "Polytechnic Institute" },
      { name: "Sophia Martinez", skills: ["Backend", "Data/ML"], primarySkill: "Backend", college: "Institute of Technology" },
      { name: "David Kim", skills: ["Frontend", "Design", "Backend"], primarySkill: "Frontend", college: "Metropolitan College" },
      { name: "Ananya Patel", skills: ["Data/ML", "DevOps/Cloud"], primarySkill: "Data/ML", college: "Tech University" },
      { name: "Noah Williams", skills: ["Design", "Frontend"], primarySkill: "Design", college: "Design Academy" },
      { name: "Maya Lin", skills: ["DevOps/Cloud", "Backend", "Frontend"], primarySkill: "DevOps/Cloud", college: "Polytechnic Institute" },
      { name: "Jordan Taylor", skills: ["Frontend", "Backend"], primarySkill: "Backend", college: "State Engineering College" },
      { name: "Samira Khan", skills: ["Data/ML", "Frontend"], primarySkill: "Data/ML", college: "National University" }
    ];

    sampleParticipants.forEach(p => {
      addParticipantToHackathon("hk_demo_1", p);
    });

    // Seed a few participants in other hackathons too
    addParticipantToHackathon("hk_demo_2", { name: "Alex Rivera", skills: ["Frontend", "Backend"], primarySkill: "Frontend", participantId: demoParticipant.id, college: "Institute of Technology" });
    addParticipantToHackathon("hk_demo_2", { name: "Elena Rostova", skills: ["Backend", "DevOps/Cloud"], primarySkill: "Backend", college: "State Engineering College" });
    addParticipantToHackathon("hk_demo_3", { name: "Liam O'Connor", skills: ["DevOps/Cloud", "Backend"], primarySkill: "DevOps/Cloud", college: "Polytechnic Institute" });

    logActivity("Pre-loaded 6 hackathons and participants for 3D showcase", "hk_demo_1", "system");
  }
}

// Auto-run seeder on script load
seedInitialDemoData();
