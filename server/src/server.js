const path = require('path');
// Load .env reliably from server directory or process cwd
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/settings', settingRoutes);
// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: statusMap[dbStatus] || 'Unknown',
      readyState: dbStatus,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    }
  });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root greeting endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'StockLite - Inventory Management API is running.',
    endpoints: {
      health: 'GET /api/health',
      products: 'GET /api/products',
      createProduct: 'POST /api/products',
      getProduct: 'GET /api/products/:id',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id'
    }
  });
});

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express server
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` StockLite Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Products API: http://localhost:${PORT}/api/products`);
    console.log(`=================================================`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

module.exports = app;
