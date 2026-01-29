import { BrowserProvider, Contract, formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { User } from '../types';

// --- Configuration ---
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
        console.warn("AppKit failed to initialize, will use fallback.", e);
    }
}

// --- Helper: Wait for connection ---
const waitForConnection = async (timeout = 40000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        
        // Immediate check
        if (appKit && appKit.getIsConnectedState()) {
            return resolve(appKit.getProvider());
        }

        const interval = setInterval(() => {
            if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error("Connection timed out"));
            }

            if (appKit && appKit.getIsConnectedState()) {
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
    let provider: BrowserProvider | null = null;
    let address: string = "";

    try {
        // STRATEGY 1: Try AppKit (WalletConnect/Reown)
        if (appKit) {
            try {
                await appKit.open();
                const walletProvider = await waitForConnection();
                provider = new BrowserProvider(walletProvider);
            } catch (appKitError) {
                console.warn("AppKit connection failed or timed out, trying fallback...", appKitError);
                throw new Error("Fallback needed"); // Trigger catch block to try fallback
            }
        } else {
             throw new Error("AppKit not initialized");
        }
    } catch (error) {
        // STRATEGY 2: Fallback to window.ethereum (MetaMask/Injected)
        console.log("Attempting direct window.ethereum connection...");
        
        if ((window as any).ethereum) {
            try {
                provider = new BrowserProvider((window as any).ethereum);
                // Request accounts directly
                await provider.send("eth_requestAccounts", []);
            } catch (mmError: any) {
                 if (mmError.code === 4001) throw new Error("User rejected connection");
                 throw new Error("Failed to connect to wallet.");
            }
        } else {
            throw new Error("No wallet found. Please install MetaMask or Trust Wallet.");
        }
    }

    if (!provider) throw new Error("Failed to initialize provider");

    const signer = await provider.getSigner();
    address = await signer.getAddress();

    // 4. Force Network Check/Switch to BSC
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
            try {
                // Try switching via Wallet RPC
                await provider.send("wallet_switchEthereumChain", [{ chainId: "0x38" }]); // 56 in hex
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await provider.send("wallet_addEthereumChain", [{
                        chainId: "0x38",
                        chainName: "Binance Smart Chain",
                        rpcUrls: ["https://bsc-dataseed.binance.org/"],
                        nativeCurrency: {
                            name: "Binance Coin",
                            symbol: "BNB",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://bscscan.com/"]
                    }]);
                } catch (addError) {
                    console.error("Failed to add BSC network", addError);
                }
            }
            console.warn("Network switch requested:", switchError);
            }
    }

    // 5. Get Balances (Graceful degradation if RPC fails)
    let balanceBnB = 0;
    let balanceUSDT = 0;
    
    try {
        const balanceBigInt = await provider.getBalance(address);
        balanceBnB = parseFloat(formatEther(balanceBigInt));
        
        // Try USDT Balance
        const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
        try {
            const usdtBal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(formatUnits(usdtBal, 18));
        } catch (err) {
            // Ignore token fetch errors
        }
    } catch (e) {
        console.warn("Could not fetch balances", e);
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
  },

  disconnect: async () => {
      if(appKit) {
        try {
            await appKit.disconnect();
        } catch(e) { console.error(e); }
      }
  },

  sendPayment: async (amount: number, currency: string): Promise<{ success: boolean; hash?: string; wait?: any; error?: string }> => {
    // Re-instantiate provider to ensure we have the latest signer state
    let provider: BrowserProvider | null = null;
    
    if (appKit && appKit.getIsConnectedState()) {
        const wp = appKit.getProvider();
        if (wp) provider = new BrowserProvider(wp);
    } 
    else if ((window as any).ethereum) {
        provider = new BrowserProvider((window as any).ethereum);
    }

    if (!provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    
    // Ensure on BSC
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
         throw new Error("Wrong Network. Please switch to Binance Smart Chain (BSC).");
    }

    try {
        let tx;
        if (currency === 'BNB') {
            tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: parseEther(amount.toString())
            });
        } 
        else {
            // USDT/BUSD Logic
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