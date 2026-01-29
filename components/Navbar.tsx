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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user was previously connected
    const savedUser = mockBackend.getCurrentUser();
    if (savedUser) {
        setUser(savedUser);
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Simple mobile detection
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = async () => {
    if (user) {
      // Disconnect
      await web3Service.disconnect();
      mockBackend.disconnect();
      setUser(null);
      showNotification("Wallet disconnected", "info");
    } else {
      // Connect Logic
      try {
          if (isMobile) {
            // STRATEGY 1: Direct Deep Link (As requested by user)
            // This forces the MetaMask/Trust app to open and load the DApp
            const dappUrl = "domaine-crypto.vercel.app"; // Your domain
            const deepLink = `https://metamask.app.link/dapp/${dappUrl}`;
            
            // Try to open standard WalletConnect modal first (better UX if it works)
            // If the user is IN the browser of the wallet, web3Service works.
            // If the user is in Chrome on Android, deepLink is needed.
            if ((window as any).ethereum) {
                 const realUser = await web3Service.connectWallet();
                 finishLogin(realUser);
            } else {
                 // Force open App
                 window.open(deepLink, '_blank');
                 // Also try standard connect in background in case they come back
                 const realUser = await web3Service.connectWallet();
                 finishLogin(realUser);
            }
          } else {
            // Desktop: Open QR Code Modal
            const realUser = await web3Service.connectWallet();
            finishLogin(realUser);
          }
      } catch (error: any) {
          console.error(error);
          // If automatic fail, try generic fallback
          if (!user && isMobile) {
              window.open(`https://metamask.app.link/dapp/domaine-crypto.vercel.app/`, '_blank');
          } else {
              showNotification(error.message || "Connection failed", "error");
          }
      }
    }
  };

  const finishLogin = (realUser: User) => {
      // Save to LocalStorage
      localStorage.setItem('cryptoreg_user_v3', JSON.stringify(realUser));
      setUser(realUser);
      showNotification(`Connected: ${realUser.walletAddress.substring(0,6)}...`, "success");
  }

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
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all ${
                user 
                ? 'bg-surface border border-border hover:border-primary text-gray-300' 
                : 'bg-primary hover:bg-primaryHover text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              <i className={`fas ${user ? 'fa-user-circle' : 'fa-wallet'}`}></i>
              {user ? (
                <span className="text-sm">
                  {user.walletAddress.substring(0,6)}... <span className="text-primary ml-1">({user.balance.BNB} BNB)</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                    {isMobile ? "Open Wallet App" : "Connect Wallet"}
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