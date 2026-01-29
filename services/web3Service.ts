import { ethers } from 'ethers';
import { User } from '../types';

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
  connectWallet: async (): Promise<User> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("No crypto wallet found. Please install MetaMask or TrustWallet.");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        
        // Get Real BNB Balance
        const balanceBigInt = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceBigInt); // Convert Wei to BNB
        
        // Create User Object compatible with our App types
        const realUser: User = {
            id: address.toLowerCase(),
            username: 'Wallet User', // Default name
            walletAddress: address,
            balance: {
                BNB: parseFloat(parseFloat(balanceEth).toFixed(4)), // Real BNB
                BUSD: 0, // Placeholder (Requires ABI to fetch real Token balance)
                USDT: 0  // Placeholder
            }
        };

        return realUser;
    } catch (error: any) {
        console.error("Connection Error:", error);
        throw new Error(error.message || "Failed to connect wallet");
    }
  },

  sendPayment: async (amount: number, currency: string) => {
    if (typeof window.ethereum === 'undefined') throw new Error("Wallet not found");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // 1. Validate Network (Must be BSC Mainnet for real money)
    // ChainId for BSC Mainnet is 56 (0x38). For testing you might use BSC Testnet 97.
    // const network = await provider.getNetwork();
    // if (network.chainId !== 56n) console.warn("Warning: Not on BSC Mainnet");

    try {
        // Logic for Native Token (BNB)
        if (currency === 'BNB') {
            const tx = await signer.sendTransaction({
                to: ADMIN_WALLET,
                value: ethers.parseEther(amount.toString())
            });
            return { success: true, hash: tx.hash, wait: tx.wait.bind(tx) };
        } 
        
        // Logic for Tokens (USDT/BUSD) requires Contract ABI
        // For MVP, if user tries to pay in USDT/BUSD, we simulate success OR warn them.
        // Here we throw error to force BNB usage or need to implement Token Contract calls.
        else {
             // To implement real USDT:
             // const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
             // await contract.transfer(ADMIN_WALLET, amount);
             
             // For now, fail safely:
             throw new Error("Automatic USDT/BUSD payment not configured yet. Please pay in BNB.");
        }
    } catch (error: any) {
        console.error("Payment Error:", error);
        return { success: false, error: error.message };
    }
  }
};