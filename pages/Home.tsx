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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [prods, deals, cats, merch] = await Promise.all([
            mockBackend.getProducts(12, 0),
            mockBackend.getFlashDeals(),
            mockBackend.getCategories(),
            mockBackend.getProducts(10, 0, 'printful') // Fetch Printful explicitly
        ]);
        setProducts(prods);
        setFlashDeals(deals);
        setCategories(cats);
        setCustomMerch(merch);
        setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO AREA START */}
        <div className="grid grid-cols-12 gap-4 mb-8">
            {/* Left Sidebar */}
            <div className="hidden lg:block col-span-2 bg-white rounded-lg shadow-sm p-2 h-full border border-gray-200">
                <h3 className="font-bold text-darker px-3 py-2 text-sm uppercase tracking-wider border-b border-gray-100 mb-2">Categories</h3>
                <ul className="space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                    <li className="bg-primary/10 rounded">
                        <Link to={`/marketplace?store=printful`} className="flex items-center justify-between px-3 py-2 text-primary font-bold rounded text-sm transition-colors capitalize">
                            <span><i className="fas fa-tshirt mr-1"></i> Custom Merch</span>
                            <i className="fas fa-star text-[10px]"></i>
                        </Link>
                    </li>
                    {categories.map(c => (
                        <li key={c}>
                            <Link to={`/marketplace?cat=${c}`} className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary rounded text-sm transition-colors capitalize">
                                <span>{c.replace('-', ' ')}</span>
                                <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/marketplace" className="block text-center text-xs text-primary font-bold mt-2 hover:underline">View All</Link>
                    </li>
                </ul>
            </div>

            {/* Main Slider */}
            <div className="col-span-12 lg:col-span-7 relative bg-darker rounded-lg overflow-hidden shadow-md h-[300px] lg:h-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/80 to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                <div className="relative z-20 p-10 h-full flex flex-col justify-center">
                    <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-2 bg-yellow-400/10 w-max px-2 py-1 rounded">Exclusive Drops</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">Crypto Custom Merch<br/>Limited Edition.</h1>
                    <p className="text-gray-300 mb-6 max-w-md text-sm leading-relaxed">Official high-quality gear. Printed on demand and shipped globally. Pay with Crypto.</p>
                    <div className="flex gap-3">
                        <Link to="/marketplace?store=printful" className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 transition-all">
                            Shop Merch
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex col-span-3 flex-col gap-4">
                <div className="bg-white rounded-lg p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center border border-gray-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3 shadow-inner">
                        <i className="fas fa-user-circle text-3xl text-gray-400"></i>
                    </div>
                    <p className="text-sm font-bold text-darker mb-1">Welcome Buyer</p>
                    <div className="flex gap-2 w-full">
                        <Link to="/marketplace" className="flex-1 bg-darker text-white text-xs py-2.5 rounded-lg hover:bg-primary transition-colors font-bold">Shop</Link>
                        <Link to="/orders" className="flex-1 bg-gray-100 text-darker text-xs py-2.5 rounded-lg hover:bg-gray-200 font-bold border border-gray-200">Orders</Link>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 shadow-sm flex-1 relative overflow-hidden border border-purple-100">
                    <h4 className="font-bold text-purple-800 relative z-10 text-lg">Your Design Here?</h4>
                    <p className="text-xs text-purple-700 relative z-10 mb-3">Create & Sell Custom Merch</p>
                    <Link to="/marketplace?store=printful" className="relative z-10 bg-purple-500 text-white text-xs px-3 py-1.5 rounded shadow-sm hover:bg-purple-600 transition-colors">Start Now</Link>
                </div>
            </div>
        </div>
        {/* HERO AREA END */}

        {/* --- PRINTFUL MOVING MARQUEE (New Feature) --- */}
        <div className="mb-10 overflow-hidden">
             <div className="flex items-center justify-between mb-4 px-1">
                 <h2 className="text-xl font-bold text-darker flex items-center gap-2">
                     <i className="fas fa-fire text-orange-500"></i> Trending Custom Merch
                 </h2>
                 <Link to="/marketplace?store=printful" className="text-xs font-bold text-primary">View All</Link>
             </div>
             
             <div className="relative group">
                 {/* Gradient Fade for edges */}
                 <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none"></div>

                 <div className="flex gap-4 animate-marquee hover:pause w-max">
                     {/* Loop twice for seamless infinite scroll */}
                     {[...customMerch, ...customMerch].map((p, i) => (
                         <div key={`${p.id}-${i}`} className="w-48 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex flex-col items-center">
                             <div className="h-32 w-full mb-2 bg-gray-50 rounded p-2">
                                 <img src={p.image} className="w-full h-full object-contain" alt={p.title} />
                             </div>
                             <h4 className="text-xs font-bold text-darker text-center line-clamp-1">{p.title}</h4>
                             <p className="text-sm font-bold text-red-600 mt-1">${p.price}</p>
                             <Link to={`/product/${p.id}`} className="mt-2 w-full bg-darker text-white text-[10px] py-1 rounded text-center font-bold hover:bg-primary">
                                 Buy Now
                             </Link>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
        {/* --- END MARQUEE --- */}

        {loading ? (
            <div className="text-center py-20">
                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                <p className="mt-4 text-gray-500">Loading Global Inventory...</p>
            </div>
        ) : (
            <>
                {/* Flash Deals */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-darker">Flash Deals</h2>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">Ending Soon</span>
                        </div>
                        <Link to="/marketplace" className="text-sm font-bold text-gray-500 hover:text-primary flex items-center gap-1">View More <i className="fas fa-arrow-right"></i></Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {flashDeals.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Just For You */}
                <div className="mb-8">
                     <div className="flex items-center gap-2 mb-6">
                        <i className="fas fa-heart text-primary"></i>
                        <h2 className="text-xl font-bold text-darker">Recommended For You</h2>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {products.map(product => (
                             <ProductCard key={product.id} product={product} />
                         ))}
                     </div>
                     <div className="mt-12 text-center">
                         <Link to="/marketplace" className="inline-block border-2 border-gray-200 bg-white text-darker px-10 py-3 rounded-full hover:border-primary hover:text-primary font-bold transition-all uppercase text-sm tracking-wider">
                             Load More Products
                         </Link>
                     </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};