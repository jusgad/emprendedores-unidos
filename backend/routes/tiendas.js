const express = require('express');
const router = express.Router();

const tiendaController = require('../controllers/tiendaController');
const { authenticateToken, authorizeVendedor, optionalAuth } = require('../middleware/auth');
const { validateTienda } = require('../middleware/validation');

router.get('/', optionalAuth, tiendaController.getAllTiendas);
router.get('/my-tienda', authenticateToken, authorizeVendedor, tiendaController.getMyTienda);
router.get('/stats', authenticateToken, authorizeVendedor, tiendaController.getTiendaStats);
router.get('/url/:url', optionalAuth, tiendaController.getTiendaByUrl);
router.get('/:id', optionalAuth, tiendaController.getTiendaById);

router.put('/my-tienda', authenticateToken, authorizeVendedor, validateTienda, tiendaController.updateMyTienda);

module.exports = router;