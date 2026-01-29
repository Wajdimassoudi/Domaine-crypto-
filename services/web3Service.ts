import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// Fallback constants to prevent crash if Env vars are missing
// We use a default public ID if process.env fails, ensuring the UI always loads.
const DEFAULT_PROJECT_ID = 'd2dc389a4c57a39667679a63c218e7e9'; 
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || DEFAULT_PROJECT_ID;
const ADMIN_WALLET = process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x4B0E80c2B8d4239857946927976f00707328C6E6';
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

// Initialize AppKit Safely
// If this fails, we catch it so the website doesn't show a white screen.
let appKit: any = null;
try {
    if (PROJECT_ID) {
        appKit = createAppKit({
          adapters: [new EthersAdapter()],
          networks: [bscMainnet],
          metadata,
          projectId: PROJECT_ID,
          features: { analytics: true, email: false, socials: [] },
          themeMode: 'dark'
        });
    }
} catch (e) {
    console.warn("AppKit failed to initialize (UI will still work with Injected wallets):", e);
}

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    let provider: ethers.BrowserProvider | null = null;
    let address = '';

    try {
        // PRIORITY 1: Injected Wallet (Bybit / Metamask / Trust)
        // This is the most reliable method for desktop browsers
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            provider = new ethers.BrowserProvider(window.ethereum);
            // Request access
            await provider.send("eth_requestAccounts", []);
        } 
        // PRIORITY 2: Reown AppKit Modal (QR Code)
        else if (appKit) {
            await appKit.open();
            const walletProvider = appKit.getProvider();
            if (!walletProvider) throw new Error("Connection failed or cancelled");
            provider = new ethers.BrowserProvider(walletProvider);
        } else {
            throw new Error("No wallet found. Please install Bybit Wallet or MetaMask.");
        }

        if (!provider) throw new Error("Provider initialization failed");

        const signer = await provider.getSigner();
        address = await signer.getAddress();
        
        // Ensure network is BSC (Chain ID 56)
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
                console.warn("Could not switch network automatically. Please switch manually to BSC.", switchError);
            }
        }

        // Get Balances safely
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
        } catch (e) { 
            // Ignore error if user has no USDT or contract read fails
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