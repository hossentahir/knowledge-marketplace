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
4. Click "Fetch Health" to verify the API connection

## Testing

- **Database empty in Compass?** MongoDB creates databases when you first insert data. Register a user via the API first.
- **Quick test:** With the server running, run:
  ```bash
  cd server && node scripts/test-api.js
  ```
  This registers a test user and creates the database.

## API

| Endpoint               | Method | Description                                   |
|------------------------|--------|-----------------------------------------------|
| `/api/health`          | GET    | Returns `{ message: "Backend is running" }`    |
| `/api/auth/register`   | POST   | Register user (name, email, password, role)    |
| `/api/auth/login`      | POST   | Login, returns JWT token and user role         |

## What to Do Now

1. **Start the app**
   - Terminal 1: `cd server && npm start`
   - Terminal 2: `cd client && npm run dev`
   - Open http://localhost:5173

2. **Register**
   - Click "Register" in the app
   - Enter name, email, password
   - Choose role: Student or Teacher
   - Submit

3. **Login**
   - Enter your email and password
   - Click Login
   - JWT is saved in localStorage; you'll see a success message

4. **Next steps (ideas)**
   - Add protected routes that require the JWT
   - Add a logout button that clears localStorage
   - Build teacher-only features (e.g. create courses)
   - Build student-only features (e.g. view/enroll in courses)
   - Add a profile page that shows the logged-in user
