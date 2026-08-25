# Synapse Teams — Intelligent Skill-Balanced Hackathon Team Formation Platform

A high-craft web platform that automatically splits hackathon participants into cross-functionally balanced teams using a deterministic greedy algorithm. It eliminates stack hoarding (e.g. four frontend developers on one team with zero backend or DevOps engineers) and ensures every student is placed into a viable team of 2 to 5 members.

Built with pure **Vanilla HTML5, CSS3, and JavaScript** using the browser's **LocalStorage** for data persistence. Zero backend frameworks, zero external build tools, and zero third-party libraries.

---

## 👥 3-Person Team Contribution Split (Git Commit Roadmap)

This project is architected into 4 clean, separable modules so each team member can explain their exact contributions during code reviews and viva examinations:

| Member / Stage | Role & Responsibility | Core Files & Modules Built |
| :--- | :--- | :--- |
| **Member 1 (UI & Design System)** | Design System, Interactive Landing Page & Shared Data Store | `css/design-system.css`, `css/components.css`, `css/pages.css`, `index.html`, `js/data-store.js`, `js/ui-helpers.js`, `js/home.js` |
| **Member 2 (Organizer Suite)** | Organizer Auth, Dashboard, Participant Roster CRUD & Team Generator | `organizer-login.html`, `organizer-dashboard.html`, `js/organizer.js`, `js/auth-state.js` |
| **Member 3 (Participant Suite)** | Participant Auth, Browse Hackathons, Self-Registration & My Team View | `participant-login.html`, `participant-dashboard.html`, `js/participant.js` |
| **Shared / Polish** | Algorithm Wrapping, LocalStorage Bridge & Viva Preparation | `js/balancer.js` (Preserved Core), `js/validation.js`, `js/storage.js`, `README.md` |

---

## ⚡ Core Features

### 1. Public Landing Page (`index.html`)
- **Google Antigravity-Grade Design**: Deep obsidian canvas (`#090d16`), high-contrast typography (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), and fluid micro-interactions.
- **Problem Statement Narrative**: Visual comparison of random unbalance vs. deterministic cross-functional grouping.
- **Live Algorithm Teaser**: Interactive widget running `balancer.js` live directly on the landing page.
- **Dual Portal Entry**: Quick-access routing for Organizers and Participants.

### 2. Organizer Portal (`organizer-login.html` & `organizer-dashboard.html`)
- **Authentication**: LocalStorage-backed sign-in and sign-up with 1-click Demo Login.
- **Event Metrics**: Real-time counting animations for Total Hackathons, Total Participants, and Formed Teams.
- **Multi-Hackathon Manager**: Create, edit, and delete events with Mode (Online/Offline/Hybrid), Venue, Dates, and Capacity limits.
- **Searchable Roster**: Filter participants by skill category (Frontend, Backend, Design, Data/ML, DevOps) or search by name.
- **Participant CRUD**: Add, edit, or remove candidates with instant validation.
- **Team Generation Engine**:
  - Validates minimum/maximum capacity feasibility (`canFormTeams`).
  - Executes greedy balancing math (`generateTeams`).
  - Staggered card flip reveal animation.
  - 1-Click Copy Team List (Markdown) and 1-Click Export JSON.
- **Live Activity Feed**: Timestamped activity logs.

### 3. Participant Portal (`participant-login.html` & `participant-dashboard.html`)
- **Student Authentication**: Profile tracking with College, Year of Study (1st–4th), and Bio.
- **Browse Open Hackathons**: Discovery gallery with live graphical capacity fill meters.
- **Self-Registration with Skills**: Select 2 to 4 competencies and mark 1 primary strength.
- **Lifecycle Tracking**: Real-time status badges (`⏳ Waiting for Teams` vs. `⚡ Team Assigned`).
- **"My Team" Celebratory View**: Complete view of assigned team number, teammates' contact badges, and team skill matrix.
- **Pre-Gen Skill Locking**: Enables skill modifications prior to team formation, and automatically locks afterwards.

---

## 📐 Data Architecture (LocalStorage Schemas)

All state is persisted purely on the client side using structured JSON in `localStorage`:

```
localStorage
├── "organizers"                 → Array<{ id, name, org, email, phone, username, password, createdAt }>
├── "participantAccounts"        → Array<{ id, name, email, phone, college, year, username, password, bio, createdAt }>
├── "hackathons"                 → Array<{ id, name, description, startDate, endDate, mode, venue, deadline, maxParticipants, createdBy, teamsGenerated, generatedTeams, createdAt }>
├── "participants_<hackathonId>" → Array<{ id, name, skills, primarySkill, participantId, college, registeredAt }>
├── "activity_log"               → Array<{ id, text, hackathonId, type, time }>
├── "loggedInOrganizerId"        → string (Session pointer)
└── "loggedInParticipantId"       → string (Session pointer)
```

---

## 🧠 How the Balancing Algorithm Works (`js/balancer.js`)

The core algorithm is a deterministic greedy balancing heuristic operating in 3 steps:

1. **Feasibility Gate (`canFormTeams`)**:
   - Ensures `numParticipants >= numTeams * 2` (MIN_TEAM_SIZE = 2).
   - Ensures `numParticipants <= numTeams * 5` (MAX_TEAM_SIZE = 5).
   - Refuses invalid team counts before any allocations occur.

2. **Fewest-Skills-First Priority Sorting**:
   - Participants are sorted in ascending order of their skill count (`skills.length`).
   - *Rationale*: Specialized candidates (e.g. knowing only Backend) are harder to place later. Allocating them first prevents teams from missing essential competencies.

3. **Greedy Placement with Urgency Override (`pickBestTeam`)**:
   - Calculates `neededToReachMin` across all teams currently below 2 members.
   - If `neededToReachMin >= remainingParticipants`, triggers `isUrgent` mode to prevent any team from being stranded below the minimum size.
   - Otherwise, places the participant into whichever candidate team currently holds the **fewest members with that participant's primary skill**. Ties are broken by smallest team size.

---

## 🚀 Quick Setup / How to Run

No installation, build step, or web server is required.

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/shauraya15/hackathon-team-formation.git
   ```
2. **Open in Browser**:
   - Double-click `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
   - Or right-click `index.html` and select **Open with Live Server** in VS Code.
3. **Pre-Seeded Demo Accounts**:
   - **Organizer**: Username: `organizer` | Password: `password123` *(or click "1-Click Demo Login")*
   - **Participant**: Username: `participant` | Password: `password123` *(or click "1-Click Demo Login")*

---

## 🎓 GitHub Viva Q&A Guide

### Q1: Why use pure Vanilla JS and LocalStorage instead of a framework?
> **Answer**: Phase 1 focuses on mastering DOM manipulation, algorithm design, data structures, and client-side state management without the abstraction of frameworks. It makes the entire architecture inspectable and transparent.

### Q2: Why sort participants by fewest skills first?
> **Answer**: A participant who only knows DevOps has exactly one way to contribute, whereas a full-stack participant can fit multiple roles. Placing constrained candidates early leaves generalists available to fill remaining gaps later.

### Q3: How is data isolation maintained between different hackathons?
> **Answer**: Each hackathon's participants are stored under an isolated key: `participants_${hackathonId}`. Deleting or modifying one hackathon never affects another.

### Q4: How does self-registration link to participant accounts?
> **Answer**: When a logged-in participant registers, their account ID is saved in the participant record (`participantId`). The participant dashboard queries all hackathons and retrieves records where `participantId === currentParticipant.id`.
