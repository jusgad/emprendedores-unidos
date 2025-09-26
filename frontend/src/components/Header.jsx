import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EU</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Emprendedores Unidos
              </span>
            </Link>
          </div>

          <nav className="flex space-x-8">
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketplace')
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/comunidad"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/comunidad')
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Comunidad
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;