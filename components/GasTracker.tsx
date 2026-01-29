import React, { useState, useEffect } from 'react';

export const GasTracker: React.FC = () => {
  const [gwei, setGwei] = useState(3);
  const [bnbPrice, setBnbPrice] = useState(320);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate BSC fluctuation (usually lower and more stable than ETH)
      setGwei(prev => Math.max(1, Math.min(7, prev + (Math.random() > 0.5 ? 0.2 : -0.2))));
      setBnbPrice(prev => prev + (Math.random() - 0.5) * 1.5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-darker/50 border border-border rounded-full px-4 py-1.5 text-gray-400">
        <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
            <i className="fas fa-network-wired"></i> BSC Mainnet
        </div>
        <div className="w-px h-3 bg-gray-700"></div>
        <div className="flex items-center gap-1.5" title="BSC Gas (Gwei)">
            <i className="fas fa-gas-pump text-primary"></i>
            <span className="text-green-400">{gwei.toFixed(1)} Gwei</span>
        </div>
        <div className="w-px h-3 bg-gray-700"></div>
        <div className="flex items-center gap-1.5">
            <span className="font-bold text-yellow-500">BNB</span>
            <span>${bnbPrice.toFixed(2)}</span>
        </div>
    </div>
  );
};