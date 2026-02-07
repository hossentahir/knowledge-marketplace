require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

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
