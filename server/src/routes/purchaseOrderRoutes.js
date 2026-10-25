
const express = require('express');
const router = express.Router();

const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus
} = require('../controllers/purchaseOrderController');

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.patch('/:id/status', updatePurchaseOrderStatus);

module.exports = router;
