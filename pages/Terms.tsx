
import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-darker mb-8">Terms of Service & Privacy Policy</h1>
        
        <section className="mb-10">
          <h2 className="text-xl font-bold text-darker mb-4 border-b pb-2">1. Introduction</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            By accessing the services provided by <strong>getwealthos.icu</strong> (referred to as "the Platform"), you agree to abide by these terms. We operate as a decentralized gateway for physical goods, utilizing blockchain technology to ensure transparency and security.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-darker mb-4 border-b pb-2">2. Zero-KYC Privacy Commitment</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            We value your anonymity. <strong>getwealthos.icu</strong> does not require sensitive government identification (KYC) for standard purchases. 
          </p>
          <ul className="list-disc ml-5 text-gray-600 text-sm space-y-2">
            <li>We only collect the minimum shipping information required to deliver your goods.</li>
            <li>All personal data is encrypted using AES-256 protocols.</li>
            <li>We never sell or share your wallet address or purchasing history with third-party advertisers.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-darker mb-4 border-b pb-2">3. Cryptocurrency Payments</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            All sales are final once confirmed on the blockchain. Due to the nature of digital assets, we cannot reverse transactions. However, if a product arrives damaged or is not delivered, <strong>getwealthos.icu</strong> offers a 100% USDT refund policy via our "Buyer Protection" escrow logic.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-darker mb-4 border-b pb-2">4. Shipping & Compliance</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            We ship to over 150 countries. The customer is responsible for any local customs duties if applicable. Our logistics partners prioritize fast, secure handling to ensure your items reach you within the estimated 15-25 day window.
          </p>
        </section>

        <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-xs mt-12 border border-gray-200">
            Last Updated: May 2024 | Official Domain: <a href="https://getwealthos.icu" className="text-primary hover:underline">getwealthos.icu</a>
        </div>
      </div>
    </div>
  );
};
