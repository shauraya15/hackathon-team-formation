// balancer.js
// The core of the project: takes a list of participants and a
// number of teams, and splits them so each team gets a spread of
// skill categories instead of one team hoarding all the "Backend"
// people while another has none.
//
// Approach:
// 1. Sort participants so the ones with FEWER skills go first.
//    Someone with only 2 skills is harder to place well later, so
//    we lock them into a team while there's still flexibility.
//    Someone with 4 skills is easier to slot in anywhere at the end.
// 2. Walk through that sorted list and drop each participant into
//    whichever team currently has the LOWEST count of that
//    participant's primary skill (and still has room). This keeps
//    every category spread evenly across teams as we go, instead
//    of filling teams in signup order.

const CATEGORIES = ["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"];

function generateTeams(participants, numTeams) {
  const teams = createEmptyTeams(numTeams);
  const maxTeamSize = Math.ceil(participants.length / numTeams);

  const sortedParticipants = [...participants].sort(
    (a, b) => a.skills.length - b.skills.length
  );

  sortedParticipants.forEach((participant) => {
    const team = pickBestTeam(teams, participant.primarySkill, maxTeamSize);
    team.members.push(participant);
    team.skillCounts[participant.primarySkill]++;
  });

  return teams;
}

function createEmptyTeams(numTeams) {
  const teams = [];
  for (let i = 1; i <= numTeams; i++) {
    const skillCounts = {};
    CATEGORIES.forEach((category) => (skillCounts[category] = 0));
    teams.push({ id: i, members: [], skillCounts });
  }
  return teams;
}

function pickBestTeam(teams, primarySkill, maxTeamSize) {
  // Prefer teams that still have room. If every team is full
  // (can happen with an odd participant count), fall back to
  // considering all teams so nobody gets left unassigned.
  const availableTeams = teams.filter((team) => team.members.length < maxTeamSize);
  const candidates = availableTeams.length > 0 ? availableTeams : teams;

  let bestTeam = candidates[0];
  candidates.forEach((team) => {
    if (team.skillCounts[primarySkill] < bestTeam.skillCounts[primarySkill]) {
      bestTeam = team;
    }
  });

  return bestTeam;
}