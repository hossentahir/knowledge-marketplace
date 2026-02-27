require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');

const app = express();
const PORT = 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`
    );
  });
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/expertise', require('./routes/expertise'));
app.use('/api/topic-requests', require('./routes/topicRequests'));
app.use('/api/topic-request', require('./routes/topicRequests'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
