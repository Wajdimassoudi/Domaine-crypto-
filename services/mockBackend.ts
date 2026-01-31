import { Product, User, Order, Domain } from '../types';
import { printfulService } from './printfulService';

const STORAGE_KEYS = {
  CART: 'cryptomart_cart_v1',
  USER: 'cryptoreg_user_v3',
  ORDERS: 'cryptomart_orders_v1'
};

const APIs = {
  dummyjson: 'https://dummyjson.com/products',
  amazon: 'https://jsondata.reactbd.com/api/amazonproducts',
  walmart: 'https://jsondata.reactbd.com/api/walmartproducts',
  all: 'https://jsondata.reactbd.com/api/products'
};

// --- Transformers ---

// 1. Transform DummyJSON format
const transformDummyJSON = (p: any): Product => {
    const originalPrice = p.price;
    const competitivePrice = parseFloat((p.price * 0.85).toFixed(2)); // 15% Off
    
    return {
        id: p.id,
        title: p.title,
        price: competitivePrice,
        originalPrice: originalPrice,
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
        specs: {
            "Brand": p.brand || "Generic",
            "SKU": p.sku || `SKU-${p.id}`,
            "Warranty": p.warrantyInformation || "1 Year Standard",
            "Weight": p.weight ? `${p.weight}kg` : "N/A"
        }
    };
};

// 2. Transform ReactBD (Amazon/Walmart) format
const transformReactBD = (p: any, sourceName: string): Product => {
    // ReactBD items usually have: _id, title, des, oldPrice, price, image, category
    const originalPrice = p.price; 
    const competitivePrice = parseFloat((p.price * 0.85).toFixed(2)); // 15% Off wholesale logic

    return {
        id: p._id || `rbd_${Math.random().toString(36).substr(2, 9)}`,
        title: p.title,
        price: competitivePrice,
        originalPrice: p.oldPrice || originalPrice,
        currency: 'USDT',
        rating: p.rating || 4.5,
        reviews: Math.floor(Math.random() * 200) + 20,
        image: p.image, // ReactBD provides direct image URL
        images: [p.image], 
        category: p.category,
        description: p.description || "High quality imported product directly from supplier.",
        stock: 100, // API doesn't allow stock tracking, simulating
        sold: Math.floor(Math.random() * 1000) + 100,
        shipping: "Free Express Shipping",
        brand: sourceName === 'amazon' ? 'Amazon Basic' : sourceName === 'walmart' ? 'Walmart Select' : 'Global Brand',
        specs: {
            "Source": sourceName === 'amazon' ? "Amazon Warehouse" : "Walmart Store",
            "Imported": "Yes",
            "Authenticity": "100% Verified"
        }
    };
};

export const mockBackend = {
  // === ASYNC API METHODS ===

  // Added 'printful' support
  getProducts: async (limit: number = 30, skip: number = 0, source: 'dummyjson' | 'amazon' | 'walmart' | 'printful' | 'all' = 'dummyjson'): Promise<Product[]> => {
    try {
        let products: Product[] = [];

        if (source === 'printful') {
            products = await printfulService.getProducts();
        } else if (source === 'dummyjson') {
            const res = await fetch(`${APIs.dummyjson}?limit=${limit}&skip=${skip}`);
            const data = await res.json();
            products = data.products.map(transformDummyJSON);
        } else {
            // ReactBD APIs return arrays directly
            const url = APIs[source as keyof typeof APIs];
            const res = await fetch(url);
            const data = await res.json();
            const slicedData = data.slice(skip, skip + limit);
            products = slicedData.map((p: any) => transformReactBD(p, source));
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
          // Mix in Printful category
          return ['Custom Merch', ...data.slice(0, 8), 'Electronics', 'Home'];
      } catch (e) {
          return ['Custom Merch', 'smartphones', 'laptops', 'home-decoration'];
      }
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    try {
        // Check if it's a Printful product
        if (id.toString().startsWith('pf_')) {
            const allPrintful = await printfulService.getProducts();
            return allPrintful.find(p => p.id === id);
        }

        // Try DummyJSON logic first (numeric IDs usually)
        if (!isNaN(Number(id))) {
             const res = await fetch(`${APIs.dummyjson}/${id}`);
             if(res.ok) {
                 const data = await res.json();
                 return transformDummyJSON(data);
             }
        }
        
        const res = await fetch(APIs.all);
        const data = await res.json();
        const found = data.find((p: any) => p._id == id || p.id == id);
        if (found) return transformReactBD(found, 'all');

        return undefined;
    } catch (e) {
        return undefined;
    }
  },

  searchProducts: async (query: string, category?: string, source: string = 'dummyjson'): Promise<Product[]> => {
    try {
        // Special case: If searching Printful
        if (source === 'printful' || category === 'Custom Merch') {
            const all = await printfulService.getProducts();
            return all.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
        }

        if (source === 'dummyjson') {
            let url = `${APIs.dummyjson}/search?q=${query}`;
            if (category && category !== 'All' && category !== 'Custom Merch') {
                url = `${APIs.dummyjson}/category/${category}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            return data.products.map(transformDummyJSON);
        } else {
            const url = APIs[source as keyof typeof APIs];
            const res = await fetch(url);
            const data = await res.json();
            
            let filtered = data.map((p: any) => transformReactBD(p, source));

            if (query) {
                filtered = filtered.filter((p: Product) => p.title.toLowerCase().includes(query.toLowerCase()));
            }
            if (category && category !== 'All') {
                filtered = filtered.filter((p: Product) => p.category.toLowerCase() === category.toLowerCase());
            }
            return filtered;
        }
    } catch (e) {
        return [];
    }
  },

  getFlashDeals: async (): Promise<Product[]> => {
      try {
        // Mix some Printful products into flash deals too!
        const printful = await printfulService.getProducts();
        const dummy = await fetch(`${APIs.dummyjson}?limit=6&skip=10&sortBy=rating&order=desc`).then(r => r.json());
        
        const dummyDeals = dummy.products.map(transformDummyJSON);
        return [...printful.slice(0, 2), ...dummyDeals];
      } catch (e) { return []; }
  },

  // === SYNC LOCAL STORAGE METHODS (Cart & User) ===

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
  
  // Create Printful Order Proxy
  createPrintfulOrder: async (order: Order, shipping: any) => {
      return await printfulService.createOrder(order, shipping);
  },

  getDomainById: (id: string): Domain | undefined => { return undefined; },
  purchaseDomain: (id: string, years: number = 1, nameservers: string[] = [], emailConfig: any = {}) => { return true; }
};