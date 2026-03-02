require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const PORT = 5000;

// ── Socket.io ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// In-memory presence store: userId (string) → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket] connected   ${socket.id}`);

  socket.on('user-online', (userId) => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`[Socket] user-online ${userId} — total online: ${onlineUsers.size}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`[Socket] disconnected ${socket.id} — total online: ${onlineUsers.size}`);
  });
});

// ── Express middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/expertise',     require('./routes/expertise'));
app.use('/api/topic-requests',require('./routes/topicRequests'));
app.use('/api/topic-request', require('./routes/topicRequests'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/profile',       require('./routes/profile'));
app.use('/api/users',         require('./routes/users'));

app.get('/api/health', (_req, res) => res.json({ message: 'Backend is running' }));

// ── Start ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
