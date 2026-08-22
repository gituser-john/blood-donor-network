const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// PATCH donor responds to notification
router.patch('/:id/respond', async (req, res) => {
  const { status } = req.body; // 'responded' or 'declined'
  
  try {
    const { data, error } = await supabase
      .from('donations')
      .update({ status })
      .eq('donation_id', req.params.id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: "Donation record not found" });

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH complete the donation (Sequential updates)
router.patch('/:id/donate', async (req, res) => {
  const { units_donated } = req.body;

  try {
    // 1. Mark the donation record as complete
    const { data: donation, error: donErr } = await supabase
      .from('donations')
      .update({ status: 'donated', units_donated })
      .eq('donation_id', req.params.id)
      .select()
      .single();

    if (donErr) throw donErr;

    // 2. Update the donor's `last_given` date to today
    const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const { error: donorErr } = await supabase
      .from('donors')
      .update({ last_given: todayStr })
      .eq('donor_id', donation.donor_id);

    if (donorErr) throw donorErr;

    // 3. Fetch the linked request to calculate new totals
    const { data: request, error: reqFetchErr } = await supabase
      .from('requests')
      .select('units_needed, units_received')
      .eq('request_id', donation.request_id)
      .single();

    if (reqFetchErr) throw reqFetchErr;

    // 4. Compute new totals and auto-close if target is met
    const new_received = request.units_received + units_donated;
    const new_status = new_received >= request.units_needed ? 'fulfilled' : 'open';

    const { data: updatedRequest, error: reqUpdateErr } = await supabase
      .from('requests')
      .update({ units_received: new_received, status: new_status })
      .eq('request_id', donation.request_id)
      .select()
      .single();

    if (reqUpdateErr) throw reqUpdateErr;

    // Return the final state of both entities
    res.status(200).json({ 
      donation, 
      request: updatedRequest 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;