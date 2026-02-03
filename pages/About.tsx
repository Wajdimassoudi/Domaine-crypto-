
import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-darker mb-6">The Future of Commerce is <span className="text-primary">Decentralized</span></h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Welcome to <strong>getwealthos.icu</strong>, a premier global marketplace where digital assets meet real-world goods. 
            We bridge the gap between your crypto wallet and the global supply chain, allowing you to spend your digital wealth with total privacy and security.
          </p>
        </div>

        <div className="grid gap-12 mb-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary text-2xl font-bold">1</div>
            <div>
              <h3 className="text-xl font-bold text-darker mb-2">Connect & Browse</h3>
              <p className="text-gray-600">Sync your wallet (MetaMask, TrustWallet, etc.) seamlessly. Browse millions of products from Amazon, Global Distributors, and Custom Merch creators without creating a traditional account.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary text-2xl font-bold">2</div>
            <div>
              <h3 className="text-xl font-bold text-darker mb-2">Secure Crypto Payment</h3>
              <p className="text-gray-600">All transactions are processed through verified smart contracts on the Binance Smart Chain. We accept USDT, BNB, and Bitcoin, ensuring instant settlement and minimal fees compared to traditional credit cards.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary text-2xl font-bold">3</div>
            <div>
              <h3 className="text-xl font-bold text-darker mb-2">Global Fulfillment</h3>
              <p className="text-gray-600">Once payment is confirmed, our automated logistics engine (powered by getwealthos.icu architecture) initiates shipping from global warehouses. You receive a tracking hash directly to your dashboard.</p>
            </div>
          </div>
        </div>

        <div className="bg-darker rounded-3xl p-10 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]"></div>
            <h2 className="text-3xl font-bold mb-4 relative z-10">Why trust us?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
              Unlike traditional stores, we don't store your personal banking data. Your privacy is our priority. Every order is a cryptographically signed agreement between you and <strong>getwealthos.icu</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
                <div className="flex items-center gap-2"><i className="fas fa-shield-alt text-primary"></i> Zero-KYC Policy</div>
                <div className="flex items-center gap-2"><i className="fas fa-lock text-primary"></i> SSL Encrypted</div>
                <div className="flex items-center gap-2"><i className="fas fa-globe text-primary"></i> Worldwide Delivery</div>
            </div>
        </div>
      </div>
    </div>
  );
};
