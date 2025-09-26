import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import ProductoCard from '../components/ProductoCard';

const Marketplace = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const { data, isLoading, error } = useApi('http://localhost:3001/api/productos');

  const categorias = ['Arte', 'Tecnología', 'Servicios'];

  const productosFiltrados = data?.data?.filter(producto => 
    !filtroCategoria || producto.categoria === filtroCategoria
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg mb-2">⚠️ Error al cargar productos</div>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Asegúrate de que el servidor backend esté ejecutándose en http://localhost:3001
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace de Emprendedores
          </h1>
          <p className="text-gray-600">
            Descubre productos y servicios únicos de emprendedores locales
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroCategoria('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !filtroCategoria
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todas las categorías
            </button>
            {categorias.map(categoria => (
              <button
                key={categoria}
                onClick={() => setFiltroCategoria(categoria)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroCategoria === categoria
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} 
            {filtroCategoria && ` en "${filtroCategoria}"`}
          </p>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛍️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-600">
              {filtroCategoria 
                ? `No se encontraron productos en la categoría "${filtroCategoria}"`
                : 'Aún no hay productos disponibles en el marketplace'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map(producto => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;