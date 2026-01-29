import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// 1. Safe Environment Access for Vite
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
  }
  return '';
};

// Configuration
const PROJECT_ID = getEnv('NEXT_PUBLIC_PROJECT_ID') || 'd2dc389a4c57a39667679a63c218e7e9';
const ADMIN_WALLET = getEnv('NEXT_PUBLIC_RECEIVER_WALLET') || '0x4B0E80c2B8d4239857946927976f00707328C6E6';
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

// Minimal ABI
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Network Config
const bscMainnet = {
  chainId: 56,
  name: 'Binance Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

const metadata = {
  name: 'CryptoReg',
  description: 'Web3 Domain Registrar',
  url: 'https://cryptoreg.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Initialize AppKit
let appKit: any = null;
try {
    appKit = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [bscMainnet],
      metadata,
      projectId: PROJECT_ID,
      features: { analytics: true, email: false, socials: [] },
      themeMode: 'dark'
    });
} catch (e) {
    console.error("AppKit Init Error:", e);
}

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    let provider: ethers.BrowserProvider | null = null;
    let address = '';

    try {
        // Method A: Check for Injected Wallet (Bybit / Metamask) directly first
        // This is often more reliable than the Modal for desktop users
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            provider = new ethers.BrowserProvider(window.ethereum);
            // Request access
            await provider.send("eth_requestAccounts", []);
        } 
        // Method B: Use Reown AppKit if no injected provider or if user prefers
        else if (appKit) {
            await appKit.open();
            const walletProvider = appKit.getProvider();
            if (!walletProvider) throw new Error("Connection failed or cancelled");
            provider = new ethers.BrowserProvider(walletProvider);
        } else {
            throw new Error("No wallet provider found");
        }

        if (!provider) throw new Error("Provider initialization failed");

        const signer = await provider.getSigner();
        address = await signer.getAddress();
        
        // Ensure network is BSC
        const network = await provider.getNetwork();
        if (network.chainId !== 56n) {
            try {
                // Try to switch to BSC
                // @ts-ignore
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }], // 56 in hex
                });
                // Re-init provider after switch
                // @ts-ignore
                provider = new ethers.BrowserProvider(window.ethereum || appKit.getProvider());
            } catch (switchError) {
                console.warn("Could not switch network automatically", switchError);
            }
        }

        // Get Balances
        const balanceBigInt = await provider.getBalance(address);
        const balanceBnB = parseFloat(ethers.formatEther(balanceBigInt));

        // Get USDT Balance
        let balanceUSDT = 0;
        try {
            const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
            const usdtBal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(ethers.formatUnits(usdtBal, 18));
        } catch (e) { 
            console.log("Could not fetch USDT balance (maybe network mismatch)"); 
        }

        return {
            id: address.toLowerCase(),
            username: 'Wallet User',
            walletAddress: address,
            balance: {
                BNB: parseFloat(balanceBnB.toFixed(4)),
                BUSD: 0,
                USDT: parseFloat(balanceUSDT.toFixed(2))
            }
        };

    } catch (error: any) {
        console.error("Connection Error:", error);
        throw new Error(error.message || "Failed to connect wallet");
    }
  },

  disconnect: async () => {
      if(appKit) await appKit.disconnect();
  },

  sendPayment: async (amount: number, currency: string) => {
    let provider: ethers.BrowserProvider;

    // Determine provider source
    // @ts-ignore
    if (window.ethereum) {
        // @ts-ignore
        provider = new ethers.BrowserProvider(window.ethereum);
    } else if (appKit && appKit.getProvider()) {
        provider = new ethers.BrowserProvider(appKit.getProvider());
    } else {
        throw new Error("Wallet not connected");
    }

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    // Enforce BSC
    if (network.chainId !== 56n) {
        throw new Error("Wrong Network. Please switch your wallet to Binance Smart Chain (BSC).");
    }

    try {
        if (currency === 'BNB') {
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
        } 
        else if (currency === 'USDT' || currency === 'BUSD') {
            const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
            // USDT on BSC is 18 decimals
            const amountInWei = ethers.parseUnits(amount.toString(), 18);
            const tx = await contract.transfer(ADMIN_WALLET, amountInWei);
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
        }
        else {
             throw new Error(`Currency ${currency} not supported.`);
        }
    } catch (error: any) {
        console.error("Payment Failed:", error);
        return { success: false, error: error.message || "Transaction rejected" };
    }
  }
};