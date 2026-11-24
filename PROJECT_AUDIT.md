# TeacherConnect – Complete Project Audit

> **Generated:** 2026-11-24  
> **Audit type:** Read-only — no source files were modified.  
> **Project root:** `knowledge-marketplace/`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Structure](#2-project-structure)
3. [Actual Technology Stack](#3-actual-technology-stack)
4. [Existing Feature Audit](#4-existing-feature-audit)
5. [Backend API Documentation](#5-backend-api-documentation)
6. [Database Documentation](#6-database-documentation)
7. [Frontend Documentation](#7-frontend-documentation)
8. [Real-Time System Audit](#8-real-time-system-audit)
9. [Run and Deployment Instructions](#9-run-and-deployment-instructions)
10. [Problems and Technical Debt](#10-problems-and-technical-debt)
11. [AI Quiz Generator Readiness](#11-ai-quiz-generator-readiness)
12. [Recommended Implementation Plan](#12-recommended-implementation-plan)

---

## 1. Executive Summary

### What TeacherConnect Does

TeacherConnect (internally called **Knowledge Marketplace**) is a two-sided platform connecting **students** and **teachers**. Its core value proposition:

1. Teachers post **expertise listings** (topic, description, price).
2. Students search and browse those listings, then send a **topic request** to a teacher.
3. The teacher accepts or rejects the request.
4. On acceptance a **conversation** is automatically created and both parties can chat in real time.
5. Presence (online/offline) of all users is broadcast via Socket.IO.

### Overall Project Status

| Dimension | Status |
|---|---|
| Core user flows (register → login → request → chat) | ✅ Fully implemented |
| Real-time chat | ⚠️ Partial — HTTP polling (no Socket.IO push for messages) |
| Password reset | ⚠️ Partial — token generated and logged to console; no email sent |
| Profile read | ✅ Implemented (read-only) |
| Profile update | ❌ Not implemented |
| AI / Quiz features | ❌ Not implemented; no models, routes, or UI exist |
| Automated tests | ❌ No test suite — only two manual dev scripts |
| Payment processing | ❌ Price field exists in DB but no payment logic |

### Current Architecture

```
Browser (React 19 + Vite 7)
        │  HTTPS / WSS
        ▼
Render  (Node.js / Express 5 + Socket.IO 4)
        │  mongoose 9
        ▼
MongoDB Atlas (cloud)
```

Both frontend (Vercel) and backend (Render) are deployed and running.

---

## 2. Project Structure

### Repository Layout

```
knowledge-marketplace/
├── client/                         # React frontend (Vite)
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite config (minimal — plugins: [react()])
│   ├── vercel.json                 # Vercel SPA rewrite rule
│   ├── .env                        # Local env vars (gitignored)
│   ├── .env.example                # Env template (committed)
│   ├── package.json
│   └── src/
│       ├── main.jsx                # React root; wraps App in BrowserRouter + SocketProvider
│       ├── App.jsx                 # Route definitions
│       ├── App.css                 # Global styles (design tokens, components)
│       ├── index.css               # CSS reset / base
│       ├── api.js                  # Centralized API_URL from VITE_API_URL env var
│       ├── socket.js               # socket.io-client singleton (autoConnect: false)
│       ├── context/
│       │   └── SocketContext.jsx   # Socket context: onlineUsers, isOnline(), connect/disconnect
│       └── components/
│           ├── Navbar.jsx          # Responsive nav; hidden on auth pages
│           ├── ProtectedRoute.jsx  # JWT + role-based route guard
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── ForgotPassword.jsx
│           ├── ResetPassword.jsx
│           ├── StudentDashboard.jsx
│           ├── TeacherDashboard.jsx
│           ├── SearchPage.jsx
│           └── ChatPage.jsx
│
├── server/                         # Express backend
│   ├── index.js                    # App entry: Express, Socket.IO, routes, DB start
│   ├── package.json
│   ├── .env                        # Secrets (gitignored)
│   ├── .env.example                # Env template (committed)
│   ├── config/
│   │   └── db.js                   # Mongoose connect; DNS override for Atlas SRV
│   ├── middleware/
│   │   └── auth.js                 # JWT verify (auth) + role check (authorize)
│   ├── models/
│   │   ├── User.js
│   │   ├── Expertise.js
│   │   ├── TopicRequest.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js                 # Register, login, forgot/reset password
│   │   ├── dashboard.js            # Stub — returns welcome message only
│   │   ├── expertise.js            # POST create, GET search
│   │   ├── topicRequests.js        # POST, GET teacher/student lists, PATCH accept/reject
│   │   ├── conversations.js        # GET single conversation by ID
│   │   ├── messages.js             # GET history, POST send
│   │   ├── profile.js              # GET user profile + expertise
│   │   └── users.js                # GET users filtered by role
│   ├── utils/
│   │   └── generateToken.js        # jwt.sign (7-day expiry)
│   └── scripts/
│       ├── test-api.js             # Manual dev script: health + register + login
│       └── test-expertise.js       # Manual dev script: teacher register + create expertise
│
├── README.md                       # Project README
└── PROJECT_AUDIT.md                # This file
```

### Key Entry Points

| Entry Point | Path | Purpose |
|---|---|---|
| Backend start | `server/index.js` | Connects DB, mounts routes, starts HTTP+WS server |
| Frontend start | `client/src/main.jsx` | Renders React app inside `BrowserRouter` + `SocketProvider` |
| Route definitions | `client/src/App.jsx` | Maps URL paths to page components |
| API base URL | `client/src/api.js` | Single source of truth for backend URL |

---

## 3. Actual Technology Stack

### Backend (`server/package.json`)

| Package | Version (declared) | Role |
|---|---|---|
| `express` | ^5.2.1 | HTTP framework |
| `mongoose` | ^9.1.6 | MongoDB ODM |
| `socket.io` | ^4.8.3 | WebSocket / real-time server |
| `jsonwebtoken` | ^9.0.3 | JWT sign/verify |
| `bcrypt` | ^6.0.0 | Password hashing |
| `cors` | ^2.8.6 | CORS middleware |
| `helmet` | ^8.1.0 | HTTP security headers |
| `dotenv` | ^17.2.4 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev server auto-restart (devDependency) |

> **Note:** Express 5 is in use (RC/stable as of v5.2.1). It differs from v4 in async error handling — unhandled promise rejections propagate automatically.

### Frontend (`client/package.json`)

| Package | Version (declared) | Role |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | DOM rendering |
| `react-router-dom` | ^7.13.0 | Client-side routing |
| `socket.io-client` | ^4.8.3 | WebSocket / real-time client |
| `vite` | ^7.2.4 | Dev server + build tool |
| `@vitejs/plugin-react` | ^5.1.1 | React JSX transform for Vite |
| `eslint` | ^9.39.1 | Linting |

### Infrastructure

| Component | Service |
|---|---|
| Backend hosting | Render (free tier) |
| Frontend hosting | Vercel |
| Database | MongoDB Atlas (cloud, free tier M0) |
| DNS resolver (server) | Google 8.8.8.8 / Cloudflare 1.1.1.1 (forced in `config/db.js`) |

### Styling

- Pure CSS — no CSS framework (Tailwind, Bootstrap, etc.)
- Design tokens via CSS custom properties in `App.css`
- Custom components: `.card`, `.btn`, `.form-control`, `.presence-dot`, `.chat-bubble`, `.navbar`, `.auth-card`, etc.
- Google Fonts: Inter (300–800 weights), loaded via `<link>` in `index.html`

---

## 4. Existing Feature Audit

### Authentication

#### ✅ Student / Teacher Registration — COMPLETE
- **Route:** `POST /api/auth/register`
- **File:** `server/routes/auth.js` lines 14–40
- **Validations:** name, email, password, role (all required); role must be `student` or `teacher`; duplicate email check
- **Password:** Hashed by `userSchema.pre('save')` hook using bcrypt with salt factor 10
- **Response:** Returns user object (no token — user must login after registration)
- **Frontend:** `client/src/components/Register.jsx` — form with name, email, password, role dropdown; redirects to `/login` on success

#### ✅ Student / Teacher Login — COMPLETE
- **Route:** `POST /api/auth/login`
- **File:** `server/routes/auth.js` lines 43–71
- **Validations:** email and password required; bcrypt compare
- **Response:** `{ token, role, user: { id, name, email, role } }`
- **Token:** JWT, signed with `JWT_SECRET`, 7-day expiry
- **Frontend:** `client/src/components/Login.jsx`; stores token + user in `localStorage`; connects socket immediately post-login; role-based redirect

#### ✅ Forgot Password — PARTIAL
- **Route:** `POST /api/auth/forgot-password`
- **File:** `server/routes/auth.js` lines 74–113
- **Implementation:** Generates a 32-byte `rawToken` via `crypto.randomBytes`; stores its SHA-256 hash in `user.resetPasswordToken`; sets 15-minute expiry. Returns 200 for both found and not-found emails (prevents enumeration).
- **Reset URL:** Logged to server console (Render logs). **No email is sent.** `resetUrl` is returned in the JSON response body in `development` mode only.
- **Frontend:** `client/src/components/ForgotPassword.jsx`; success message tells user to check server console
- **Limitation:** ⚠️ **No email delivery.** A production email service (SendGrid, Resend, Nodemailer) must be integrated for this to be usable by real users.

#### ✅ Reset Password — COMPLETE
- **Route:** `POST /api/auth/reset-password/:token`
- **File:** `server/routes/auth.js` lines 116–151
- **Implementation:** Hashes incoming token; looks up `resetPasswordToken` + checks `resetPasswordExpire > now`; updates password (pre-save hook re-hashes); clears reset fields
- **Validations:** password required, min 6 chars
- **Frontend:** `client/src/components/ResetPassword.jsx`; client-side confirm match check; redirect to login with `resetSuccess` state

#### ✅ JWT Middleware + Role-Based Authorization — COMPLETE
- **File:** `server/middleware/auth.js`
- **`auth` middleware:** Reads `Authorization: Bearer <token>` header; verifies with `JWT_SECRET`; attaches `req.user = { id, role }` to request
- **`authorize(role)` middleware:** Checks `req.user.role === role`; returns 403 if not
- **Fallback secret:** `'fallback-secret-change-in-production'` used if `JWT_SECRET` env var is absent (acceptable for local dev; production always has the env var set on Render)

#### ✅ Logout — COMPLETE
- **Implementation:** Client-side only — `localStorage.removeItem('token')` + `localStorage.removeItem('user')` + `socket.disconnect()`
- **File:** `client/src/components/Navbar.jsx` → `handleLogout()`
- **Note:** No server-side token invalidation. JWT remains valid until its 7-day expiry. This is a known and accepted limitation of stateless JWT auth.

---

### Dashboards

#### ✅ Student Dashboard — COMPLETE
- **File:** `client/src/components/StudentDashboard.jsx`
- **Sections:**
  1. **Teachers presence panel** — fetches all teachers via `GET /api/users?role=teacher`, sorts online-first
  2. **My requests** — fetches `GET /api/topic-request/student/history`; shows status badge and "Open chat" link for accepted requests
  3. **Available expertise** — fetches `GET /api/expertise/search?query=` (empty query = all)
- **Request topic:** Inline "Request topic" button → `POST /api/topic-request`

#### ✅ Teacher Dashboard — COMPLETE
- **File:** `client/src/components/TeacherDashboard.jsx`
- **Sections:**
  1. **Students presence panel** — fetches all students via `GET /api/users?role=student`
  2. **Post new expertise** — form → `POST /api/expertise`
  3. **Pending requests** — fetches `GET /api/topic-request/teacher`; Accept / Decline buttons
  4. **Request history** — toggled section, fetches `GET /api/topic-request/teacher/history`
- **Accept flow:** On accept → `PATCH /api/topic-request/:id` → server creates conversation → response includes `conversationId` → frontend redirects to `/chat/:conversationId`

---

### Profiles

#### ✅ Profile Read — COMPLETE (backend), ❌ NOT surfaced in UI
- **Route:** `GET /api/profile/:id`
- **File:** `server/routes/profile.js`
- **Implementation:** Returns user object (password excluded); if teacher, appends their `expertise` array
- **Frontend:** No profile page exists. `ProtectedRoute` does not include a `/profile/:id` route in `App.jsx`. This endpoint exists but is unreachable from the UI.

#### ❌ Profile Update — NOT IMPLEMENTED
- No `PATCH /api/profile/:id` route exists.
- No edit profile UI exists.

---

### Expertise

#### ✅ Create Expertise — COMPLETE
- **Route:** `POST /api/expertise` (teacher only)
- **File:** `server/routes/expertise.js` lines 7–27
- **Validations:** title, description, price required; auth + role guard
- **Frontend:** Form in `TeacherDashboard.jsx`

#### ❌ Edit / Delete Expertise — NOT IMPLEMENTED
- No `PATCH` or `DELETE /api/expertise/:id` route exists.
- No UI for editing or deleting an existing listing.

#### ✅ Expertise Search — COMPLETE
- **Route:** `GET /api/expertise/search?query=`
- **File:** `server/routes/expertise.js` lines 31–47
- **Implementation:** Case-insensitive regex on `title` field only; empty query returns all
- **Role restriction:** Students only (`authorize('student')`)
- **Frontend:** `client/src/components/SearchPage.jsx` (also called from `StudentDashboard` for the "Available expertise" section)

---

### Topic Requests

#### ✅ Submit Topic Request — COMPLETE
- **Route:** `POST /api/topic-requests` (also mounted at `/api/topic-request`)
- **File:** `server/routes/topicRequests.js` lines 28–55
- **Validations:** `expertiseId` required; expertise must exist; student role required
- **Frontend:** "Request topic" button in `SearchPage` and `StudentDashboard`

#### ✅ Accept / Reject Requests — COMPLETE
- **Route:** `PATCH /api/topic-request/:id`
- **File:** `server/routes/topicRequests.js` lines 112–161
- **Authorization:** Only the owning teacher can update (`findOneAndUpdate` with `teacher: req.user.id`)
- **Conversation auto-creation:** On `status === 'accepted'`, uses `findOneAndUpdate + upsert:true` to create (or return existing) Conversation — prevents duplicates
- **Response:** Includes `conversationId` so the frontend can navigate to chat immediately

#### ✅ Request History — COMPLETE
- **Teacher history route:** `GET /api/topic-request/teacher/history` (accepted + rejected)
- **Student history route:** `GET /api/topic-request/student/history` (all statuses)
- Both routes call the internal `attachConversationIds()` helper to include the linked `conversationId` in each result
- **Frontend:** Teacher history is a toggled section in `TeacherDashboard`; student history shown permanently in `StudentDashboard`

---

### Conversations

#### ✅ Automatic Conversation Creation — COMPLETE
- Created server-side when a teacher accepts a request (see above)
- Schema enforces `unique: true` on `topicRequest` field — one conversation per request

#### ✅ Conversation Retrieval — COMPLETE
- **Route:** `GET /api/conversations/:id`
- **File:** `server/routes/conversations.js`
- **Authorization:** Participant-only check (`student._id` or `teacher._id` matches `req.user.id`)
- **Frontend:** `ChatPage` fetches this on mount to display the other participant's name and email

---

### Real-Time Chat

#### ⚠️ Chat Messaging — PARTIAL (HTTP only; no Socket.IO push)
- **Send:** `POST /api/messages` (REST)
- **Receive:** `GET /api/messages/:conversationId` (REST, polled after each send)
- **Polling strategy:** `fetchMessages(true)` (silent) is called after every successful send — this is **not real-time**. If the other user sends a message, the current user does not see it without refreshing.
- **No Socket.IO events for messages** are implemented anywhere in the codebase. Socket.IO is used exclusively for presence (online/offline).
- **Frontend:** `client/src/components/ChatPage.jsx`

#### ✅ Online / Offline Presence — COMPLETE
- **Server:** In-memory `Map<userId, socketId>` maintained in `server/index.js`
- **Connect:** `user-online` event emitted by client after login (and on page refresh via `SocketContext`)
- **Disconnect:** Socket `disconnect` event removes user from map
- **Broadcast:** `io.emit('online-users', [...])` sent to all clients on every connect/disconnect
- **Client:** `SocketContext` stores `onlineUsers` array; `isOnline(userId)` helper used in all dashboards, search page, and navbar

---

### Other Discovered Features

#### ✅ Users List (by role) — COMPLETE
- **Route:** `GET /api/users?role=teacher|student`
- **File:** `server/routes/users.js`
- Used internally by dashboards to populate presence panels

#### ✅ Health Check — COMPLETE
- **Route:** `GET /api/health`
- Returns `{ status: 'ok', message: 'Backend is running' }`

#### ✅ Request Logging — COMPLETE
- Every HTTP request is logged: `[HTTP] METHOD /path STATUS - Nms`
- Implemented as inline middleware in `server/index.js` lines 60–67

---

## 5. Backend API Documentation

### Route Mount Points

The backend registers these route prefixes (note the dual mount for topic-requests):

```javascript
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/dashboard',      require('./routes/dashboard'));
app.use('/api/expertise',      require('./routes/expertise'));
app.use('/api/topic-requests', require('./routes/topicRequests'));
app.use('/api/topic-request',  require('./routes/topicRequests'));  // alias
app.use('/api/messages',       require('./routes/messages'));
app.use('/api/conversations',  require('./routes/conversations'));
app.use('/api/profile',        require('./routes/profile'));
app.use('/api/users',          require('./routes/users'));
```

> **Note:** Both `/api/topic-requests` and `/api/topic-request` point to the same router. The frontend uses `/api/topic-request` (singular).

### Complete Endpoint Table

| Method | Endpoint | Auth | Role | Purpose | Status |
|---|---|---|---|---|---|
| `GET` | `/api/health` | None | Any | Health check | ✅ |
| `POST` | `/api/auth/register` | None | Any | Register new user | ✅ |
| `POST` | `/api/auth/login` | None | Any | Login + get JWT | ✅ |
| `POST` | `/api/auth/forgot-password` | None | Any | Generate reset token | ⚠️ No email |
| `POST` | `/api/auth/reset-password/:token` | None | Any | Reset password with token | ✅ |
| `GET` | `/api/dashboard/student` | JWT | student | Stub — welcome message | ⚠️ Stub only |
| `GET` | `/api/dashboard/teacher` | JWT | teacher | Stub — welcome message | ⚠️ Stub only |
| `POST` | `/api/expertise` | JWT | teacher | Create expertise listing | ✅ |
| `GET` | `/api/expertise/search?query=` | JWT | student | Search expertise by title | ✅ |
| `POST` | `/api/topic-request` | JWT | student | Submit topic request | ✅ |
| `GET` | `/api/topic-request/teacher` | JWT | teacher | Get own pending requests | ✅ |
| `GET` | `/api/topic-request/teacher/history` | JWT | teacher | Get own processed history | ✅ |
| `GET` | `/api/topic-request/student/history` | JWT | student | Get own all requests | ✅ |
| `PATCH` | `/api/topic-request/:id` | JWT | teacher | Accept or reject request | ✅ |
| `GET` | `/api/messages/:conversationId` | JWT | participant | Get messages in conversation | ✅ |
| `POST` | `/api/messages` | JWT | participant | Send message | ✅ |
| `GET` | `/api/conversations/:id` | JWT | participant | Get single conversation | ✅ |
| `GET` | `/api/profile/:id` | JWT | any | Get user profile + expertise | ✅ |
| `GET` | `/api/users?role=` | JWT | any | Get users filtered by role | ✅ |

### Validation & Error Handling

- **Input validation:** Manual `if (!field)` checks; no validation library (e.g., Joi, Zod, express-validator)
- **Error responses:** Consistent `{ message: string }` JSON
- **HTTP status codes:** Correctly used (400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 internal)
- **Express 5 async:** Unhandled async errors propagate automatically; all handlers use `try/catch`
- **Authorization depth:** Participant-only checks in `/api/messages` and `/api/conversations` verified by comparing ObjectIds as strings

---

## 6. Database Documentation

### Models

#### `User`
**File:** `server/models/User.js`

| Field | Type | Required | Unique | Default | Notes |
|---|---|---|---|---|---|
| `name` | String | ✅ | — | — | Display name |
| `email` | String | ✅ | ✅ | — | Login identifier |
| `password` | String | ✅ | — | — | Stored as bcrypt hash |
| `role` | String (enum) | ✅ | — | — | `'student'` or `'teacher'` |
| `resetPasswordToken` | String | — | — | undefined | SHA-256 hash of raw reset token |
| `resetPasswordExpire` | Date | — | — | undefined | Expiry timestamp (15 min from creation) |
| `createdAt` | Date | — | — | auto | Mongoose timestamps |
| `updatedAt` | Date | — | — | auto | Mongoose timestamps |

**Hooks:** `pre('save')` — bcrypt hash of `password` when modified  
**Indexes:** `email` (unique index via schema definition)

---

#### `Expertise`
**File:** `server/models/Expertise.js`

| Field | Type | Required | Notes |
|---|---|---|---|
| `teacher` | ObjectId → User | ✅ | The teacher who posted this listing |
| `title` | String | ✅ | Used for regex search |
| `description` | String | ✅ | — |
| `price` | Number | ✅ | Stored as number; displayed as USD in UI |

**No timestamps.** No indexes beyond `_id`.

---

#### `TopicRequest`
**File:** `server/models/TopicRequest.js`

| Field | Type | Required | Notes |
|---|---|---|---|
| `student` | ObjectId → User | ✅ | The requesting student |
| `teacher` | ObjectId → User | ✅ | The teacher being requested |
| `expertise` | ObjectId → Expertise | ✅ | The specific listing |
| `status` | String (enum) | — | `'pending'` (default), `'accepted'`, `'rejected'` |

**No timestamps.** No unique compound index — a student can submit multiple requests for the same expertise (duplicates allowed at DB level).

---

#### `Conversation`
**File:** `server/models/Conversation.js`

| Field | Type | Required | Unique | Notes |
|---|---|---|---|---|
| `topicRequest` | ObjectId → TopicRequest | ✅ | ✅ | Enforces 1 conversation per request |
| `student` | ObjectId → User | ✅ | — | — |
| `teacher` | ObjectId → User | ✅ | — | — |

**No timestamps.** No message count or last-message cache.

---

#### `Message`
**File:** `server/models/Message.js`

| Field | Type | Required | Notes |
|---|---|---|---|
| `conversation` | ObjectId → Conversation | ✅ | — |
| `sender` | ObjectId → User | ✅ | — |
| `text` | String | ✅ | `trim: true` |
| `createdAt` | Date | — | Default `Date.now` (manual, not Mongoose timestamps) |

**Note:** No `updatedAt`. No `readBy` or delivery receipts. No indexes on `conversation` — queries will do collection scans on large datasets.

---

### Model Relationships

```
User (role=teacher) ──1──< Expertise
User (role=student) ──1──< TopicRequest >──1── Expertise
User (role=teacher) ──1──< TopicRequest
TopicRequest ──1──1── Conversation   (unique constraint)
Conversation ──1──< Message
User ──1──< Message (sender)
```

**Textual overview:**
- One teacher owns many Expertise listings.
- One student can send many TopicRequests (one per Expertise, though uniqueness is not enforced at DB level).
- Each TopicRequest links to exactly one Conversation (enforced by `unique: true`).
- Each Conversation contains many Messages.
- Each Message has exactly one sender (a User).

---

## 7. Frontend Documentation

### Routing

**File:** `client/src/App.jsx`

| Path | Component | Guard | Allowed Roles |
|---|---|---|---|
| `/login` | `Login` | None | Public |
| `/register` | `Register` | None | Public |
| `/forgot-password` | `ForgotPassword` | None | Public |
| `/reset-password/:token` | `ResetPassword` | None | Public |
| `/search` | `SearchPage` | ✅ JWT + role | student only |
| `/student/dashboard` | `StudentDashboard` | ✅ JWT | any authenticated |
| `/teacher/dashboard` | `TeacherDashboard` | ✅ JWT | any authenticated |
| `/chat/:conversationId` | `ChatPage` | ✅ JWT | any authenticated |
| `/` | Redirect | — | → `/login` |

> **Route guard nuance:** `/student/dashboard` and `/teacher/dashboard` use `<ProtectedRoute>` without `allowedRoles`, meaning any authenticated user (student or teacher) can access each other's dashboard URL if they know it. The UI renders correctly regardless because components fetch data using the JWT role, but the URLs are not role-restricted.

### State Management

- **No global state library** (no Redux, Zustand, Jotai, etc.)
- State is local `useState` per component
- Auth state: `localStorage` (`token` + `user` JSON)
- Socket/presence state: `SocketContext` (React Context)
- No state persistence beyond `localStorage`

### API Integration

- All API calls use the native `fetch` API (no Axios)
- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:5000'` from `src/api.js`
- Auth header: `Authorization: Bearer ${token}` added manually in every fetch call
- No centralized API client / interceptor — token retrieval repeated per component

### Components Detail

| Component | Lines | Key State | API Calls | Real-time |
|---|---|---|---|---|
| `Login` | 106 | email, password, loading, error | `POST /api/auth/login` | socket connect after login |
| `Register` | 111 | name, email, password, role, loading, error | `POST /api/auth/register` | — |
| `ForgotPassword` | 87 | email, loading, success, error | `POST /api/auth/forgot-password` | — |
| `ResetPassword` | 98 | password, confirm, loading, error | `POST /api/auth/reset-password/:token` | — |
| `Navbar` | 58 | reads localStorage | — | presence dot for self |
| `ProtectedRoute` | 19 | reads localStorage | — | — |
| `StudentDashboard` | 258 | expertise, myRequests, teachers, loading states | 3 GETs + POST | presence via context |
| `TeacherDashboard` | 331 | requests, history, students, form state | 4 GETs + POST + PATCH | presence via context |
| `SearchPage` | 142 | query, results, loading, error, successId | GET search + POST topic-request | teacher presence dot |
| `ChatPage` | 187 | conversation, messages, text, loading, sending | 2 GETs + POST | polling (no push) |

### Protected Route Implementation

**File:** `client/src/components/ProtectedRoute.jsx`

```jsx
// Checks localStorage for token (not validated against server)
// Optional allowedRoles check
// Redirects unauthenticated users to /login
// Redirects wrong-role users to their role's dashboard
```

> **Security note:** Token validation is client-side only (presence check). An expired or tampered token will pass the route guard but fail on the first API call. This is standard SPA behavior.

### Loading and Error States

- Loading: text strings ("Loading…", "Searching…", etc.) — no spinner/skeleton UI
- Errors: `<div className="alert alert-error">{error}</div>` shown inline
- Success: `<div className="alert alert-success">` shown inline
- Empty states: Custom empty state blocks with emoji icons

### Responsive Design

- CSS uses `var(--...)` custom properties for spacing, colors, radii
- No explicit media queries found in `App.css` or `index.css` (not audited in depth)
- Layout uses CSS flexbox and grid (`.grid`, `.presence-panel`)

---

## 8. Real-Time System Audit

### Architecture

```
Client (socket.io-client v4.8.3)
        │  WebSocket upgrade (HTTP long-poll fallback)
        ▼
Server  (socket.io v4.8.3)
        │  in-memory Map<userId, socketId>
        └── no database persistence
```

### Socket.IO Server (`server/index.js` lines 24–53)

```javascript
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] }
});

const onlineUsers = new Map(); // userId → socketId

io.on('connection', socket => {
  socket.on('user-online', userId => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
  socket.on('disconnect', () => {
    // removes user from map; broadcasts updated list
    io.emit('online-users', [...onlineUsers.keys()]);
  });
});
```

### Socket.IO Client (`client/src/socket.js`, `client/src/context/SocketContext.jsx`)

| Method | When Called | Effect |
|---|---|---|
| `socket.connect()` | On login or page refresh (if logged in) | Establishes WS connection |
| `socket.emit('user-online', userId)` | On login or page refresh | Registers presence on server |
| `socket.on('online-users', cb)` | On mount in `SocketContext` | Updates `onlineUsers` state |
| `socket.disconnect()` | On logout | Removes from server map; triggers `disconnect` event |

### Verified Behaviors

| Behavior | Status | Notes |
|---|---|---|
| Online status broadcasts to all clients | ✅ | `io.emit` (broadcast to everyone) |
| Presence survives page refresh | ✅ | `SocketContext` re-connects on mount if `localStorage` has token |
| Logout clears presence | ✅ | `socket.disconnect()` triggers server-side cleanup |
| Socket CORS configured | ✅ | Uses `FRONTEND_URL` env var |

### Known Issues and Limitations

| Issue | Impact | Severity |
|---|---|---|
| **No Socket.IO authentication** | Socket can be connected by anyone with a user ID string without a valid JWT | Medium |
| **In-memory presence only** — `Map` lost on server restart | Render free tier restarts frequently; presence resets with no reconnect retry | Medium |
| **Multiple tabs/devices** — only the most recent socket per userId is tracked | Logging in on a second device silently overwrites the first socket ID | Low |
| **No Socket.IO push for new chat messages** | ChatPage does not receive new messages from the other user in real time — requires manual refresh or new message sent | High |
| **No reconnect handling** — if WS connection drops, presence is lost | No `reconnect` event handler on the client | Medium |
| **Global broadcast** — `io.emit('online-users')` sends to ALL connected clients | Scales poorly; at large user counts this sends large payloads to everyone | Low (for FYP scale) |

---

## 9. Run and Deployment Instructions

### Local Development

**Prerequisites:** Node.js ≥18, MongoDB (local or Atlas)

#### Backend

```bash
cd server
cp .env.example .env     # fill in values
npm install
npm run dev              # nodemon auto-restart
# runs on http://localhost:5000
```

#### Frontend

```bash
cd client
cp .env.example .env     # fill in VITE_API_URL=http://localhost:5000
npm install
npm run dev
# runs on http://localhost:5173
```

### Required Environment Variables

#### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | ✅ in prod | JWT signing secret (min 32 chars recommended) |
| `PORT` | — | HTTP port (default: 5000) |
| `NODE_ENV` | — | `development` or `production` |
| `FRONTEND_URL` | — | Frontend origin for CORS (default: `http://localhost:5173`) |

#### Frontend (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ in prod | Backend base URL (e.g., `https://knowledge-marketplace.onrender.com`) |

> **Never commit `.env` files.** Both are in their respective `.gitignore` files.

### Build Commands

| Command | Directory | Output |
|---|---|---|
| `npm run build` | `client/` | `client/dist/` (static files for Vercel) |
| `npm start` | `server/` | Starts production server (`node index.js`) |

### Deployment Configuration

#### Vercel (Frontend)

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Env Var | `VITE_API_URL=https://knowledge-marketplace.onrender.com` |
| SPA routing | `vercel.json` rewrites all paths to `index.html` |

#### Render (Backend)

| Setting | Value |
|---|---|
| Runtime | Node.js |
| Start Command | `node index.js` (from `server/`) |
| Root Directory | `server` |
| Env Vars | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` |

### Developer Scripts

| Script | Location | Purpose |
|---|---|---|
| `node scripts/test-api.js` | `server/` | Tests health, register, login |
| `node scripts/test-expertise.js` | `server/` | Tests teacher register + create expertise |

---

## 10. Problems and Technical Debt

### ✅ Verified Issues (confirmed by code inspection)

#### Critical

| # | Issue | File | Impact |
|---|---|---|---|
| C1 | **No real-time message delivery** — ChatPage polls only on send | `ChatPage.jsx` | Other user's messages invisible until page refresh |
| C2 | **No email delivery for password reset** — URL logged to console only | `routes/auth.js:99-103` | Password reset unusable by real users |
| C3 | **No Socket.IO authentication** — `user-online` event accepts any userId string without JWT | `server/index.js:37` | Presence can be spoofed by any browser with DevTools |

#### High

| # | Issue | File | Impact |
|---|---|---|---|
| H1 | **Expertise search only by `title`** — description not searched | `routes/expertise.js:35` | Poor discoverability |
| H2 | **No pagination** — all expertise, requests, messages, users returned in one query | All GET routes | Performance degrades at scale |
| H3 | **No Message index on `conversation`** | `models/Message.js` | Collection scan on every message load |
| H4 | **Dashboard `/api/dashboard/student` and `/api/dashboard/teacher` are stubs** | `routes/dashboard.js` | Returns welcome string; no real data |
| H5 | **Duplicate topic requests allowed** — no compound unique index on (student, expertise) | `models/TopicRequest.js` | Student can spam request for same topic |
| H6 | **Profile page missing from frontend routing** | `App.jsx` | `GET /api/profile/:id` unreachable from UI |

#### Medium

| # | Issue | File | Impact |
|---|---|---|---|
| M1 | **JWT stored in `localStorage`** — XSS-accessible | `Login.jsx:32-33` | Standard SPA trade-off; acceptable for FYP |
| M2 | **No token refresh** — 7-day JWT with no refresh endpoint | `generateToken.js` | User silently logged out after 7 days |
| M3 | **No server-side logout / token blacklist** | — | Logged-out tokens valid for remainder of 7 days |
| M4 | **In-memory presence lost on server restart** | `server/index.js:32` | Render free tier restarts frequently |
| M5 | **Multiple device / tab presence** — last socket wins | `server/index.js:38` | First tab incorrectly shown as offline |
| M6 | **No expertise edit or delete** | `routes/expertise.js` | Teachers cannot correct or remove listings |
| M7 | **`/api/topic-request` and `/api/topic-requests` both mounted** — dual routing | `server/index.js:73-74` | Confusion; either prefix works |
| M8 | **Role-based route guard incomplete** — `/student/dashboard` accessible to teachers by URL | `App.jsx:26-30` | UI renders fine but guard logic inconsistent |
| M9 | **`topicRequests.js` reads `topicRequest.teacher` before populate** | `topicRequests.js:145` | Potential `undefined` if populate fails |
| M10 | **No loading skeleton** — only text "Loading…" | All dashboard components | Poor perceived performance |

#### Low

| # | Issue | File | Impact |
|---|---|---|---|
| L1 | **No automated tests** | — | Regressions undetected |
| L2 | **No input sanitization** (XSS in text fields) | All routes | Stored XSS risk if content rendered as HTML (currently rendered as JSX text — safe) |
| L3 | **Price validation absent** — negative prices accepted | `routes/expertise.js:17` | Data integrity |
| L4 | **`dns.setServers` global DNS override** may affect other network calls | `config/db.js:6` | Side effect in complex environments |
| L5 | **`scripts/test-api.js` hardcodes `localhost:5000`** | `scripts/test-api.js:14` | Scripts only work locally |
| L6 | **`Expertise` has no `timestamps`** | `models/Expertise.js` | Cannot sort by creation date |
| L7 | **`TopicRequest` has no `timestamps`** | `models/TopicRequest.js` | Cannot sort by creation date (sorts by `_id` as proxy) |

### ⚠️ Potential Risks (not confirmed as bugs, but worth attention)

| # | Risk | Notes |
|---|---|---|
| R1 | Render free tier cold starts (~30–60s) may cause Socket.IO connection timeouts | First connection after idle will be slow |
| R2 | MongoDB Atlas free tier (M0) limits: 512MB storage, shared compute | May throttle under load |
| R3 | Express 5 is used — some middleware and patterns differ from v4 | Error propagation behavior changed; ensure all async routes are tested |
| R4 | `bcrypt` v6 may have breaking API changes from v5 | Verify `bcrypt.compare` and `bcrypt.genSalt` signatures are compatible |

---

## 11. AI Quiz Generator Readiness

### Existing Relevant Infrastructure

| Component | Exists | Notes |
|---|---|---|
| Quiz / Question models | ❌ | No models exist |
| Learning / topic models | ✅ (partial) | `Expertise` model has `title` and `description` — topic data |
| Student learning history | ❌ | No model; `TopicRequest` with `accepted` status is the closest proxy |
| Quiz-related UI | ❌ | No pages or components |
| AI integrations | ❌ | No API keys, no AI SDK, no AI routes |
| Accepted conversations | ✅ | An accepted `TopicRequest → Conversation → Messages` chain exists and can provide chat context for quiz generation |

### Existing Patterns Suitable for AI Module

| Pattern | Where | Applicable for AI? |
|---|---|---|
| JWT auth middleware | `middleware/auth.js` | ✅ AI routes can reuse `auth` + `authorize` |
| Role-based authorization | `middleware/auth.js` | ✅ Teacher generates quiz, student takes quiz |
| Mongoose model pattern | `models/*.js` | ✅ New `Quiz`, `Question`, `QuizAttempt` follow same pattern |
| REST route pattern | `routes/*.js` | ✅ New `routes/quiz.js` integrates cleanly |
| `API_URL` centralized client | `client/src/api.js` | ✅ New quiz fetch calls use same `API_URL` |
| `ProtectedRoute` with roles | `ProtectedRoute.jsx` | ✅ `/quiz/*` routes can be gated |
| Conversation context | `Conversation` + `Message` | ✅ Chat history could seed AI prompts |

### Integration Approach

An AI Quiz Generator can be added as an **independent module** without modifying any existing code. It would:

1. **Backend:** New `routes/quiz.js` calling an external AI API (e.g., Google Gemini, OpenAI) to generate questions from a topic or conversation; new `Quiz`, `Question`, `QuizAttempt` Mongoose models.
2. **Frontend:** New pages (`/quiz/generate`, `/quiz/:id`, `/quiz/results/:id`) added to `App.jsx` router; existing `API_URL` and fetch pattern reused.
3. **Data context:** Teacher provides an Expertise topic title/description → AI generates questions → stored in DB → student takes quiz.

---

## 12. Recommended Implementation Plan

> **This section is a plan only. No code changes are made here.**

### Phase 0: Fix Critical Issues First (Prerequisite)

Before adding AI features, resolve:

- **C1 (Real-time messages):** Add `socket.on('new-message', ...)` event in `ChatPage`; emit from `POST /api/messages` handler using the conversation's socket room.
- **C3 (Socket auth):** Pass JWT in `auth` header on socket handshake; verify in `io.use()` middleware.
- **H5 (Duplicate requests):** Add compound unique index `{ student, expertise }` to `TopicRequest`.
- **H3 (Message index):** Add `{ conversation: 1, createdAt: 1 }` index to `Message` model.

---

### Phase 1: Database Changes

Add three new Mongoose models:

#### `Quiz`
```
{
  teacher:      ObjectId → User       (required)
  expertise:    ObjectId → Expertise  (optional — context)
  conversation: ObjectId → Conversation (optional — context)
  topic:        String                (required — prompt basis)
  status:       enum ['draft','active','closed']  default 'active'
  createdAt:    Date (timestamps)
}
```

#### `Question`
```
{
  quiz:          ObjectId → Quiz      (required)
  questionText:  String               (required)
  options:       [String]             (array of 4 choices)
  correctIndex:  Number               (0–3)
  explanation:   String               (AI-generated rationale)
  createdAt:     Date (timestamps)
}
```

#### `QuizAttempt`
```
{
  quiz:       ObjectId → Quiz    (required)
  student:    ObjectId → User    (required)
  answers:    [Number]           (selected option index per question)
  score:      Number             (computed on submit)
  completedAt: Date
  createdAt:  Date (timestamps)
}
```

---

### Phase 2: Backend API Routes (`server/routes/quiz.js`)

| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/quiz/generate` | JWT | teacher | Send topic to AI; create Quiz + Questions in DB |
| `GET` | `/api/quiz` | JWT | teacher | List own quizzes |
| `GET` | `/api/quiz/available` | JWT | student | List quizzes available to student |
| `GET` | `/api/quiz/:id` | JWT | any participant | Get quiz with questions |
| `POST` | `/api/quiz/:id/attempt` | JWT | student | Submit answers; compute + store score |
| `GET` | `/api/quiz/:id/results` | JWT | any participant | Get attempt results |

---

### Phase 3: AI Integration Approach

**Recommended:** Google Gemini API (consistent with the Google ecosystem of this project)

```
POST /api/quiz/generate
  Body: { topic, description, numQuestions: 5 }
  → Build prompt: "Generate {numQuestions} multiple-choice questions about {topic}..."
  → Call Gemini API (or OpenAI GPT-4o)
  → Parse JSON response: [{ question, options:[4], correctIndex, explanation }]
  → Save Quiz + Questions to MongoDB
  → Return { quizId, questions }
```

**Environment variable to add:**
```
GEMINI_API_KEY=...   # or OPENAI_API_KEY
```

**Error handling:** AI calls must have timeout, retry logic, and fallback error messages. Never expose API keys to the client.

---

### Phase 4: Frontend Pages/Components

Add to `client/src/App.jsx`:
```jsx
<Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
  <Route path="/quiz/generate" element={<GenerateQuiz />} />
  <Route path="/quiz/my" element={<MyQuizzes />} />
</Route>
<Route element={<ProtectedRoute allowedRoles={['student']} />}>
  <Route path="/quiz/available" element={<AvailableQuizzes />} />
  <Route path="/quiz/:id/take" element={<TakeQuiz />} />
  <Route path="/quiz/:id/results" element={<QuizResults />} />
</Route>
```

New components:
- `GenerateQuiz.jsx` — form: topic, description, number of questions → POST → redirect to quiz view
- `MyQuizzes.jsx` — teacher list of created quizzes with status
- `AvailableQuizzes.jsx` — student list; filter by their accepted expertise topics
- `TakeQuiz.jsx` — renders questions as radio buttons; submit answers
- `QuizResults.jsx` — score display, correct/incorrect per question, explanations
- Navbar: add "Quizzes" link for both roles

---

### Phase 5: Authorization and Validation

- Teacher can only generate quiz for their own expertise topics
- Student can only take quiz linked to an `accepted` TopicRequest they own
- Duplicate attempt prevention: one attempt per student per quiz
- AI response validation: parse and validate JSON structure before saving to DB
- Input validation: `numQuestions` must be 1–20; `topic` min 5 chars

---

### Phase 6: Error Handling

- AI API down → return 503 with user-friendly message; do not save partial quiz
- Invalid AI response → log raw response, return 500
- Quiz not found → 404
- Attempt already exists → 409 Conflict
- Student accesses quiz they have no right to → 403

---

### Phase 7: Regression Checks

Before merging AI feature:
- [ ] All existing routes still respond correctly (run `test-api.js`, `test-expertise.js`)
- [ ] Login, register, chat, topic request flows tested end-to-end
- [ ] Socket.IO presence unaffected by new routes
- [ ] `npm run build` succeeds in `client/`
- [ ] Render deployment redeploys successfully
- [ ] New environment variables documented in `.env.example`
- [ ] No `.env` files committed

---

*End of PROJECT_AUDIT.md*
