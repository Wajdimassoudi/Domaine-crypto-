
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
  amazon_mock: 'https://jsondata.reactbd.com/api/amazonproducts', // Keeping as fallback
  walmart: 'https://jsondata.reactbd.com/api/walmartproducts',
  all: 'https://jsondata.reactbd.com/api/products'
};

const transformDummyJSON = (p: any): Product => {
    const competitivePrice = parseFloat((p.price * 0.85).toFixed(2));
    return {
        id: p.id,
        title: p.title,
        price: competitivePrice,
        originalPrice: p.price,
        currency: 'USDT',
        rating: p.rating,
        reviews: p.stock ? p.stock * 2 : 50,
        image: p.thumbnail,
        images: p.images,
        category: p.category,
        description: p.description,
        stock: p.stock,
        sold: Math.floor(Math.random() * 500) + 50,
        shipping: p.price > 50 ? "Free Global Shipping" : "+ $15.00 Shipping",
        brand: p.brand || "Generic",
        specs: { "Brand": p.brand || "Generic", "SKU": p.sku || `SKU-${p.id}` }
    };
};

const transformReactBD = (p: any, sourceName: string): Product => {
    return {
        id: p._id || `rbd_${Math.random().toString(36).substr(2, 9)}`,
        title: p.title,
        price: parseFloat((p.price * 0.85).toFixed(2)),
        originalPrice: p.oldPrice || p.price,
        currency: 'USDT',
        rating: p.rating || 4.5,
        reviews: Math.floor(Math.random() * 200) + 20,
        image: p.image,
        images: [p.image], 
        category: p.category,
        description: p.description || "High quality imported product.",
        stock: 100,
        sold: Math.floor(Math.random() * 1000) + 100,
        shipping: "Free Express Shipping",
        brand: sourceName === 'amazon' ? 'Amazon Basic' : 'Global Brand',
        specs: { "Source": sourceName, "Authenticity": "100% Verified" }
    };
};

export const mockBackend = {
  getProducts: async (limit: number = 30, skip: number = 0, source: string = 'dummyjson', page: number = 1): Promise<Product[]> => {
    try {
        let products: Product[] = [];

        if (source === 'amazon') {
            // REAL AMAZON API CALL
            products = await amazonApiService.searchProducts('trending', page);
            // Optionally store in Supabase for caching
            products.forEach(p => dbService.cacheProduct(p).catch(() => {}));
        } else if (source === 'printful') {
            products = await printfulService.getProducts();
        } else if (source === 'dummyjson') {
            const res = await fetch(`${APIs.dummyjson}?limit=${limit}&skip=${skip}`);
            const data = await res.json();
            products = data.products.map(transformDummyJSON);
        } else {
            const url = APIs[source as keyof typeof APIs] || APIs.all;
            const res = await fetch(url);
            const data = await res.json();
            products = data.slice(skip, skip + limit).map((p: any) => transformReactBD(p, source));
        }
        return products;
    } catch (e) {
        console.error("API Error", e);
        return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
      try {
          const res = await fetch(`${APIs.dummyjson}/category-list`);
          const data = await res.json();
          return ['Custom Merch', 'Amazon Real-time', ...data.slice(0, 5)];
      } catch (e) { return ['Custom Merch', 'Amazon Real-time']; }
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    try {
        // 1. Check if ID is an ASIN (Amazon)
        if (typeof id === 'string' && id.length === 10 && !id.startsWith('pf_')) {
             const amzProd = await amazonApiService.getProductDetails(id);
             if (amzProd) return amzProd;
        }

        // 2. Check Cache/Supabase
        const cached = await dbService.getCachedProduct(id.toString());
        if (cached) return cached;

        // 3. Fallbacks
        if (id.toString().startsWith('pf_')) {
            const allPrintful = await printfulService.getProducts();
            return allPrintful.find(p => p.id === id);
        }
        if (!isNaN(Number(id))) {
             const res = await fetch(`${APIs.dummyjson}/${id}`);
             if(res.ok) return transformDummyJSON(await res.json());
        }
        return undefined;
    } catch (e) { return undefined; }
  },

  searchProducts: async (query: string, category?: string, source: string = 'dummyjson'): Promise<Product[]> => {
    try {
        if (source === 'amazon' || category === 'Amazon Real-time') {
            return await amazonApiService.searchProducts(query || 'best sellers');
        }
        if (source === 'printful' || category === 'Custom Merch') {
            const all = await printfulService.getProducts();
            return all.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
        }

        // Original DummyJSON Search
        let url = `${APIs.dummyjson}/search?q=${query}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.products.map(transformDummyJSON);
    } catch (e) { return []; }
  },

  getFlashDeals: async (): Promise<Product[]> => {
      try {
        const amz = await amazonApiService.searchProducts('deals', 1);
        const pf = await printfulService.getProducts();
        return [...amz.slice(0, 2), ...pf.slice(0, 2)];
      } catch (e) { return []; }
  },

  getCart: () => {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : { items: [], total: 0 };
  },

  addToCart: (product: Product, qty: number = 1) => {
      const cart = mockBackend.getCart();
      const existing = cart.items.find((i: any) => i.id === product.id);
      if (existing) existing.quantity += qty;
      else cart.items.push({ ...product, quantity: qty });
      mockBackend.saveCart(cart);
  },

  // Fix: Added missing removeFromCart method for Cart page
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

  // Fix: Added missing getCurrentUser method for DomainDetails page
  getCurrentUser: () => {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
  },

  getOrders: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
  
  saveOrder: (order: Order) => {
      const orders = mockBackend.getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  // Fix: Added missing createPrintfulOrder method for Cart page
  createPrintfulOrder: async (order: Order, shipping: any) => {
      return await printfulService.createOrder(order, shipping);
  },

  // Fix: Added missing getDomainById method for DomainDetails page
  getDomainById: (id: string): Domain | undefined => {
      // derive the domain from the ID prefix set in dynadotService
      if (id.startsWith('real_') || id.startsWith('fallback_')) {
          const fullName = id.replace('real_', '').replace('fallback_', '');
          const parts = fullName.split('.');
          return {
              id,
              name: parts[0],
              tld: ('.' + parts[parts.length - 1]),
              fullName: fullName,
              price: id.startsWith('real_') ? 12.99 : 14.99,
              currency: 'USDT',
              isPremium: false,
              owner: null,
              isListed: true,
              views: Math.floor(Math.random() * 100),
              description: "Premium virtual domain ready for development.",
              privacyEnabled: true,
              autoRenew: true,
              nameservers: [],
              dnsRecords: []
          };
      }
      return undefined;
  },

  // Fix: Added missing purchaseDomain method for DomainDetails page
  purchaseDomain: (id: string | number, years: number, nameservers: string[], forwarding: any) => {
      console.log(`[MockBackend] Purchasing domain ${id} for ${years} years with NS:`, nameservers);
  }
};
