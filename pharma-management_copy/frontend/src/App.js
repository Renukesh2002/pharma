import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import AdminLogin from './pages/adminlogin';
import PharmacistLogin from './pages/pharmacistlogin';
import AdminDashboard from './pages/admindashboard';
import PharmacistDashboard from './pages/pharmacistdashboard';
import AddMedicine from './pages/addmedicine';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Homepage />} />
        
        {/* Admin Login Page */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Pharmacist Login Page */}
        <Route path="/pharmacist/login" element={<PharmacistLogin />} />
        
        {/* Admin Dashboard Page */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Pharmacist Dashboard Page */}
        <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
        
        {/* Add Medicine Page */}
        <Route path="/pharmacist/addmedicine" element={<AddMedicine />} />
      </Routes>
    </Router>
  );
}

export default App;
