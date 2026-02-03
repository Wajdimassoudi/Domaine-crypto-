
import { Product, User, Order, Domain } from '../types';
import { printfulService } from './printfulService';
import { amazonApiService } from './amazonApiService';
import { dbService } from './supabaseClient';

const STORAGE_KEYS = {
  CART: 'cryptomart_cart_v1',
  USER: 'cryptoreg_user_v3',
  ORDERS: 'cryptomart_orders_v1'
};

const APIs = {
  dummyjson: 'https://dummyjson.com/products',
  fakestore: 'https://fakestoreapi.com/products',
};

// Advanced expansion engine to generate thousands of unique items
const expandProducts = (baseProducts: any[]): Product[] => {
    const expanded: Product[] = [];
    const years = ["2022", "2023", "2024", "2025"];
    const conditions = ["New", "Certified Refurbished", "Open Box - Like New"];
    const storageOptions = ["128GB", "256GB", "512GB", "1TB"];
    const colors = ["Space Gray", "Silver", "Ocean Blue", "Phantom Black", "Pearl White"];

    baseProducts.forEach((p) => {
        const baseCategory = mapCategory(p.category);
        
        // Generate up to 30 variations per base product to reach thousands
        for (let i = 0; i < 30; i++) {
            const year = years[i % years.length];
            const condition = conditions[i % conditions.length];
            const color = colors[i % colors.length];
            const isLatest = year === "2025";
            
            // Wholesale competitive pricing logic
            let wholesaleBase = p.price || 150;
            // Add variance based on variation index
            wholesaleBase = wholesaleBase * (0.85 + (i * 0.02)); 
            const finalPrice = parseFloat((wholesaleBase * 0.88).toFixed(2)); // Always 12% below retail

            const titleAddon = baseCategory === 'Smartphones' || baseCategory === 'Computers' 
                ? `${storageOptions[i % 4]} ${color}` 
                : `${color} Edition`;

            expanded.push({
                id: `${p.source || 'gen'}_${p.id}_v${i}`,
                title: `${p.title} ${isLatest ? 'Ultra Pro' : ''} ${titleAddon} (${year})`,
                price: finalPrice,
                originalPrice: parseFloat((finalPrice * 1.3).toFixed(2)),
                currency: 'USDT',
                rating: Math.min(5, (p.rating?.rate || p.rating || 4.2) + (Math.random() * 0.4)),
                reviews: Math.floor(Math.random() * 5000) + 200,
                image: p.image || p.thumbnail,
                images: p.images || [p.image || p.thumbnail],
                category: baseCategory,
                description: `Exclusive ${year} ${condition} model. ${p.description}. Sourced directly from wholesale partners for the CryptoMart ecosystem. High-performance guaranteed.`,
                stock: Math.floor(Math.random() * 1000) + 50,
                sold: Math.floor(Math.random() * 8000) + 500,
                shipping: "Priority Crypto Shipping (Insured)",
                brand: p.brand || "Global Tech Elite",
                specs: {
                    "Release Date": `${year}-01`,
                    "Condition": condition,
                    "Warranty": "Global Crypto-Warranty (24 Months)",
                    "Color": color,
                    "Wholesale ID": `W-BATCH-${Math.floor(Math.random() * 1000000)}`
                }
            });
        }
    });
    return expanded;
};

const mapCategory = (cat: string): string => {
    const c = cat.toLowerCase();
    if (c.includes('phone') || c.includes('mobile') || c.includes('smartphones')) return 'Smartphones';
    if (c.includes('laptop') || c.includes('pc') || c.includes('computer') || c.includes('tablet')) return 'Computers';
    if (c.includes('tv') || c.includes('television') || c.includes('home-appliances') || c.includes('lighting')) return 'Home & TV';
    if (c.includes('jewelery') || c.includes('watch') || c.includes('accessories')) return 'Jewelry & Watches';
    if (c.includes('clothing') || c.includes('fashion') || c.includes('shirt') || c.includes('shoe')) return 'Fashion';
    if (c.includes('game') || c.includes('console') || c.includes('toy')) return 'Gaming & Play';
    if (c.includes('fragrance') || c.includes('beauty') || c.includes('skin')) return 'Beauty & Health';
    if (c.includes('crypto') || c.includes('hardware') || c.includes('ledger')) return 'Crypto Hardware';
    return 'Electronics'; // Default fallback
};

export const mockBackend = {
  getProducts: async (limit: number = 100, skip: number = 0, source: string = 'all'): Promise<Product[]> => {
    try {
        if (source === 'printful') return await printfulService.getProducts();
        
        // Parallel fetch for speed
        const [djRes, fsRes] = await Promise.all([
            fetch(`${APIs.dummyjson}?limit=100`),
            fetch(APIs.fakestore)
        ]);
        
        const djData = await djRes.json();
        const fsData = await fsRes.json();
        
        const allBase = [
            ...djData.products.map((p: any) => ({ ...p, source: 'dj' })),
            ...fsData.map((p: any) => ({ ...p, source: 'fs' }))
        ];
        
        const allExpanded = expandProducts(allBase);
        
        // Return sorted by date/popularity simulation
        return allExpanded.sort((a, b) => b.sold - a.sold).slice(skip, skip + limit);
    } catch (e) {
        console.error("Critical API Error", e);
        return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
      return ['Smartphones', 'Computers', 'Home & TV', 'Fashion', 'Jewelry & Watches', 'Gaming & Play', 'Beauty & Health', 'Crypto Hardware'];
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    // Search in a large batch to find generated items
    const all = await mockBackend.getProducts(3000); 
    return all.find(p => p.id.toString() === id.toString());
  },

  searchProducts: async (query: string, category?: string): Promise<Product[]> => {
    const all = await mockBackend.getProducts(3000); // Massive search pool
    let filtered = all;
    
    if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q)
        );
    }
    
    return filtered;
  },

  getFlashDeals: async (): Promise<Product[]> => {
      const all = await mockBackend.getProducts(100);
      return all.filter(p => p.originalPrice).slice(0, 12).map(p => ({
          ...p,
          price: parseFloat((p.price * 0.75).toFixed(2)) // Extra 25% off for flash deals
      }));
  },

  getCart: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '{"items":[], "total":0}'),
  addToCart: (product: Product, qty: number = 1) => {
      const cart = mockBackend.getCart();
      const existing = cart.items.find((i: any) => i.id === product.id);
      if (existing) existing.quantity += qty;
      else cart.items.push({ ...product, quantity: qty });
      mockBackend.saveCart(cart);
  },
  removeFromCart: (id: string | number) => {
      const cart = mockBackend.getCart();
      cart.items = cart.items.filter((i: any) => i.id !== id);
      mockBackend.saveCart(cart);
  },
  saveCart: (cart: any) => {
      cart.total = cart.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
  },
  clearCart: () => {
      localStorage.removeItem(STORAGE_KEYS.CART);
      window.dispatchEvent(new Event('cartUpdated'));
  },
  getCurrentUser: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
  getOrders: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
  saveOrder: (order: Order) => {
      const orders = mockBackend.getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  createPrintfulOrder: async (order: Order, shipping: any) => ({ success: true }),
  getDomainById: (id: string): Domain | undefined => undefined,
  purchaseDomain: (id: string | number, years: number, ns: string[], fwd: any) => {}
};
