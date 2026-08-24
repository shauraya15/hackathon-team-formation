// balancer.js
// The core of the project: takes a list of participants and a
// number of teams, and splits them so each team gets a spread of
// skill categories instead of one team hoarding all the "Backend"
// people while another has none.
//
// Approach:
// 1. Before doing anything, check the numbers are even feasible —
//    every team must end up with between MIN_TEAM_SIZE and
//    MAX_TEAM_SIZE members. If not, refuse instead of producing
//    broken teams (e.g. teams with only 1 person).
// 2. Sort participants so the ones with FEWER skills go first.
//    Someone with only 2 skills is harder to place well later, so
//    we lock them into a team while there's still flexibility.
// 3. Walk through that sorted list and drop each participant into
//    whichever team currently has the LOWEST count of that
//    participant's primary skill (and still has room). On a tie,
//    prefer whichever team currently has fewer members overall, so
//    team sizes stay even instead of always favoring earlier teams.

const CATEGORIES = ["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"];
const MIN_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 4;

// Checks whether numParticipants can actually be split into numTeams
// teams while keeping every team between MIN_TEAM_SIZE and
// MAX_TEAM_SIZE members. Returns { valid: true } or
// { valid: false, message }.
function canFormTeams(numParticipants, numTeams) {
  const minRequired = numTeams * MIN_TEAM_SIZE;
  const maxAllowed = numTeams * MAX_TEAM_SIZE;

  if (numParticipants < minRequired) {
    return {
      valid: false,
      message: `Not enough participants. ${numTeams} teams need at least ${minRequired} participants (${MIN_TEAM_SIZE} each), but only ${numParticipants} are added.`,
    };
  }

  if (numParticipants > maxAllowed) {
    return {
      valid: false,
      message: `Too many participants for ${numTeams} teams. Max is ${maxAllowed} (${MAX_TEAM_SIZE} each). Try increasing the number of teams.`,
    };
  }

  return { valid: true };
}

function generateTeams(participants, numTeams) {
  const teams = createEmptyTeams(numTeams);

  const sortedParticipants = [...participants].sort(
    (a, b) => a.skills.length - b.skills.length
  );

  sortedParticipants.forEach((participant) => {
    const team = pickBestTeam(teams, participant.primarySkill, MAX_TEAM_SIZE);
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
  // Prefer teams that still have room.
  const availableTeams = teams.filter((team) => team.members.length < maxTeamSize);
  const candidates = availableTeams.length > 0 ? availableTeams : teams;

  let bestTeam = candidates[0];
  candidates.forEach((team) => {
    const teamCount = team.skillCounts[primarySkill];
    const bestCount = bestTeam.skillCounts[primarySkill];

    if (teamCount < bestCount) {
      bestTeam = team;
    } else if (teamCount === bestCount && team.members.length < bestTeam.members.length) {
      // Tie on skill count — prefer whichever team is currently
      // smaller, so teams fill up evenly instead of always
      // favoring earlier teams in the array.
      bestTeam = team;
    }
  });

  return bestTeam;
}