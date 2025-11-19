const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load .env first
dotenv.config();

// Initialize Express App
const app = express();

// DB Connection
const connectDB = require('./config/db');
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));  // GPS
app.use('/api/chat', require('./routes/chatbotRoutes'));        // Chatbot route

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Default route
app.get('/', (req, res) => {
  res.send('HealthSync Backend Running ✅');
});

// Error handler (keep last)
app.use(require('./middleware/errorHandler'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
