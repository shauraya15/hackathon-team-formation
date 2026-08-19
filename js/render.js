// render.js
// Takes the teams array (already decided by balancer.js) and
// displays it as cards. This file doesn't make any decisions -
// it just draws what it's given.

function renderTeams(teams) {
  const container = document.getElementById("team-cards-container");
  container.innerHTML = "";

  teams.forEach((team) => {
    const card = document.createElement("div");
    card.className = "team-card";

    const heading = document.createElement("h3");
    heading.textContent = `Team ${team.id}`;
    card.appendChild(heading);

    const memberList = document.createElement("ul");
    team.members.forEach((member) => {
      const item = document.createElement("li");
      item.textContent = `${member.name} (${member.primarySkill})`;
      memberList.appendChild(item);
    });
    card.appendChild(memberList);

    const skillSummary = document.createElement("p");
    const counts = Object.entries(team.skillCounts)
      .map(([skill, count]) => `${skill}: ${count}`)
      .join(", ");
    skillSummary.textContent = `Skill spread — ${counts}`;
    card.appendChild(skillSummary);

    container.appendChild(card);
  });
}