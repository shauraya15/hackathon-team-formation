const express = require("express");
const { SKILLS } = require("./models");
const { requireAuth, requireRole } = require("./auth");
const { signup, login, currentAccount } = require("./controllers/authController");
const {
  listHackathons, createHackathon, getHackathon, registerParticipant, listParticipants
} = require("./controllers/hackathonController");
const { generateTeams, getTeams, analytics } = require("./controllers/teamController");

const router = express.Router();
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get("/skills", (req, res) => res.json({ skills: SKILLS }));
router.post("/auth/signup", asyncRoute(signup));
router.post("/auth/login", asyncRoute(login));
router.get("/auth/me", requireAuth, asyncRoute(currentAccount));

router.get("/hackathons", asyncRoute(listHackathons));
router.post("/hackathons", requireAuth, requireRole("organizer"), asyncRoute(createHackathon));
router.get("/hackathons/:hackathonId", asyncRoute(getHackathon));
router.post("/hackathons/:hackathonId/participants", requireAuth, requireRole("participant"), asyncRoute(registerParticipant));
router.get("/hackathons/:hackathonId/participants", requireAuth, asyncRoute(listParticipants));
router.post("/hackathons/:hackathonId/teams/generate", requireAuth, requireRole("organizer"), asyncRoute(generateTeams));
router.get("/hackathons/:hackathonId/teams", asyncRoute(getTeams));
router.get("/hackathons/:hackathonId/analytics", requireAuth, asyncRoute(analytics));

module.exports = router;
