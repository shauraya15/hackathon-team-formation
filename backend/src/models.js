const mongoose = require("mongoose");

const SKILLS = ["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"];

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    username: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["organizer", "participant"], required: true },
    college: { type: String, trim: true },
    year: { type: String, trim: true },
    bio: { type: String, trim: true },
    organization: { type: String, trim: true }
  },
  { timestamps: true }
);

const hackathonSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    startDate: String,
    endDate: String,
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
    venue: String,
    deadline: String,
    maxParticipants: { type: Number, min: 1 }
  },
  { timestamps: true }
);

const participantSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    name: { type: String, required: true, trim: true },
    skills: {
      type: [{ type: String, enum: SKILLS }],
      validate: {
        validator: value => value.length >= 2 && value.length <= 4,
        message: "Participants must select between 2 and 4 skills."
      }
    },
    primarySkill: { type: String, enum: SKILLS, required: true }
  },
  { timestamps: true }
);

participantSchema.index({ hackathonId: 1, accountId: 1 }, { unique: true });

const teamResultSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, unique: true },
    requestedTeams: { type: Number, required: true, min: 1 },
    teams: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

module.exports = {
  Account: mongoose.model("Account", accountSchema),
  Hackathon: mongoose.model("Hackathon", hackathonSchema),
  Participant: mongoose.model("Participant", participantSchema),
  TeamResult: mongoose.model("TeamResult", teamResultSchema),
  SKILLS
};
