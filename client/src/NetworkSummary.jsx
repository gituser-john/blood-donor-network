import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NetworkSummary() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/summary');
      setStats(res.data);
    } catch (err) {
      setError("Failed to load summary: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Simple inline styles for the MVP grid
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  
  const numberStyle = { 
    fontSize: '2.5rem', 
    fontWeight: 'bold', 
    margin: '10px 0', 
    color: '#333' 
  };
  
  const labelStyle = { 
    color: '#666', 
    fontSize: '1rem', 
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Network Dashboard</h2>
        <button 
          onClick={fetchStats} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={cardStyle}>
            <h3 style={numberStyle}>{stats.total_requests}</h3>
            <p style={labelStyle}>Total Requests</p>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{...numberStyle, color: '#d9534f'}}>{stats.open_requests}</h3>
            <p style={labelStyle}>Open Requests</p>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{...numberStyle, color: '#5cb85c'}}>{stats.fulfilled_requests}</h3>
            <p style={labelStyle}>Fulfilled Requests</p>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{...numberStyle, color: '#777'}}>{stats.cancelled_requests}</h3>
            <p style={labelStyle}>Cancelled</p>
          </div>

          <div style={cardStyle}>
            <h3 style={numberStyle}>{stats.total_broadcasts}</h3>
            <p style={labelStyle}>Broadcasts Sent</p>
          </div>

          <div style={cardStyle}>
            <h3 style={numberStyle}>{stats.donors_responded}</h3>
            <p style={labelStyle}>Donor Responses</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{...numberStyle, color: '#0275d8'}}>{stats.total_donations}</h3>
            <p style={labelStyle}>Total Donations</p>
          </div>

          <div style={{...cardStyle, borderColor: '#5cb85c', backgroundColor: '#f0fff0'}}>
            <h3 style={{...numberStyle, color: '#5cb85c'}}>{stats.currently_eligible_donors}</h3>
            <p style={labelStyle}>Eligible Donors</p>
          </div>
        </div>
      )}
    </div>
  );
}