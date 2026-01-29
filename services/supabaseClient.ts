import { createClient } from '@supabase/supabase-js';

// These will be populated by Vercel Environment Variables
// If they are missing, we avoid initializing the client to prevent the "supabaseUrl is required" crash.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const dbService = {
  // Save a new order
  createOrder: async (orderData: any) => {
    if (!supabase) {
        console.warn("Supabase not connected. Order not saved to cloud DB.");
        return { data: null, error: null };
    }
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    return { data, error };
  },

  // Get user domains
  getUserDomains: async (walletAddress: string) => {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_wallet', walletAddress)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Log a transaction
  logTransaction: async (txData: any) => {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
      .from('transactions')
      .insert([txData]);
    return { data, error };
  }
};