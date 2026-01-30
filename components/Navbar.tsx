import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { web3Service } from '../services/web3Service';
import { User } from '../types';
import { GasTracker } from './GasTracker';
import { useNotification } from '../context/NotificationContext';
import { mockBackend } from '../services/mockBackend';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    // User Load
    const savedUser = localStorage.getItem('cryptoreg_user_v3');
    if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) {}

    // Cart Load & Listen
    const updateCart = () => {
        const cart = mockBackend.getCart();
        const count = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(count);
    };
    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      navigate(`/marketplace?q=${search}&cat=${category}`);
  };

  const handleAuth = async () => {
    if (loading) return;
    if (user) {
      setLoading(true);
      try {
          await web3Service.disconnect();
          localStorage.removeItem('cryptoreg_user_v3');
          setUser(null);
          showNotification("Wallet disconnected", "info");
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    } else {
      setLoading(true);
      try {
          const realUser = await web3Service.connectWallet();
          if (realUser && realUser.walletAddress) {
              localStorage.setItem('cryptoreg_user_v3', JSON.stringify(realUser));
              setUser(realUser);
              showNotification(`Welcome! ${realUser.walletAddress.substring(0,6)}...`, "success");
          }
      } catch (error: any) {
          showNotification(error.message || "Connection failed", "error");
      } finally { setLoading(false); }
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-darker border-b border-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group min-w-max">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center text-darker font-bold text-xl transform group-hover:rotate-12 transition-transform">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight hidden md:block">
              Crypto<span className="text-primary">Mart</span>
            </span>
          </Link>

          {/* Search Bar - Amazon Style */}
          <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden sm:flex">
             <div className="flex w-full bg-white rounded-lg overflow-hidden border-2 border-primary/50 focus-within:border-primary transition-colors">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-100 text-gray-700 px-3 py-2 text-sm border-r border-gray-300 outline-none hover:bg-gray-200 cursor-pointer max-w-[120px]"
                >
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Crypto Hardware">Crypto Hardware</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className="flex-grow px-4 py-2 text-darker outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="bg-primary hover:bg-primaryHover text-white px-6 font-bold">
                    <i className="fas fa-search"></i>
                </button>
             </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4 min-w-max">
            <GasTracker />
            
            <Link to="/cart" className="relative group p-2">
                <i className="fas fa-shopping-cart text-2xl text-gray-300 group-hover:text-primary transition-colors"></i>
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-darker">
                        {cartCount}
                    </span>
                )}
                <div className="hidden group-hover:block absolute top-full right-0 text-xs text-white bg-darker p-2 rounded border border-border mt-2 whitespace-nowrap">
                    View Cart
                </div>
            </Link>

            {user && (
                 <Link to="/orders" className="text-gray-300 hover:text-white flex flex-col items-center text-xs">
                    <span className="font-bold">My Orders</span>
                 </Link>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                user 
                ? 'bg-surface border border-border hover:border-primary text-gray-300' 
                : 'bg-primary hover:bg-primaryHover text-white'
              }`}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${user ? 'fa-user' : 'fa-wallet'}`}></i>}
              {user ? (
                  <span className="flex flex-col items-start leading-none">
                      <span>{user.username}</span>
                      <span className="text-[10px] text-primary">{user.balance.USDT} USDT</span>
                  </span>
              ) : 'Connect'}
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="sm:hidden pb-4">
             <form onSubmit={handleSearch} className="flex w-full bg-white rounded-lg overflow-hidden border border-primary">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="flex-grow px-4 py-2 text-darker outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white px-4">
                    <i className="fas fa-search"></i>
                </button>
             </form>
        </div>
      </div>
      
      {/* Category Strip */}
      <div className="bg-surface border-t border-border hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm py-2 overflow-x-auto">
              <Link to="/marketplace?cat=All" className="text-white font-bold hover:text-primary">All</Link>
              <Link to="/marketplace?cat=Electronics" className="text-gray-400 hover:text-white">Electronics</Link>
              <Link to="/marketplace?cat=Fashion" className="text-gray-400 hover:text-white">Fashion</Link>
              <Link to="/marketplace?cat=Home" className="text-gray-400 hover:text-white">Home & Garden</Link>
              <Link to="/marketplace?cat=Crypto Hardware" className="text-gray-400 hover:text-white">Crypto Hardware</Link>
              <Link to="/marketplace?cat=Beauty" className="text-gray-400 hover:text-white">Beauty</Link>
              <div className="flex-grow"></div>
              <span className="text-primary font-bold"><i className="fas fa-bolt"></i> Flash Deals</span>
          </div>
      </div>
    </nav>
  );
};