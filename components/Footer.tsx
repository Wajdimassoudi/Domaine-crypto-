
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
         <div>
            <span className="text-xl font-bold text-darker mb-4 block">Crypto<span className="text-primary">Mart</span></span>
            <p className="text-sm text-gray-500">The premier global marketplace for crypto payments via <strong>getwealthos.icu</strong> architecture. Secure, fast, and boundless.</p>
         </div>
         <div>
             <h4 className="font-bold text-darker mb-4">Shop</h4>
             <ul className="space-y-2 text-sm text-gray-500">
                 <li><Link to="/marketplace?cat=Electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
                 <li><Link to="/marketplace?cat=Fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
                 <li><Link to="/marketplace?cat=Home" className="hover:text-primary transition-colors">Home & Living</Link></li>
             </ul>
         </div>
         <div>
             <h4 className="font-bold text-darker mb-4">Corporate</h4>
             <ul className="space-y-2 text-sm text-gray-500">
                 <li><Link to="/about" className="hover:text-primary transition-colors font-medium">How it works</Link></li>
                 <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Privacy</Link></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
             </ul>
         </div>
         <div>
             <h4 className="font-bold text-darker mb-4">We Accept</h4>
             <div className="flex gap-2">
                 <i className="fab fa-bitcoin text-2xl text-yellow-500"></i>
                 <i className="fas fa-coins text-2xl text-yellow-500"></i>
                 <span className="font-bold text-green-500 text-lg">USDT</span>
             </div>
             <p className="text-[10px] text-gray-400 mt-4 italic">Certified by WealthOS Secure Audit.</p>
         </div>
      </div>
      <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-8">
         &copy; 2024 CryptoMart Inc. Powered by <a href="https://getwealthos.icu" className="hover:text-primary">getwealthos.icu</a>. All rights reserved.
      </div>
    </footer>
  );
};
