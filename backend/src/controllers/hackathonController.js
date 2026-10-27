const { Hackathon, Participant, SKILLS } = require("../models");

const isObjectId = value => /^[a-f\d]{24}$/i.test(value);

async function listHackathons(req, res) {
  const filter = req.query.organizerId && isObjectId(req.query.organizerId) ? { organizerId: req.query.organizerId } : {};
  const hackathons = await Hackathon.find(filter).sort({ createdAt: -1 }).lean();
  const counts = await Participant.aggregate([{ $group: { _id: "$hackathonId", count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map(item => [item._id.toString(), item.count]));
  res.json({ hackathons: hackathons.map(hackathon => ({
    ...hackathon,
    participantCount: countMap[hackathon._id.toString()] || 0
  })) });
}

async function createHackathon(req, res) {
  if (!String(req.body.name || "").trim()) return res.status(400).json({ error: "Hackathon name is required." });
  const hackathon = await Hackathon.create({ ...req.body, organizerId: req.auth.sub });
  res.status(201).json({ hackathon });
}

async function getHackathon(req, res) {
  if (!isObjectId(req.params.hackathonId)) return res.status(400).json({ error: "Invalid hackathon id." });
  const hackathon = await Hackathon.findById(req.params.hackathonId).lean();
  if (!hackathon) return res.status(404).json({ error: "Hackathon not found." });
  const participantCount = await Participant.countDocuments({ hackathonId: hackathon._id });
  res.json({ hackathon: { ...hackathon, participantCount } });
}

async function registerParticipant(req, res) {
  const { skills, primarySkill, name } = req.body;
  if (!isObjectId(req.params.hackathonId) || !name || !Array.isArray(skills) || skills.length < 2 || skills.length > 4 || !skills.includes(primarySkill) || skills.some(skill => !SKILLS.includes(skill))) {
    return res.status(400).json({ error: "Name, 2-4 valid skills, and a primary skill from the selected skills are required." });
  }
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) return res.status(404).json({ error: "Hackathon not found." });
  if (hackathon.maxParticipants && await Participant.countDocuments({ hackathonId: hackathon._id }) >= hackathon.maxParticipants) {
    return res.status(409).json({ error: "This hackathon has reached its participant limit." });
  }
  try {
    const participant = await Participant.create({ hackathonId: hackathon._id, accountId: req.auth.sub, name, skills, primarySkill });
    res.status(201).json({ participant });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "You are already registered for this hackathon." });
    throw error;
  }
}

async function listParticipants(req, res) {
  if (!isObjectId(req.params.hackathonId)) return res.status(400).json({ error: "Invalid hackathon id." });
  const participants = await Participant.find({ hackathonId: req.params.hackathonId }).sort({ name: 1 }).lean();
  res.json({ participants });
}

module.exports = { isObjectId, listHackathons, createHackathon, getHackathon, registerParticipant, listParticipants };
