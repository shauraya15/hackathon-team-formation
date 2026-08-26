<<<<<<< HEAD
﻿# Synapse Teams — Intelligent Skill-Balanced Hackathon Team Formation Platform

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
=======
# Formfactor

Formfactor is a browser-based hackathon team formation tool. It helps organizers turn participants with different strengths into balanced teams that are ready to build.

Hackathon organizers often need to form teams quickly from a mixed group of frontend, backend, design, data, and cloud participants. Manual grouping can be slow and subjective. Formfactor collects each participant's skills and primary skill, then uses an explainable balancing algorithm to distribute people across teams.

This is **Phase 1** of the project. It uses plain HTML, CSS, and JavaScript with LocalStorage. There is no backend, database, framework, or external authentication/email service yet.

## Project Goal

The project solves the problem of unbalanced hackathon teams, where one team may collect similar skills while another team has important gaps. The application gives organizers a structured workflow and gives participants a clear view of their registration and team assignment.

## Complete User Flow

1. An organizer creates an account and signs in.
2. The organizer creates a hackathon with event details.
3. A participant creates an account and signs in.
4. The participant browses available hackathons.
5. The participant selects an event and registers with 2–4 skills and one primary skill.
6. The organizer opens the selected event's formation workspace.
7. The workspace loads the event details, participants, and any saved teams.
8. The organizer checks feasibility and generates teams.
9. The existing balancing algorithm distributes participants by primary skill.
10. Generated teams are saved in LocalStorage.
11. Participants return to their dashboard and see either `Registered — waiting for teams` or their assigned team.
12. Assigned participants can see their team number, teammates, primary skills, and skill spread.
13. The organizer can copy or export the team list and log out.

## Current Features

### Home and presentation

- Responsive product-style Home page
- Organizer and participant entry points
- How-it-works and feature sections
- Shared restrained paper, ink, blue, and lime design system
- Responsive layouts for desktop and mobile
- Purposeful hover and entrance animations
- Compact spacing for easier first-viewport navigation

### Organizer features

- Organizer signup and login
- Login with username or email
- LocalStorage session handling
- Organizer dashboard
- Hackathon statistics
- Create hackathon form with:
  - Name
  - Description
  - Start and end dates
  - Online, Offline, or Hybrid mode
  - Venue
  - Registration deadline
  - Maximum participants
- Multiple hackathons with separate participant lists
- Hackathon selection by ID
- Hackathon details in the formation workspace
- Edit hackathon name
- Delete hackathon and related local data
- Participant roster with name, skills, and primary skill
- Participant search by name
- Participant filtering by primary skill
- Participant deletion
- Formation workspace with existing configuration
- Saved team results loaded immediately when available
- Generate and regenerate teams
- Minimum and maximum team-size checks
- Team generation activity log
- Copy team list
- Export team list as CSV
- Organizer logout

### Participant features

- Participant signup and login
- Login with username or email
- Participant name, email, phone, college, year, username, password, and optional bio
- Browse all available hackathons
- View event description, dates, mode, and participant count
- Join a hackathon through a skill form
- Select 2–4 skills
- Select one primary skill
- Registration linked to the account using `participantId`
- Registration status: waiting for teams
- Assigned-team status after generation
- My Hackathons view
- Team number and teammate list
- Teammate primary skills
- Overall team skill spread
- Participant logout

### Formation workspace

The **Open Formation Workspace** action passes the selected hackathon ID in the URL:

```text
pages/organizer-tool.html?hackathon=<hackathon-id>
```

The workspace then retrieves the selected event's data from LocalStorage and displays:

- Selected hackathon details
- All registered participants
- Minimum members: 2
- Maximum members: 5
- Requested team count
- `No teams generated yet.` when no saved result exists
- Existing saved team cards when teams already exist

Each detailed team card contains:

- Team number
- Number of members
- Member names
- Member skills
- Member primary skills
- Team primary-skill distribution

## Team Algorithm

The original algorithm in `js/balancer.js` is preserved.

Its behavior is:

1. Check whether the participant count can fit within the requested number of teams.
2. Require at least 2 and at most 5 members per team.
3. Sort participants by number of selected skills.
4. Place participants greedily into the team with the lowest count for their primary skill.
5. Use team size and minimum-team constraints as placement safeguards.
6. Return team objects containing members and skill counts.

The algorithm balances by **primary skill**. Other selected skills are stored, displayed, and available for future algorithm improvements, but they do not currently change the balancing calculation.

A direct test covered 154 feasible participant/team combinations. No participant assignment, team-size, or duplicate-member failures were found.
>>>>>>> 6b4f9f17b4532a829c3165455312a8aa78e07513

All state is persisted purely on the client side using structured JSON in `localStorage`:

<<<<<<< HEAD
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
=======
These screenshots document the current Phase 1 interface and the main presentation flow:

### Home page

![Formfactor Home page](screenshots/current-home.png)

### Organizer login

![Organizer login](screenshots/current-organizer-login.png)

### Organizer dashboard

![Organizer dashboard](screenshots/current-organizer-dashboard.png)

