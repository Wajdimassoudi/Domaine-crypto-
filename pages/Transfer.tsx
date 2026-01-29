import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export const Transfer: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'eligible' | 'error' | 'success'>('idle');
  const { showNotification } = useNotification();

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.includes('.')) {
        setStatus('error');
        return;
    }
    setStatus('checking');
    setTimeout(() => {
        setStatus('eligible');
    }, 1500);
  };

  const handleTransfer = () => {
    if (!authCode) {
        showNotification("Auth code is required", "error");
        return;
    }
    showNotification("Transfer initiated! Check your email for confirmation.", "success");
    setStatus('success');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-darker px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-white mb-4">Transfer Your Domain</h1>
            <p className="text-gray-400">Move your portfolio to CryptoReg. Experience anonymity and crypto-native management.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
            {status === 'success' ? (
                <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl">
                        <i className="fas fa-paper-plane"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Transfer Initiated</h2>
                    <p className="text-gray-400">We have contacted the losing registrar. The transfer of <b>{domain}</b> will complete within 5-7 days.</p>
                    <button onClick={() => setStatus('idle')} className="mt-8 text-primary hover:text-white underline">Transfer another</button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleCheck} className="mb-8">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Domain Name</label>
                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                value={domain}
                                onChange={e => setDomain(e.target.value)}
                                placeholder="example.com"
                                className="flex-grow bg-dark border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                                disabled={status === 'eligible'}
                            />
                            {status !== 'eligible' && (
                                <button type="submit" disabled={status === 'checking'} className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-bold transition-colors">
                                    {status === 'checking' ? <i className="fas fa-spinner fa-spin"></i> : "Check Eligibility"}
                                </button>
                            )}
                        </div>
                        {status === 'error' && <p className="text-red-500 text-sm mt-2">Please enter a valid domain.</p>}
                    </form>

                    {status === 'eligible' && (
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <div>
                                    <p className="text-green-400 font-bold">Good news! {domain} is eligible for transfer.</p>
                                    <p className="text-green-500/70 text-sm">Transfer Fee: 0.01 BNB (includes 1 year extension).</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Authorization (EPP) Code</label>
                                <input 
                                    type="text" 
                                    value={authCode}
                                    onChange={e => setAuthCode(e.target.value)}
                                    placeholder="Enter code from current registrar"
                                    className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                                />
                            </div>

                            <button onClick={handleTransfer} className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-secondary/20">
                                Proceed to Payment (0.01 BNB)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
            <div className="p-4 bg-surface/50 rounded-lg border border-border/50">
                <i className="fas fa-lock text-primary text-xl mb-2"></i>
                <p className="text-gray-300">No downtime during transfer</p>
            </div>
            <div className="p-4 bg-surface/50 rounded-lg border border-border/50">
                <i className="fas fa-calendar-plus text-primary text-xl mb-2"></i>
                <p className="text-gray-300">1 Year extension included</p>
            </div>
            <div className="p-4 bg-surface/50 rounded-lg border border-border/50">
                <i className="fas fa-headset text-primary text-xl mb-2"></i>
                <p className="text-gray-300">24/7 Expert Support</p>
            </div>
        </div>
      </div>
    </div>
  );
};