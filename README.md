# Formfactor

Formfactor is a hackathon team-formation application that helps organizers create hackathons, register participants, and generate balanced teams based on participant skills.

## Features

- Organizer signup and login
- Participant signup and login
- Hackathon creation and management
- Participant registration
- Skill-based team generation
- Team results and analytics
- REST API built with Express
- MongoDB Atlas database integration
- Bearer-token authentication
- Role-based authorization
- Postman API collection
- Automated backend tests
- Render deployment configuration

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Bearer Tokens, Role-Based Authorization |
| Testing | Node.js Test Runner, Postman |
| Deployment | Render |

## Project Structure

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
│   ├── docs/
│   ├── .env.example
│   └── render.yaml
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- MongoDB Atlas account and database
- Git

Verify your Node.js and npm versions:

```powershell
node --version
npm --version
```

## Running the Application Locally

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd hackathon-team-formation
```

### 2. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env` with your configuration:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-private-secret>
CLIENT_ORIGIN=http://localhost:3000
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port used by the Express server | `3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Private secret used to sign authentication tokens | A long random secret |
| `CLIENT_ORIGIN` | Allowed client origin for CORS | `http://localhost:3000` |

**Important:** Never commit `backend/.env` or expose your MongoDB credentials and JWT secret.

### 4. Start the Server

```powershell
npm start
```

For development with automatic server restarts:

```powershell
npm run dev
```

The application will be available at:

```text
http://localhost:3000/
```

The Express backend serves the frontend files and API from the same origin.

## Application Workflow

### Organizer Workflow

1. Create an organizer account.
2. Log in as an organizer.
3. Create a hackathon.
4. Add or manage hackathon details.
5. View registered participants.
6. Generate teams based on participant skills.
7. View generated teams and analytics.

### Participant Workflow

1. Create a participant account.
2. Log in as a participant.
3. Join an available hackathon.
4. Provide the required profile and skill information.
5. View participation and team results.

## Data Storage

The backend stores accounts, hackathons, participants, and generated team results in MongoDB through Mongoose.

Some frontend interface state, including session and dashboard-related information, may also be stored in the browser's `localStorage`. Clearing browser storage can remove that local frontend state.

## Architecture

```text
                 Browser
                    |
                    v
              Express Server
               /          \
              v            v
       Frontend Files   REST API
                            |
                            v
                       MongoDB Atlas
```

### MVC Responsibilities

- **Models:** `backend/src/models.js` defines accounts, hackathons, participants, and team results.
- **Views:** `frontend/` contains browser pages and presentation assets.
- **Routes and Controllers:** `backend/src/routes.js` validates requests, applies authentication and authorization, reads and writes models, and returns API responses.
- **Authentication:** `backend/src/auth.js` handles bearer-token authentication and role checks.
- **Configuration:** `backend/src/config/database.js` connects to MongoDB Atlas.
- **Server Entry Point:** `backend/server.js` configures Express, serves the frontend, and starts the API.

## API Endpoints

All API endpoints use the `/api` prefix.

| Method | Endpoint | Authentication |
|---|---|---|
| `GET` | `/api/health` | Not required |
| `GET` | `/api/skills` | Not required |
| `POST` | `/api/auth/signup` | Not required |
| `POST` | `/api/auth/login` | Not required |
| `GET` | `/api/auth/me` | Bearer token |
| `GET` | `/api/hackathons` | Bearer token |
| `POST` | `/api/hackathons` | Organizer |
| `GET` | `/api/hackathons/:hackathonId` | Bearer token |
| `POST` | `/api/hackathons/:hackathonId/participants` | Participant |
| `GET` | `/api/hackathons/:hackathonId/participants` | Organizer |
| `POST` | `/api/hackathons/:hackathonId/teams/generate` | Organizer |
| `GET` | `/api/hackathons/:hackathonId/teams` | Bearer token |
| `GET` | `/api/hackathons/:hackathonId/analytics` | Organizer |

### Authentication Header

Protected requests should include:

```http
Authorization: Bearer <token>
```

### Health Check

```http
GET http://localhost:3000/api/health
```

Example response:

