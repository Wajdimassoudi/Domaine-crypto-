
import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 selection:bg-primary selection:text-white">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 md:p-20 rounded-[40px] shadow-sm border border-gray-100">
        <div className="mb-16 border-b border-gray-100 pb-12">
            <h1 className="text-4xl font-bold text-darker mb-4">Legal & Privacy Governance</h1>
            <p className="text-gray-500">Official Terms of Service and Data Governance for <strong>getwealthos.icu</strong> and its associated platforms.</p>
        </div>
        
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-darker mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">01</span>
              Operational Framework
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
                By utilizing the <strong>getwealthos.icu</strong> marketplace, you acknowledge and agree to operate within a decentralized ecosystem. Our platform acts as an automated gateway connecting cryptocurrency holders with global suppliers. All transactions are peer-to-peer in nature, finalized via blockchain verification.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-darker mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">02</span>
              Data Anonymization Policy
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
                We adhere to a strict <strong>Zero-Persistence Data Policy</strong>. Unlike traditional e-commerce entities, we do not store:
            </p>
            <ul className="list-disc ml-6 space-y-2">
                <li>Government-issued identification numbers.</li>
                <li>Financial history unrelated to our specific transactions.</li>
                <li>IP addresses beyond the current session's fulfillment requirements.</li>
            </ul>
            <p>
                Your shipping details are encrypted and only transmitted to the relevant fulfillment center (e.g., Amazon, Printful) at the moment of order confirmation.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-darker mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">03</span>
              Payment & Refund Protocols
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
                Payments are accepted exclusively in supported cryptocurrencies (USDT, BNB, BTC). Due to the immutable nature of the blockchain, transactions cannot be reversed once broadcast. 
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-sm">
                "However, getwealthos.icu maintains a dedicated Buyer Protection Fund. If an item is verified as lost in transit or significantly not as described, we issue a 1:1 reimbursement in USDT to the originating wallet."
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-darker mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">04</span>
              Global Compliance
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <p>
                It is the responsibility of the user to ensure that purchasing goods with cryptocurrency is compliant with local laws in their specific jurisdiction. <strong>getwealthos.icu</strong> operates as a technology provider and does not provide financial or legal advice.
            </p>
          </div>
        </section>

        <div className="bg-darker p-8 rounded-3xl text-center text-white mt-20">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Digital Signature of Authority</p>
            <p className="text-sm font-mono text-primary truncate">GW-OS_CERT_2024_DECENTRALIZED_GOVERNANCE_SECURE</p>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-center gap-8 text-xs text-gray-400">
                <span>&copy; 2024 CryptoMart</span>
                <a href="https://getwealthos.icu" className="hover:text-primary transition-colors">getwealthos.icu Official</a>
            </div>
        </div>
      </div>
    </div>
  );
};
