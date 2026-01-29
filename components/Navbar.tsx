import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { web3Service } from '../services/web3Service';
import { User } from '../types';
import { GasTracker } from './GasTracker';
import { useNotification } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user was previously connected in local storage
    const savedUser = mockBackend.getCurrentUser();
    if (savedUser) {
        setUser(savedUser);
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = async () => {
    if (loading) return;

    if (user) {
      // Disconnect Logic
      setLoading(true);
      try {
          await web3Service.disconnect();
          mockBackend.disconnect();
          setUser(null);
          showNotification("Wallet disconnected", "info");
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
    } else {
      // Connect Logic
      setLoading(true);
      try {
          const realUser = await web3Service.connectWallet();
          
          // Save session
          localStorage.setItem('cryptoreg_user_v3', JSON.stringify(realUser));
          setUser(realUser);
          showNotification(`Connected: ${realUser.walletAddress.substring(0,6)}...`, "success");
      } catch (error: any) {
          console.error("Auth Error:", error);
          if (!error.message?.includes("cancelled")) {
              showNotification(error.message || "Connection failed", "error");
          }
      } finally {
          setLoading(false);
      }
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-darker/90 backdrop-blur-lg border-b border-border shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg transform group-hover:rotate-12 transition-transform">
                C
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                Crypto<span className="text-primary">Reg</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/marketplace" current={location.pathname}>Marketplace</NavLink>
              <NavLink to="/transfer" current={location.pathname}>Transfer</NavLink>
              {user && <NavLink to="/admin" current={location.pathname}>My Domains</NavLink>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <GasTracker />
            <button
              onClick={handleAuth}
              disabled={loading}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all ${
                user 
                ? 'bg-surface border border-border hover:border-primary text-gray-300' 
                : 'bg-primary hover:bg-primaryHover text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              } ${loading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
              ) : (
                  <i className={`fas ${user ? 'fa-user-circle' : 'fa-wallet'}`}></i>
              )}
              
              {user ? (
                <span className="text-sm">
                  {user.walletAddress.substring(0,6)}... <span className="text-primary ml-1">({user.balance.BNB} BNB)</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                    Connect Wallet
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string, current: string, children: React.ReactNode }> = ({ to, current, children }) => (
  <Link 
    to={to} 
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      current === to 
      ? 'text-white bg-white/5' 
      : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {children}
  </Link>
);