import React from 'react';
import { Link } from 'react-router-dom';
import '../style/homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      <div className="container">
        <h1 className="title">Pharmacy Management System</h1>
        <p className="subtitle">Manage Pharmacy Operations with Ease</p>
        <div className="buttons">
          <Link to="/admin/login" className="btn admin-btn">Admin Login</Link>
          <Link to="/pharmacist/login" className="btn pharmacist-btn">Pharmacist Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
