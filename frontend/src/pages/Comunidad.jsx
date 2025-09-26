import useApi from '../hooks/useApi';
import PostCard from '../components/PostCard';

const Comunidad = () => {
  const { data, isLoading, error } = useApi('http://localhost:3001/api/social/posts');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando feed...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg mb-2">⚠️ Error al cargar el feed</div>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Asegúrate de que el servidor backend esté ejecutándose en http://localhost:3001
            </p>
          </div>
        </div>
      </div>
    );
  }

  const posts = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comunidad de Emprendedores
          </h1>
          <p className="text-gray-600">
            Conecta, comparte y aprende con otros emprendedores
          </p>
        </div>

        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-lg">👤</span>
            </div>
            <div className="flex-1">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                ¿Qué quieres compartir con la comunidad?
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                <span>📷</span>
                <span className="text-sm">Foto</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                <span>📝</span>
                <span className="text-sm">Artículo</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                <span>🚀</span>
                <span className="text-sm">Logro</span>
              </button>
            </div>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Publicar
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📱</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay publicaciones aún
            </h3>
            <p className="text-gray-600">
              Sé el primero en compartir algo con la comunidad
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button className="bg-white hover:bg-gray-50 text-gray-600 px-6 py-3 rounded-lg border border-gray-200 transition-colors">
            Cargar más publicaciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comunidad;