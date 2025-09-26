const ProductoCard = ({ producto }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'Arte': 'bg-purple-100 text-purple-800',
      'Tecnología': 'bg-blue-100 text-blue-800',
      'Servicios': 'bg-green-100 text-green-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-gray-400 text-lg">📦</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {producto.nombre}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(producto.categoria)}`}>
            {producto.categoria}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(producto.precio)}
            </span>
            <span className="text-sm text-gray-500">
              Stock: {producto.stock} unidades
            </span>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-gray-500">Tienda #{producto.tiendaId}</span>
          </div>
        </div>
        
        <button className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;