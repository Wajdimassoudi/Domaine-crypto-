import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || 'All';

  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        // Add artificial delay for realism
        await new Promise(r => setTimeout(r, 500));
        
        let results: Product[] = [];
        if (query || (category && category !== 'All')) {
            results = await mockBackend.searchProducts(query, category);
        } else {
            results = await mockBackend.getProducts(50, 0); // Load more for marketplace
        }
        setProducts(results);
        setLoading(false);
    };
    fetchResults();
  }, [query, category]);

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-darker">
                        {category !== 'All' ? `Category: ${category}` : 'Global Marketplace'}
                    </h1>
                    {query && <p className="text-gray-500 text-sm mt-1">Search results for "{query}"</p>}
                </div>
                <div className="text-sm text-gray-500">
                    Showing {products.length} results
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg h-72 animate-pulse"></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-600">No products found</h2>
                    <p className="text-gray-500">Try adjusting your search or category.</p>
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