import { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';

export default function DonorNotifications() {
  const [donorId, setDonorId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async (e) => {
    if (e) e.preventDefault();
    if (!donorId) return;
    
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/donors/${donorId}/notifications`);
      setNotifications(res.data);
      setHasSearched(true);
    } catch (err) {
      setError("Failed to load notifications: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRespond = async (donationId, status) => {
    try {
      await axios.patch(`${API_URL}/api/donations/${donationId}/respond`, { status });
      setNotifications(notifications.filter(n => n.donation_id !== donationId));
    } catch (err) {
      alert("Failed to respond: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h2>Check Donor Notifications</h2>
      
      <form onSubmit={fetchNotifications} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Enter your Donor ID" 
          value={donorId} 
          onChange={(e) => setDonorId(e.target.value)} 
          required 
        />
        <button type="submit">Check</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {hasSearched && notifications.length === 0 && !error && (
        <p>You have no pending notifications at this time.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notifications.map((notif) => {
          const reqDetails = notif.requests || {};
          const hospitalName = reqDetails.patients?.hospital_name || "Unknown Hospital";

          return (
            <div key={notif.donation_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#fff9e6' }}>
              <h3 style={{ marginTop: 0, color: '#d9534f' }}>🚨 You're Needed!</h3>
              <p>
                <strong>Blood Group:</strong> {reqDetails.blood_group} <br />
                <strong>Units Needed:</strong> {reqDetails.units_needed} <br />
                <strong>Location:</strong> {hospitalName}, {reqDetails.district}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => handleRespond(notif.donation_id, 'responded')}
                >
                  I Can Donate (Accept)
                </button>
                <button 
                  style={{ backgroundColor: 'gray', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => handleRespond(notif.donation_id, 'declined')}
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}