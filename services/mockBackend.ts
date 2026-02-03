
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
  amazon_mock: 'https://jsondata.reactbd.com/api/amazonproducts',
  all: 'https://jsondata.reactbd.com/api/products'
};

const transformDummyJSON = (p: any): Product => ({
    id: `dj_${p.id}`,
    title: p.title,
    price: parseFloat((p.price * 0.9).toFixed(2)),
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
    shipping: "Free Global Shipping",
    brand: p.brand || "Global Tech",
    specs: { "Brand": p.brand || "Generic", "SKU": p.sku || `SKU-${p.id}` }
});

const transformFakeStore = (p: any): Product => ({
    id: `fs_${p.id}`,
    title: p.title,
    price: p.price,
    currency: 'USDT',
    rating: p.rating?.rate || 4.2,
    reviews: p.rating?.count || 120,
    image: p.image,
    images: [p.image],
    category: p.category,
    description: p.description,
    stock: 100,
    sold: Math.floor(Math.random() * 1000) + 100,
    shipping: "Standard Crypto Delivery",
    brand: "Imported",
    specs: { "Material": "High Quality", "Source": "Global Direct" }
});

export const mockBackend = {
  getProducts: async (limit: number = 30, skip: number = 0, source: string = 'dummyjson', page: number = 1): Promise<Product[]> => {
    try {
        if (source === 'amazon') {
            const products = await amazonApiService.searchProducts('trending', page);
            if (products.length > 0) return products;
            // Fallback to local mock if API fails
            const res = await fetch(APIs.amazon_mock);
            const data = await res.json();
            return data.slice(0, limit).map((p: any) => ({ ...p, id: p._id, currency: 'USDT' }));
        }
        
        if (source === 'printful') return await printfulService.getProducts();

        if (source === 'dummyjson') {
            const [djRes, fsRes] = await Promise.all([
                fetch(`${APIs.dummyjson}?limit=${limit/2}&skip=${skip}`),
                fetch(APIs.fakestore)
            ]);
            const djData = await djRes.json();
            const fsData = await fsRes.json();
            
            const djProds = djData.products.map(transformDummyJSON);
            const fsProds = fsData.slice(0, limit/2).map(transformFakeStore);
            
            return [...djProds, ...fsProds].sort(() => Math.random() - 0.5);
        }

        const res = await fetch(APIs.all);
        const data = await res.json();
        return data.slice(skip, skip + limit).map((p: any) => ({...p, currency: 'USDT'}));
    } catch (e) {
        console.error("API Fetch Error", e);
        return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
      try {
          const res = await fetch(`${APIs.dummyjson}/category-list`);
          const data = await res.json();
          return ['Custom Merch', 'Amazon Real-time', ...data.slice(0, 10)];
      } catch (e) { return ['Custom Merch', 'Amazon Real-time']; }
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    const idStr = id.toString();
    try {
        if (idStr.startsWith('dj_')) {
            const realId = idStr.replace('dj_', '');
            const res = await fetch(`${APIs.dummyjson}/${realId}`);
            return transformDummyJSON(await res.json());
        }
        if (idStr.startsWith('fs_')) {
            const realId = idStr.replace('fs_', '');
            const res = await fetch(`${APIs.fakestore}/${realId}`);
            return transformFakeStore(await res.json());
        }
        return await amazonApiService.getProductDetails(idStr) || undefined;
    } catch (e) { return undefined; }
  },

  searchProducts: async (query: string, category?: string, source: string = 'dummyjson'): Promise<Product[]> => {
    try {
        if (source === 'amazon' || category === 'Amazon Real-time') return await amazonApiService.searchProducts(query || 'best sellers');
        
        const res = await fetch(`${APIs.dummyjson}/search?q=${query}`);
        const data = await res.json();
        return data.products.map(transformDummyJSON);
    } catch (e) { return []; }
  },

  getFlashDeals: async (): Promise<Product[]> => {
      try {
        const res = await fetch(APIs.fakestore);
        const data = await res.json();
        return data.slice(5, 9).map(transformFakeStore);
      } catch (e) { return []; }
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
