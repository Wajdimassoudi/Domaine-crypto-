import React from 'react';

const activities = [
    { user: '0x4a...92b', action: 'registered', domain: 'velocity.ai', time: '1s ago' },
    { user: '0x8f...11c', action: 'registered', domain: 'token.io', time: '2s ago' },
    { user: 'CryptoKing', action: 'bought', domain: 'pizza.com', time: '4s ago' },
    { user: '0x1d...ff2', action: 'listed', domain: 'defi.org', time: '5s ago' },
    { user: '0x99...a1a', action: 'registered', domain: 'gpt5.net', time: '8s ago' },
    { user: 'Web3Dev', action: 'renewed', domain: 'wallet.app', time: '12s ago' },
    { user: '0x22...c4d', action: 'registered', domain: 'moon.bsc', time: '15s ago' },
    { user: 'Satoshi_Fan', action: 'bought', domain: 'btc.xyz', time: '18s ago' },
    { user: '0x77...e3e', action: 'registered', domain: 'gemini.ai', time: '20s ago' },
    { user: 'NFT_Collector', action: 'listed', domain: 'art.gallery', time: '22s ago' },
    { user: '0xbb...101', action: 'registered', domain: 'swap.exchange', time: '25s ago' },
    { user: 'DeFi_Whale', action: 'renewed', domain: 'yield.farm', time: '28s ago' },
];

export const LiveActivity: React.FC = () => {
  return (
    <div className="bg-darker border-b border-border py-2 overflow-hidden flex items-center relative z-50">
        <div className="px-4 text-xs font-bold text-primary whitespace-nowrap z-10 bg-darker shadow-[10px_0_20px_#05080F] flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
            LIVE FEED
        </div>
        {/* The container needs to be wide enough. We duplicate the list to create the seamless loop effect. */}
        <div className="flex animate-marquee hover:pause whitespace-nowrap">
            {[...activities, ...activities, ...activities].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mx-6 text-xs text-gray-400">
                    <span className="text-gray-500 font-mono">{item.user}</span>
                    <span className={item.action === 'bought' ? 'text-green-400' : item.action === 'registered' ? 'text-blue-400' : 'text-purple-400'}>
                        {item.action}
                    </span>
                    <span className="text-white font-bold font-mono">{item.domain}</span>
                    <span className="text-gray-600">({item.time})</span>
                    <div className="w-1 h-1 bg-gray-800 rounded-full ml-4"></div>
                </div>
            ))}
        </div>
    </div>
  );
};