const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./supabaseClient');
const donorRoutes = require('./donorRoutes');
const patientRoutes = require('./patientRoutes');
const requestRoutes = require('./requestRoutes');
const donationRoutes = require('./donationRoutes');
const summaryRoutes = require('./summaryRoutes'); // <-- New import

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount Routes
app.use('/api/donors', donorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/summary', summaryRoutes); // <-- Mount new routes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});