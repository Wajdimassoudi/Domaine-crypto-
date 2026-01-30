import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { useNotification } from '../context/NotificationContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { showNotification } = useNotification();

  const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      mockBackend.addToCart(product);
      showNotification(`Added ${product.title} to Cart!`, "success");
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-200">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 p-4">
        <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
        />
        {product.originalPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-darker font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary h-10 leading-tight">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
            <div className="flex items-baseline gap-2">
               <span className="text-lg font-bold text-red-600">${product.price}</span>
               {product.originalPrice && <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>}
            </div>
            <div className="text-[10px] text-gray-500 mb-2">{product.sold} sold</div>

            <button 
                onClick={handleAddToCart}
                className="w-full bg-darker text-white py-2 rounded font-bold text-sm hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
                <i className="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
      </div>
    </Link>
  );
};