```json
{
  "status": "ok"
}
```

### Signup Example

```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
```

Request body:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "secure-password",
  "role": "participant"
}
```

### Login Example

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

The login response provides a bearer token for protected API requests.

## API Testing

API testing resources are available in:

```text
backend/docs/
```

Available files include:

- `formfactor-phase2.http`
- `formfactor-phase2.postman_collection.json`
- `formfactor-health.postman_collection.json`
- `formfactor-local.postman_environment.json`
- `formfactor-phase2.thunder-collection.json`

### Recommended Request Order

1. Check the health endpoint.
2. Retrieve supported skills.
3. Create an organizer account.
4. Log in as the organizer.
5. Create a hackathon.
6. Create a participant account.
7. Log in as the participant.
8. Register the participant for the hackathon.
9. List participants.
10. Generate teams as the organizer.
11. Retrieve the generated teams.
12. View analytics.

### Postman Setup

1. Import the collection from `backend/docs/`.
2. Import the `Formfactor Local` environment.
3. Select the imported environment.
4. Set `baseUrl` to:

```text
http://localhost:3000/api
```

5. Run the requests in the recommended order.

## Running Tests

From the `backend` directory:

```powershell
npm test
```

The test suite checks:

- API health status
- Supported skill categories
- Protected API routes without authentication

The tests do not require a live MongoDB connection for the covered cases.

## Deployment to Render

The repository includes a Render configuration in:

```text
backend/render.yaml
```

### Deployment Steps

1. Create a new Web Service in Render.
2. Connect the GitHub repository.
3. Set the root directory to:

```text
backend
```

4. Use the following build command:

```text
npm install
```

5. Use the following start command:

```text
npm start
```

6. Configure the following environment variables in Render:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure private secret |
| `CLIENT_ORIGIN` | The deployed application URL |

7. Configure the health check path:

```text
/api/health
```

8. Deploy the service.
9. Confirm that the health endpoint responds successfully.
10. Update the Postman environment with the deployed API URL.
11. Confirm that the frontend loads and displays application data.

The frontend is served by the Express backend, so a separate frontend deployment is not required.

## Troubleshooting

### MongoDB Connection Failure

Check that:

- `MONGODB_URI` is correct.
- Your MongoDB Atlas cluster is running.
- Your IP address is allowed in MongoDB Atlas network access.
- The database username and password are correct.
- Special characters in the password are URL-encoded.

### Missing JWT Secret

Make sure `JWT_SECRET` is present in `backend/.env`:

```env
JWT_SECRET=<long-random-private-secret>
```

Restart the server after changing environment variables.

### Port Already in Use

Change the port in `backend/.env`:

```env
PORT=3001
```

Then open:

```text
http://localhost:3001/
```

### Frontend Does Not Load

Confirm that:

- The server is running from the `backend` directory.
- You opened the application through the Express server.
- You are using `http://localhost:3000/` rather than opening an HTML file directly.
- The frontend files are present in the repository.

### CORS Errors

Check that `CLIENT_ORIGIN` matches the URL used by the browser:

```env
CLIENT_ORIGIN=http://localhost:3000
```

For Render, use the deployed service URL instead.

## Security Notes

- Never commit `.env` files.
- Never commit MongoDB passwords or JWT secrets.
- Use a strong, randomly generated `JWT_SECRET`.
- Restrict MongoDB Atlas network access appropriately.
- Do not use production credentials during local testing.
- Rotate credentials immediately if they are accidentally exposed.

## Contributing

1. Create a feature branch:

```powershell
git checkout -b docs/update-readme
```

2. Make the required changes.

3. Run the test suite:

```powershell
cd backend
npm test
```

4. Review the changes:

```powershell
git diff
```

5. Commit the changes:

```powershell
git add README.md
git commit -m "docs: improve README setup and usage documentation"
```

6. Push the branch:

```powershell
git push origin docs/update-readme
```

7. Open a pull request.

Pull requests should include:

- A clear description of the documentation changes.
- Any commands that were tested.
- Screenshots when changing documented UI workflows.
- Confirmation that no secrets were added.

## License

Add the project's license information here if a license has been selected.