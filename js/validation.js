// validation.js
// Checks a participant's form entry against the project's rules
// before it gets saved. Doesn't touch storage or the DOM directly.

function validateParticipant(name, selectedSkills, primarySkill) {
  const trimmedName = name.trim();

  if (trimmedName === "") {
    return { valid: false, message: "Please enter a name." };
  }

  if (selectedSkills.length < 2) {
    return { valid: false, message: "Select at least 2 skills." };
  }

  if (selectedSkills.length > 4) {
    return { valid: false, message: "You can select at most 4 skills." };
  }

  if (!primarySkill) {
    return { valid: false, message: "Please choose a primary skill." };
  }

  if (!selectedSkills.includes(primarySkill)) {
    return { valid: false, message: "Primary skill must be one of the skills you selected." };
  }

  return { valid: true };
}