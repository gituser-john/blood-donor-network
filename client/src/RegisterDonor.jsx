import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';

export default function RegisterDonor() {
  const [formData, setFormData] = useState({
    name: '',
    blood_group: 'A+',
    phone: '',
    district: ''
  });
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState(null);

  const fetchDonors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/donors`);
      setDonors(res.data);
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/donors`, formData);
      setMessage({ type: 'success', text: `Donor registered successfully! Assigned ID: ${res.data.donor_id}` });
      setFormData({ name: '', blood_group: 'A+', phone: '', district: '' }); 
      fetchDonors(); 
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setMessage({ type: 'error', text: `Failed to register: ${errorMsg}` });
    }
  };

  const toggleMedicallyUnfit = async (donor) => {
    try {
      await axios.put(`${API_URL}/api/donors/${donor.donor_id}`, {
        ...donor,
        medically_unfit: !donor.medically_unfit 
      });
      fetchDonors(); 
    } catch (error) {
      alert("Failed to update status: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Register as a Donor</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginBottom: '20px' }}>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        
        <select name="blood_group" value={formData.blood_group} onChange={handleChange} required>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        
        <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
        
        <button type="submit">Register</button>
      </form>

      {message && (
        <div style={{ color: message.type === 'success' ? 'green' : 'red', marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <h3>Active Donors List</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Blood Group</th>
            <th>District</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {donors.length === 0 ? (
            <tr><td colSpan="5">No donors found.</td></tr>
          ) : (
            donors.map((donor) => (
              <tr key={donor.donor_id}>
                <td>{donor.name}</td>
                <td>{donor.blood_group}</td>
                <td>{donor.district}</td>
                <td style={{ color: donor.medically_unfit ? 'red' : 'green' }}>
                  {donor.medically_unfit ? 'Unfit' : 'Fit'}
                </td>
                <td>
                  <button onClick={() => toggleMedicallyUnfit(donor)}>
                    {donor.medically_unfit ? 'Mark Fit' : 'Mark Medically Unfit'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}