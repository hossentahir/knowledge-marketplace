# Teacher-Student

A role-based full-stack platform where students request topics from teachers, teachers accept/reject requests, and accepted requests open a chat conversation.

## Project Overview

- **Frontend:** React + Vite
- **Backend:** Express + Mongoose
- **Auth:** JWT (Bearer token)
- **Roles:** `student`, `teacher`
- **Core flow:** register/login -> teacher posts expertise -> student requests topic -> teacher accepts -> conversation is created -> participants exchange messages

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
- `/teacher/dashboard` – Protected teacher dashboard (create expertise + pending/history requests)
- `/search` – **Protected student-only** expertise search + “Request Topic”
- `/chat/:conversationId` – Protected chat page for student/teacher participants

### Teacher flow

1. Register as a **teacher** and log in.
2. Go to `/teacher/dashboard`.
3. Use the form to create expertise (title, description, price).

### Student flow

1. Register as a **student** and log in.
2. Open `/student/dashboard` to see available expertise.
3. Use `/search` (student-only) to search by topic.
4. Click **Request Topic** to send request to teacher.
5. After acceptance, open `/chat/:conversationId` to exchange messages.

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

| Endpoint                              | Method | Auth         | Description                                                                 |
|---------------------------------------|--------|--------------|-----------------------------------------------------------------------------|
| `/api/health`                         | GET    | Public       | Returns backend health message                                               |
| `/api/auth/register`                  | POST   | Public       | Register user (`name`, `email`, `password`, `role`)                         |
| `/api/auth/login`                     | POST   | Public       | Login and return JWT + user payload                                          |
| `/api/dashboard/student`              | GET    | Student JWT  | Example protected student route                                              |
| `/api/dashboard/teacher`              | GET    | Teacher JWT  | Example protected teacher route                                              |
| `/api/expertise`                      | POST   | Teacher JWT  | Create expertise (`title`, `description`, `price`)                          |
| `/api/expertise/search?query=`        | GET    | Student JWT  | Search expertise by title (student only)                                    |
| `/api/topic-requests`                 | POST   | Student JWT  | Create topic request for an `expertiseId`                                   |
| `/api/topic-request/teacher`          | GET    | Teacher JWT  | Get **pending** requests for logged-in teacher                              |
| `/api/topic-request/teacher/history`  | GET    | Teacher JWT  | Get accepted/rejected request history for logged-in teacher                 |
| `/api/topic-request/:id`              | PATCH  | Teacher JWT  | Accept/reject request; creates Conversation when accepted; returns `conversationId` |
| `/api/messages`                       | POST   | JWT          | Send message (`conversationId`, `text`) with sender from JWT                |
| `/api/messages/:conversationId`       | GET    | JWT          | Get all conversation messages sorted by `createdAt` (participants only)     |

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
   - Log in and open `/student/dashboard` to browse all expertise
   - Optionally use `/search` to filter by topic and click **“Request Topic”**

4. **Review requests as teacher**
   - In `/teacher/dashboard`, accept/reject pending requests.
   - Toggle **View history** to see processed requests.

5. **Chat after acceptance**
   - When a request is accepted, backend creates a `Conversation`.
   - Use returned `conversationId` from `PATCH /api/topic-request/:id`.
   - Open `/chat/:conversationId` and exchange messages.

## Troubleshooting (Why it may not work as expected)

- Restart backend after route/model changes: `cd server && npm start`
- Use the latest JWT (log out and log in again if role/token changed)
- `/search` is student-only now; teacher accounts will be redirected
- Chat requires a real `conversationId` from an **accepted** topic request
- If chat opens with no ID, route must be `/chat/<conversationId>`

