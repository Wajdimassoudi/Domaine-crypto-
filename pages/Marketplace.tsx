
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

type StoreSource = 'all' | 'printful' | 'amazon';

export const Marketplace: React.FC = () => {
  // Fix: Initialize useNavigate hook to handle programmatic navigation (line 88 error fix)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStore, setCurrentStore] = useState<StoreSource>('all');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || 'All';

  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        // Request a large initial batch
        const results = await mockBackend.searchProducts(query, category);
        setProducts(results);
        setLoading(false);
    };
    fetchResults();
  }, [query, category]);

  const tabs: {id: StoreSource, label: string, icon: string, color: string}[] = [
      { id: 'all', label: 'Global Inventory', icon: 'fa-globe', color: 'bg-primary' },
      { id: 'printful', label: 'Fashion & Custom', icon: 'fa-tshirt', color: 'bg-indigo-600' },
      { id: 'amazon', label: 'Tech Direct', icon: 'fa-microchip', color: 'bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Store Tabs */}
            <div className="flex flex-wrap gap-4 mb-10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentStore(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                            currentStore === tab.id 
                            ? `${tab.color} text-white shadow-xl scale-105 ring-4 ring-offset-2 dark:ring-offset-darker ring-${tab.color}/20` 
                            : 'bg-white dark:bg-surface text-gray-500 border border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-darker'
                        }`}
                    >
                        <i className={`fas ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {category !== 'All' ? `${category} Collection` : 'Direct Crypto Marketplace'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Verified wholesale inventory from global partners.</p>
                </div>
                <div className="text-sm font-bold bg-white dark:bg-surface px-6 py-3 rounded-full shadow-lg border border-gray-100 dark:border-border flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                    <span className="text-primary">{products.length.toLocaleString()}</span> Items Available
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(18)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-surface rounded-xl h-80 animate-pulse border border-gray-200 dark:border-border">
                             <div className="h-44 bg-gray-100 dark:bg-darker w-full mb-4"></div>
                             <div className="h-4 bg-gray-100 dark:bg-darker w-3/4 mx-4 mb-2"></div>
                             <div className="h-4 bg-gray-100 dark:bg-darker w-1/2 mx-4"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-surface rounded-[40px] shadow-sm border border-gray-100 dark:border-border">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-darker rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-gray-300">
                        <i className="fas fa-search"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300">No matching assets found</h2>
                    <p className="text-gray-400 mt-2">Try adjusting your filters or browsing a different category.</p>
                    <button onClick={() => navigate('/marketplace')} className="mt-8 bg-primary text-white px-8 py-3 rounded-full font-bold">Clear All Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
