# Inventory Search Application

## 🔧 Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: SQLite

---

## 🚀 Features

### Part A (Search)

- Search products by name (partial match)
- Filter by category
- Filter by price range
- Case-insensitive search
- Combined filters supported

### Part B (Database)

- Add suppliers
- Add inventory items
- Validate supplier existence
- Quantity ≥ 0, Price > 0
- Group inventory by supplier

---

## 🔍 Search Logic

- Filters applied step-by-step
- Case-insensitive using `.toLowerCase()`
- Returns all items if no filters applied

---

## 🧠 Database Design

### Suppliers Table

- id (Primary Key)
- name
- city

### Inventory Table

- id (Primary Key)
- supplier_id (Foreign Key)
- product_name
- category
- quantity
- price

---

## 📊 Grouped Query

- Groups inventory by supplier
- Calculates total value using:
  quantity × price
- Sorted in descending order

---

## ⚡ Optimization Idea

- Add index on supplier_id:
  CREATE INDEX idx_supplier_id ON inventory(supplier_id);
- Use pagination for large datasets

---

## ▶️ How to Run Locally

### Backend

cd backend
npm install
node server.js

### Frontend

cd frontend
npm install
npm run dev

---

## 🌐 Live Demo

Frontend: (your vercel link)
Backend: (your render link)
