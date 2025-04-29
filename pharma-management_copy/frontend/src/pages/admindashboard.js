import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../style/dashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('addMedicine');
  const [sidebarOpen, setSidebarOpen] = useState(true); // State to toggle sidebar
  const [medicine, setMedicine] = useState({
    name: '',
    quantity: '',
    price: '',
    description: '',
  });
  const [pharmacist, setPharmacist] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [pharmacists, setPharmacists] = useState([]);
  const [editingQuantity, setEditingQuantity] = useState({});
  const navigate = useNavigate();

  const handleMedicineChange = (e) => {
    setMedicine({ ...medicine, [e.target.name]: e.target.value });
  };

  const handlePharmacistChange = (e) => {
    setPharmacist({ ...pharmacist, [e.target.name]: e.target.value });
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/admin/medicine/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Medicine added successfully!');
        setMedicine({ name: '', quantity: '', price: '', description: '' });
        fetchMedicines();
      } else {
        setMessage(data.message || 'Failed to add medicine.');
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('Server error. Please try again later.');
    }
  };

  const handlePharmacistSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/admin/pharmacist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pharmacist),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Pharmacist added successfully!');
        setPharmacist({ name: '', username: '', password: '' });
        fetchPharmacists();
      } else {
        setMessage(data.message || 'Failed to add pharmacist.');
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('Server error. Please try again later.');
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch('http://localhost:5000/medicines');
      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchPharmacists = async () => {
    try {
      const response = await fetch('http://localhost:5000/pharmacists');
      const data = await response.json();
      setPharmacists(data);
    } catch (err) {
      console.error('Error fetching pharmacists:', err);
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
  
    try {
      const res = await fetch(`http://localhost:5000/admin/medicine/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
  
      if (res.ok) {
        alert('Medicine deleted successfully!');
        fetchMedicines(); // refresh the list after deletion
      } else {
        alert(data.message || 'Failed to delete medicine');
      }
    } catch (err) {
      console.error('Error deleting medicine:', err);
      alert('Server error');
    }
  };  

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchMedicines();
    }
  }, [activeTab]);

  const toggleSidebar = () => setSidebarOpen((prevState) => !prevState);

  const updateQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/medicine/update-quantity/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        setEditingQuantity((prev) => ({ ...prev, [id]: false }));
        fetchMedicines();
      } else {
        alert(data.message || 'Failed to update quantity.');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Server error. Please try again later.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="hamburger" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <h2>Admin Panel</h2>
        <ul>
          <li onClick={() => setActiveTab('addMedicine')}> Add Medicine</li>
          <li onClick={() => setActiveTab('inventory')}> Medicine Inventory</li>
          <li onClick={() => setActiveTab('manageMedicine')}> Manage Medicine</li>
          <li onClick={() => setActiveTab('addPharmacist')}> Add Pharmacist</li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'addMedicine' && (
          <>
            <h2>Add Medicine</h2>
            <form onSubmit={handleMedicineSubmit} className="medicine-form">
              <input
                type="text"
                name="name"
                placeholder="Medicine Name"
                value={medicine.name}
                onChange={handleMedicineChange}
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={medicine.quantity}
                onChange={handleMedicineChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                step="0.01"
                value={medicine.price}
                onChange={handleMedicineChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={medicine.description}
                onChange={handleMedicineChange}
              ></textarea>

              <button type="submit">Add Medicine</button>
            </form>
            {message && <p className="message">{message}</p>}
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            <h2>Medicine Inventory</h2>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med.id}>
                    <td>{med.id}</td>
                    <td>{med.name}</td>
                    <td>{med.quantity}</td>
                    <td>₹{med.price}</td>
                    <td>{med.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'manageMedicine' && (
          <>
            <h2>Manage Medicine</h2>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med.id}>
                    <td>{med.id}</td>
                    <td>{med.name}</td>
                    <td>
                      <button onClick={() => deleteMedicine(med.id)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'addPharmacist' && (
          <>
            <h2>Add Pharmacist</h2>
            <form onSubmit={handlePharmacistSubmit} className="medicine-form">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={pharmacist.name}
                onChange={handlePharmacistChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={pharmacist.username}
                onChange={handlePharmacistChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={pharmacist.password}
                onChange={handlePharmacistChange}
                required
              />

              <button type="submit">Add Pharmacist</button>
            </form>
            {message && <p className="message">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
