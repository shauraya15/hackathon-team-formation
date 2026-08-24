// balancer.js
// The core of the project: takes a list of participants and a
// number of teams, and splits them so each team gets a spread of
// skill categories instead of one team hoarding all the "Backend"
// people while another has none.
//
// Approach:
// 1. Feasibility check first — refuse if the participant count can't
//    possibly satisfy MIN_TEAM_SIZE / MAX_TEAM_SIZE for the requested
//    number of teams.
// 2. Sort participants by number of skills, fewest first — they're
//    harder to place well later, so we lock them in while there's
//    still flexibility.
// 3. For each participant, normally assign by SKILL BALANCE first —
//    whichever team has the fewest people with that participant's
//    primary skill. But before doing that, check whether we're
//    running low on participants relative to how many are still
//    needed to bring every under-sized team up to MIN_TEAM_SIZE. If
//    it's genuinely urgent, skill balance is temporarily overridden
//    and the participant is placed into an under-minimum team instead
//    — otherwise a team could get stranded below the minimum.

const CATEGORIES = ["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"];
const MIN_TEAM_SIZE = 2;
const MAX_TEAM_SIZE = 5;

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

  sortedParticipants.forEach((participant, index) => {
    const remainingIncludingCurrent = sortedParticipants.length - index;
    const team = pickBestTeam(teams, participant.primarySkill, remainingIncludingCurrent);
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

function pickBestTeam(teams, primarySkill, remainingIncludingCurrent) {
  // How many more participants would it take to bring every
  // currently under-minimum team up to MIN_TEAM_SIZE?
  const underMinTeams = teams.filter((t) => t.members.length < MIN_TEAM_SIZE);
  const neededToReachMin = underMinTeams.reduce(
    (sum, t) => sum + (MIN_TEAM_SIZE - t.members.length),
    0
  );

  // If the participants left (including this one) are exactly or
  // barely enough to cover that need, we can't afford to skip an
  // under-minimum team just for skill balance — do it now or it
  // becomes impossible later.
  const isUrgent = neededToReachMin >= remainingIncludingCurrent;

  let candidates;
  if (isUrgent) {
    candidates = underMinTeams.filter((t) => t.members.length < MAX_TEAM_SIZE);
  } else {
    candidates = teams.filter((t) => t.members.length < MAX_TEAM_SIZE);
  }

  // Safety fallback — should rarely trigger given the feasibility
  // check up front, but never leave a participant unplaced.
  if (candidates.length === 0) candidates = teams;

  // Within the chosen candidate pool, pick by skill balance first,
  // team size only as a tie-breaker.
  let bestTeam = candidates[0];
  candidates.forEach((team) => {
    const teamCount = team.skillCounts[primarySkill];
    const bestCount = bestTeam.skillCounts[primarySkill];

    if (teamCount < bestCount) {
      bestTeam = team;
    } else if (teamCount === bestCount && team.members.length < bestTeam.members.length) {
      bestTeam = team;
    }
  });

  return bestTeam;
}