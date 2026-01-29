import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// Configuration
const PROJECT_ID = 'd2dc389a4c57a39667679a63c218e7e9'; // Hardcoded as requested for reliability
const ADMIN_WALLET = process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x4B0E80c2B8d4239857946927976f00707328C6E6';
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

// Minimal ABI
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Network Config: BSC Mainnet (Chain ID 56)
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
  url: 'https://domaine-crypto.vercel.app', // Updated URL
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Initialize AppKit
let appKit: any = null;

if (typeof window !== 'undefined') {
    try {
        appKit = createAppKit({
          adapters: [new EthersAdapter()],
          networks: [bscMainnet],
          defaultNetwork: bscMainnet,
          metadata,
          projectId: PROJECT_ID,
          features: { 
            analytics: true, 
            email: false, 
            socials: [],
            swaps: false 
          },
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#10b981',
            '--w3m-z-index': '9999'
          }
        });
    } catch (e) {
        console.error("AppKit Init Error:", e);
    }
}

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    if (!appKit) throw new Error("Wallet Service not initialized");

    try {
        // 1. Force Open the Modal
        await appKit.open();

        // 2. Get Provider
        // We assume the modal interaction handles the connection or deeplinking
        // appKit.getProvider() returns the provider if connected
        let walletProvider = appKit.getProvider();
        
        // Simple polling if not immediately available
        if (!walletProvider) {
             await new Promise(resolve => setTimeout(resolve, 1000));
             walletProvider = appKit.getProvider();
        }

        if (!walletProvider) {
            // If still no provider, we wait for the user to complete action in the modal
             return new Promise((resolve, reject) => {
                 const checkInterval = setInterval(async () => {
                     const p = appKit.getProvider();
                     if (p) {
                         clearInterval(checkInterval);
                         try {
                             const user = await web3Service.fetchUserData(p);
                             resolve(user);
                         } catch (err) { reject(err); }
                     }
                     // Timeout after 2 minutes
                 }, 1000);
             });
        }

        return await web3Service.fetchUserData(walletProvider);

    } catch (error: any) {
        console.error("Connect Error:", error);
        throw error;
    }
  },

  fetchUserData: async (walletProvider: any): Promise<User> => {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check Network
      const network = await provider.getNetwork();
      if (network.chainId !== 56n) {
          try {
             await appKit.switchNetwork(bscMainnet);
          } catch(e) { console.warn("Switch network failed", e); }
      }

      let balanceBnB = 0;
      try {
          const balanceBigInt = await provider.getBalance(address);
          balanceBnB = parseFloat(ethers.formatEther(balanceBigInt));
      } catch (e) {}

      return {
          id: address.toLowerCase(),
          username: 'Wallet User',
          walletAddress: address,
          balance: {
              BNB: parseFloat(balanceBnB.toFixed(4)),
              BUSD: 0,
              USDT: 0
          }
      };
  },

  disconnect: async () => {
      if(appKit) await appKit.disconnect();
  },

  // Update return type to allow 'error' property
  sendPayment: async (amount: number, currency: string): Promise<{ success: boolean; hash?: string; wait?: any; error?: string }> => {
    if (!appKit) throw new Error("Wallet not initialized");

    const walletProvider = appKit.getProvider();
    if (!walletProvider) throw new Error("Wallet not connected");

    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    
    // Ensure on BSC
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
         await appKit.switchNetwork(bscMainnet);
    }

    if (currency === 'BNB') {
        const tx = await signer.sendTransaction({
            to: ADMIN_WALLET,
            value: ethers.parseEther(amount.toString())
        });
        return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
    } 
    else {
        // USDT/BUSD Logic
        const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        const tx = await contract.transfer(ADMIN_WALLET, amountInWei);
        return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
    }
  }
};