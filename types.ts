export type CryptoCurrency = 'BNB' | 'BUSD' | 'USDT';

export type Category = 
  | 'Electronics' | 'Phones' | 'Computer' | 'Fashion' 
  | 'Home' | 'Beauty' | 'Crypto Hardware' | 'Toys' | 'Automotive';

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: CryptoCurrency;
  originalPrice?: number; // For discount display
  rating: number;
  reviews: number;
  image: string; // URL
  category: Category;
  description: string;
  stock: number;
  sold: number;
  shipping: string; // e.g., "Free Shipping"
  specs?: Record<string, string>;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  balance: {
    BNB: number;
    BUSD: number;
    USDT: number;
  }
}

export interface Order {
  id: string;
  buyer: string;
  total: number;
  currency: CryptoCurrency;
  items: CartItem[];
  date: string;
  hash: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingInfo: {
      fullName: string;
      address: string;
      city: string;
      country: string;
  }
}

export interface Domain {
  id: string;
  name: string;
  tld: string;
  fullName: string;
  price: number;
  currency: CryptoCurrency;
  isPremium: boolean;
  owner: string | null;
  isListed: boolean;
  views: number;
  description: string;
  privacyEnabled: boolean;
  autoRenew: boolean;
  nameservers: string[];
  dnsRecords: any[];
}
