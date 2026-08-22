const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET all requests, sorted by newest first
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new request
router.post('/', async (req, res) => {
  const { patient_id, blood_group, units_needed, district } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ 
        patient_id, 
        blood_group, 
        units_needed, 
        district, 
        status: 'open', 
        units_received: 0 
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH cancel a request
router.patch('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('requests')
      .update({ status: 'cancelled' })
      .eq('request_id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: "Request not found" });

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET eligible donors for a specific request
router.get('/:id/eligible-donors', async (req, res) => {
  try {
    // 1. Fetch the request to get blood_group and district
    const { data: request, error: reqError } = await supabase
      .from('requests')
      .select('blood_group, district')
      .eq('request_id', req.params.id)
      .single();

    if (reqError) throw reqError;

    // 2. Query basic eligible donors from DB
    const { data: donors, error: donorError } = await supabase
      .from('donors')
      .select('*')
      .eq('blood_group', request.blood_group)
      .eq('deleted', false)
      .eq('medically_unfit', false);

    if (donorError) throw donorError;

    // 3. Compute 56-day availability in memory
    const today = new Date();
    const availableDonors = donors.filter(donor => {
      if (!donor.last_given) return true; // Never donated before
      
      const lastGivenDate = new Date(donor.last_given);
      const diffTime = Math.abs(today - lastGivenDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 56;
    });

    // 4. Sort by matching district priority
    availableDonors.sort((a, b) => {
      const aMatches = a.district === request.district;
      const bMatches = b.district === request.district;
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0; // Keep relative order if both match or both don't match
    });

    res.status(200).json(availableDonors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST broadcast request to selected donors
router.post('/:id/broadcast', async (req, res) => {
  const { id } = req.params;
  const { donor_ids } = req.body;

  try {
    // Prepare bulk insert array
    const insertions = donor_ids.map(donor_id => ({
      request_id: id,
      donor_id,
      status: 'notified',
      units_donated: 0
    }));

    const { data, error } = await supabase
      .from('donations')
      .insert(insertions)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET donations (notified/responded) for a specific request
router.get('/:id/donations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        donation_id,
        status,
        donors ( donor_id, name, phone )
      `)
      .eq('request_id', req.params.id)
      .in('status', ['notified', 'responded']);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;