
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [customMerch, setCustomMerch] = useState<Product[]>([]);
  const [adProducts, setAdProducts] = useState<Product[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [prods, deals, cats, merch] = await Promise.all([
            mockBackend.getProducts(30, 0), // Increased load
            mockBackend.getFlashDeals(),
            mockBackend.getCategories(),
            mockBackend.getProducts(15, 0, 'printful')
        ]);
        setProducts(prods);
        setFlashDeals(deals);
        setCategories(cats);
        setCustomMerch(merch);
        setAdProducts([...deals, ...prods.slice(0, 10)].sort(() => Math.random() - 0.5));
        setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (adProducts.length === 0) return;
    const interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % adProducts.length);
    }, 3000); // 3 seconds per ad
    return () => clearInterval(interval);
  }, [adProducts]);

  const currentAd = adProducts[currentAdIndex];

  return (
    <div className="min-h-screen pt-32 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO AREA START */}
        <div className="grid grid-cols-12 gap-4 mb-8">
            {/* Categories Sidebar */}
            <div className="hidden lg:block col-span-2 bg-white dark:bg-surface rounded-lg shadow-sm p-2 h-full border border-gray-200 dark:border-border">
                <h3 className="font-bold px-3 py-2 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-border mb-2 opacity-70">Inventory</h3>
                <ul className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {categories.map(c => (
                        <li key={c}>
                            <Link to={`/marketplace?cat=${c}`} className="flex items-center justify-between px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darker hover:text-primary rounded text-sm transition-colors capitalize">
                                <span>{c}</span>
                                <i className="fas fa-chevron-right text-[10px] opacity-30"></i>
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/marketplace" className="block text-center text-xs text-primary font-bold mt-4 hover:underline">Explore 5,000+ Items</Link>
                    </li>
                </ul>
            </div>

            {/* Main Ad Slider (Banner) */}
            <div className="col-span-12 lg:col-span-7 relative bg-darker rounded-lg overflow-hidden shadow-2xl h-[400px] group border border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/60 to-transparent z-10"></div>
                
                {currentAd ? (
                    <div className="absolute inset-0 transition-opacity duration-1000 animate-[fadeIn_1s]">
                        <img src={currentAd.image} className="absolute inset-0 w-full h-full object-contain opacity-40 p-10" alt="Ad" />
                        <div className="relative z-20 p-10 h-full flex flex-col justify-center">
                            <span className="text-primary font-bold uppercase tracking-widest text-[10px] mb-2 bg-primary/10 w-max px-3 py-1 rounded-full border border-primary/30">
                                <i className="fas fa-bullhorn mr-1"></i> Special Offer
                            </span>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 leading-tight drop-shadow-lg">
                                {currentAd.title}
                            </h1>
                            <p className="text-gray-300 mb-6 max-w-md text-sm leading-relaxed line-clamp-2">
                                {currentAd.description}
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 line-through">${currentAd.originalPrice}</span>
                                    <span className="text-3xl font-bold text-green-400">${currentAd.price} <span className="text-xs text-gray-500 font-normal">USDT</span></span>
                                </div>
                                <Link to={`/product/${currentAd.id}`} className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1">
                                    Buy Now
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                   <div className="flex items-center justify-center h-full text-gray-600">Loading Ads...</div>
                )}
                
                {/* Dots */}
                <div className="absolute bottom-4 right-10 z-20 flex gap-2">
                    {adProducts.slice(0, 5).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${currentAdIndex % 5 === i ? 'bg-primary w-6' : 'bg-white/20'}`}></div>
                    ))}
                </div>
            </div>

            {/* Account & Promo Panels */}
            <div className="hidden lg:flex col-span-3 flex-col gap-4">
                <div className="bg-white dark:bg-surface rounded-lg p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center border border-gray-200 dark:border-border">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-darker dark:to-surface rounded-full flex items-center justify-center mb-3 shadow-inner border border-gray-200 dark:border-border">
                        <i className="fas fa-wallet text-3xl text-primary"></i>
                    </div>
                    <p className="text-sm font-bold mb-1">Direct Crypto Access</p>
                    <p className="text-xs text-gray-500 mb-4">No middleman. No KYC. Just shopping.</p>
                    <div className="flex gap-2 w-full">
                        <Link to="/marketplace" className="flex-1 bg-darker dark:bg-primary text-white text-xs py-2.5 rounded-lg hover:opacity-90 transition-colors font-bold">Shop Now</Link>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-5 shadow-xl flex-1 relative overflow-hidden text-white group">
                    <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
                        <i className="fas fa-shipping-fast text-8xl"></i>
                    </div>
                    <h4 className="font-bold relative z-10 text-lg">Global Logistics</h4>
                    <p className="text-xs relative z-10 mb-4 opacity-80 font-medium">150+ Countries supported with getwealthos.icu architecture.</p>
                    <Link to="/about" className="relative z-10 bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs px-4 py-2 rounded-lg hover:bg-white/30 transition-colors inline-block">Learn More</Link>
                </div>
            </div>
        </div>
        {/* HERO AREA END */}

        {/* --- PRINTFUL MOVING MARQUEE --- */}
        <div className="mb-12 overflow-hidden">
             <div className="flex items-center justify-between mb-6 px-1">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                     <i className="fas fa-fire-alt text-orange-500"></i> Trending Apparel
                 </h2>
                 <Link to="/marketplace?cat=Fashion" className="text-sm font-bold text-primary hover:underline">View Global Fashion</Link>
             </div>
             
             <div className="relative">
                 <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-100 dark:from-darker to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-100 dark:from-darker to-transparent z-10 pointer-events-none"></div>

                 <div className="flex gap-4 animate-marquee hover:pause w-max">
                     {[...customMerch, ...customMerch].map((p, i) => (
                         <div key={`${p.id}-${i}`} className="w-56 bg-white dark:bg-surface rounded-xl p-4 shadow-sm border border-gray-200 dark:border-border flex flex-col items-center hover:shadow-lg transition-shadow">
                             <div className="h-40 w-full mb-3 bg-gray-50 dark:bg-darker rounded-lg p-3">
                                 <img src={p.image} className="w-full h-full object-contain" alt={p.title} />
                             </div>
                             <h4 className="text-xs font-bold text-center line-clamp-1 opacity-80">{p.title}</h4>
                             <p className="text-lg font-bold text-primary mt-1">${p.price} <span className="text-[10px] opacity-50">USDT</span></p>
                             <Link to={`/product/${p.id}`} className="mt-3 w-full bg-darker dark:bg-primary text-white text-xs py-2 rounded-lg text-center font-bold hover:opacity-80 transition-opacity">
                                 Grab Wholesale
                             </Link>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
        {/* --- END MARQUEE --- */}

        {loading ? (
            <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Synchronizing with WealthOS Inventory...</p>
            </div>
        ) : (
            <>
                {/* Flash Deals */}
                <div className="bg-white dark:bg-surface rounded-2xl shadow-sm p-8 mb-12 border border-gray-200 dark:border-border">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-border pb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold">Flash Deals</h2>
                            <div className="flex items-center gap-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                                <i className="fas fa-clock"></i> ENDING SOON
                            </div>
                        </div>
                        <Link to="/marketplace" className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 transition-colors">See all deals <i className="fas fa-arrow-right text-[10px]"></i></Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {flashDeals.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Just For You (Massive Listing) */}
                <div className="mb-12">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <i className="fas fa-award text-xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold">Recommended for You</h2>
                        </div>
                        <span className="text-xs font-mono opacity-50">SCANNED 4,281 ITEMS</span>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                         {products.map(product => (
                             <ProductCard key={product.id} product={product} />
                         ))}
                     </div>
                     <div className="mt-16 text-center">
                         <Link to="/marketplace" className="inline-flex items-center gap-3 bg-white dark:bg-surface border-2 border-gray-200 dark:border-border px-12 py-4 rounded-full hover:border-primary hover:text-primary font-bold transition-all uppercase text-xs tracking-widest shadow-xl shadow-black/5">
                             Discover Full Inventory <i className="fas fa-plus"></i>
                         </Link>
                     </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
