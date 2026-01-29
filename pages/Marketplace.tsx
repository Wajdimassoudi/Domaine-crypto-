import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Domain, TLD } from '../types';
import { DomainCard } from '../components/DomainCard';

export const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filtered, setFiltered] = useState<Domain[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // As requested: 5 names per page

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTld, setSelectedTld] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Helper for mock USD conversion
  const getUsdEstimate = (d: Domain) => {
      if (d.currency === 'USDT' || d.currency === 'BUSD') return d.price;
      if (d.currency === 'BNB') return d.price * 320; 
      return 0;
  };

  useEffect(() => {
    // Initial Load
    const data = mockBackend.getDomains();
    setDomains(data.filter(d => d.isListed));
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearch(query);
  }, [searchParams]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);

    let result: Domain[] = [];

    // Search Logic
    if (search && search.length > 0) {
        result = mockBackend.searchDomains(search);
    } else {
        result = domains; 
    }

    result = result.filter(d => d.isListed);

    // TLD Filter
    if (selectedTld !== 'All') {
      result = result.filter(d => d.tld === selectedTld);
    }

    // Price Filter
    if (priceRange === 'Under 100') {
        result = result.filter(d => getUsdEstimate(d) < 100);
    } else if (priceRange === '100 - 1000') {
        result = result.filter(d => {
            const val = getUsdEstimate(d);
            return val >= 100 && val <= 1000;
        });
    } else if (priceRange === 'Over 1000') {
        result = result.filter(d => getUsdEstimate(d) > 1000);
    }

    // Premium Filter
    if (onlyPremium) {
        result = result.filter(d => d.isPremium);
    }

    // Sorting
    if (sortBy === 'price_low') {
        result.sort((a, b) => getUsdEstimate(a) - getUsdEstimate(b));
    } else if (sortBy === 'price_high') {
        result.sort((a, b) => getUsdEstimate(b) - getUsdEstimate(a));
    } else if (sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'views') {
        result.sort((a, b) => b.views - a.views);
    }

    setFiltered(result);
  }, [search, selectedTld, priceRange, onlyPremium, domains, sortBy]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const tldOptions: string[] = ['All', '.com', '.net', '.org', '.io', '.ai', '.app', '.co'];

  return (
    <div className="min-h-screen py-32 bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-8 bg-surface p-6 rounded-xl border border-border h-fit">
                <div>
                    <h3 className="text-white font-bold mb-4 font-display flex items-center gap-2">
                        <i className="fas fa-filter text-primary"></i> Extensions
                    </h3>
                    <div className="space-y-2">
                        {tldOptions.map(t => (
                            <label key={t} className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedTld === t ? 'border-primary bg-primary' : 'border-gray-600 group-hover:border-gray-400'}`}>
                                    {selectedTld === t && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input type="radio" className="hidden" name="tld" value={t} onChange={() => setSelectedTld(t)} checked={selectedTld === t} />
                                <span className={`${selectedTld === t ? 'text-white' : 'text-gray-400'} group-hover:text-white transition-colors`}>{t}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-border pt-6">
                    <h3 className="text-white font-bold mb-4 font-display">Price Range</h3>
                    <select 
                        value={priceRange} 
                        onChange={e => setPriceRange(e.target.value)}
                        className="w-full bg-dark border border-border text-white rounded-lg p-3 outline-none focus:border-primary"
                    >
                        <option>All</option>
                        <option>Under 100</option>
                        <option>100 - 1000</option>
                        <option>Over 1000</option>
                    </select>
                </div>

                <div className="border-t border-border pt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary rounded bg-surface border-gray-600 focus:ring-primary" checked={onlyPremium} onChange={e => setOnlyPremium(e.target.checked)} />
                        <span className="text-white font-medium">Premium Only</span>
                    </label>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow">
                {/* Search & Sort Header */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                        <input 
                            type="text" 
                            placeholder="Search 327+ Premium Domains..." 
                            className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all shadow-lg text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    
                    <div className="w-full md:w-auto flex-shrink-0">
                         <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full h-full bg-surface border border-border text-white px-4 py-4 rounded-xl outline-none focus:border-primary cursor-pointer appearance-none font-medium"
                         >
                            <option value="featured">Featured</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="views">Most Popular</option>
                         </select>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                    <p className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filtered.length)} of {filtered.length} domains
                    </p>
                    <div className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                        Live Inventory
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-gray-700">
                        <div className="inline-block p-4 rounded-full bg-surface mb-4">
                            <i className="fas fa-search text-2xl text-gray-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No domains found</h3>
                        <p className="text-gray-400">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <>
                        {/* Domain Grid - 5 items per page essentially becomes a list or a grid depending on view, 
                            but we keep grid logic for robustness */}
                        <div className="grid grid-cols-1 gap-4">
                            {currentItems.map(d => (
                                <DomainCard key={d.id} domain={d} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show current page in middle
                                    let p = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage > 3) {
                                            p = currentPage - 2 + i;
                                        }
                                        if (p > totalPages) {
                                            p = totalPages - 4 + i;
                                        }
                                    }
                                    return (
                                        <button 
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                                                currentPage === p 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-surface border border-border text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                        
                        <div className="text-center text-xs text-gray-600 mt-4">
                            Page {currentPage} of {totalPages}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};