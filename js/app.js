// app.js
// Wires everything together - listens for user actions and calls
// the right functions from the other files. No real logic lives
// here, just the glue.

const form = document.getElementById("participant-form");
const formError = document.getElementById("form-error");
const generateBtn = document.getElementById("generate-teams-btn");

form.addEventListener("submit", (event) => {
  event.preventDefault();

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

  saveParticipant({
    name: name.trim(),
    skills: selectedSkills,
    primarySkill: primarySkill,
  });

  form.reset();
});

generateBtn.addEventListener("click", () => {
  const numTeams = parseInt(document.getElementById("team-count").value, 10);
  const participants = getParticipants();

  if (!numTeams || numTeams < 2) {
    alert("Enter a valid number of teams (2 or more).");
    return;
  }

  if (participants.length === 0) {
    alert("No participants added yet.");
    return;
  }

  const teams = generateTeams(participants, numTeams);
  renderTeams(teams);
});