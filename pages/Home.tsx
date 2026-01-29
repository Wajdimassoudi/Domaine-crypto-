import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Domain } from '../types';
import { DomainCard } from '../components/DomainCard';
import { LiveActivity } from '../components/LiveActivity';

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Domain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTld, setActiveTld] = useState('.com');
  const navigate = useNavigate();

  useEffect(() => {
    const all = mockBackend.getDomains();
    setFeatured(all.filter(d => d.isListed).slice(0, 4));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const tlds = ['.com', '.net', '.io', '.ai', '.org'];

  return (
    <div className="min-h-screen">
      <div className="fixed top-20 w-full z-40">
        <LiveActivity />
      </div>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-darker">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-darker to-darker opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-float"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              The Web3 Registrar
            </div>
            <h1 className="text-5xl font-display font-bold tracking-tight text-white sm:text-7xl mb-6">
              Claim your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Web2 Identity</span> with Crypto.
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              Buy, sell, and manage standard domains (.com, .net, .io) using BNB, BUSD, or USDT. No credit card required. Pure anonymity on BSC.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500 animate-gradient-x"></div>
                <div className="relative bg-surface rounded-xl p-2 flex items-center shadow-2xl border border-white/5">
                    <input 
                        type="text" 
                        placeholder="Search for your perfect domain name..." 
                        className="w-full bg-transparent border-none text-white px-4 py-3 text-lg focus:outline-none placeholder-gray-500 font-display"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center gap-1 pr-2 border-r border-gray-700 mr-2">
                        {tlds.map(tld => (
                            <button 
                                key={tld} 
                                type="button" 
                                onClick={() => setActiveTld(tld)}
                                className={`text-xs px-2 py-1 rounded hover:bg-white/10 ${activeTld === tld ? 'text-white bg-white/10' : 'text-gray-500'}`}
                            >
                                {tld}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-primary/20">
                        Search
                    </button>
                </div>
            </form>
            
            <p className="mt-4 text-sm text-gray-500">
                Trending: <span className="text-gray-300 cursor-pointer hover:text-primary transition-colors">ai.com</span>, <span className="text-gray-300 cursor-pointer hover:text-primary transition-colors">crypto.net</span>, <span className="text-gray-300 cursor-pointer hover:text-primary transition-colors">meta.io</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-surface/50 border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div className="text-4xl font-bold text-white font-display mb-1">125K+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Domains Registered</div>
            </div>
            <div>
                <div className="text-4xl font-bold text-white font-display mb-1">$42M+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Trading Volume</div>
            </div>
             <div>
                <div className="text-4xl font-bold text-white font-display mb-1">8K+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Unique Wallets</div>
            </div>
             <div>
                <div className="text-4xl font-bold text-white font-display mb-1">0.5s</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Avg Transfer Time</div>
            </div>
        </div>
      </div>

      {/* TLD Strip */}
      <div className="bg-dark/50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-12">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {['.com', '.net', '.org', '.io', '.ai', '.app'].map(ext => (
                   <div key={ext} className="text-center group cursor-pointer">
                       <span className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">{ext}</span>
                   </div>
               ))}
           </div>
        </div>
      </div>

      {/* Featured Grid */}
      <div className="py-24 bg-darker">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h2 className="text-3xl font-display font-bold text-white">Premium Listings</h2>
                <p className="text-gray-400 mt-2">Exclusive domains available for immediate transfer.</p>
             </div>
             <Link to="/marketplace" className="text-primary hover:text-white transition-colors font-medium">View Market <i className="fas fa-arrow-right ml-2"></i></Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-surface border-y border-border relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]"></div>
         <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mx-auto mb-6">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Instant Transfer</h3>
                    <p className="text-gray-400">Domains are pushed to your registrar account immediately after blockchain confirmation.</p>
                </div>
                <div className="p-6">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary text-3xl mx-auto mb-6">
                        <i className="fas fa-user-secret"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">100% Anonymous</h3>
                    <p className="text-gray-400">No personal data required. Just a wallet address and an email for domain control.</p>
                </div>
                <div className="p-6">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mx-auto mb-6">
                        <i className="fas fa-coins"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Crypto Native</h3>
                    <p className="text-gray-400">We accept BNB, USDT, and BUSD. Low gas fees and secure escrow on BSC.</p>
                </div>
            </div>
         </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-darker">
          <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-display font-bold text-white">Frequently Asked Questions</h2>
                  <p className="text-gray-400 mt-2">Everything you need to know about decentralized domain registration.</p>
              </div>
              <div className="space-y-4">
                  <div className="bg-surface border border-border rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-2">Do I truly own the domain?</h3>
                      <p className="text-gray-400">Yes. When you purchase a domain on CryptoReg, the ownership is transferred to your account instantly. We act as a custody agent until you transfer it out to another registrar, or you can manage DNS directly here.</p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-2">Which cryptocurrencies do you accept?</h3>
                      <p className="text-gray-400">We exclusively operate on the Binance Smart Chain (BSC). We accept BNB, BUSD, and USDT (BEP20). Ensure you are on the BSC network to avoid fund loss.</p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-2">How does the transfer process work?</h3>
                      <p className="text-gray-400">If you already own a domain, go to the 'Transfer' page, enter the domain and Auth Code. Once the blockchain transaction confirms the fee, we automate the EPP transfer process which takes 5-7 days.</p>
                  </div>
                   <div className="bg-surface border border-border rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-2">Is there a renewal fee?</h3>
                      <p className="text-gray-400">Yes, standard TLDs (.com, .net, etc.) have annual registry fees. You can pay these fees in crypto via your dashboard. We send reminders to your wallet notifications.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};