const { posts } = require('../db/config');

const getFeedPosts = (req, res) => {
  try {
    const postsOrdenados = posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.json({
      success: true,
      data: postsOrdenados,
      total: postsOrdenados.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts del feed',
      error: error.message
    });
  }
};

const getPostById = (req, res) => {
  try {
    const { id } = req.params;
    const post = posts.find(p => p.id === parseInt(id));
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener post',
      error: error.message
    });
  }
};

const likePost = (req, res) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    posts[postIndex].likes += 1;

    res.json({
      success: true,
      data: posts[postIndex],
      message: 'Like agregado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al dar like al post',
      error: error.message
    });
  }
};

const getPostsByTienda = (req, res) => {
  try {
    const { tiendaId } = req.params;
    const postsFiltrados = posts.filter(p => p.tiendaId === parseInt(tiendaId));

    res.json({
      success: true,
      data: postsFiltrados,
      total: postsFiltrados.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts de la tienda',
      error: error.message
    });
  }
};

module.exports = {
  getFeedPosts,
  getPostById,
  likePost,
  getPostsByTienda
};