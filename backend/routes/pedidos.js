const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidoController');
const { authenticateToken, authorizeVendedor } = require('../middleware/auth');
const { validatePedido } = require('../middleware/validation');

router.get('/my-pedidos', authenticateToken, pedidoController.getMyPedidos);
router.get('/ventas', authenticateToken, authorizeVendedor, pedidoController.getVentasPedidos);
router.get('/:id', authenticateToken, pedidoController.getPedidoById);

router.post('/', authenticateToken, validatePedido, pedidoController.createPedido);
router.put('/:id/estado', authenticateToken, authorizeVendedor, pedidoController.updatePedidoEstado);

module.exports = router;