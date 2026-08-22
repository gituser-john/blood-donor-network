const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET patient by phone number (e.g., /api/patients/search?phone=1234567890)
router.get('/search', async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "Phone number query parameter is required" });
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', phone);

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Return the matched patient
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all patients
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new patient
router.post('/', async (req, res) => {
  const { name, phone, blood_group, hospital_name, district } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([{ name, phone, blood_group, hospital_name, district }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;