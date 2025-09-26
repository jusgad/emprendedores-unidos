const express = require('express');
const router = express.Router();

const socialController = require('../controllers/socialController');
const { authenticateToken, authorizeVendedor, optionalAuth } = require('../middleware/auth');
const { validatePost, validateComentario } = require('../middleware/validation');

router.get('/feed', optionalAuth, socialController.getFeedPosts);
router.get('/my-posts', authenticateToken, authorizeVendedor, socialController.getMyPosts);
router.get('/posts/:id', optionalAuth, socialController.getPostById);

router.post('/posts', authenticateToken, authorizeVendedor, validatePost, socialController.createPost);
router.post('/posts/:id/like', authenticateToken, socialController.likePost);
router.post('/posts/:id/comment', authenticateToken, validateComentario, socialController.addComment);
router.post('/follow/:tiendaId', authenticateToken, socialController.followTienda);

router.delete('/posts/:id', authenticateToken, authorizeVendedor, socialController.deletePost);

module.exports = router;