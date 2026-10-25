const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  cancelInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .delete(deleteInvoice);

router.route('/:id/cancel')
  .put(cancelInvoice)
  .post(cancelInvoice);

module.exports = router;
