import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// Configuration
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'd2dc389a4c57a39667679a63c218e7e9';
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
  url: 'https://cryptoreg.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Initialize AppKit (WalletConnect v2)
// This handles the Modal UI and connection logic for ALL wallets (MetaMask, Trust, etc.)
let appKit: any = null;
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
        swaps: false // Disable built-in swap to keep UI clean
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#10b981', // Primary Emerald Color
        '--w3m-border-radius-master': '12px'
      }
    });
} catch (e) {
    console.error("AppKit Init Error:", e);
}

// Helper: Polling to wait for user to connect inside the modal
const waitForConnection = async (timeoutMs = 60000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                reject(new Error("Connection timed out"));
            }
            const provider = appKit.getProvider();
            if (provider) {
                clearInterval(interval);
                resolve(provider);
            }
        }, 500);
    });
};

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    if (!appKit) throw new Error("Wallet Service not initialized");

    try {
        // 1. Force Open the WalletConnect Modal
        // This ensures the UI always appears, no "No wallet found" errors.
        await appKit.open();

        // 2. Wait for a valid provider (User interaction in modal)
        // We poll until AppKit reports a provider is available
        let walletProvider;
        if (appKit.getIsConnectedState()) {
            walletProvider = appKit.getProvider();
        } else {
             walletProvider = await waitForConnection();
        }
        
        if (!walletProvider) throw new Error("Failed to get wallet provider");

        // 3. Create Ethers Provider
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // 4. Force Network Switch to BSC if needed
        const network = await provider.getNetwork();
        if (network.chainId !== 56n) {
            try {
                await appKit.switchNetwork(bscMainnet); 
                // Alternatively use provider.send('wallet_switchEthereumChain', ...)
            } catch (switchError) {
                console.warn("Network switch requested but failed/cancelled", switchError);
            }
        }

        // 5. Fetch Balances
        let balanceBnB = 0;
        try {
            const balanceBigInt = await provider.getBalance(address);
            balanceBnB = parseFloat(ethers.formatEther(balanceBigInt));
        } catch (e) { console.warn("Failed to fetch BNB balance"); }

        let balanceUSDT = 0;
        try {
            const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
            const usdtBal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(ethers.formatUnits(usdtBal, 18));
        } catch (e) { /* Ignore */ }

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
        // User closed modal or rejected
        if (error.message.includes("User rejected") || error.message.includes("timed out")) {
            throw new Error("Connection cancelled by user");
        }
        throw new Error("Could not connect wallet. Please try again.");
    }
  },

  disconnect: async () => {
      if(appKit) await appKit.disconnect();
  },

  sendPayment: async (amount: number, currency: string) => {
    if (!appKit) throw new Error("Wallet not initialized");

    try {
        const walletProvider = appKit.getProvider();
        if (!walletProvider) throw new Error("Wallet not connected");

        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        
        if (currency === 'BNB') {
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
        } 
        else if (currency === 'USDT' || currency === 'BUSD') {
            const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
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