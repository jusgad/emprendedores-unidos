const express = require('express');
const router = express.Router();

const pagoController = require('../controllers/pagoController');
const { authenticateToken, authorizeVendedor } = require('../middleware/auth');

router.post('/create-payment-intent', authenticateToken, pagoController.createPaymentIntent);
router.post('/confirm-payment', authenticateToken, pagoController.confirmPayment);
router.get('/history', authenticateToken, pagoController.getPaymentHistory);
router.post('/refund', authenticateToken, authorizeVendedor, pagoController.refundPayment);

module.exports = router;