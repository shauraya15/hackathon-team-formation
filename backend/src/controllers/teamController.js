const { Participant, TeamResult, SKILLS } = require("../models");
const { isObjectId } = require("./hackathonController");

async function generateTeams(req, res) {
  const teamCount = Number(req.body.teamCount);
  const participants = await Participant.find({ hackathonId: req.params.hackathonId }).lean();
  if (!Number.isInteger(teamCount) || teamCount < 1) return res.status(400).json({ error: "teamCount must be a positive integer." });
  if (participants.length < teamCount * 2 || participants.length > teamCount * 5) {
    return res.status(400).json({ error: `Participants must fit between ${teamCount * 2} and ${teamCount * 5} for ${teamCount} teams.` });
  }
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    id: index + 1, members: [], skillCounts: Object.fromEntries(SKILLS.map(skill => [skill, 0]))
  }));
  [...participants].sort((a, b) => a.skills.length - b.skills.length).forEach(participant => {
    const team = teams.reduce((best, current) => {
      const currentCount = current.skillCounts[participant.primarySkill];
      const bestCount = best.skillCounts[participant.primarySkill];
      return currentCount < bestCount || (currentCount === bestCount && current.members.length < best.members.length) ? current : best;
    });
    team.members.push(participant);
    team.skillCounts[participant.primarySkill] += 1;
  });
  const result = await TeamResult.findOneAndUpdate(
    { hackathonId: req.params.hackathonId },
    { hackathonId: req.params.hackathonId, requestedTeams: teamCount, teams },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ result });
}

async function getTeams(req, res) {
  if (!isObjectId(req.params.hackathonId)) return res.status(400).json({ error: "Invalid hackathon id." });
  const result = await TeamResult.findOne({ hackathonId: req.params.hackathonId }).lean();
  if (!result) return res.status(404).json({ error: "Teams have not been generated yet." });
  res.json({ result });
}

async function analytics(req, res) {
  if (!isObjectId(req.params.hackathonId)) return res.status(400).json({ error: "Invalid hackathon id." });
  const participants = await Participant.find({ hackathonId: req.params.hackathonId }).lean();
  const skillDistribution = Object.fromEntries(SKILLS.map(skill => [
    skill, participants.filter(item => item.primarySkill === skill).length
  ]));
  const result = await TeamResult.findOne({ hackathonId: req.params.hackathonId }).lean();
  res.json({ participantCount: participants.length, skillDistribution, teamsGenerated: Boolean(result), teamCount: result ? result.teams.length : 0 });
}

module.exports = { generateTeams, getTeams, analytics };
