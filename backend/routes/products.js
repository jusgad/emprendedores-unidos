const express = require('express');
const router = express.Router();

const productController = require('../controllers/productoController');
const { authenticateToken, authorizeVendedor, optionalAuth } = require('../middleware/auth');
const { validateProducto, validateIdParam } = require('../middleware/validation');

router.get('/', optionalAuth, productController.getAllProducts);
router.get('/my-products', authenticateToken, authorizeVendedor, productController.getMyProducts);
router.get('/categoria/:categoria', optionalAuth, productController.getProductsByCategory);
router.get('/:id', optionalAuth, validateIdParam, productController.getProductById);

router.post('/', authenticateToken, authorizeVendedor, validateProducto, productController.createProduct);
router.put('/:id', authenticateToken, authorizeVendedor, validateIdParam, validateProducto, productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeVendedor, validateIdParam, productController.deleteProduct);

module.exports = router;