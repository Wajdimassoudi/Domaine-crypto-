import React from 'react';
import { Domain } from '../types';
import { Link } from 'react-router-dom';

interface DomainCardProps {
  domain: Domain;
}

export const DomainCard: React.FC<DomainCardProps> = ({ domain }) => {
  return (
    <div className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 relative">
      {domain.isPremium && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500/20 to-transparent pl-8 pb-8 pt-3 pr-3 rounded-bl-3xl">
          <i className="fas fa-crown text-yellow-500 text-sm"></i>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-darker px-3 py-1 rounded text-xs font-mono text-gray-400 border border-border">
            {domain.tld}
          </div>
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-1 truncate">
          {domain.name}<span className="text-gray-500">{domain.tld}</span>
        </h3>
        
        <p className="text-gray-500 text-xs mb-6 line-clamp-2 min-h-[2.5em]">
          {domain.description || "Premium domain available for immediate transfer."}
        </p>

        <div className="flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">BEP20 Price</p>
            <div className="flex items-center gap-1.5 text-white font-bold text-lg">
               {domain.currency === 'BNB' && <i className="fas fa-coins text-yellow-500 text-sm"></i>}
               {(domain.currency === 'BUSD' || domain.currency === 'USDT') && <span className="text-green-500 text-sm">$</span>}
               {domain.price.toLocaleString()} <span className="text-xs text-gray-500 font-normal">{domain.currency}</span>
            </div>
          </div>
          
          {domain.owner ? (
             <span className="text-sm font-medium text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg">
               Taken
             </span>
          ) : (
            <Link 
              to={`/domain/${domain.id}`}
              className="bg-white/5 hover:bg-primary hover:text-white text-primary border border-primary/30 hover:border-primary px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};