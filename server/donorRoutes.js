const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET all active donors
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('deleted', false);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new donor
router.post('/', async (req, res) => {
  const { name, blood_group, phone, district } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('donors')
      .insert([{ name, blood_group, phone, district }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) a donor's details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, blood_group, phone, district, last_given, medically_unfit } = req.body;

  try {
    const { data, error } = await supabase
      .from('donors')
      .update({ name, blood_group, phone, district, last_given, medically_unfit })
      .eq('donor_id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: "Donor not found" });
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (soft delete) a donor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('donors')
      .update({ deleted: true })
      .eq('donor_id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: "Donor not found" });

    res.status(200).json({ message: "Donor deleted successfully", donor: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a donor's notifications (nested fetch via Supabase)
router.get('/:id/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        requests (
          blood_group,
          units_needed,
          district,
          patients (
            hospital_name
          )
        )
      `)
      .eq('donor_id', req.params.id)
      .eq('status', 'notified');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;