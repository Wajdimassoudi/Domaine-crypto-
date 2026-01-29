import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// --- CONFIGURATION ---
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'd2dc389a4c57a39667679a63c218e7e9'; 
const ADMIN_WALLET = process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x4B0E...ReplaceWithYourRealWallet...'; 

// USDT Contract Address on BSC Mainnet
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Minimal ERC20 ABI for Transfer
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

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
  url: 'https://cryptoreg.app', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 3. Create AppKit Instance
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
        '--w3m-accent': '#10b981',
        '--w3m-border-radius-master': '1px'
      }
    });
} catch (e) {
    console.warn("AppKit initialization warning:", e);
}

export const web3Service = {
  // Opens the Reown Modal to Connect
  connectWallet: async (): Promise<User> => {
    if (!appKit) throw new Error("Wallet Service not initialized");

    await appKit.open();

    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(async () => {
            const state = appKit.getIsConnectedState();
            if (state) {
                clearInterval(checkInterval);
                
                try {
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

        setTimeout(() => {
            clearInterval(checkInterval);
        }, 60000);
    });
  },

  disconnect: async () => {
      if(appKit) {
          await appKit.disconnect();
      }
  },

  // Send Payment (BNB or USDT)
  sendPayment: async (amount: number, currency: string) => {
    if (!appKit) throw new Error("Wallet Service not initialized");
    
    const walletProvider = appKit.getProvider();
    if (!walletProvider) throw new Error("Please connect your wallet first.");

    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    
    try {
        if (currency === 'BNB') {
            // Native BNB Transfer
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
            
        } else if (currency === 'USDT' || currency === 'BUSD') {
            // Token Transfer (BEP20)
            // Note: For BUSD you would need a different address, currently set for USDT
            const contractAddress = USDT_CONTRACT_ADDRESS; 
            const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
            
            // USDT on BSC has 18 decimals usually, but we check or assume standard
            // Standard parseEther works for 18 decimals
            const amountInWei = ethers.parseUnits(amount.toString(), 18);
            
            const tx = await contract.transfer(ADMIN_WALLET, amountInWei);
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
            
        } else {
             throw new Error(`Currency ${currency} not supported yet.`);
        }
    } catch (error: any) {
        console.error("Payment Error:", error);
        return { success: false, error: error.message };
    }
  }
};