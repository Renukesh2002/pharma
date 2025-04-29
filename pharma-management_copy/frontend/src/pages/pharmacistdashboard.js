import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/dashboard.css';

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [medicines, setMedicines] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [pharmacistInventory, setPharmacistInventory] = useState([]);

  useEffect(() => {
    fetchMedicines();
    fetchPharmacistInventory();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('http://localhost:5000/medicines');
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchPharmacistInventory = async () => {
    try {
      const res = await fetch('http://localhost:5000/pharmacist/inventory');
      const data = await res.json();
      setPharmacistInventory(data);
    } catch (err) {
      console.error('Error fetching pharmacist inventory:', err);
    }
  };

  const handleQuantityChange = (id, value) => {
    setQuantities(q => ({ ...q, [id]: value }));
  };

  const handleBuy = async () => {
    const purchases = medicines
      .map(med => {
        const qty = parseInt(quantities[med.id], 10);
        return qty > 0 ? { id: med.id, name: med.name, quantity: qty, price: med.price } : null;
      })
      .filter(x => x);

    if (purchases.length === 0) {
      alert('Please enter at least one valid quantity.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/pharmacist/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchases }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Purchase successful!');
        setPurchaseHistory(h => [
          ...h,
          { timestamp: new Date(), items: purchases }
        ]);
        setQuantities({});
        fetchMedicines();
        fetchPharmacistInventory();
      } else {
        setMessage(data.message || 'Purchase failed.');
      }
    } catch (err) {
      console.error('Error buying medicines:', err);
      setMessage('Server error. Please try again.');
    }
  };

  const handleGenerateInvoice = () => {
    const latest = purchaseHistory[purchaseHistory.length - 1];
    if (!latest) {
      alert('No purchases to invoice.');
      return;
    }
    const lines = latest.items.map(item =>
      `${item.name} x${item.quantity} @ ₹${item.price} = ₹${item.quantity * item.price}`
    );
    const total = latest.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    alert(`Invoice (${latest.timestamp.toLocaleString()}):\n\n${lines.join('\n')}\n\nTotal: ₹${total}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Pharmacist Panel</h2>
        <ul>
          <li onClick={() => setActiveTab('inventory')}>Inventory & Buy</li>
          <li onClick={() => setActiveTab('history')}>Purchase History</li>
          <li onClick={() => setActiveTab('pharmacistInventory')}>Pharmacist Inventory</li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'inventory' && (
          <>
            <h2>Medicine Inventory & Purchase</h2>
            {message && <p className="message">{message}</p>}
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Available</th>
                  <th>Price</th>
                  <th>Qty to Buy</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(med => (
                  <tr key={med.id}>
                    <td>{med.name}</td>
                    <td>{med.quantity}</td>
                    <td>₹{med.price}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={quantities[med.id] || ''}
                        onChange={e => handleQuantityChange(med.id, e.target.value)}
                        className="buy-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="inventory-actions">
              <button onClick={handleBuy} className="action-button">
                Buy Selected Medicines
              </button>
              <button onClick={handleGenerateInvoice} className="action-button">
                Generate Invoice
              </button>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <h2>Purchase History</h2>
            {!purchaseHistory.length && <p>No purchases yet.</p>}
            {purchaseHistory.map((entry, idx) => (
              <div key={idx} className="history-entry">
                <strong>{entry.timestamp.toLocaleString()}</strong>
                <ul>
                  {entry.items.map(item => (
                    <li key={item.id}>
                      {item.name} x{item.quantity} @ ₹{item.price} = ₹{item.quantity * item.price}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

{activeTab === 'pharmacistInventory' && (
  <>
    <h2>Pharmacist Inventory</h2>
    {!pharmacistInventory.length && <p>No medicines purchased yet.</p>}
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Purchased At</th>
        </tr>
      </thead>
      <tbody>
        {pharmacistInventory.map(item => (
          <tr key={item.InventoryID}>
            <td>{item.MedicineName}</td>
            <td>{item.Quantity}</td>
            <td>₹{item.Price.toFixed(2)}</td>
            <td>{new Date(item.PurchaseDate).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
      </div>
    </div>
  );
}
