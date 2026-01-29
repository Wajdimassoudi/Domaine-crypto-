import { ethers } from 'ethers';

// Add type definition for window.ethereum to fix TypeScript errors
declare global {
  interface Window {
    ethereum: any;
  }
}

// This is YOUR wallet where money will be sent.
// In Vercel, set NEXT_PUBLIC_RECEIVER_WALLET
const ADMIN_WALLET = process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x4B0E...ReplaceWithYourRealWallet...'; 

export const web3Service = {
  connectWallet: async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("No crypto wallet found. Please install MetaMask or TrustWallet.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return { 
        address: accounts[0], 
        signer 
    };
  },

  sendPayment: async (amount: number, currency: string) => {
    if (typeof window.ethereum === 'undefined') throw new Error("Wallet not found");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // 1. Validate Network (Must be BSC Mainnet for real money)
    // ChainId for BSC Mainnet is 56 (0x38). For testing you might use BSC Testnet 97.
    const network = await provider.getNetwork();
    // In production, uncomment the line below to force BSC
    // if (network.chainId !== 56n) throw new Error("Please switch your wallet to Binance Smart Chain (BSC).");

    try {
        // Logic for Native Token (BNB)
        if (currency === 'BNB') {
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait };
        } 
        
        // Logic for Tokens (USDT/BUSD) would go here (requires ABI for transfer)
        // For this version, we assume BNB for simplicity or manual transfer for others
        else {
             // For USDT/BUSD, we would need the contract address and ABI.
             // Falling back to simple BNB request or throwing error for MVP
             throw new Error("Automatic USDT/BUSD payment not configured in this contract version. Please pay in BNB.");
        }
    } catch (error: any) {
        console.error("Payment Error:", error);
        return { success: false, error: error.message };
    }
  }
};