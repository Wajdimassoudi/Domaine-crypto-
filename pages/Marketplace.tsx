import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

type StoreSource = 'dummyjson' | 'amazon' | 'walmart' | 'printful' | 'all';

export const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [currentStore, setCurrentStore] = useState<StoreSource>('dummyjson');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || 'All';
  const storeParam = searchParams.get('store');

  useEffect(() => {
    if (storeParam && ['printful', 'amazon', 'walmart'].includes(storeParam)) {
        setCurrentStore(storeParam as StoreSource);
    }
  }, [storeParam]);

  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        // Add artificial delay for realism
        await new Promise(r => setTimeout(r, 300));
        
        let results: Product[] = [];
        if (query || (category && category !== 'All')) {
            results = await mockBackend.searchProducts(query, category, currentStore);
        } else {
            results = await mockBackend.getProducts(50, 0, currentStore);
        }
        setProducts(results);
        setLoading(false);
    };
    fetchResults();
  }, [query, category, currentStore]);

  const tabs: {id: StoreSource, label: string, icon: string, color: string}[] = [
      { id: 'printful', label: 'Custom Merch', icon: 'fa-tshirt', color: 'bg-indigo-600' },
      { id: 'dummyjson', label: 'Global Store', icon: 'fa-globe', color: 'bg-blue-600' },
      { id: 'amazon', label: 'Amazon Imports', icon: 'fa-amazon', color: 'bg-yellow-600' },
      { id: 'walmart', label: 'Walmart Deals', icon: 'fa-warehouse', color: 'bg-blue-500' },
      { id: 'all', label: 'All Products', icon: 'fa-layer-group', color: 'bg-purple-600' },
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
                        <i className={`fab ${tab.icon} ${tab.icon.startsWith('fa-') ? 'fas' : ''}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-darker flex items-center gap-2">
                        {currentStore === 'printful' && <i className="fas fa-palette text-indigo-600"></i>}
                        {currentStore === 'amazon' && <i className="fab fa-amazon text-yellow-600"></i>}
                        {currentStore === 'walmart' && <i className="fas fa-certificate text-blue-600"></i>}
                        {category !== 'All' ? `Category: ${category}` : currentStore === 'printful' ? 'Premium Custom Merchandise' : 'Marketplace'}
                    </h1>
                    {query && <p className="text-gray-500 text-sm mt-1">Search results for "{query}" in {currentStore}</p>}
                </div>
                <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                    Showing {products.length} Products
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg h-72 animate-pulse border border-gray-200">
                             <div className="h-40 bg-gray-200 w-full mb-4"></div>
                             <div className="h-4 bg-gray-200 w-3/4 mx-4 mb-2"></div>
                             <div className="h-4 bg-gray-200 w-1/2 mx-4"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-600">No products found</h2>
                    <p className="text-gray-500">Try adjusting your search or switching stores.</p>
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