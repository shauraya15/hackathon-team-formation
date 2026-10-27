// app.js
// Wires everything together. Tracks which hackathon is currently
// active, and every form/storage/algorithm action operates within
// that hackathon's scope.

let activeHackathonId = null;

const hackathonSelect = document.getElementById("hackathon-select");
const newHackathonInput = document.getElementById("new-hackathon-name");
const createHackathonBtn = document.getElementById("create-hackathon-btn");
const activeHackathonLabel = document.getElementById("active-hackathon-label");

const form = document.getElementById("participant-form");
const formError = document.getElementById("form-error");
const generateBtn = document.getElementById("generate-teams-btn");
const clearBtn = document.getElementById("clear-participants-btn");

// ---------- Hackathon selection ----------

function loadHackathonsIntoDropdown() {
  const hackathons = getHackathons();
  hackathonSelect.innerHTML = '<option value="">-- select a hackathon --</option>';

  hackathons.forEach((hackathon) => {
    const option = document.createElement("option");
    option.value = hackathon.id;
    option.textContent = hackathon.name;
    hackathonSelect.appendChild(option);
  });
}

function setActiveHackathon(id, name) {
  activeHackathonId = id;
  activeHackathonLabel.textContent = id ? `Active hackathon: ${name}` : "";
  document.getElementById("team-cards-container").innerHTML = "";
}

hackathonSelect.addEventListener("change", () => {
  const selectedId = hackathonSelect.value;
  const hackathons = getHackathons();
  const selected = hackathons.find((h) => h.id === selectedId);
  setActiveHackathon(selected ? selected.id : null, selected ? selected.name : "");
});

createHackathonBtn.addEventListener("click", () => {
  const name = newHackathonInput.value.trim();
  if (name === "") {
    alert("Enter a name for the new hackathon.");
    return;
  }

  const newHackathon = saveHackathon(name);
  newHackathonInput.value = "";
  loadHackathonsIntoDropdown();
  hackathonSelect.value = newHackathon.id;
  setActiveHackathon(newHackathon.id, newHackathon.name);
});

// ---------- Participant form ----------

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeHackathonId) {
    formError.textContent = "Select or create a hackathon first.";
    return;
  }

  const name = document.getElementById("participant-name").value;
  const primarySkill = document.getElementById("primary-skill").value;

  const checkedBoxes = document.querySelectorAll('input[name="skill"]:checked');
  const selectedSkills = Array.from(checkedBoxes).map((box) => box.value);

  const result = validateParticipant(name, selectedSkills, primarySkill);

  if (!result.valid) {
    formError.textContent = result.message;
    return;
  }

  formError.textContent = "";

  saveParticipant(activeHackathonId, {
    name: name.trim(),
    skills: selectedSkills,
    primarySkill: primarySkill,
  });

  form.reset();
});

// ---------- Team generation ----------

generateBtn.addEventListener("click", () => {
  if (!activeHackathonId) {
    alert("Select or create a hackathon first.");
    return;
  }

  const numTeams = parseInt(document.getElementById("team-count").value, 10);
  const participants = getParticipants(activeHackathonId);

  if (!numTeams || numTeams < 1) {
    alert("Enter a valid number of teams.");
    return;
  }

  if (participants.length === 0) {
    alert("No participants added yet for this hackathon.");
    return;
  }

  const feasibility = canFormTeams(participants.length, numTeams);
  if (!feasibility.valid) {
    alert(feasibility.message);
    return;
  }

  const teams = generateTeams(participants, numTeams);
  renderTeams(teams);
});
// ---------- Clear participants (scoped to active hackathon) ----------

clearBtn.addEventListener("click", () => {
  if (!activeHackathonId) {
    alert("Select a hackathon first.");
    return;
  }

  const confirmed = confirm("This will remove all participants for this hackathon. Continue?");
  if (confirmed) {
    clearParticipants(activeHackathonId);
    document.getElementById("team-cards-container").innerHTML = "";
  }
});

// ---------- Initial load ----------

loadHackathonsIntoDropdown();