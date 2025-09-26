const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');
const socialController = require('../controllers/socialController');

router.get('/productos', productoController.getAllProducts);
router.get('/productos/:id', productoController.getProductById);
router.get('/productos/categoria/:categoria', productoController.getProductsByCategory);

router.get('/social/posts', socialController.getFeedPosts);
router.get('/social/posts/:id', socialController.getPostById);
router.post('/social/posts/:id/like', socialController.likePost);
router.get('/social/tienda/:tiendaId/posts', socialController.getPostsByTienda);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Emprendedores Unidos funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;