import { useState } from 'react';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              T{post.tiendaId}
            </span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-900">
              Tienda #{post.tiendaId}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(post.fecha)}
            </p>
          </div>
        </div>
        
        <p className="text-gray-800 mb-4 leading-relaxed">
          {sanitizeText(post.contenido)}
        </p>

        {post.imagenUrl && sanitizeUrl(post.imagenUrl) && (
          <div className="mb-4">
            <img
              src={sanitizeUrl(post.imagenUrl)}
              alt="Imagen del post"
              className="w-full h-64 object-cover rounded-lg bg-gray-100"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              isLiked
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className={`text-lg ${isLiked ? '❤️' : '🤍'}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="font-medium">
              {likes}
            </span>
          </button>
          
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <span>💬</span>
              <span className="text-sm">Comentar</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <span>📤</span>
              <span className="text-sm">Compartir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;