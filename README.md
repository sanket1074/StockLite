# StockLite — Inventory Management System 📦

> A lightweight, modern, and production-ready **MERN Stack Inventory Management Dashboard** built for MCA class assessment.

---

## 🚀 Tech Stack

- **Frontend:** React (v18) with Vite, Vanilla Modern CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Language:** JavaScript only (ES6+)

---

## ✨ Features Implemented

1. **Executive Metric Cards:**
   - **Total Products:** Total distinct items in stock.
   - **Total Units:** Sum total of physical product quantities.
   - **Total Inventory Value:** Dynamically computed from `price × quantity` across the entire catalog.
   - **Low-Stock Alert Count:** Real-time count of items where `quantity <= 5`.
2. **Product Catalog & Table:**
   - Visual inventory table with status badges (`In Stock`, `Low Stock (≤ 5)`, `Out of Stock`).
   - Highlighted row alerts for low-stock items.
3. **Add & Edit Products:**
   - Modal form with real-time value calculation preview.
   - Frontend and backend validation for required fields, non-negative prices, and quantities.
4. **Delete Products:**
   - Confirmation modal displaying product name and warning before removal.
5. **Real-time Search:**
   - Case-insensitive instant search by product name.
6. **Category Filtering:**
   - Filter dropdown dynamically populated with inventory categories.
   - One-click toggle for low-stock products (`quantity <= 5`).
7. **Database Health Indicator:**
   - Real-time indicator displaying MongoDB connection status and step-by-step resolution tips if disconnected.

---

## 📁 Project Structure

```text
StockLite/
├── package.json               # Root convenience runner
├── README.md                  # Project documentation & guide
├── .env.example               # Environment variables template
├── server/                    # Node.js & Express Backend
│   ├── package.json
│   ├── .env                   # Server environment config
│   ├── .env.example
│   ├── seed.js                # Initial database seeder
│   ├── test-suite.js          # CRUD & calculation test suite
│   ├── test-e2e-api.js        # End-to-end HTTP test runner
│   └── src/
│       ├── server.js          # Express entrypoint
│       ├── config/
│       │   └── db.js          # MongoDB connection handler
│       ├── models/
│       │   └── Product.js     # Mongoose Product Schema & virtuals
│       ├── controllers/
│       │   └── productController.js # CRUD business logic
│       └── routes/
│           └── productRoutes.js     # API Route definitions
└── client/                    # React + Vite Frontend
    ├── package.json
    ├── vite.config.js         # Vite proxy configuration (/api -> :5000)
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx            # State orchestration & modal handlers
        ├── index.css          # Design system & color tokens
        ├── App.css            # Component styles & animations
        └── components/
            ├── Sidebar.jsx    # Sidebar navigation & branding
            ├── Header.jsx     # Top navbar with "Add Product" button
            ├── StatCards.jsx  # 4 KPI metric cards
            ├── FilterBar.jsx  # Search, category & low-stock filters
            ├── ProductTable.jsx # Inventory data table & status badges
            ├── ProductModal.jsx # Add / Edit modal dialog with validation
            ├── DeleteConfirmModal.jsx # Delete confirmation prompt
            ├── DatabaseAlert.jsx # MongoDB status banner & tips
            └── Toast.jsx      # Feedback notification alerts
```

---

## ⚙️ Environment Variables

Create `server/.env` (a template is provided in `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stocklite
```

*(For MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stocklite?retryWrites=true&w=majority`)*

---

## 🏃 Quick Start Guide

### Step 1: Start MongoDB
Ensure MongoDB is running locally:
- **Windows Command (Administrator PowerShell):**
  ```powershell
  net start MongoDB
  ```
  *Or launch mongod directly:*
  ```powershell
  & "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe"
  ```

### Step 2: Seed Sample Data (Optional but Recommended)
Populate the database with sample inventory items:
```bash
npm run seed
```

### Step 3: Run the Backend Server
In Terminal 1:
```bash
cd server
npm run dev
```
*The backend API will run at `http://localhost:5000`.*

### Step 4: Run the Frontend Client
In Terminal 2:
```bash
cd client
npm run dev
```
*The frontend dashboard will run at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server and database status check |
| `GET` | `/api/products` | Get products (supports `?search=`, `?category=`, `?lowStock=true`) |
| `GET` | `/api/products/:id` | Get single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product by ID |

---

## 🧪 Testing

Run backend test suites:
- **Unit & calculations test:** `npm run test:suite`
- **End-to-End HTTP tests:** `npm run test:api`
