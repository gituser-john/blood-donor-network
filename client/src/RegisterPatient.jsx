import { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';

export default function RegisterPatient() {
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    blood_group: 'A+',
    hospital_name: '',
    district: ''
  });
  
  const [requestForm, setRequestForm] = useState({
    blood_group: '',
    units_needed: 1,
    district: ''
  });

  const [searchPhone, setSearchPhone] = useState('');
  const [searchMessage, setSearchMessage] = useState(null);

  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [message, setMessage] = useState(null);

  const handlePatientChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchMessage(null);
    setMessage(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/patients/search?phone=${searchPhone}`);
      const foundPatient = res.data;
      
      setRegisteredPatient(foundPatient);
      
      setRequestForm({
        blood_group: foundPatient.blood_group,
        units_needed: 1,
        district: foundPatient.district
      });
      
      setMessage({ type: 'success', text: `Welcome back, ${foundPatient.name}!` });
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchMessage("No record found, please register below.");
      } else {
        setSearchMessage("Search failed: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSearchMessage(null);
    
    try {
      const res = await axios.post(`${API_URL}/api/patients`, patientForm);
      const newPatient = res.data;
      
      setRegisteredPatient(newPatient);
      
      setRequestForm({
        blood_group: newPatient.blood_group,
        units_needed: 1,
        district: newPatient.district
      });
      
      setMessage({ type: 'success', text: `Patient registered successfully! Patient ID: ${newPatient.patient_id}` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to register patient: ${error.response?.data?.error || error.message}` });
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        patient_id: registeredPatient.patient_id,
        ...requestForm
      };
      const res = await axios.post(`${API_URL}/api/requests`, payload);
      setMessage({ type: 'success', text: `Blood request raised successfully! Request ID: ${res.data.request_id}` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to raise request: ${error.response?.data?.error || error.message}` });
    }
  };

  return (
    <div>
      <h2>Patient & Blood Request Portal</h2>
      
      {message && (
        <div style={{ color: message.type === 'success' ? 'green' : 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}>
          {message.text}
        </div>
      )}

      {!registeredPatient && (
        <div style={{ maxWidth: '300px' }}>
          
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #b8daff' }}>
            <h3 style={{ marginTop: 0 }}>Returning Patient?</h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="tel" 
                placeholder="Search by Phone" 
                value={searchPhone} 
                onChange={(e) => setSearchPhone(e.target.value)} 
                required 
                style={{ flex: 1 }}
              />
              <button type="submit">Find</button>
            </form>
            {searchMessage && <p style={{ color: '#d9534f', margin: '10px 0 0 0', fontSize: '0.9rem' }}>{searchMessage}</p>}
          </div>

          <hr style={{ margin: '20px 0' }} />

          <form onSubmit={handlePatientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ marginTop: 0 }}>1. New Patient Details</h3>
            <input type="text" name="name" placeholder="Patient Name" value={patientForm.name} onChange={handlePatientChange} required />
            <input type="tel" name="phone" placeholder="Phone Number" value={patientForm.phone} onChange={handlePatientChange} required />
            
            <select name="blood_group" value={patientForm.blood_group} onChange={handlePatientChange} required>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <input type="text" name="hospital_name" placeholder="Hospital Name" value={patientForm.hospital_name} onChange={handlePatientChange} required />
            <input type="text" name="district" placeholder="District" value={patientForm.district} onChange={handlePatientChange} required />
            
            <button type="submit">Register Patient</button>
          </form>

        </div>
      )}

      {registeredPatient && (
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', padding: '15px', backgroundColor: '#fdf5e6', border: '1px solid #faebd7' }}>
          <h3 style={{ marginTop: 0 }}>2. Raise Blood Request</h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555' }}>
            For: <strong>{registeredPatient.name}</strong> (ID: {registeredPatient.patient_id})
          </p>
          
          <label>
            Blood Group:
            <select name="blood_group" value={requestForm.blood_group} onChange={handleRequestChange} required style={{ width: '100%', marginTop: '5px' }}>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </label>

          <label>
            Units Needed:
            <input type="number" name="units_needed" min="1" value={requestForm.units_needed} onChange={handleRequestChange} required style={{ width: '100%', marginTop: '5px' }} />
          </label>

          <label>
            District:
            <input type="text" name="district" value={requestForm.district} onChange={handleRequestChange} required style={{ width: '100%', marginTop: '5px' }} />
          </label>
          
          <button type="submit" style={{ marginTop: '10px' }}>Raise Request</button>
        </form>
      )}
    </div>
  );
}