import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterDonor from './RegisterDonor';
import RegisterPatient from './RegisterPatient';
import ViewRequests from './ViewRequests';
import DonorNotifications from './DonorNotifications';
import NetworkSummary from './NetworkSummary'; // New Import

const Home = () => (
  <div style={{ textAlign: 'center', marginTop: '40px' }}>
    <h2>Welcome to the Blood Donor Network</h2>
    <p>Select an action from the navigation menu above to get started.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* Global Navigation Bar */}
        <header style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>
          <h1 style={{ marginTop: 0, color: '#d9534f' }}>🩸 Blood Network</h1>
          <nav>
            <ul style={{ 
              display: 'flex', 
              gap: '15px', 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              flexWrap: 'wrap' 
            }}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/register-donor">Register Donor</Link></li>
              <li><Link to="/register-patient">Register Patient & Request</Link></li>
              <li><Link to="/requests">Manage Requests</Link></li>
              <li><Link to="/donor-notifications">Donor Notifications</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </nav>
        </header>

        {/* Route Content Area */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-donor" element={<RegisterDonor />} />
            <Route path="/register-patient" element={<RegisterPatient />} />
            <Route path="/requests" element={<ViewRequests />} />
            <Route path="/donor-notifications" element={<DonorNotifications />} />
            <Route path="/dashboard" element={<NetworkSummary />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;