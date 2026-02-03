
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockBackend.getProducts(100).then(data => {
        setProducts(data);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
        setAdIndex(prev => (prev + 1) % 10); // Rotate first 10 products
    }, 3000);
    return () => clearInterval(interval);
  }, [products]);

  const currentAd = products[adIndex];

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Ad Banner Section */}
        <div className="relative h-64 md:h-96 bg-darker rounded-3xl overflow-hidden mb-12 shadow-2xl border border-primary/20">
            {currentAd && (
                <div className="absolute inset-0 flex flex-col md:flex-row items-center p-8 md:p-16 animate-[fadeIn_0.5s]">
                    <div className="flex-1 text-right md:text-left order-2 md:order-1">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">عرض خاص وحصري</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{currentAd.title}</h2>
                        <p className="text-gray-400 mb-6 text-sm md:text-lg line-clamp-2">{currentAd.description}</p>
                        <div className="flex gap-4">
                             <Link to={`/product/${currentAd.id}`} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30">اشتري الآن</Link>
                             <div className="text-2xl font-bold text-green-400">{currentAd.price} USDT</div>
                        </div>
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center order-1 md:order-2 mb-4 md:mb-0">
                        <img src={currentAd.image} alt="Ad" className="max-h-full object-contain transform hover:scale-110 transition-transform" />
                    </div>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-bolt text-yellow-500"></i> عروض اليوم - أسعار الجملة
            </h2>
            <Link to="/marketplace" className="text-primary font-bold text-sm">عرض الكل</Link>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {products.slice(0, 36).map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        )}

        <div className="mt-16 bg-primary/10 rounded-3xl p-12 text-center border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">أكبر مخزون للمنتجات في عالم الكريبتو</h3>
            <p className="text-gray-600 mb-8">نحن نوفر لك آلاف المنتجات بأسعار أقل من سعر السوق، توصيل سريع لجميع أنحاء العالم ودفع آمن 100%.</p>
            <Link to="/marketplace" className="bg-darker text-white px-12 py-4 rounded-full font-bold inline-block">تصفح آلاف المنتجات الآن</Link>
        </div>
      </div>
    </div>
  );
};
