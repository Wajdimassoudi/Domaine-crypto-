import { Product, User, Order, Domain } from '../types';

const STORAGE_KEYS = {
  CART: 'cryptomart_cart_v1',
  USER: 'cryptoreg_user_v3',
  ORDERS: 'cryptomart_orders_v1'
};

const API_BASE = 'https://dummyjson.com';

// Helper to transform API product to our App Product type
// We apply a 15% discount to make prices "competitive"
const transformProduct = (p: any): Product => {
    const originalPrice = p.price;
    const competitivePrice = parseFloat((p.price * 0.85).toFixed(2)); // Wholesale price simulation
    
    return {
        id: p.id,
        title: p.title,
        price: competitivePrice,
        originalPrice: originalPrice,
        currency: 'USDT',
        rating: p.rating,
        reviews: p.stock * 2 + 10, // Simulated reviews based on stock
        image: p.thumbnail,
        images: p.images,
        category: p.category,
        description: p.description,
        stock: p.stock,
        sold: Math.floor(Math.random() * 500) + 50,
        shipping: p.price > 50 ? "Free Global Shipping" : "+ $15.00 Shipping",
        brand: p.brand,
        specs: {
            "Brand": p.brand || "Generic",
            "SKU": p.sku || `SKU-${p.id}`,
            "Warranty": p.warrantyInformation || "1 Year Standard",
            "Weight": p.weight ? `${p.weight}kg` : "N/A"
        }
    };
};

export const mockBackend = {
  // === ASYNC API METHODS ===

  getProducts: async (limit: number = 30, skip: number = 0): Promise<Product[]> => {
    try {
        const res = await fetch(`${API_BASE}/products?limit=${limit}&skip=${skip}`);
        const data = await res.json();
        return data.products.map(transformProduct);
    } catch (e) {
        console.error("API Error", e);
        return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
      try {
          const res = await fetch(`${API_BASE}/products/category-list`);
          const data = await res.json();
          // Provide top 10 categories to avoid UI clutter
          return data.slice(0, 10);
      } catch (e) {
          return ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration'];
      }
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if(!res.ok) return undefined;
        const data = await res.json();
        return transformProduct(data);
    } catch (e) {
        return undefined;
    }
  },

  searchProducts: async (query: string, category?: string): Promise<Product[]> => {
    try {
        let url = `${API_BASE}/products/search?q=${query}`;
        if (category && category !== 'All') {
            url = `${API_BASE}/products/category/${category}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        return data.products.map(transformProduct);
    } catch (e) {
        return [];
    }
  },

  getFlashDeals: async (): Promise<Product[]> => {
      // Simulate flash deals by taking random high-discount items
      // DummyJSON doesn't have a "deal" endpoint, so we fetch standard and pick top rated
      try {
        const res = await fetch(`${API_BASE}/products?limit=8&skip=10&sortBy=rating&order=desc`);
        const data = await res.json();
        return data.products.map(transformProduct);
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
      // Recalculate total
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

  // === Legacy Domain Stub (to prevent build errors) ===
  getDomainById: (id: string): Domain | undefined => {
      return undefined;
  },
  purchaseDomain: (id: string, years: number = 1, nameservers: string[] = [], emailConfig: any = {}) => { return true; }
};