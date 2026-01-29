import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend'; // Keep for "Featured" fallback only
import { dynadot } from '../services/dynadotService';
import { Domain } from '../types';
import { DomainCard } from '../components/DomainCard';
import { useNotification } from '../context/NotificationContext';

export const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  
  // Search State
  const [search, setSearch] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');

  // Initial Load (Show Featured from Mock/Cache just to populate the UI initially)
  useEffect(() => {
    const initialData = mockBackend.getDomains().filter(d => d.isListed).slice(0, 8);
    setDomains(initialData);
  }, []);

  // Handle URL Query
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
        setSearch(query);
        handleRealSearch(query);
    }
  }, [searchParams]);

  const handleRealSearch = async (term: string) => {
      if (!term.trim()) return;
      setLoading(true);
      setSearchedTerm(term);
      setDomains([]); // Clear current list

      try {
          // 1. Call Real API
          const realResults = await dynadot.search(term);
          
          if (realResults.length > 0) {
              setDomains(realResults);
          } else {
              // Fallback: If API returns empty
              if (term.includes('.')) {
                  // Double check availability of specific domain
                   const isAvailable = await dynadot.checkDomain(term);
                   if (isAvailable) {
                       const parts = term.split('.');
                       setDomains([{
                           id: `real_${term}`,
                           name: parts[0],
                           tld: ('.' + parts[1]) as any,
                           fullName: term,
                           price: 12.99, // Fallback price
                           currency: 'USDT', // Fix: Use USDT instead of USD to match CryptoCurrency type
                           isPremium: false,
                           owner: null,
                           isListed: true,
                           views: 1,
                           description: "Available via API",
                           privacyEnabled: true,
                           autoRenew: true,
                           nameservers: [],
                           dnsRecords: []
                       }]);
                   }
              }
          }
      } catch (error) {
          console.error(error);
          showNotification("Error fetching from Registrar", "error");
      } finally {
          setLoading(false);
      }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleRealSearch(search);
  };

  return (
    <div className="min-h-screen py-32 bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl font-display font-bold text-white mb-4">Domain Marketplace</h1>
                <p className="text-gray-400">Search and register domains directly on the blockchain.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={onSearchSubmit} className="relative max-w-3xl mx-auto w-full group z-20 mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl opacity-75 blur transition duration-500"></div>
                <div className="relative bg-surface rounded-xl p-2 flex items-center shadow-2xl">
                    <input 
                        type="text" 
                        placeholder="Search for a domain (e.g. myproject.io)" 
                        className="w-full bg-transparent border-none text-white px-4 py-3 text-lg focus:outline-none placeholder-gray-500 font-display"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg">
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Search'}
                    </button>
                </div>
            </form>

            {/* Results Area */}
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-4 px-2">
                    <p className="text-sm text-gray-500">
                        {loading ? 'Searching Registrar...' : searchedTerm ? `Results for "${searchedTerm}"` : 'Featured Listings'}
                    </p>
                    <div className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                        {searchedTerm ? 'Live API Results' : 'Premium Inventory'}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                         <p className="text-gray-400">Querying Dynadot API...</p>
                    </div>
                ) : domains.length === 0 ? (
                    <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-gray-700">
                        <div className="inline-block p-4 rounded-full bg-surface mb-4">
                            <i className="fas fa-search text-2xl text-gray-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No domains found</h3>
                        <p className="text-gray-400">Try a different keyword or extension.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {domains.map(d => (
                            <DomainCard key={d.id} domain={d} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};