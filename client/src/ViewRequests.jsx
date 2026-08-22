import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ViewRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  
  // UI State for expandable rows
  const [activeAction, setActiveAction] = useState({ requestId: null, type: null }); // type: 'find' or 'record'
  
  // Find Donors State
  const [eligibleDonors, setEligibleDonors] = useState([]);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState(null);

  // Record Donation State
  const [activeDonations, setActiveDonations] = useState([]);
  const [donationForm, setDonationForm] = useState({ donation_id: '', units_donated: 1 });
  const [recordMsg, setRecordMsg] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/requests/${id}/cancel`);
      fetchRequests();
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.error || err.message));
    }
  };

  // --- Find & Broadcast Logic ---
  const handleFindDonors = async (id) => {
    setActiveAction({ requestId: id, type: 'find' });
    setBroadcastMsg(null);
    setSelectedDonors([]);
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/${id}/eligible-donors`);
      setEligibleDonors(res.data);
    } catch (err) {
      alert("Failed to fetch donors: " + err.message);
    }
  };

  const toggleDonorSelection = (donorId) => {
    setSelectedDonors(prev => 
      prev.includes(donorId) ? prev.filter(id => id !== donorId) : [...prev, donorId]
    );
  };

  const handleBroadcast = async (requestId) => {
    if (selectedDonors.length === 0) return alert("Select at least one donor.");
    try {
      await axios.post(`http://localhost:5000/api/requests/${requestId}/broadcast`, {
        donor_ids: selectedDonors
      });
      setBroadcastMsg(`Successfully notified ${selectedDonors.length} donors!`);
      setSelectedDonors([]);
    } catch (err) {
      alert("Broadcast failed: " + (err.response?.data?.error || err.message));
    }
  };

  // --- Record Donation Logic ---
  const handleOpenRecord = async (id) => {
    setActiveAction({ requestId: id, type: 'record' });
    setRecordMsg(null);
    setDonationForm({ donation_id: '', units_donated: 1 });
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/${id}/donations`);
      setActiveDonations(res.data);
    } catch (err) {
      alert("Failed to fetch active donations: " + err.message);
    }
  };

  const submitDonation = async (e) => {
    e.preventDefault();
    if (!donationForm.donation_id) return alert("Please select a donor.");
    
    try {
      await axios.patch(`http://localhost:5000/api/donations/${donationForm.donation_id}/donate`, {
        units_donated: parseInt(donationForm.units_donated)
      });
      setRecordMsg("Donation recorded successfully!");
      fetchRequests(); // Refresh main table to show updated units
    } catch (err) {
      alert("Failed to record: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h2>Active Blood Requests</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Blood Group</th>
            <th>Units (Rec/Need)</th>
            <th>District</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <React.Fragment key={req.request_id}>
              {/* Main Row */}
              <tr>
                <td>{req.request_id}</td>
                <td><strong>{req.blood_group}</strong></td>
                <td>{req.units_received} / {req.units_needed}</td>
                <td>{req.district}</td>
                <td style={{ color: req.status === 'open' ? 'green' : 'gray' }}>{req.status.toUpperCase()}</td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  {req.status === 'open' && (
                    <>
                      <button onClick={() => handleFindDonors(req.request_id)}>Find Donors</button>
                      <button onClick={() => handleOpenRecord(req.request_id)}>Record Donation</button>
                      <button onClick={() => handleCancel(req.request_id)}>Cancel</button>
                    </>
                  )}
                </td>
              </tr>

              {/* Expandable Section: Find Donors */}
              {activeAction.requestId === req.request_id && activeAction.type === 'find' && (
                <tr>
                  <td colSpan="6" style={{ backgroundColor: '#f9f9f9', padding: '15px' }}>
                    <h4>Eligible Donors for Request #{req.request_id}</h4>
                    {broadcastMsg && <p style={{ color: 'green' }}>{broadcastMsg}</p>}
                    
                    {eligibleDonors.length === 0 ? (
                      <p>No eligible donors found.</p>
                    ) : (
                      <>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {eligibleDonors.map(d => (
                            <li key={d.donor_id} style={{ marginBottom: '5px' }}>
                              <label>
                                <input 
                                  type="checkbox" 
                                  checked={selectedDonors.includes(d.donor_id)}
                                  onChange={() => toggleDonorSelection(d.donor_id)}
                                />
                                {d.name} ({d.blood_group}) - {d.district} - {d.phone}
                              </label>
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleBroadcast(req.request_id)}>
                          Broadcast to Selected ({selectedDonors.length})
                        </button>
                      </>
                    )}
                    <br/><br/>
                    <button onClick={() => setActiveAction({ requestId: null, type: null })}>Close</button>
                  </td>
                </tr>
              )}

              {/* Expandable Section: Record Donation */}
              {activeAction.requestId === req.request_id && activeAction.type === 'record' && (
                <tr>
                  <td colSpan="6" style={{ backgroundColor: '#f0f8ff', padding: '15px' }}>
                    <h4>Record Donation for Request #{req.request_id}</h4>
                    {recordMsg && <p style={{ color: 'green' }}>{recordMsg}</p>}
                    
                    {activeDonations.length === 0 ? (
                      <p>No donors have been notified or responded yet. Broadcast first.</p>
                    ) : (
                      <form onSubmit={submitDonation} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select 
                          required
                          value={donationForm.donation_id} 
                          onChange={(e) => setDonationForm({...donationForm, donation_id: e.target.value})}
                        >
                          <option value="">-- Select Donor --</option>
                          {activeDonations.map(d => (
                            <option key={d.donation_id} value={d.donation_id}>
                              {d.donors?.name} (Status: {d.status})
                            </option>
                          ))}
                        </select>

                        <input 
                          type="number" 
                          min="1" 
                          placeholder="Units" 
                          value={donationForm.units_donated}
                          onChange={(e) => setDonationForm({...donationForm, units_donated: e.target.value})}
                          required
                          style={{ width: '60px' }}
                        />
                        <button type="submit">Confirm Donation</button>
                      </form>
                    )}
                    <br/>
                    <button onClick={() => setActiveAction({ requestId: null, type: null })}>Close</button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}