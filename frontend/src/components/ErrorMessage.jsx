const ErrorMessage = ({ 
  error, 
  title = 'Error', 
  showRetry = false, 
  onRetry,
  type = 'error' 
}) => {
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconEmojis = {
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️'
  };

  return (
    <div className={`border rounded-lg p-6 ${typeClasses[type]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl" role="img" aria-label={type}>
            {iconEmojis[type]}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium mb-2">
            {title}
          </h3>
          <div className="text-sm">
            {typeof error === 'string' ? (
              <p>{error}</p>
            ) : (
              <div>
                <p className="mb-2">Ha ocurrido un error inesperado:</p>
                <code className="block bg-white bg-opacity-50 p-2 rounded text-xs font-mono">
                  {error?.message || JSON.stringify(error, null, 2)}
                </code>
              </div>
            )}
          </div>
          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 transition-colors"
              >
                🔄 Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;