### Formation workspace

![Formation workspace](screenshots/current-formation-workspace.png)

The formation workspace screenshot shows the selected hackathon, event metadata, participant roster, team configuration, and the empty state before teams are generated. After generation, the workspace displays detailed team cards and the saved-results confirmation.

## Folder Structure

```text
hackathon-team-formation/
├── pages/
│   ├── index.html
│   ├── organizer-login.html
│   ├── organizer-signup.html
│   ├── organizer-dashboard.html
│   ├── create-hackathon.html
│   ├── organizer-tool.html
│   ├── participant-login.html
│   ├── participant-signup.html
│   └── participant-dashboard.html
├── styles/
│   ├── shared.css
│   ├── auth.css
│   ├── dashboard.css
│   └── style.css
├── js/
│   ├── app.js
│   ├── balancer.js
│   ├── render.js
│   ├── storage.js
│   ├── validation.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── team-state.js
│   ├── formation.js
│   └── phase2.js
├── screenshots/
├── README.md
└── .git/
```

## File Responsibilities

- `pages/index.html` — Home page
- `pages/organizer-login.html` — Organizer login
- `pages/organizer-signup.html` — Organizer account creation
- `pages/organizer-dashboard.html` — Organizer event and participant workspace
- `pages/create-hackathon.html` — Event creation form
- `pages/organizer-tool.html` — Existing participant form, team generation, saved team display, and export actions
- `pages/participant-login.html` — Participant login
- `pages/participant-signup.html` — Participant account creation
- `pages/participant-dashboard.html` — Event browsing, registration, and team status
- `styles/shared.css` — Home page design system
- `styles/auth.css` — Authentication and event-creation styles
- `styles/dashboard.css` — Dashboard and formation workspace styles
- `styles/style.css` — Original formation tool styles
- `js/storage.js` — Existing LocalStorage data layer
- `js/validation.js` — Existing participant validation
- `js/balancer.js` — Protected team-balancing algorithm
- `js/render.js` — Existing basic team-card renderer
- `js/app.js` — Existing formation workspace coordinator
- `js/auth.js` — Frontend-only signup, login, and password reset
- `js/dashboard.js` — Session checks, organizer dashboard behavior, and shared data helpers
- `js/team-state.js` — Saved team-result storage and activity helper
- `js/formation.js` — Formation workspace data and detailed-card renderer
- `js/phase2.js` — Activity, joined-hackathon, and participant skill helpers

The protected core files were not changed:

- `js/balancer.js`
- `js/app.js`
- `js/storage.js`
- `js/validation.js`
- `js/render.js`

New functionality wraps around the existing logic instead of replacing the balancing math.

## LocalStorage Data Model

Phase 1 uses these browser keys:

- `organizers`
- `participantAccounts`
- `loggedInOrganizerId`
- `loggedInParticipantId`
- `hackathons`
- `participants_<hackathonId>`
- `hackathonDetails`
- `teamResults`
- `activityLog`

This data is local to one browser origin and one device. For example, `file:///...`, `localhost`, and `127.0.0.1` have separate LocalStorage areas.

## How to Run

No installation or build step is required.

1. Open the cloned project in VS Code.
2. Start the Live Server extension from the project folder.
3. Open:

   ```text
   http://127.0.0.1:5500/hackathon-team-formation/pages/index.html
   ```

4. Use the same browser origin for every signup, login, and dashboard test.
5. Create one organizer account, one hackathon, and enough participants to satisfy the team-size rules.

## Recommended Demo Sequence

1. Open `pages/index.html`.
2. Create an organizer account.
3. Create a hackathon.
4. Log out.
5. Create a participant account.
6. Join the hackathon and select 2–4 skills.
7. Repeat with enough participants for the requested number of teams.
8. Log in as the organizer.
9. Open the hackathon dashboard.
10. Click the event arrow to inspect participants.
11. Click **Open formation workspace**.
12. Confirm the selected event details and participant roster.
13. Enter a valid team count and click **Generate Teams**.
14. Confirm team cards and the saved-results message.
15. Log in as a participant.
16. Confirm the status changes from waiting to assigned.
17. Show the participant's team, teammates, skills, and skill spread.
18. Demonstrate Copy Team List and Export CSV.

## Phase 1 Limitations

- Data is stored only in the current browser.
- Passwords are stored in LocalStorage for demonstration and are not production-secure.
- No real email is sent.
- Forgot-password updates the password locally after email verification.
- Invitations and email acceptance links are not implemented.
- No real-time synchronization exists across browsers or devices.
- Same-browser invitation simulation can be added, but real email requires a backend or email service.

## Future Phase 2

A future MERN version can add:

- Secure authentication and password hashing
- Shared database storage
- REST APIs
- Role-based access control
- Email verification and password reset
- Real invitations and acceptance links
- Cross-device access
- Notifications and real-time updates

## Project Status

**Phase 1 — Vanilla HTML, CSS, JavaScript, and LocalStorage**
>>>>>>> 6b4f9f17b4532a829c3165455312a8aa78e07513
