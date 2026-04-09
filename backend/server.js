const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- DATABASE ----------------
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER,
      product_name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )
  `);
});

// ---------------- PART A: SEARCH ----------------
const sampleData = [
  { id: 1, productName: "Chair", category: "Furniture", price: 100 },
  { id: 2, productName: "Table", category: "Furniture", price: 200 },
  { id: 3, productName: "Laptop", category: "Electronics", price: 500 },
  { id: 4, productName: "Mouse", category: "Electronics", price: 20 },
  { id: 5, productName: "Keyboard", category: "Electronics", price: 50 },
];

app.get("/search", (req, res) => {
  let { q, category, minPrice, maxPrice } = req.query;

  let filtered = [...sampleData];

  if (q) {
    filtered = filtered.filter((item) =>
      item.productName.toLowerCase().includes(q.toLowerCase()),
    );
  }

  if (category) {
    filtered = filtered.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    return res.status(400).json({ message: "Invalid price range" });
  }

  if (minPrice) {
    filtered = filtered.filter((item) => item.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((item) => item.price <= Number(maxPrice));
  }

  res.json(filtered);
});

// ---------------- PART B: APIs ----------------

// POST Supplier
app.post("/supplier", (req, res) => {
  const { name, city } = req.body;

  if (!name || !city) {
    return res.status(400).json({ message: "Name and city are required" });
  }

  db.run(
    "INSERT INTO suppliers (name, city) VALUES (?, ?)",
    [name, city],
    function (err) {
      if (err) return res.status(500).json(err.message);

      res.json({
        message: "Supplier added successfully",
        id: this.lastID,
      });
    },
  );
});

// POST Inventory
app.post("/inventory", (req, res) => {
  const { supplier_id, product_name, category, quantity, price } = req.body;

  if (!supplier_id || !product_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (quantity < 0) {
    return res.status(400).json({ message: "Quantity must be >= 0" });
  }

  if (price <= 0) {
    return res.status(400).json({ message: "Price must be > 0" });
  }

  db.get(
    "SELECT * FROM suppliers WHERE id = ?",
    [supplier_id],
    (err, supplier) => {
      if (err) return res.status(500).json(err.message);

      if (!supplier) {
        return res.status(400).json({ message: "Invalid supplier_id" });
      }

      db.run(
        `INSERT INTO inventory 
        (supplier_id, product_name, category, quantity, price)
        VALUES (?, ?, ?, ?, ?)`,
        [supplier_id, product_name, category, quantity, price],
        function (err) {
          if (err) return res.status(500).json(err.message);

          res.json({
            message: "Inventory added successfully",
            id: this.lastID,
          });
        },
      );
    },
  );
});

// GET Inventory
app.get("/inventory", (req, res) => {
  db.all("SELECT * FROM inventory", [], (err, rows) => {
    if (err) return res.status(500).json(err.message);
    res.json(rows);
  });
});

// GROUPED QUERY
app.get("/inventory-grouped", (req, res) => {
  db.all(
    `
    SELECT s.name,
    SUM(i.quantity * i.price) AS total_value
    FROM suppliers s
    JOIN inventory i ON s.id = i.supplier_id
    GROUP BY s.id
    ORDER BY total_value DESC
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err.message);
      res.json(rows);
    },
  );
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
