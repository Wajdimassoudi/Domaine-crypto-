import { Product, User, Order, Category, Domain } from '../types';

const STORAGE_KEYS = {
  CART: 'cryptomart_cart_v1',
  USER: 'cryptoreg_user_v3',
  ORDERS: 'cryptomart_orders_v1'
};

// Helper to generate fake products
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  const categories: Category[] = ['Electronics', 'Phones', 'Computer', 'Fashion', 'Home', 'Beauty', 'Crypto Hardware'];
  
  const titles = [
      ['iPhone 15 Pro Max', 'Samsung S24 Ultra', 'Google Pixel 8', 'Xiaomi 14'],
      ['MacBook Pro M3', 'Dell XPS 15', 'Lenovo Legion', 'Asus ROG'],
      ['Ledger Nano X', 'Trezor Model T', 'SafePal S1', 'Ellipal Titan'],
      ['Men Leather Jacket', 'Running Sneakers', 'Luxury Watch', 'Designer Sunglasses'],
      ['Smart Coffee Maker', 'Robot Vacuum', 'Air Purifier', 'LED Smart Bulb']
  ];

  const images = [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&auto=format&fit=crop&q=60', // iPhone
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&auto=format&fit=crop&q=60', // MacBook
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=60', // Ledger
      'https://images.unsplash.com/photo-1551028919-ac66c9a3d683?w=500&auto=format&fit=crop&q=60', // Jacket
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60'  // Home
  ];

  let idCounter = 1;

  categories.forEach((cat, idx) => {
      for (let i = 0; i < 12; i++) {
          const rand = Math.floor(Math.random() * 5);
          const basePrice = Math.floor(Math.random() * 800) + 20;
          
          let titleBase = titles[idx % titles.length] ? titles[idx % titles.length][i % 4] : 'Generic Item';
          
          products.push({
              id: `prod_${idCounter++}`,
              title: `${titleBase} - ${['Pro', 'Ultra', 'Max', 'Lite'][i%4]} Edition`,
              price: basePrice,
              originalPrice: parseFloat((basePrice * 1.2).toFixed(2)),
              currency: 'USDT',
              category: cat,
              rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
              reviews: Math.floor(Math.random() * 500),
              image: images[idx % images.length] || images[0],
              description: "Experience premium quality with this top-rated product. Features advanced technology, durable materials, and sleek design. Perfect for daily use or as a gift.",
              stock: Math.floor(Math.random() * 100),
              sold: Math.floor(Math.random() * 2000),
              shipping: Math.random() > 0.5 ? "Free Shipping" : "+ $5.00 Shipping",
              specs: {
                  "Brand": "GlobalTech",
                  "Warranty": "1 Year",
                  "Origin": "CN",
                  "Material": "Premium"
              }
          });
      }
  });

  return products;
};

// Cache products in memory
const ALL_PRODUCTS = generateProducts();

export const mockBackend = {
  getProducts: (): Product[] => {
    return ALL_PRODUCTS;
  },

  getProductById: (id: string): Product | undefined => {
    return ALL_PRODUCTS.find(p => p.id === id);
  },

  searchProducts: (query: string, category?: string): Product[] => {
    let res = ALL_PRODUCTS;
    if (category && category !== 'All') {
        res = res.filter(p => p.category === category);
    }
    if (query) {
        const q = query.toLowerCase();
        res = res.filter(p => p.title.toLowerCase().includes(q));
    }
    return res;
  },

  getCart: (): {items: any[], total: number} => {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : { items: [], total: 0 };
  },

  addToCart: (product: Product, qty: number = 1) => {
      const cart = mockBackend.getCart();
      const existing = cart.items.find((i: any) => i.id === product.id);
      if (existing) {
          existing.quantity += qty;
      } else {
          cart.items.push({ ...product, quantity: qty });
      }
      mockBackend.saveCart(cart);
  },

  removeFromCart: (id: string) => {
      const cart = mockBackend.getCart();
      cart.items = cart.items.filter((i: any) => i.id !== id);
      mockBackend.saveCart(cart);
  },

  saveCart: (cart: any) => {
      // Recalculate total
      cart.total = cart.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      // Dispatch event for UI updates
      window.dispatchEvent(new Event('cartUpdated'));
  },

  clearCart: () => {
      localStorage.removeItem(STORAGE_KEYS.CART);
      window.dispatchEvent(new Event('cartUpdated'));
  },

  // Auth & Orders
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  saveOrder: (order: Order) => {
      const orders = mockBackend.getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getOrders: (): Order[] => {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [];
  },

  // === Domain Methods ===
  getDomainById: (id: string): Domain | undefined => {
      const cleanId = id.replace(/^(real_|fallback_)/, '');
      const parts = cleanId.split('.');
      const tld = parts.length > 1 ? '.' + parts[parts.length - 1] : '.com';
      const name = parts.length > 1 ? parts.slice(0, -1).join('.') : cleanId;

      return {
          id: id,
          name: name,
          tld: tld,
          fullName: cleanId,
          price: id.includes('real') ? 12.99 : 14.99,
          currency: 'USDT',
          isPremium: false,
          owner: null,
          isListed: true,
          views: 12,
          description: "Premium Domain",
          privacyEnabled: true,
          autoRenew: true,
          nameservers: [],
          dnsRecords: []
      };
  },

  purchaseDomain: (id: string, years: number, ns: string[], opts: any) => {
      console.log('Domain purchased:', id, years, ns, opts);
      return true;
  }
};
