import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PageLayout = ({ 
  children, 
  isLoading = false, 
  error = null, 
  onRetry,
  title,
  description,
  maxWidth = '7xl'
}) => {
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          <LoadingSpinner size="lg" text="Cargando contenido..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          <ErrorMessage 
            error={error}
            title="Error al cargar la página"
            showRetry={!!onRetry}
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageLayout;