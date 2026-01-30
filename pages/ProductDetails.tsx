import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { useNotification } from '../context/NotificationContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (id) {
        const p = mockBackend.getProductById(id);
        if (p) setProduct(p);
    }
  }, [id]);

  if (!product) return <div className="pt-32 text-center">Loading...</div>;

  const handleAddToCart = () => {
      mockBackend.addToCart(product, qty);
      showNotification("Added to Cart", "success");
  };

  const handleBuyNow = () => {
      mockBackend.addToCart(product, qty);
      navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-8 bg-gray-50 border-r border-gray-100 flex items-center justify-center">
                <img src={product.image} alt={product.title} className="max-h-[500px] w-full object-contain mix-blend-multiply" />
            </div>

            {/* Info */}
            <div className="p-8">
                <div className="mb-4">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">{product.category}</span>
                </div>
                <h1 className="text-3xl font-bold text-darker mb-2">{product.title}</h1>
                
                {/* Ratings */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                        ))}
                    </div>
                    <span className="text-gray-500 text-sm">{product.reviews} Reviews</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-sm">{product.sold} Sold</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-red-600">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through mb-1">${product.originalPrice}</span>
                        )}
                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded mb-2">
                             {product.currency} Only
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of VAT. Shipping calculated at checkout.</p>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className="font-bold text-darker mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>

                {/* Specs */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                     <h3 className="font-bold text-darker mb-2 text-sm">Specifications</h3>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                         {product.specs && Object.entries(product.specs).map(([key, val]) => (
                             <div key={key} className="flex justify-between">
                                 <span className="text-gray-500">{key}:</span>
                                 <span className="text-darker font-medium">{val}</span>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 items-center">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => setQty(Math.max(1, qty-1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-3 py-2 font-bold text-darker w-10 text-center">{qty}</span>
                        <button onClick={() => setQty(qty+1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                    <button onClick={handleAddToCart} className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors">
                        Add to Cart
                    </button>
                    <button onClick={handleBuyNow} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primaryHover shadow-lg shadow-primary/30 transition-colors">
                        Buy Now
                    </button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};