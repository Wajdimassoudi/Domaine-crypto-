import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { dynadot } from '../services/dynadotService';
import { web3Service } from '../services/web3Service';
import { dbService } from '../services/supabaseClient';
import { Domain } from '../types';
import { useNotification } from '../context/NotificationContext';

export const DomainDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [privacy, setPrivacy] = useState(true);
  
  // Registration Configuration State
  const [years, setYears] = useState(1);
  const [ns1, setNs1] = useState('');
  const [ns2, setNs2] = useState('');
  const [enableEmail, setEnableEmail] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  // Payment State
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    if (!id) return;
    const d = mockBackend.getDomainById(id);
    if (d) {
        setDomain(d);
        setPrivacy(true);
        dynadot.checkDomain(d.fullName);
    }
    // Try to get wallet from storage
    setUser(mockBackend.getCurrentUser());
  }, [id]);

  const handleBuy = async () => {
    try {
        // Force connect real wallet to ensure we have fresh data
        const realUser = await web3Service.connectWallet();
        
        // Update storage so Navbar updates too
        localStorage.setItem('cryptoreg_user_v3', JSON.stringify(realUser));
        
        setUser(realUser);
        setShowModal(true);
    } catch (e: any) {
        showNotification(e.message, "error");
    }
  };

  const processPayment = async () => {
    // 1. Validation
    if (!ns1 || !ns2) {
        showNotification("Custom Nameservers are required.", "error");
        return;
    }
    if (enableEmail && !targetEmail.includes('@')) {
        showNotification("Please enter a valid email.", "error");
        return;
    }
    if (!domain) return;

    setProcessing(true);

    try {
        // 2. Real Payment via Blockchain
        const totalCost = domain.price * years;
        
        // MVP: Currently we force BNB payment in web3Service even if currency is USDT
        // In a real app, we'd have a switch statement here.
        // Warn user if they are trying to pay USDT/BUSD that we only take BNB for MVP
        if (domain.currency !== 'BNB') {
             // Optional: Alert user "Converting price to BNB..."
        }
        
        const payment = await web3Service.sendPayment(totalCost, domain.currency);
        
        if (!payment || !payment.success) {
            throw new Error(payment?.error || "Payment Failed");
        }

        setTxHash(payment.hash || '');
        showNotification("Payment Sent! Waiting for confirmation...", "info");
        
        // Wait for blockchain confirmation
        if(payment.wait) await payment.wait();

        setStep(2); // Move to Processing screen

        // 3. Execute Dynadot Logic via Proxy
        const regRes = await dynadot.registerDomain(domain.fullName, years);
        if(!regRes.success) throw new Error("Registration command failed at Registrar.");

        await dynadot.setNameservers(domain.fullName, ns1, ns2);
        if (enableEmail) {
            await dynadot.setEmailForwarding(domain.fullName, 'info', targetEmail);
        }
        await dynadot.setPrivacy(domain.fullName);

        // 4. Save to Real Database (Supabase)
        const orderData = {
            domain_name: domain.fullName,
            buyer_wallet: user?.walletAddress || 'unknown',
            price: totalCost,
            currency: domain.currency,
            years: years,
            nameservers: [ns1, ns2],
            tx_hash: payment.hash || '',
            forwarding_email: targetEmail,
            created_at: new Date().toISOString()
        };

        // Try Supabase
        const { error } = await dbService.createOrder(orderData);
        
        // Also Save to LocalStorage for immediate UI feedback without refresh
        mockBackend.purchaseDomain(domain.id, years, [ns1, ns2], { enabled: enableEmail, email: targetEmail });

        if (error) console.error("DB Save Error:", error);

        setProcessing(false);
        setStep(3); // Success

    } catch (err: any) {
        console.error(err);
        showNotification(err.message || "Transaction failed", "error");
        setProcessing(false);
    }
  };

  if (!domain) return <div className="text-white text-center pt-32">Domain not found.</div>;

  const totalCost = domain.price * years;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-darker">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
          <i className="fas fa-arrow-left"></i> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${domain.isListed ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
                                {domain.isListed ? 'Available' : 'Registered'}
                            </span>
                            {domain.isPremium && <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">Premium</span>}
                            <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-gray-700">BEP20</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2">{domain.name}<span className="text-gray-500">{domain.tld}</span></h1>
                        <p className="text-gray-400 text-lg max-w-2xl">{domain.description}</p>
                        
                        <div className="mt-6 flex items-center gap-2 text-green-400 text-sm">
                            <i className="fas fa-check-circle"></i> CheckDomain API: Available
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-8">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Registrar</span>
                            <span className="text-white font-medium">CryptoReg LLC (Via Dynadot)</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Network</span>
                            <span className="text-yellow-500 font-medium font-mono">Binance Smart Chain</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
                <div className="bg-surface border border-border rounded-2xl p-6 sticky top-24">
                    <div className="text-center mb-6">
                        <span className="text-gray-400 text-sm">Starting at</span>
                        <div className="text-4xl font-bold text-white mt-2 flex items-center justify-center gap-2">
                             {domain.price.toLocaleString()} <span className="text-2xl text-gray-500">{domain.currency}</span>
                        </div>
                    </div>

                    {!domain.isListed ? (
                        <div className="bg-red-500/10 text-red-500 text-center py-4 rounded-xl font-bold border border-red-500/20">
                            Currently Unavailable
                        </div>
                    ) : (
                        <button 
                            onClick={handleBuy}
                            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4"
                        >
                            Configure & Buy
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>

            {step === 1 && (
                <>
                    <h3 className="text-2xl font-bold text-white mb-6">Configuration</h3>
                    
                    {/* Nameservers */}
                    <div className="mb-6">
                        <label className="block text-white text-sm mb-2 font-bold flex justify-between">
                            <span>Custom Nameservers <span className="text-red-500">*</span></span>
                            <span className="text-xs text-gray-400 font-normal">Required for setup</span>
                        </label>
                        <div className="space-y-3">
                            <input type="text" placeholder="ns1.hosting.com" value={ns1} onChange={e => setNs1(e.target.value)}
                                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none" />
                            <input type="text" placeholder="ns2.hosting.com" value={ns2} onChange={e => setNs2(e.target.value)}
                                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-6 border-t border-gray-700 pt-6">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input type="checkbox" checked={enableEmail} onChange={e => setEnableEmail(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-dark" />
                            <span className="text-white font-bold text-sm">Enable Free Email Forwarding</span>
                        </label>
                        {enableEmail && (
                            <input type="email" placeholder="your-gmail@gmail.com" value={targetEmail} onChange={e => setTargetEmail(e.target.value)}
                                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary outline-none text-sm" />
                        )}
                    </div>

                    {/* Years */}
                    <div className="mb-6 border-t border-gray-700 pt-6">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">Duration</span>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(y => (
                                    <button key={y} onClick={() => setYears(y)} className={`px-3 py-1 rounded border text-xs font-bold ${years === y ? 'bg-primary border-primary text-white' : 'border-gray-600 text-gray-400'}`}>
                                        {y} Yr
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="flex justify-between items-center text-xl font-bold text-white">
                            <span>Total Due:</span>
                            <span>{totalCost.toLocaleString()} {domain.currency}</span>
                         </div>
                    </div>

                    <button onClick={processPayment} disabled={processing} className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
                        {processing ? <i className="fas fa-spinner fa-spin"></i> : `Confirm & Pay with Crypto Wallet`}
                    </button>
                </>
            )}

            {step === 2 && (
                <div className="text-center py-12">
                     <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                     <h3 className="text-xl font-bold text-white mb-2">Processing Transaction...</h3>
                     <p className="text-sm text-gray-500 mb-4 font-mono">{txHash ? txHash.substring(0, 20) + '...' : 'Waiting for signature...'}</p>
                     <div className="space-y-2 text-sm text-gray-400 text-left max-w-xs mx-auto mt-4 font-mono">
                         <div className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Blockchain Payment</div>
                         <div className="flex items-center gap-2"><i className="fas fa-circle-notch fa-spin text-primary"></i> RegisterDomain</div>
                     </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-2">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                        <i className="fas fa-check"></i>
                    </div>
                    
                    <div className="bg-dark p-6 rounded-xl border border-gray-700 text-left space-y-3 mb-6">
                        <p className="font-bold text-white text-lg">مرحباً {user?.username},</p>
                        <div className="text-green-400 text-sm font-medium">✅ تم تسجيل [{domain.fullName}] بنجاح</div>
                        <div className="text-gray-300 text-sm text-xs font-mono break-all">TX: {txHash}</div>
                        {enableEmail && (
                            <div className="text-gray-300 text-sm">✅ إيميلك: info@{domain.fullName} → {targetEmail}</div>
                        )}
                        <div className="text-gray-300 text-sm">✅ Nameservers: {ns1}, {ns2}</div>
                        <div className="text-primary text-sm mt-2">✅ تم الحفظ في قاعدة البيانات</div>
                    </div>

                    <button onClick={() => navigate('/admin')} className="bg-surface border border-gray-600 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium w-full">
                        الذهاب إلى لوحة التحكم
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};