import React, { useState } from 'react';

function AddMedicine() {
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    alert(`Medicine ${medicineName} with quantity ${quantity} added!`);
    // You can extend this to call an API
  };

  return (
    <div>
      <h2>Add Medicine</h2>
      <form onSubmit={handleAdd}>
        <input type="text" placeholder="Medicine Name" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} /><br />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} /><br />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddMedicine;
