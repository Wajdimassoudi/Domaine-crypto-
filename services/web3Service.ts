import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// --- Configuration ---
const PROJECT_ID = 'd2dc389a4c57a39667679a63c218e7e9';
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
  url: 'https://domaine-crypto.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// --- AppKit Initialization ---
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

// --- Helper: Wait for connection ---
const waitForConnection = async (timeout = 120000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        
        // Immediate check
        if (appKit.getIsConnectedState()) {
            return resolve(appKit.getProvider());
        }

        const interval = setInterval(() => {
            if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error("Connection timed out. Please try again."));
            }

            if (appKit.getIsConnectedState()) {
                const provider = appKit.getProvider();
                if (provider) {
                    clearInterval(interval);
                    resolve(provider);
                }
            }
        }, 500);
    });
};

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    if (!appKit) throw new Error("Wallet Service failed to initialize");

    try {
        // 1. Open the UI (QR Code or Mobile Link)
        await appKit.open();

        // 2. Wait for the user to actually connect
        // This handles the gap between "Modal Open" and "User Approved"
        const walletProvider = await waitForConnection();
        
        // 3. Setup Ethers Provider
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // 4. Force Network Check/Switch
        const network = await provider.getNetwork();
        if (network.chainId !== 56n) {
             try {
                await appKit.switchNetwork(bscMainnet);
             } catch (e) {
                console.warn("Network switch requested:", e);
                // Don't throw here, sometimes user is on correct network but provider lags
             }
        }

        // 5. Get Balances (Optional, don't fail if this fails)
        let balanceBnB = 0;
        let balanceUSDT = 0;
        
        try {
            const balanceBigInt = await provider.getBalance(address);
            balanceBnB = parseFloat(ethers.formatEther(balanceBigInt));
            
            // Try USDT Balance
            const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
            const usdtBal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(ethers.formatUnits(usdtBal, 18));
        } catch (e) {
            console.warn("Could not fetch some balances", e);
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
        console.error("Connect Error:", error);
        if (error.message.includes("timed out")) {
             throw error;
        }
        // If modal was closed by user
        throw new Error("Connection cancelled or failed.");
    }
  },

  disconnect: async () => {
      if(appKit) await appKit.disconnect();
  },

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

    try {
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
    } catch (err: any) {
        return { success: false, error: err.message || "Transaction rejected" };
    }
  }
};