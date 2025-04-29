const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1) DB CONFIG
const dbConfig = {
  user: 'pharma_user',
  password: 'mypassword2002',
  server: 'localhost\\SQLEXPRESS',
  database: 'pharmacy',
  options: { encrypt: false, trustServerCertificate: true }
};

// 2) POOL PROMISE
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ DB Connection Failed:', err);
    process.exit(1);
  });

// 3) AUTH
app.post('/login/admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username & password required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('u', sql.NVarChar, username)
      .input('p', sql.NVarChar, password)
      .query('SELECT * FROM Admins WHERE Username=@u AND Password=@p');

    if (!result.recordset.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Admin login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login/pharmacist', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username & password required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('u', sql.NVarChar, username)
      .input('p', sql.NVarChar, password)
      .query('SELECT * FROM Pharmacists WHERE Username=@u AND Password=@p');

    if (!result.recordset.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Pharmacist login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4) LIST ALL MEDICINES
app.get('/medicines', async (_, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Medicines');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 5) ADD MEDICINE (ADMIN)
app.post('/admin/medicine/add', async (req, res) => {
  const { name, quantity, price } = req.body;
  if (!name || !quantity || !price)
    return res.status(400).json({ message: 'Name, quantity & price required' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('n', sql.NVarChar, name)
      .input('q', sql.Int, quantity)
      .input('p', sql.Decimal(10, 2), price)
      .query('INSERT INTO Medicines (Name, Quantity, Price) VALUES(@n, @q, @p)');
    res.json({ message: 'Medicine added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 6) DELETE MEDICINE (ADMIN)
app.delete('/admin/medicine/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Medicine ID is required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Medicines WHERE ID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error('🔥 Delete medicine error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 7) ADD PHARMACIST (ADMIN)
app.post('/admin/pharmacist/add', async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ message: 'Name, username & password required' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('n', sql.NVarChar, name)
      .input('u', sql.NVarChar, username)
      .input('p', sql.NVarChar, password)
      .query('INSERT INTO Pharmacists (Name, Username, Password) VALUES(@n, @u, @p)');
    res.json({ message: 'Pharmacist added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 8) BULK PURCHASE (PHARMACIST)
app.post('/pharmacist/buy', async (req, res) => {
  const purchases = req.body.purchases;
  if (!Array.isArray(purchases) || !purchases.length)
    return res.status(400).json({ message: 'Non-empty purchases required' });

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (let { id, quantity, name, price } of purchases) {
      // 1) Check stock
      const check = await new sql.Request(transaction)
        .input('mid', sql.Int, id)
        .query('SELECT Quantity FROM Medicines WHERE ID=@mid');
      const available = check.recordset[0]?.Quantity ?? 0;
      if (available < quantity) {
        throw new Error(`Insufficient stock for medicine ID ${id}`);
      }

      // 2) Deduct stock
      await new sql.Request(transaction)
        .input('mid', sql.Int, id)
        .input('q', sql.Int, quantity)
        .query('UPDATE Medicines SET Quantity = Quantity - @q WHERE ID = @mid');

      // 3) Log purchase
      await new sql.Request(transaction)
        .input('mname', sql.NVarChar, name)
        .input('q', sql.Int, quantity)
        .input('p', sql.Decimal(10, 2), price)
        .query(`
          INSERT INTO PharmacistInventory
            (MedicineName, Quantity, Price, PurchaseDate)
          VALUES
            (@mname, @q, @p, GETDATE())
        `);
    }

    await transaction.commit();
    res.json({ message: 'Purchase successful' });
  } catch (err) {
    await transaction.rollback();
    console.error('🔥 Bulk purchase error:', err);
    res.status(400).json({ message: err.message });
  }
});

// 9) FETCH PHARMACIST INVENTORY
app.get('/pharmacist/inventory', async (_, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        InventoryID,
        MedicineName,
        Quantity,
        Price,
        PurchaseDate
      FROM PharmacistInventory
      ORDER BY PurchaseDate DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('🔥 Fetch pharmacist inventory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 10) START SERVER
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
