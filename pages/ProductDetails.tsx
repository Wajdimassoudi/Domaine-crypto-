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
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (id) {
        setLoading(true);
        mockBackend.getProductById(id).then(p => {
            if (p) {
                setProduct(p);
                setSelectedImage(p.image);
            }
            setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="pt-40 text-center"><i className="fas fa-spinner fa-spin text-4xl text-primary"></i></div>;
  if (!product) return <div className="pt-40 text-center">Product not found</div>;

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
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
            {/* Image Gallery */}
            <div className="p-8 bg-white border-r border-gray-100 flex flex-col">
                <div className="flex-grow flex items-center justify-center mb-6 h-[400px]">
                    <img src={selectedImage} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {product.images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedImage(img)}
                                className={`w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0 ${selectedImage === img ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-8">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{product.category}</span>
                    {product.brand && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">{product.brand}</span>}
                </div>
                <h1 className="text-3xl font-bold text-darker mb-2 leading-tight">{product.title}</h1>
                
                {/* Ratings */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-darker mt-0.5">{product.rating}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-sm">{product.reviews} Reviews</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-sm">{product.sold} Orders</span>
                </div>

                {/* Price */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-red-600">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through mb-1">${product.originalPrice}</span>
                        )}
                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded mb-2 font-bold">
                             -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <i className="fas fa-shipping-fast text-green-500"></i>
                        <span>{product.shipping} (Estimated 15-25 Days)</span>
                    </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="font-bold text-darker mb-2 text-sm uppercase tracking-wider">About this item</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>

                {/* Specs */}
                <div className="mb-8">
                     <h3 className="font-bold text-darker mb-3 text-sm uppercase tracking-wider">Specifications</h3>
                     <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-gray-50 p-4 rounded border border-gray-100">
                         {product.specs && Object.entries(product.specs).map(([key, val]) => (
                             <div key={key} className="flex justify-between border-b border-gray-200 pb-1 last:border-0">
                                 <span className="text-gray-500">{key}:</span>
                                 <span className="text-darker font-medium text-right">{val}</span>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 items-center mt-auto">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button onClick={() => setQty(Math.max(1, qty-1))} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-l-lg">-</button>
                        <span className="px-4 py-3 font-bold text-darker w-12 text-center">{qty}</span>
                        <button onClick={() => setQty(qty+1)} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
                    </div>
                    <button onClick={handleAddToCart} className="flex-1 bg-white border-2 border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors">
                        Add to Cart
                    </button>
                    <button onClick={handleBuyNow} className="flex-1 bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primaryHover shadow-lg shadow-primary/30 transition-colors">
                        Buy Now
                    </button>
                </div>
                
                <div className="mt-4 text-center">
                     <p className="text-xs text-gray-400">Transaction secured by Smart Contract. Money-back guarantee if not delivered.</p>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};