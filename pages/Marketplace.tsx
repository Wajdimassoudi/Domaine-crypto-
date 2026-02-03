
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

type StoreSource = 'all' | 'printful' | 'amazon';

export const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStore, setCurrentStore] = useState<StoreSource>('all');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || 'All';

  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        const results = await mockBackend.searchProducts(query, category);
        setProducts(results);
        setLoading(false);
    };
    fetchResults();
  }, [query, category]);

  const tabs: {id: StoreSource, label: string, icon: string, color: string}[] = [
      { id: 'all', label: 'Global Inventory', icon: 'fa-globe', color: 'bg-primary' },
      { id: 'printful', label: 'Custom Merch', icon: 'fa-tshirt', color: 'bg-indigo-600' },
      { id: 'amazon', label: 'Tech & Gadgets', icon: 'fa-microchip', color: 'bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Store Tabs */}
            <div className="flex flex-wrap gap-4 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentStore(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${
                            currentStore === tab.id 
                            ? `${tab.color} text-white shadow-lg scale-105` 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <i className={`fas ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-darker flex items-center gap-2">
                        {category !== 'All' ? `${category} Collection` : 'Direct Wholesale Marketplace'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Discover thousands of verified products with crypto checkout.</p>
                </div>
                <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <span className="text-primary font-bold">{products.length}</span> Products Available
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg h-80 animate-pulse border border-gray-200">
                             <div className="h-44 bg-gray-100 w-full mb-4"></div>
                             <div className="h-4 bg-gray-100 w-3/4 mx-4 mb-2"></div>
                             <div className="h-4 bg-gray-100 w-1/2 mx-4"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <i className="fas fa-search text-4xl text-gray-200 mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-600">No matching items</h2>
                    <p className="text-gray-400">Try adjusting your filters or category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
