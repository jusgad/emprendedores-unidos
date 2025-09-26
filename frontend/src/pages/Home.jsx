import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Emprendedores
            <span className="text-primary-600"> Unidos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma que conecta emprendedores, impulsa negocios y construye una comunidad 
            próspera donde las ideas se transforman en realidad.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/marketplace"
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Explorar Marketplace 🛍️
            </Link>
            <Link
              to="/comunidad"
              className="bg-white hover:bg-gray-50 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-200 transition-colors shadow-lg hover:shadow-xl"
            >
              Unirse a la Comunidad 🤝
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marketplace</h3>
              <p className="text-gray-600">
                Descubre productos únicos y servicios especializados de emprendedores locales. 
                Apoya el talento y encuentra exactamente lo que necesitas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Red Social</h3>
              <p className="text-gray-600">
                Conecta con otros emprendedores, comparte experiencias, aprende nuevas estrategias 
                y construye relaciones que impulsen tu negocio.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crecimiento</h3>
              <p className="text-gray-600">
                Herramientas y recursos diseñados para hacer crecer tu emprendimiento. 
                Desde visibilidad hasta networking, todo en un solo lugar.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Listo para hacer crecer tu emprendimiento?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Únete a nuestra comunidad de emprendedores y accede a un marketplace 
              diseñado para impulsar tu negocio al siguiente nivel.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Comenzar Ahora ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;