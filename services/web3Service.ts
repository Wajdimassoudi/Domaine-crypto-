import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// --- CONFIGURATION ---
const PROJECT_ID = 'd2dc389a4c57a39667679a63c218e7e9'; // Your Reown Project ID
const ADMIN_WALLET = process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x4B0E...ReplaceWithYourRealWallet...'; 

// 1. Define Networks (BSC Mainnet)
const bscMainnet = {
  chainId: 56,
  name: 'Binance Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

// 2. Create Metadata
const metadata = {
  name: 'CryptoReg',
  description: 'Buy Web2 Domains with Web3',
  url: 'https://cryptoreg.app', // Update with your actual domain later
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 3. Create AppKit Instance
// We perform a check to ensure we only create it once in the browser environment
let appKit: any = null;

try {
    appKit = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [bscMainnet],
      metadata,
      projectId: PROJECT_ID,
      features: {
        analytics: true,
        email: false, 
        socials: [],
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#10b981', // Your Primary Color
        '--w3m-border-radius-master': '1px'
      }
    });
} catch (e) {
    console.warn("AppKit initialization warning (likely already initialized):", e);
}

export const web3Service = {
  // Opens the Reown Modal to Connect
  connectWallet: async (): Promise<User> => {
    if (!appKit) throw new Error("Wallet Service not initialized");

    // Open the modal
    await appKit.open();

    // Wait for connection (Polling simple check for MVP)
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(async () => {
            const state = appKit.getIsConnectedState();
            if (state) {
                clearInterval(checkInterval);
                
                try {
                    // Get Provider from the Adapter
                    const provider = new ethers.BrowserProvider(appKit.getProvider());
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const balanceBigInt = await provider.getBalance(address);
                    const balanceEth = ethers.formatEther(balanceBigInt);

                    const realUser: User = {
                        id: address.toLowerCase(),
                        username: 'Wallet User',
                        walletAddress: address,
                        balance: {
                            BNB: parseFloat(parseFloat(balanceEth).toFixed(4)),
                            BUSD: 0, 
                            USDT: 0
                        }
                    };
                    resolve(realUser);
                } catch (err) {
                    reject(err);
                }
            }
        }, 1000);

        // Timeout after 60 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            // Don't reject, just let the user close or try again, 
            // but for code flow we stop polling.
        }, 60000);
    });
  },

  // Disconnect function
  disconnect: async () => {
      if(appKit) {
          await appKit.disconnect();
      }
  },

  // Send Payment using the Reown Provider
  sendPayment: async (amount: number, currency: string) => {
    if (!appKit) throw new Error("Wallet Service not initialized");
    
    // Get the provider from AppKit (supports MetaMask, WalletConnect, etc.)
    const walletProvider = appKit.getProvider();
    if (!walletProvider) throw new Error("Please connect your wallet first.");

    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    
    try {
        if (currency === 'BNB') {
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
        } else {
             throw new Error("Automatic USDT/BUSD payment not configured yet. Please pay in BNB.");
        }
    } catch (error: any) {
        console.error("Payment Error:", error);
        return { success: false, error: error.message };
    }
  }
};