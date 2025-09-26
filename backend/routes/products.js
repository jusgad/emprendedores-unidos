const express = require('express');
const router = express.Router();

const productController = require('../controllers/productoController');
const { authenticateToken, authorizeVendedor, optionalAuth } = require('../middleware/auth');
const { validateProducto } = require('../middleware/validation');

router.get('/', optionalAuth, productController.getAllProducts);
router.get('/my-products', authenticateToken, authorizeVendedor, productController.getMyProducts);
router.get('/categoria/:categoria', optionalAuth, productController.getProductsByCategory);
router.get('/:id', optionalAuth, productController.getProductById);

router.post('/', authenticateToken, authorizeVendedor, validateProducto, productController.createProduct);
router.put('/:id', authenticateToken, authorizeVendedor, validateProducto, productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeVendedor, productController.deleteProduct);

module.exports = router;