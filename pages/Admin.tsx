import React, { useEffect, useState } from 'react';
import { dbService } from '../services/supabaseClient'; // Real DB
import { web3Service } from '../services/web3Service';
import { Domain, TLD } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  
  // Connect and Fetch
  useEffect(() => {
    const init = async () => {
        try {
            // Attempt to get connected user
            const u = await web3Service.connectWallet(); // This checks connection state
            setUser(u);
            
            // Fetch Real Data from Supabase
            const { data, error } = await dbService.getUserDomains(u.walletAddress);
            
            if (error) throw error;

            if (data) {
                // Map Supabase DB schema to UI Domain Type
                const mapped: Domain[] = data.map((row: any) => ({
                    id: row.id.toString(),
                    name: row.domain_name.split('.')[0],
                    // Fix: Cast the string string to any or TLD to satisfy TypeScript
                    tld: ('.' + row.domain_name.split('.').pop()) as any, 
                    fullName: row.domain_name,
                    price: 0, // Owned, price irrelevant
                    currency: 'BNB',
                    isPremium: false,
                    owner: row.buyer_wallet,
                    isListed: false,
                    registrationDate: row.created_at,
                    renewalDate: new Date(new Date(row.created_at).setFullYear(new Date(row.created_at).getFullYear() + (row.years || 1))).toISOString(),
                    views: 0,
                    description: 'Registered Domain',
                    privacyEnabled: true,
                    autoRenew: false,
                    nameservers: row.nameservers || [],
                    dnsRecords: [],
                    forwardingEmail: row.forwarding_email
                }));
                setMyDomains(mapped);
            }
        } catch (e) {
            console.error("Dashboard Load Error:", e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  if (loading) return <div className="min-h-screen pt-32 text-center text-white">Loading Dashboard...</div>;

  if (!user) return (
      <div className="min-h-screen pt-32 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please connect wallet</h2>
          <p className="text-gray-400">Access to dashboard requires authentication.</p>
      </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-darker">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Portfolio</h1>
        <p className="text-gray-400 mb-8">Manage your registered domains on the Blockchain.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDomains.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-surface/30 rounded-2xl border border-dashed border-gray-700">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 text-2xl">
                            <i className="fas fa-folder-open"></i>
                    </div>
                    <p className="text-gray-400 mb-4">You don't own any domains yet.</p>
                    <Link to="/marketplace" className="text-primary hover:underline">Browse Marketplace</Link>
                </div>
            ) : (
                myDomains.map(d => (
                    <div key={d.id} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group relative shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center text-primary text-xl border border-white/5">
                                <i className="fas fa-globe"></i>
                            </div>
                            <div className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 font-bold uppercase">Active</div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{d.fullName}</h3>
                        <p className="text-xs text-gray-500 mb-6">Expires: {new Date(d.renewalDate || '').toLocaleDateString()}</p>
                        
                        <div className="grid grid-cols-1 gap-2">
                             <div className="text-xs text-gray-400 font-mono bg-dark p-2 rounded">
                                 NS: {d.nameservers.join(', ') || 'Default'}
                             </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};