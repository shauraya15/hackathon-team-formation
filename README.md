# Formfactor

Formfactor is a hackathon team-formation application. Organizers create
hackathons, participants register their skills, and the backend generates
balanced teams using each participant's primary skill.

The project is organized into two application folders:

```text
hackathon-team-formation/
├── frontend/
│   ├── index.html
│   ├── pages/
│   ├── js/
│   ├── styles/
│   └── screenshots/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   ├── auth.js
│   │   ├── models.js
│   │   └── routes.js
│   ├── tests/
│   └── docs/
└── README.md
```

## Technology

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js and Express
- Database: MongoDB Atlas with Mongoose
- Authentication: bearer tokens and role-based authorization
- Testing: Node test runner and Postman

## Run locally

From the `backend` folder:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm start
```

Set these values in `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<private-secret>
CLIENT_ORIGIN=http://localhost:3000
```

Never commit `backend/.env` or expose the MongoDB password.

Open the frontend through the backend server:

```text
http://localhost:3000/
```

The backend serves the files in `frontend/`, so the browser uses the same
origin as the API.

## MVC responsibilities

- Models: `backend/src/models.js` defines accounts, hackathons, participants,
  and team results.
- Views: `frontend/` contains the browser pages and presentation assets.
- Controllers/routes: `backend/src/routes.js` validates requests, applies
  authentication and role checks, reads/writes models, and returns API
  responses.
- Configuration: `backend/src/config/database.js` connects to MongoDB Atlas.

## API endpoints

```text
GET  /api/health
GET  /api/skills
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/hackathons
POST /api/hackathons
GET  /api/hackathons/:hackathonId
POST /api/hackathons/:hackathonId/participants
GET  /api/hackathons/:hackathonId/participants
POST /api/hackathons/:hackathonId/teams/generate
GET  /api/hackathons/:hackathonId/teams
GET  /api/hackathons/:hackathonId/analytics
```

## API testing

Postman files are in `backend/docs/`. Import the collection and environment,
select the `Formfactor Local` environment, and run requests in this order:

1. Health and skills
2. Organizer and participant signup/login
3. Create a hackathon
4. Register participants
5. List participants
6. Generate teams
7. Retrieve saved teams
8. View analytics

The frontend performs the same workflow through:

```text
Frontend → Express REST API → MongoDB Atlas
```

## Tests

From `backend`:

```powershell
npm test
```

The test suite checks the health endpoint, supported skills, and protected
authentication behavior without requiring a live database connection.

## Deployment checklist

This repository includes `backend/render.yaml` as a deployment reference.

1. In Render, create a **New Web Service** from this GitHub repository.
2. Set the service root directory to `backend`.
3. Use `npm install` as the build command and `npm start` as the start command.
4. Configure the secret `MONGODB_URI` with the MongoDB Atlas connection string.
5. Set `CLIENT_ORIGIN` to the deployed service URL.
6. Confirm the deployed `/api/health` endpoint.
7. Update the Postman environment `baseUrl` to
   `<deployed-service-url>/api` and run the collection again.
8. Confirm the frontend loads from the deployed backend and displays API data.
9. Keep this same GitHub repository containing both `frontend/` and `backend/`.

The frontend is served by the Express backend and uses same-origin `/api`
requests, so it does not need a separate frontend deployment for this project.
