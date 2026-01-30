import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);

  useEffect(() => {
    const all = mockBackend.getProducts();
    setProducts(all);
    setFlashDeals(all.slice(0, 4));
  }, []);

  const categories: {name: Category, icon: string}[] = [
      { name: 'Electronics', icon: 'fa-microchip' },
      { name: 'Phones', icon: 'fa-mobile-alt' },
      { name: 'Fashion', icon: 'fa-tshirt' },
      { name: 'Home', icon: 'fa-couch' },
      { name: 'Crypto Hardware', icon: 'fa-key' },
      { name: 'Beauty', icon: 'fa-spa' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Area */}
        <div className="grid grid-cols-12 gap-4 mb-8">
            
            {/* Left Sidebar (Categories) */}
            <div className="hidden lg:block col-span-2 bg-white rounded-lg shadow-sm p-2 h-full">
                <h3 className="font-bold text-darker px-3 py-2 text-sm uppercase">Categories</h3>
                <ul className="space-y-1">
                    {categories.map(c => (
                        <li key={c.name}>
                            <Link to={`/marketplace?cat=${c.name}`} className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary rounded text-sm transition-colors">
                                <i className={`fas ${c.icon} w-5 text-center`}></i>
                                {c.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Slider (Hero) */}
            <div className="col-span-12 lg:col-span-7 relative bg-darker rounded-lg overflow-hidden shadow-sm h-[300px] lg:h-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-darker to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
                <div className="relative z-20 p-10 h-full flex flex-col justify-center">
                    <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Crypto Exclusive</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Pay with USDT<br/>Shop the World.</h1>
                    <p className="text-gray-300 mb-6 max-w-md">Secure, anonymous, and fast shipping global marketplace. Ledger wallets, Tech, and Fashion.</p>
                    <Link to="/marketplace" className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-bold w-max shadow-lg shadow-primary/30">
                        Start Shopping
                    </Link>
                </div>
            </div>

            {/* Right Side (User/Promo) */}
            <div className="hidden lg:flex col-span-3 flex-col gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Welcome to CryptoMart</p>
                    <div className="flex gap-2 w-full">
                        <Link to="/marketplace" className="flex-1 bg-darker text-white text-xs py-2 rounded hover:bg-primary transition-colors">Join</Link>
                        <Link to="/orders" className="flex-1 bg-gray-100 text-darker text-xs py-2 rounded hover:bg-gray-200">Orders</Link>
                    </div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 shadow-sm flex-1 relative overflow-hidden">
                    <h4 className="font-bold text-yellow-800 relative z-10">Crypto Deals</h4>
                    <p className="text-xs text-yellow-700 relative z-10">Save 20% paying with BNB</p>
                    <i className="fab fa-bitcoin absolute -bottom-4 -right-4 text-8xl text-yellow-200 opacity-50 rotate-12"></i>
                </div>
            </div>
        </div>

        {/* Flash Deals */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-darker">Flash Deals</h2>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-mono">Ending in 02:14:50</span>
                </div>
                <Link to="/marketplace" className="text-sm text-gray-500 hover:text-primary">See All <i className="fas fa-chevron-right text-xs"></i></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flashDeals.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
             <h2 className="text-xl font-bold text-darker mb-4">Just For You</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {products.map(product => (
                     <ProductCard key={product.id} product={product} />
                 ))}
             </div>
             <div className="mt-8 text-center">
                 <Link to="/marketplace" className="inline-block border border-gray-300 bg-white text-gray-700 px-8 py-3 rounded-full hover:bg-gray-50 font-medium">
                     Load More
                 </Link>
             </div>
        </div>

        {/* Trust Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-t border-gray-200">
            <div className="flex items-center gap-4">
                <i className="fas fa-shield-alt text-3xl text-primary"></i>
                <div>
                    <h4 className="font-bold text-darker">Secure Payment</h4>
                    <p className="text-xs text-gray-500">Escrow via Smart Contract</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <i className="fas fa-truck text-3xl text-primary"></i>
                <div>
                    <h4 className="font-bold text-darker">Global Delivery</h4>
                    <p className="text-xs text-gray-500">Ships to 150+ countries</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <i className="fas fa-undo text-3xl text-primary"></i>
                <div>
                    <h4 className="font-bold text-darker">30 Days Return</h4>
                    <p className="text-xs text-gray-500">Money back guarantee</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <i className="fas fa-headset text-3xl text-primary"></i>
                <div>
                    <h4 className="font-bold text-darker">24/7 Support</h4>
                    <p className="text-xs text-gray-500">Real human agents</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};