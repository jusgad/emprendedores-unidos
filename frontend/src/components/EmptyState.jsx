const EmptyState = ({ 
  icon = '📦', 
  title, 
  description, 
  actionText, 
  onAction,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'text-4xl mb-3',
      title: 'text-lg font-medium',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'text-6xl mb-4',
      title: 'text-xl font-medium',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'text-8xl mb-6',
      title: 'text-2xl font-semibold',
      description: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`text-center ${classes.container}`}>
      <div className={`text-gray-400 ${classes.icon}`} role="img" aria-label="empty">
        {icon}
      </div>
      <h3 className={`text-gray-900 mb-2 ${classes.title}`}>
        {title}
      </h3>
      <p className={`text-gray-600 max-w-md mx-auto ${classes.description}`}>
        {description}
      </p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;