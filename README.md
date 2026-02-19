# Teacher-Student

A minimal full-stack app with an Express.js backend and React frontend.

## Project Structure

```
├── server/     # Express.js API (port 5000)
└── client/     # Vite + React app
```

## Setup

### 1. MongoDB (choose one)

**Option A: MongoDB Atlas (recommended, no local install)**

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a free cluster
3. Database Access → Add User → create username/password
4. Network Access → Add IP → allow `0.0.0.0` (or your IP)
5. Connect → Drivers → copy the connection string
6. In `server/.env`, set:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/teacher-student
   ```
   Replace `<user>`, `<password>`, and the cluster URL with your values.

**Option B: Local MongoDB**

- Install [MongoDB Community](https://www.mongodb.com/try/download/community)
- Start MongoDB service
- Default `.env` uses `mongodb://localhost:27017/teacher-student`

### 2. Backend

```bash
cd server
npm install
# Copy .env.example to .env and set MONGO_URI
npm start
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

## Usage

1. Start the backend: `cd server && npm start`
2. Start the frontend: `cd client && npm run dev`
3. Open the dev URL (e.g. http://localhost:5173)

### Frontend routes

- `/login` – Login form (redirects to student/teacher dashboard based on role)
- `/register` – Register as student or teacher
- `/student/dashboard` – Protected student dashboard
- `/teacher/dashboard` – Protected teacher dashboard (create expertise)
- `/search` – Public expertise search + “Request Topic”

### Teacher flow

1. Register as a **teacher** and log in.
2. Go to `/teacher/dashboard`.
3. Use the form to create expertise (title, description, price).

### Student flow

1. Register as a **student** and log in.
2. Go to `/search`.
3. Search by topic title.
4. See expertise results with teacher name and price.
5. Click **“Request Topic”** to send a topic request to the teacher.

## Testing

- **Database empty in Compass?** MongoDB creates databases when you first insert data. Register a user or create expertise first.
- **Quick API smoke test:** With the server running, you can still use:
  ```bash
  cd server && node scripts/test-api.js
  ```
- **Test teacher expertise and topic requests:**
  ```bash
  cd server && node scripts/test-expertise.js
  ```

## API

| Endpoint                             | Method | Auth         | Description                                                       |
|--------------------------------------|--------|-------------|-------------------------------------------------------------------|
| `/api/health`                        | GET    | Public      | Returns `{ message: "Backend is running" }`                       |
| `/api/auth/register`                 | POST   | Public      | Register user (name, email, password, role: `student`/`teacher`)  |
| `/api/auth/login`                    | POST   | Public      | Login, returns JWT token, user info, and role                     |
| `/api/dashboard/student`             | GET    | Student JWT | Example protected student route                                   |
| `/api/dashboard/teacher`             | GET    | Teacher JWT | Example protected teacher route                                   |
| `/api/expertise`                     | POST   | Teacher JWT | Create expertise (title, description, price)                      |
| `/api/expertise/search?query=`       | GET    | Public      | Search expertise by title, populates teacher name & email         |
| `/api/topic-requests`                | POST   | Student JWT | Create topic request for a given `expertiseId`                    |
| `/api/topic-request/teacher`         | GET    | Teacher JWT | List topic requests for the logged-in teacher                     |
| `/api/topic-request/:id`             | PATCH  | Teacher JWT | Update topic request status (`accepted` / `rejected`)             |

## What to Do Now

1. **Start the app**
   - Terminal 1: `cd server && npm start`
   - Terminal 2: `cd client && npm run dev`
   - Open http://localhost:5173

2. **Create a teacher**
   - Go to `/register`
   - Register with role **Teacher**
   - Log in and open `/teacher/dashboard`
   - Create a few expertise items

3. **Create a student and request topics**
   - Register with role **Student**
   - Log in and open `/search`
   - Search for a topic and click **“Request Topic”**

4. **Review requests as teacher**
   - As the teacher, call `GET /api/topic-request/teacher` with your JWT (or add a UI later) to see pending topic requests.

