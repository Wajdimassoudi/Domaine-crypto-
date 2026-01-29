import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-darker border-t border-surface py-12">
      <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
        <div className="mb-4">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            CryptoDomains
          </span>
        </div>
        <p className="text-sm mb-6">The world's first AI-powered decentralized domain exchange.</p>
        <div className="flex justify-center gap-6 text-lg mb-8">
          <a href="#" className="hover:text-primary"><i className="fab fa-twitter"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-discord"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-github"></i></a>
        </div>
        <p className="text-xs">&copy; 2024 CryptoDomains. Powered by Puter.js v2.</p>
      </div>
    </footer>
  );
};