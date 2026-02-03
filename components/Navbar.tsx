
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { web3Service } from '../services/web3Service';
import { User } from '../types';
import { GasTracker } from './GasTracker';
import { useNotification } from '../context/NotificationContext';
import { mockBackend } from '../services/mockBackend';
import { dbService } from '../services/supabaseClient';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    // Apply theme
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#f3f4f6';
      document.body.style.color = '#111827';
    } else {
      document.body.classList.remove('light-mode');
      document.body.style.backgroundColor = '#05080F';
      document.body.style.color = '#E2E8F0';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cryptoreg_user_v3');
    if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) {}

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
              dbService.upsertUser(realUser).catch(err => console.error("Tracking Error:", err));
              showNotification(`Welcome! ${realUser.walletAddress.substring(0,6)}...`, "success");
          }
      } catch (error: any) {
          showNotification(error.message || "Connection failed", "error");
      } finally { setLoading(false); }
    }
  };

  const menuCategories = [
    'Smartphones', 'Computers', 'Home & TV', 'Fashion', 'Jewelry & Watches', 'Gaming & Play', 'Beauty & Health', 'Crypto Hardware'
  ];

  return (
    <nav className={`fixed w-full z-50 border-b shadow-xl transition-colors duration-300 ${theme === 'dark' ? 'bg-darker border-border' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          <Link to="/" className="flex items-center gap-2 group min-w-max">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center text-darker font-bold text-xl transform group-hover:rotate-12 transition-transform">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <span className={`text-2xl font-display font-bold tracking-tight hidden md:block ${theme === 'dark' ? 'text-white' : 'text-darker'}`}>
              Crypto<span className="text-primary">Mart</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden sm:flex">
             <div className="flex w-full bg-white rounded-lg overflow-hidden border-2 border-primary/50 focus-within:border-primary transition-colors">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-100 text-gray-700 px-3 py-2 text-sm border-r border-gray-300 outline-none hover:bg-gray-200 cursor-pointer max-w-[120px]"
                >
                    <option value="All">Categories</option>
                    {menuCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input 
                    type="text" 
                    placeholder="Search thousands of products..." 
                    className="flex-grow px-4 py-2 text-darker outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="bg-primary hover:bg-primaryHover text-white px-6 font-bold">
                    <i className="fas fa-search"></i>
                </button>
             </div>
          </form>

          <div className="flex items-center gap-4 min-w-max">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-surface' : 'text-gray-500 hover:bg-gray-100'}`}>
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </button>

            <GasTracker />
            
            <Link to="/cart" className="relative group p-2">
                <i className={`fas fa-shopping-cart text-2xl group-hover:text-primary transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}></i>
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-darker">
                        {cartCount}
                    </span>
                )}
            </Link>

            <button
              onClick={handleAuth}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                user 
                ? (theme === 'dark' ? 'bg-surface border border-border text-gray-300' : 'bg-gray-100 border border-gray-200 text-gray-700') 
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
      </div>
      
      <div className={`border-t transition-colors duration-300 hidden md:block ${theme === 'dark' ? 'bg-surface border-border' : 'bg-gray-50 border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm py-2 overflow-x-auto">
              <Link to="/marketplace?cat=All" className={`font-bold hover:text-primary ${theme === 'dark' ? 'text-white' : 'text-darker'}`}>All</Link>
              {menuCategories.slice(0, 6).map(cat => (
                  <Link key={cat} to={`/marketplace?cat=${cat}`} className={`hover:text-primary ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{cat}</Link>
              ))}
              <div className="flex-grow"></div>
              <span className="text-primary font-bold animate-pulse"><i className="fas fa-bolt"></i> Live Discounts</span>
          </div>
      </div>
    </nav>
  );
};
