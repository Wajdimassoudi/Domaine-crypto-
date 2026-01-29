import { BrowserProvider, Contract, formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
// @ts-ignore
import { createAppKit } from '@reown/appkit';
// @ts-ignore
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

// Network Config: BSC Mainnet (Fixed for strict Typescript & AppKit types)
const bscMainnet = {
  id: 56, // Must be 'id', not 'chainId'
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
            '--w3m-z-index': 9999 // Fixed: Number not string
          }
        });
        console.log("AppKit initialized successfully");
    } catch (e: any) {
        console.error("AppKit Initialization Failed:", e);
        appKitError = e.message || "Unknown AppKit Error";
    }
}

// --- Helper: Wait for connection ---
const waitForConnection = async (timeout = 60000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        
        // Immediate check
        if (appKit && appKit.getIsConnectedState()) {
            return resolve(appKit.getProvider());
        }

        const interval = setInterval(() => {
            if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error("Connection timed out. Please try again."));
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
            console.log("Opening AppKit modal...");
            await appKit.open();
            const walletProvider = await waitForConnection();
            provider = new BrowserProvider(walletProvider);
        } else {
             console.warn("AppKit not available:", appKitError);
             throw new Error("AppKit not initialized");
        }
    } catch (error) {
        // STRATEGY 2: Fallback to window.ethereum (MetaMask/Injected)
        console.log("Falling back to direct window.ethereum connection...");
        
        if ((window as any).ethereum) {
            try {
                provider = new BrowserProvider((window as any).ethereum);
                await provider.send("eth_requestAccounts", []);
            } catch (mmError: any) {
                 if (mmError.code === 4001) throw new Error("User rejected connection");
                 throw new Error("Failed to connect to wallet.");
            }
        } else {
            if (appKitError) {
                throw new Error(`Connection System Error: ${appKitError}. Also, no MetaMask found.`);
            }
            throw new Error("No crypto wallet found. Please install MetaMask or TrustWallet extension.");
        }
    }

    if (!provider) throw new Error("Failed to initialize provider");

    const signer = await provider.getSigner();
    address = await signer.getAddress();

    // 4. Force Network Check/Switch to BSC
    const network = await provider.getNetwork();
    // 56n is BigInt for BSC Chain ID
    if (network.chainId !== 56n) {
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: "0x38" }]); // 56 in hex
            } catch (switchError: any) {
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
            }
    }

    // 5. Get Balances
    let balanceBnB = 0;
    let balanceUSDT = 0;
    
    try {
        const balanceBigInt = await provider.getBalance(address);
        balanceBnB = parseFloat(formatEther(balanceBigInt));
        
        const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
        try {
            const usdtBal = await usdtContract.balanceOf(address);
            balanceUSDT = parseFloat(formatUnits(usdtBal, 18));
        } catch (err) { /* ignore */ }
    } catch (e) {
        console.warn("Could not fetch balances", e);
    }

    const userData: User = {
        id: address.toLowerCase(),
        username: 'Wallet User',
        walletAddress: address,
        balance: {
            BNB: parseFloat(balanceBnB.toFixed(4)),
            BUSD: 0,
            USDT: parseFloat(balanceUSDT.toFixed(2))
        }
    };
    
    // Explicitly return the user data
    return userData;
  },

  disconnect: async () => {
      if(appKit) {
        try {
            await appKit.disconnect();
        } catch(e) { console.error(e); }
      }
  },

  sendPayment: async (amount: number, currency: string): Promise<{ success: boolean; hash?: string; wait?: any; error?: string }> => {
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