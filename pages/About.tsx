
import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-white selection:bg-primary selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20 animate-[fadeIn_0.8s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-darker mb-8 tracking-tighter">
            E-Commerce, <span className="text-primary">Redefined</span>.
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
            At <strong>getwealthos.icu</strong>, we are building the world's most robust bridge between digital wealth and the global supply chain. 
            Shopping with Crypto is no longer a niche—it's the new standard for privacy and freedom.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    <i className="fas fa-fingerprint"></i>
                </div>
                <h3 className="text-xl font-bold text-darker mb-4">Zero-KYC Protocol</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    We believe in your right to privacy. Our platform architecture at <strong>getwealthos.icu</strong> ensures that you can browse, buy, and ship millions of items without ever uploading your ID or sensitive banking documents.
                </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                    <i className="fas fa-shield-halved"></i>
                </div>
                <h3 className="text-xl font-bold text-darker mb-4">Smart Contract Escrow</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Every transaction is protected by decentralized logic. Your funds are secured until the logistics chain confirms fulfillment. We leverage the power of BSC (Binance Smart Chain) for instant, low-fee settlements.
                </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-darker text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-darker/30 group-hover:scale-110 transition-transform">
                    <i className="fas fa-globe-americas"></i>
                </div>
                <h3 className="text-xl font-bold text-darker mb-4">Direct Fulfillment</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    By partnering with global giants like Amazon and high-end Print-on-Demand providers, we ensure that your product reaches your doorstep in 150+ countries with full tracking visibility.
                </p>
            </div>
        </div>

        <div className="bg-darker rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] -mr-48 -mt-48"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">The WealthOS Ecosystem</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Operating under the <strong>getwealthos.icu</strong> ecosystem means high-availability, enterprise-grade security, and 24/7 automated monitoring. 
                        We don't just sell products; we provide a sovereign financial experience.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-primary">
                            <i className="fas fa-check-circle"></i>
                            <span className="text-white font-medium">SSL Encrypted Communication</span>
                        </div>
                        <div className="flex items-center gap-4 text-primary">
                            <i className="fas fa-check-circle"></i>
                            <span className="text-white font-medium">Multi-Layer Fraud Prevention</span>
                        </div>
                        <div className="flex items-center gap-4 text-primary">
                            <i className="fas fa-check-circle"></i>
                            <span className="text-white font-medium">Global Warehouse Redundancy</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Network Status</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">Live</span>
                    </div>
                    <div className="space-y-6">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[99.9%] bg-primary"></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Logistics Latency</span>
                            <span className="text-white font-mono">1.2ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Crypto Confirmation</span>
                            <span className="text-white font-mono">&lt; 3s</span>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-center text-gray-500 text-xs italic">"Empowering the next generation of digital-first consumers."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
