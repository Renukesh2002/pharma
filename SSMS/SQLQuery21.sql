-- 1. Create database
CREATE DATABASE pharmacy;
GO

-- 2. Create SQL Server login (pharma_user) with password
CREATE LOGIN pharma_user WITH PASSWORD = 'mypassword2002';
GO

-- 3. Use the pharmacy database
USE pharmacy;
GO

-- 4. Create user in this database and map to login
CREATE USER pharma_user FOR LOGIN pharma_user;
GO

-- 5. Grant permissions to pharma_user
ALTER ROLE db_owner ADD MEMBER pharma_user;
GO

-- 6. Create Admins table
CREATE TABLE Admins (
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(100) NOT NULL
);
GO

-- 7. Create Pharmacists table
CREATE TABLE Pharmacists (
    PharmacistID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(100) NOT NULL
);
GO

-- 8. Create Medicines table
CREATE TABLE Medicines (
    MedicineID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL
);
GO

CREATE TABLE dbo.PharmacistInventory (
    InventoryID    INT            IDENTITY(1,1) PRIMARY KEY,
    MedicineName   NVARCHAR(100)  NOT NULL,
    Quantity       INT            NOT NULL,
    Price          DECIMAL(10,2)  NOT NULL,
    PurchaseDate   DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

-- 9. Insert sample Admin user
INSERT INTO Admins (Username, Password)
VALUES ('admin1', 'adminpass123');
GO

-- 10. Insert sample Pharmacist user
INSERT INTO Pharmacists (Username, Password)
VALUES ('pharma1', 'pharmapass123');
GO

-- 11. Insert some sample Medicines
INSERT INTO Medicines (Name, Quantity, Price)
VALUES 
('Paracetamol', 100, 5.00),
('Ibuprofen', 50, 8.50),
('Amoxicillin', 200, 12.00),
('Cough Syrup', 80, 7.25);
GO

-- Done ✅
PRINT 'Database pharmacy setup completed!';
