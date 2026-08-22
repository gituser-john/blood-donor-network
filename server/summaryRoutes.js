const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

router.get('/', async (req, res) => {
  try {
    // Calculate the cutoff date for 56 days ago (YYYY-MM-DD format)
    const cutoffDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Define queries (these return promises)
    const reqTotal = supabase.from('requests').select('*', { count: 'exact', head: true });
    
    const reqFulfilled = supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'fulfilled');
    
    const reqOpen = supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'open');
    
    const reqCancelled = supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'cancelled');
    
    const donTotal = supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'donated');
    
    const donBroadcasts = supabase.from('donations').select('*', { count: 'exact', head: true });
    
    const donResponded = supabase.from('donations').select('*', { count: 'exact', head: true }).in('status', ['responded', 'donated']);
    
    // Eligible: Not deleted, medically fit, and either never donated or last donated <= cutoffDate
    const eligibleDonors = supabase.from('donors')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false)
      .eq('medically_unfit', false)
      .or(`last_given.is.null,last_given.lte.${cutoffDate}`);

    // Execute all queries concurrently for maximum speed
    const results = await Promise.all([
      reqTotal, reqFulfilled, reqOpen, reqCancelled, 
      donTotal, donBroadcasts, donResponded, eligibleDonors
    ]);

    // Check if any of the queries threw a Supabase error
    const firstError = results.find(result => result.error);
    if (firstError) throw firstError.error;

    // Map results to the exact variables requested
    res.status(200).json({
      total_requests: results[0].count,
      fulfilled_requests: results[1].count,
      open_requests: results[2].count,
      cancelled_requests: results[3].count,
      total_donations: results[4].count,
      total_broadcasts: results[5].count,
      donors_responded: results[6].count,
      currently_eligible_donors: results[7].count
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;