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
    year: account.year || "1st Year",
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
    id: `hk_${Date.now()}`,
    name: data.name.trim(),
    description: (data.description || "").trim(),
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    mode: data.mode || "Online", // Online, Offline, Hybrid
    venue: (data.venue || "").trim(),
    deadline: data.deadline || "",
    maxParticipants: parseInt(data.maxParticipants, 10) || 50,
    createdBy: data.createdBy || null,
    teamsGenerated: false,
    generatedTeams: [],
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
// SEED INITIAL DEMO DATA (FOR QUICK LIVE EVALUATION)
// ==========================================================================
function seedInitialDemoData() {
  const existingHackathons = getHackathons();
  if (existingHackathons.length > 0) return; // already has data

  // 1. Seed Demo Organizer
  const demoOrganizer = saveOrganizerAccount({
    id: "org_demo_1",
    name: "Dr. Alan Turing",
    org: "ACM Student Chapter",
    email: "organizer@hackathon.edu",
    phone: "+1 555-0199",
    username: "organizer",
    password: "password123"
  });

  // 2. Seed Demo Participant Account
  const demoParticipant = saveParticipantAccount({
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

  // 3. Seed Demo Hackathon
  const demoHackathon = createRichHackathon({
    name: "Antigravity Global Hackathon 2026",
    description: "48-hour collaborative build sprint challenging students to build intelligent agentic web platforms and accessible tools.",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    mode: "Hybrid",
    venue: "Main Auditorium & Discord",
    deadline: "2026-09-10",
    maxParticipants: 30,
    createdBy: demoOrganizer.id
  });

  // 4. Seed 12 Diverse Participants for Team Balancing demonstration
  const sampleParticipants = [
    { name: "Alex Rivera", skills: ["Frontend", "Design"], primarySkill: "Frontend", participantId: demoParticipant.id },
    { name: "Elena Rostova", skills: ["Backend", "DevOps/Cloud"], primarySkill: "Backend" },
    { name: "Marcus Chen", skills: ["Frontend", "Backend", "Data/ML"], primarySkill: "Data/ML" },
    { name: "Priya Sharma", skills: ["Design", "Frontend"], primarySkill: "Design" },
    { name: "Liam O'Connor", skills: ["DevOps/Cloud", "Backend"], primarySkill: "DevOps/Cloud" },
    { name: "Sophia Martinez", skills: ["Backend", "Data/ML"], primarySkill: "Backend" },
    { name: "David Kim", skills: ["Frontend", "Design", "Backend"], primarySkill: "Frontend" },
    { name: "Ananya Patel", skills: ["Data/ML", "DevOps/Cloud"], primarySkill: "Data/ML" },
    { name: "Noah Williams", skills: ["Design", "Frontend"], primarySkill: "Design" },
    { name: "Maya Lin", skills: ["DevOps/Cloud", "Backend", "Frontend"], primarySkill: "DevOps/Cloud" },
    { name: "Jordan Taylor", skills: ["Frontend", "Backend"], primarySkill: "Backend" },
    { name: "Samira Khan", skills: ["Data/ML", "Frontend"], primarySkill: "Data/ML" }
  ];

  sampleParticipants.forEach(p => {
    addParticipantToHackathon(demoHackathon.id, p);
  });

  logActivity("Pre-loaded demo participants and hackathon", demoHackathon.id, "system");
}

// Auto-run seeder on script load
seedInitialDemoData();
