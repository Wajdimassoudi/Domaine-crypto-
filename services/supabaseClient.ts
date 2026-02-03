
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const dbService = {
  // Cache a product fetched from API
  cacheProduct: async (product: any) => {
    if (!supabase) return;
    await supabase.from('cached_products').upsert({
      id: product.id.toString(),
      data: product,
      updated_at: new Date().toISOString()
    });
  },

  getCachedProduct: async (id: string) => {
    if (!supabase) return null;
    const { data } = await supabase.from('cached_products').select('data').eq('id', id).single();
    return data ? data.data : null;
  },

  createOrder: async (orderData: any) => {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('orders').insert([orderData]).select();
  },

  upsertUser: async (user: any) => {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('users').upsert({ 
          wallet_address: user.walletAddress, 
          username: user.username,
          last_login: new Date().toISOString()
    }, { onConflict: 'wallet_address' }).select();
  }
};
