import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [prods, deals, cats] = await Promise.all([
            mockBackend.getProducts(12, 0),
            mockBackend.getFlashDeals(),
            mockBackend.getCategories()
        ]);
        setProducts(prods);
        setFlashDeals(deals);
        setCategories(cats);
        setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Area */}
        <div className="grid grid-cols-12 gap-4 mb-8">
            
            {/* Left Sidebar (Real API Categories) */}
            <div className="hidden lg:block col-span-2 bg-white rounded-lg shadow-sm p-2 h-full border border-gray-200">
                <h3 className="font-bold text-darker px-3 py-2 text-sm uppercase tracking-wider border-b border-gray-100 mb-2">Categories</h3>
                <ul className="space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar">
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

            {/* Main Slider (Hero) */}
            <div className="col-span-12 lg:col-span-7 relative bg-darker rounded-lg overflow-hidden shadow-md h-[300px] lg:h-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/80 to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                <div className="relative z-20 p-10 h-full flex flex-col justify-center">
                    <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-2 bg-yellow-400/10 w-max px-2 py-1 rounded">Wholesale Prices</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">Global Imports<br/>Crypto Payments.</h1>
                    <p className="text-gray-300 mb-6 max-w-md text-sm leading-relaxed">Direct from factory to your door. Save up to 40% paying with USDT/BNB. Standard 15-day secure delivery.</p>
                    <div className="flex gap-3">
                        <Link to="/marketplace" className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 transition-all">
                            Shop Now
                        </Link>
                        <Link to="/marketplace?cat=smartphones" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold backdrop-blur-sm transition-all border border-white/10">
                            Electronics
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side (User/Promo) */}
            <div className="hidden lg:flex col-span-3 flex-col gap-4">
                <div className="bg-white rounded-lg p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center border border-gray-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3 shadow-inner">
                        <i className="fas fa-user-circle text-3xl text-gray-400"></i>
                    </div>
                    <p className="text-sm font-bold text-darker mb-1">Welcome Buyer</p>
                    <p className="text-xs text-gray-500 mb-4">Track your international orders</p>
                    <div className="flex gap-2 w-full">
                        <Link to="/marketplace" className="flex-1 bg-darker text-white text-xs py-2.5 rounded-lg hover:bg-primary transition-colors font-bold">New Order</Link>
                        <Link to="/orders" className="flex-1 bg-gray-100 text-darker text-xs py-2.5 rounded-lg hover:bg-gray-200 font-bold border border-gray-200">Track</Link>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 shadow-sm flex-1 relative overflow-hidden border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 relative z-10 text-lg">Daily Drops</h4>
                    <p className="text-xs text-yellow-700 relative z-10 mb-3">Tech & Gadgets under $50</p>
                    <Link to="/marketplace" className="relative z-10 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded shadow-sm hover:bg-yellow-600 transition-colors">Check Now</Link>
                    <i className="fas fa-fire absolute -bottom-2 -right-2 text-7xl text-yellow-200/50 rotate-12"></i>
                </div>
            </div>
        </div>

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
                            <div className="flex gap-1">
                                <span className="bg-darker text-white text-xs font-bold px-1.5 py-1 rounded">02</span>
                                <span className="text-darker font-bold">:</span>
                                <span className="bg-darker text-white text-xs font-bold px-1.5 py-1 rounded">14</span>
                                <span className="text-darker font-bold">:</span>
                                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-1 rounded">50</span>
                            </div>
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

        {/* Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-gray-200">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 text-2xl">
                     <i className="fas fa-globe-americas"></i>
                </div>
                <div>
                    <h4 className="font-bold text-darker">Global Shipping</h4>
                    <p className="text-xs text-gray-500 mt-1">15-25 Day Delivery via DHL/FedEx</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-2xl">
                     <i className="fas fa-lock"></i>
                </div>
                <div>
                    <h4 className="font-bold text-darker">Secure Crypto Payment</h4>
                    <p className="text-xs text-gray-500 mt-1">Escrow protection until delivery</p>
                </div>
            </div>
             <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 text-2xl">
                     <i className="fas fa-check-double"></i>
                </div>
                <div>
                    <h4 className="font-bold text-darker">Quality Control</h4>
                    <p className="text-xs text-gray-500 mt-1">Inspected before shipping</p>
                </div>
            </div>
             <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-2xl">
                     <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h4 className="font-bold text-darker">Instant Invoices</h4>
                    <p className="text-xs text-gray-500 mt-1">Automated tax invoices</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};