# TeacherConnect

A role-based full-stack platform where teachers publish expertise, students request sessions, and both sides chat once a request is accepted.

## Project Overview

- **Frontend:** React 19 + Vite 7 + React Router 7
- **Backend:** Node.js + Express 5
- **Database:** MongoDB (Mongoose 9)
- **Auth:** JWT Bearer tokens (7-day expiry, bcrypt passwords)
- **Security:** Helmet middleware + role-based route guards

---

## Core User Flow

```
Teacher registers → posts expertise
Student registers → browses / searches expertise → sends topic request
Teacher accepts request → Conversation auto-created → both land in chat
Teacher / Student exchange messages in real-time chat UI
```

---

## Project Structure

```
teacher-student/
├── client/                        # React frontend (Vite, port 5173)
│   └── src/
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── StudentDashboard.jsx
│       │   ├── TeacherDashboard.jsx
│       │   ├── SearchPage.jsx
│       │   └── ChatPage.jsx
│       ├── App.jsx
│       └── App.css / index.css
│
└── server/                        # Express API (port 5000)
    ├── config/db.js
    ├── middleware/auth.js
    ├── models/
    │   ├── User.js
    │   ├── Expertise.js
    │   ├── TopicRequest.js
    │   ├── Conversation.js
    │   └── Message.js
    └── routes/
        ├── auth.js
        ├── dashboard.js
        ├── expertise.js
        ├── topicRequests.js
        ├── conversations.js
        └── messages.js
```

---

## Setup

### 1. MongoDB

**Option A — Atlas (recommended)**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com), create a free cluster
2. Add a DB user and whitelist your IP
3. Copy the connection string into `server/.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/teacher-student
   ```

**Option B — Local**
```
MONGO_URI=mongodb://localhost:27017/teacher-student
```

### 2. server/.env
```
MONGO_URI=...
JWT_SECRET=your-strong-secret-here
```

### 3. Start backend
```bash
cd server
npm install
npm start        # runs on http://localhost:5000
```

### 4. Start frontend
```bash
cd client
npm install
npm run dev      # runs on http://localhost:5173
```

---

## Frontend Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Sign in, redirects by role |
| `/register` | Public | Create student or teacher account |
| `/student/dashboard` | Student | Browse expertise + request history |
| `/teacher/dashboard` | Teacher | Post expertise + pending requests + history |
| `/search` | Student only | Search expertise by title |
| `/chat/:conversationId` | Participant | Messenger chat between student and teacher |

---

## Complete User Flows

### Teacher
1. Register as **teacher** and log in
2. `/teacher/dashboard` → fill in title, description, price → **Publish listing**
3. Pending student requests appear in the **Pending requests** section
4. Click **Accept** → conversation is created → **redirected to chat automatically**
5. Click **Decline** to reject (no conversation created)
6. Toggle **View history** to see past accepted/rejected requests and re-open chats

### Student
1. Register as **student** and log in
2. `/student/dashboard` → see available expertise, click **Request topic**
3. Track request status in **My requests** section (pending / accepted / rejected)
4. When request is accepted → **Open chat** button appears on the accepted card
5. Use `/search` to find expertise by keyword and request from there too

---

## API Reference

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/health` | — | Public | Health check |
| POST | `/api/auth/register` | — | Public | Register (`name`, `email`, `password`, `role`) |
| POST | `/api/auth/login` | — | Public | Login → returns JWT + user |
| GET | `/api/dashboard/student` | JWT | Student | Protected student stub |
| GET | `/api/dashboard/teacher` | JWT | Teacher | Protected teacher stub |
| POST | `/api/expertise` | JWT | Teacher | Create expertise listing |
| GET | `/api/expertise/search?query=` | JWT | Student | Search expertise by title |
| POST | `/api/topic-requests` | JWT | Student | Submit topic request |
| GET | `/api/topic-request/teacher` | JWT | Teacher | Get pending requests |
| GET | `/api/topic-request/teacher/history` | JWT | Teacher | Get accepted/rejected history + `conversationId` |
| GET | `/api/topic-request/student/history` | JWT | Student | Get all student requests + `conversationId` |
| PATCH | `/api/topic-request/:id` | JWT | Teacher | Accept/reject; creates Conversation on accept; returns `conversationId` |
| GET | `/api/conversations/:id` | JWT | Participant | Get conversation with participant names |
| POST | `/api/messages` | JWT | Participant | Send message (`conversationId`, `text`) |
| GET | `/api/messages/:conversationId` | JWT | Participant | Get messages sorted by `createdAt` |

---

## Models

| Model | Key fields |
|---|---|
| User | `name`, `email`, `password` (bcrypt), `role` (student/teacher) |
| Expertise | `teacher` (ref), `title`, `description`, `price` |
| TopicRequest | `student` (ref), `teacher` (ref), `expertise` (ref), `status` (pending/accepted/rejected) |
| Conversation | `topicRequest` (ref, unique), `student` (ref), `teacher` (ref) |
| Message | `conversation` (ref), `sender` (ref), `text`, `createdAt` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend not starting | Check `server/.env` has `MONGO_URI` and `JWT_SECRET` |
| `/search` redirects me away | Search is student-only; log in as a student |
| Accept button not navigating to chat | Restart server after latest changes |
| Chat shows "Conversation not found" | The `conversationId` in the URL must come from an accepted request |
| Student doesn't see "Open chat" | Refresh the student dashboard — history loads on mount |
| Messages not loading | Both users must be participants of that conversation |
