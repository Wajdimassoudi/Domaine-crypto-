import { BrowserProvider, Contract, formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
// @ts-ignore
import { createAppKit } from '@reown/appkit';
// @ts-ignore
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// --- Configuration ---
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'd2dc389a4c57a39667679a63c218e7e9'; 

// UPDATED: Admin Wallet for all incoming payments
const ADMIN_WALLET = '0xd906036d5c0c7d3a560f3de10e02c9da3b10cd46';

const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

// Minimal ABI
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Network Config: BSC Mainnet
// Fixes TS Error: Type is not assignable to AppKitNetwork (must use 'id' not 'chainId')
const bscMainnet = {
  id: 56, 
  name: 'Binance Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org/'] },
    public: { http: ['https://bsc-dataseed.binance.org/'] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  }
};

const metadata = {
  name: 'CryptoReg',
  description: 'Web3 Domain Registrar',
  url: 'https://domaine-crypto.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// --- AppKit Initialization ---
let appKit: any = null;
let appKitError: string | null = null;

if (typeof window !== 'undefined') {
    try {
        // @ts-ignore
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
            // @ts-ignore - Fix z-index type (number not string)
            '--w3m-z-index': 9999
          }
        });
    } catch (e: any) {
        console.error("AppKit Initialization Failed:", e);
        appKitError = e.message;
    }
}

// --- Helper: Wait for connection ---
const waitForConnection = async (timeout = 60000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        if (appKit && appKit.getIsConnectedState()) return resolve(appKit.getProvider());

        const interval = setInterval(() => {
            if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error("Connection timed out"));
            }
            if (appKit && appKit.getIsConnectedState()) {
                clearInterval(interval);
                resolve(appKit.getProvider());
            }
        }, 500);
    });
};

export const web3Service = {
  
  connectWallet: async (): Promise<User> => {
    let provider: BrowserProvider | null = null;
    let address: string = "";

    try {
        if (appKit) {
            await appKit.open();
            const walletProvider = await waitForConnection();
            provider = new BrowserProvider(walletProvider);
        } else {
             throw new Error("AppKit not initialized");
        }
    } catch (error) {
        console.log("Fallback to window.ethereum...");
        if ((window as any).ethereum) {
            provider = new BrowserProvider((window as any).ethereum);
            await provider.send("eth_requestAccounts", []);
        } else {
            throw new Error("No crypto wallet found.");
        }
    }

    if (!provider) throw new Error("Provider Error");

    const signer = await provider.getSigner();
    address = await signer.getAddress();

    // Force Switch to BSC
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
        try {
            await provider.send("wallet_switchEthereumChain", [{ chainId: "0x38" }]);
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                await provider.send("wallet_addEthereumChain", [{
                    chainId: "0x38",
                    chainName: "Binance Smart Chain",
                    rpcUrls: ["https://bsc-dataseed.binance.org/"],
                    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                    blockExplorerUrls: ["https://bscscan.com/"]
                }]);
            }
        }
    }

    // Get Balances
    let balanceBnB = 0;
    let balanceUSDT = 0;
    try {
        balanceBnB = parseFloat(formatEther(await provider.getBalance(address)));
        const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
        try {
            const bal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(formatUnits(bal, 18));
        } catch(err) { console.warn("USDT check failed", err); }
    } catch (e) { /* ignore */ }

    return {
        id: address.toLowerCase(),
        username: 'User',
        walletAddress: address,
        balance: {
            BNB: parseFloat(balanceBnB.toFixed(4)),
            BUSD: 0,
            USDT: parseFloat(balanceUSDT.toFixed(2))
        }
    };
  },

  disconnect: async () => {
      if(appKit) await appKit.disconnect();
  },

  sendPayment: async (amount: number, currency: string): Promise<{ success: boolean; hash?: string; wait?: any; error?: string }> => {
    let provider: BrowserProvider | null = null;
    
    if (appKit && appKit.getIsConnectedState()) {
        const wp = appKit.getProvider();
        if (wp) provider = new BrowserProvider(wp);
    } else if ((window as any).ethereum) {
        provider = new BrowserProvider((window as any).ethereum);
    }

    if (!provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    
    if (network.chainId !== 56n) throw new Error("Please switch to Binance Smart Chain (BSC)");

    try {
        let tx;
        if (currency === 'BNB') {
            tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: parseEther(amount.toString())
            });
        } else {
            const contract = new Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
            const amountInWei = parseUnits(amount.toString(), 18);
            tx = await contract.transfer(ADMIN_WALLET, amountInWei);
        }
        return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
    } catch (err: any) {
        return { success: false, error: err.message || "Transaction rejected" };
    }
  }
};