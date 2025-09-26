const { productos } = require('../db/config');

const getAllProducts = (req, res) => {
  try {
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const producto = productos.find(p => p.id === parseInt(id));
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

const getProductsByCategory = (req, res) => {
  try {
    const { categoria } = req.params;
    const productosFiltrados = productos.filter(p => 
      p.categoria.toLowerCase() === categoria.toLowerCase()
    );

    res.json({
      success: true,
      data: productosFiltrados,
      total: productosFiltrados.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al filtrar productos por categoría',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory
};