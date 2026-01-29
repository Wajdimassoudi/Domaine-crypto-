import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { dbService } from '../services/supabaseClient';
import { Domain, DnsRecord, Transaction } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [tab, setTab] = useState<'assets' | 'manage' | 'history'>('assets');
  const [manageView, setManageView] = useState<'details' | 'dns' | 'ns' | 'email'>('details');
  const { showNotification } = useNotification();
  
  // DNS Form
  const [recordType, setRecordType] = useState('A');
  const [host, setHost] = useState('@');
  const [value, setValue] = useState('');

  // Email Form
  const [newForward, setNewForward] = useState('');

  useEffect(() => {
    const u = mockBackend.getCurrentUser();
    setUser(u);
    if (u) {
        refreshData(u.walletAddress || u.id);
    }
  }, []);

  const refreshData = async (walletAddress: string) => {
    // 1. Try Supabase First
    const { data: realOrders } = await dbService.getUserDomains(walletAddress);
    
    if (realOrders && realOrders.length > 0) {
        // Map Supabase Orders to Domain Type
        const realDomains: Domain[] = realOrders.map((o: any) => ({
            id: o.id.toString(),
            name: o.domain_name.split('.')[0],
            tld: ('.' + o.domain_name.split('.')[1]) as any,
            fullName: o.domain_name,
            price: o.price,
            currency: o.currency,
            isPremium: false,
            owner: walletAddress,
            isListed: false,
            registrationDate: o.created_at,
            renewalDate: new Date(new Date(o.created_at).setFullYear(new Date(o.created_at).getFullYear() + o.years)).toISOString(),
            views: 0,
            privacyEnabled: true,
            autoRenew: false,
            nameservers: o.nameservers || [],
            dnsRecords: [],
            forwardingEmail: o.forwarding_email
        }));
        setMyDomains(realDomains);
    } else {
        // Fallback to LocalStorage (Legacy/Demo)
        const allDomains = mockBackend.getDomains();
        setMyDomains(allDomains.filter(d => d.owner === user?.id));
    }

    // Load Transactions (Mock for now, easy to switch to DB)
    const allTxs = mockBackend.getTransactions();
    setTransactions(allTxs.filter(t => t.buyer === user?.id).reverse());
  };

  const handleManage = (d: Domain) => {
      setSelectedDomain(d);
      setTab('manage');
      setManageView('details');
  };

  const toggleAutoRenew = () => {
      if (selectedDomain) {
          const updated = { ...selectedDomain, autoRenew: !selectedDomain.autoRenew };
          mockBackend.saveDomain(updated); // Save locally for instant UI update
          setSelectedDomain(updated);
          showNotification(`Auto-renew ${updated.autoRenew ? 'enabled' : 'disabled'}`, 'success');
      }
  };

  const addDnsRecord = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedDomain) {
          const newRecord: DnsRecord = {
              id: Math.random().toString(36).substr(2, 5),
              type: recordType as any,
              host,
              value,
              ttl: 3600
          };
          const updated = { ...selectedDomain, dnsRecords: [...selectedDomain.dnsRecords, newRecord] };
          mockBackend.saveDomain(updated);
          setSelectedDomain(updated);
          setValue('');
          showNotification("DNS Record added successfully", "success");
      }
  };

  const deleteDnsRecord = (recordId: string) => {
      if(selectedDomain) {
           const updated = { ...selectedDomain, dnsRecords: selectedDomain.dnsRecords.filter(r => r.id !== recordId) };
           mockBackend.saveDomain(updated);
           setSelectedDomain(updated);
           showNotification("DNS Record deleted", "info");
      }
  };

  const updateEmailForwarding = () => {
      if (selectedDomain) {
          if (!newForward.includes('@')) {
              showNotification("Invalid email address", "error");
              return;
          }
          const updated = { ...selectedDomain, forwardingEmail: newForward, emailAlias: 'info' };
          mockBackend.saveDomain(updated);
          setSelectedDomain(updated);
          showNotification("Email forwarding updated (SetEmailForwarding)", "success");
      }
  };

  if (!user) return (
      <div className="min-h-screen pt-32 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please connect wallet</h2>
          <p className="text-gray-400">Access to dashboard requires authentication.</p>
      </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-darker">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                    {tab === 'manage' && selectedDomain ? `Manage: ${selectedDomain.fullName}` : 
                     tab === 'history' ? 'Transaction History' : 'My Portfolio'}
                </h1>
                <p className="text-gray-400">
                    {tab === 'manage' ? 'Configure your domain settings.' : 
                     tab === 'history' ? 'View your past purchases and transfers.' : 'Manage your digital assets and DNS settings.'}
                </p>
            </div>
            
            <div className="flex gap-2">
                {tab === 'manage' ? (
                    <button onClick={() => setTab('assets')} className="bg-surface border border-border text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <i className="fas fa-arrow-left mr-2"></i> Back to Assets
                    </button>
                ) : (
                    <>
                         <button onClick={() => setTab('assets')} className={`px-4 py-2 rounded-lg transition-colors font-medium ${tab === 'assets' ? 'bg-primary text-white' : 'bg-surface border border-border text-gray-400 hover:text-white'}`}>
                            Assets
                         </button>
                         <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg transition-colors font-medium ${tab === 'history' ? 'bg-primary text-white' : 'bg-surface border border-border text-gray-400 hover:text-white'}`}>
                            Billing & History
                         </button>
                    </>
                )}
            </div>
        </div>

        {tab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s]">
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
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleManage(d)} className="col-span-2 bg-dark border border-gray-700 text-white py-2.5 rounded-lg hover:bg-primary hover:border-primary transition-colors font-medium">
                                    Manage Domain
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {tab === 'history' && (
             <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-[fadeIn_0.3s]">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead className="bg-darker text-xs text-gray-500 uppercase border-b border-border">
                             <tr>
                                 <th className="px-6 py-4">Transaction ID</th>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Domain</th>
                                 <th className="px-6 py-4">Period</th>
                                 <th className="px-6 py-4">Amount</th>
                                 <th className="px-6 py-4">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                             {transactions.length === 0 ? (
                                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>
                             ) : (
                                 transactions.map(tx => (
                                     <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                         <td className="px-6 py-4 font-mono text-sm text-gray-400">{tx.id}</td>
                                         <td className="px-6 py-4 text-sm text-white">{new Date(tx.date).toLocaleDateString()} <span className="text-gray-500 text-xs">{new Date(tx.date).toLocaleTimeString()}</span></td>
                                         <td className="px-6 py-4 font-bold text-white">{tx.domainName}</td>
                                         <td className="px-6 py-4 text-sm text-gray-300">{tx.years} Year(s)</td>
                                         <td className="px-6 py-4 font-mono text-primary">{tx.amount} {tx.currency}</td>
                                         <td className="px-6 py-4">
                                             <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 font-bold uppercase">
                                                 Confirmed
                                             </span>
                                         </td>
                                     </tr>
                                 ))
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}

        {tab === 'manage' && selectedDomain && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row shadow-2xl animate-[fadeIn_0.3s]">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-dark/50 border-r border-border p-4">
                    <div className="space-y-2">
                        <button onClick={() => setManageView('details')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${manageView === 'details' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                            <i className="fas fa-info-circle w-5"></i> Overview
                        </button>
                        <button onClick={() => setManageView('dns')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${manageView === 'dns' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                            <i className="fas fa-network-wired w-5"></i> DNS Records
                        </button>
                        <button onClick={() => setManageView('ns')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${manageView === 'ns' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                            <i className="fas fa-server w-5"></i> Nameservers
                        </button>
                        <button onClick={() => setManageView('email')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${manageView === 'email' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                            <i className="fas fa-envelope w-5"></i> Email Forwarding
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-8">
                    {manageView === 'details' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s]">
                            <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Domain Overview</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-dark p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-sm mb-1">Status</div>
                                    <div className="text-green-400 font-bold flex items-center gap-2"><i className="fas fa-check-circle"></i> Active</div>
                                </div>
                                <div className="bg-dark p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-sm mb-1">Registration Date</div>
                                    <div className="text-white font-mono">{new Date(selectedDomain.registrationDate || '').toLocaleDateString()}</div>
                                </div>
                                <div className="bg-dark p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-sm mb-1">Auto-Renewal</div>
                                    <div className="flex items-center justify-between">
                                        <span className={selectedDomain.autoRenew ? "text-white" : "text-gray-500"}>{selectedDomain.autoRenew ? "On" : "Off"}</span>
                                        <button onClick={toggleAutoRenew} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedDomain.autoRenew ? 'bg-primary' : 'bg-gray-600'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedDomain.autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-dark p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-sm mb-1">Privacy Protection</div>
                                    <div className="text-white flex items-center gap-2">
                                        {selectedDomain.privacyEnabled ? <i className="fas fa-lock text-green-400"></i> : <i className="fas fa-lock-open text-red-400"></i>}
                                        {selectedDomain.privacyEnabled ? "Enabled" : "Disabled"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {manageView === 'dns' && (
                         <div className="space-y-8 animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                                <h3 className="text-xl font-bold text-white">DNS Management</h3>
                                <button className="text-xs text-primary hover:underline">Restore Defaults</button>
                            </div>

                            {/* Add Record */}
                            <form onSubmit={addDnsRecord} className="bg-dark/50 p-4 rounded-xl border border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Type</label>
                                    <select value={recordType} onChange={e => setRecordType(e.target.value)} className="w-full bg-dark border border-gray-600 rounded p-2 text-white outline-none">
                                        <option value="A">A Record</option>
                                        <option value="CNAME">CNAME</option>
                                        <option value="MX">MX</option>
                                        <option value="TXT">TXT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Host</label>
                                    <input value={host} onChange={e => setHost(e.target.value)} className="w-full bg-dark border border-gray-600 rounded p-2 text-white outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Value</label>
                                    <input required value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 192.168.1.1" className="w-full bg-dark border border-gray-600 rounded p-2 text-white outline-none" />
                                </div>
                                <button type="submit" className="bg-primary hover:bg-primaryHover text-white p-2 rounded font-bold transition-colors">Add</button>
                            </form>

                            {/* Table */}
                            <div className="border border-gray-700 rounded-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-dark">
                                        <tr>
                                            <th className="px-4 py-3 text-xs text-gray-400 uppercase">Type</th>
                                            <th className="px-4 py-3 text-xs text-gray-400 uppercase">Host</th>
                                            <th className="px-4 py-3 text-xs text-gray-400 uppercase">Value</th>
                                            <th className="px-4 py-3 text-xs text-gray-400 uppercase">TTL</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {selectedDomain.dnsRecords.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No custom records found.</td></tr>
                                        ) : (
                                            selectedDomain.dnsRecords.map(r => (
                                                <tr key={r.id} className="hover:bg-white/5">
                                                    <td className="px-4 py-3 text-sm font-bold text-white">{r.type}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">{r.host}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-300 font-mono break-all">{r.value}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{r.ttl}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => deleteDnsRecord(r.id)} className="text-red-400 hover:text-red-300"><i className="fas fa-trash"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}

                    {manageView === 'ns' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s]">
                            <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Nameservers (GetDns)</h3>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                These values are synchronized via Dynadot API (SetNameservers).
                            </div>
                            
                            <div className="space-y-4">
                                {selectedDomain.nameservers.map((ns, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <span className="text-gray-500 w-8">NS{idx + 1}</span>
                                        <input readOnly value={ns} className="flex-grow bg-dark border border-gray-600 rounded p-3 text-white outline-none focus:border-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {manageView === 'email' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s]">
                            <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Email Forwarding (GetEmailForwarding)</h3>
                            
                            <div className="bg-surface border border-gray-700 rounded-xl p-6">
                                <div className="mb-6">
                                    <div className="text-sm text-gray-400 mb-1">Current Forwarding</div>
                                    <div className="text-xl text-white font-mono">
                                        {selectedDomain.forwardingEmail ? (
                                            <span className="flex items-center gap-2">
                                                info@{selectedDomain.fullName} <i className="fas fa-arrow-right text-gray-600 text-sm"></i> {selectedDomain.forwardingEmail}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 italic">Not configured</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-6">
                                    <label className="block text-sm font-bold text-white mb-2">Update Destination</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="email" 
                                            placeholder="new-email@gmail.com" 
                                            value={newForward} 
                                            onChange={e => setNewForward(e.target.value)} 
                                            className="flex-grow bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                                        />
                                        <button onClick={updateEmailForwarding} className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-bold">Update</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};