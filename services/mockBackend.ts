
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

// خوارزمية توسيع المنتجات لإنشاء آلاف الخيارات
const expandProducts = (baseProducts: any[]): Product[] => {
    const expanded: Product[] = [];
    const years = ["2022", "2023", "2024", "2025"];
    const conditions = ["New", "Refurbished (A+)", "Open Box"];

    baseProducts.forEach((p) => {
        // إنشاء 10 متغيرات لكل منتج أساسي للوصول لآلاف المنتجات
        for (let i = 0; i < 12; i++) {
            const year = years[i % years.length];
            const condition = conditions[i % conditions.length];
            const isLatest = year === "2025";
            
            // حساب سعر تنافسي (أقل من الجملة)
            let wholesalePrice = p.price || 100;
            if (i > 0) wholesalePrice = wholesalePrice * (0.8 + (i * 0.05)); // تنويع الأسعار
            const finalPrice = parseFloat((wholesalePrice * 0.9).toFixed(2)); // خصم 10% إضافي للسعر التنافسي

            expanded.push({
                id: `${p.source || 'gen'}_${p.id}_v${i}`,
                title: `${p.title} ${isLatest ? 'Pro Max' : ''} (${year} Edition)`,
                price: finalPrice,
                originalPrice: parseFloat((finalPrice * 1.25).toFixed(2)),
                currency: 'USDT',
                rating: Math.min(5, (p.rating?.rate || p.rating || 4) + (Math.random() * 0.5)),
                reviews: Math.floor(Math.random() * 2000) + 50,
                image: p.image || p.thumbnail,
                images: p.images || [p.image || p.thumbnail],
                category: mapCategory(p.category),
                description: `${p.description}. This ${year} model features upgraded components and is offered at a special crypto-exclusive wholesale price.`,
                stock: Math.floor(Math.random() * 500) + 20,
                sold: Math.floor(Math.random() * 5000) + 100,
                shipping: "Free Express Shipping",
                brand: p.brand || "Global Elite",
                specs: {
                    "Model Year": year,
                    "Condition": condition,
                    "Warranty": "2 Years Global",
                    "Authenticity": "100% Guaranteed",
                    "Wholesale ID": `WHS-${Math.floor(Math.random() * 99999)}`
                }
            });
        }
    });
    return expanded;
};

const mapCategory = (cat: string): string => {
    const c = cat.toLowerCase();
    if (c.includes('phone') || c.includes('smartphones')) return 'Smartphones';
    if (c.includes('laptop') || c.includes('pc')) return 'Computers';
    if (c.includes('tv') || c.includes('lighting')) return 'Home & TV';
    if (c.includes('jewelery')) return 'Jewelry';
    if (c.includes('clothing') || c.includes('fashion')) return 'Fashion';
    if (c.includes('game') || c.includes('console')) return 'Gaming';
    if (c.includes('fragrance') || c.includes('beauty')) return 'Beauty';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export const mockBackend = {
  getProducts: async (limit: number = 50, skip: number = 0, source: string = 'all'): Promise<Product[]> => {
    try {
        if (source === 'printful') return await printfulService.getProducts();
        
        // جلب البيانات من المصادر المتعددة
        const [djRes, fsRes] = await Promise.all([
            fetch(`${APIs.dummyjson}?limit=100`),
            fetch(APIs.fakestore)
        ]);
        
        const djData = await djRes.json();
        const fsData = await fsRes.json();
        
        // دمج وتوسيع البيانات لتصل للآلاف
        const allBase = [
            ...djData.products.map((p: any) => ({ ...p, source: 'dj' })),
            ...fsData.map((p: any) => ({ ...p, source: 'fs' }))
        ];
        
        const allExpanded = expandProducts(allBase);
        
        // الخلط العشوائي لضمان التنوع
        return allExpanded.sort(() => Math.random() - 0.5).slice(skip, skip + limit);
    } catch (e) {
        console.error("API Fetch Error", e);
        return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
      return ['Smartphones', 'Computers', 'Home & TV', 'Fashion', 'Jewelry', 'Gaming', 'Beauty', 'Custom Merch'];
  },

  getProductById: async (id: string | number): Promise<Product | undefined> => {
    // بما أننا نولد المنتجات ديناميكياً، سنقوم بجلبها والبحث عن الـ ID
    const all = await mockBackend.getProducts(2000); 
    return all.find(p => p.id.toString() === id.toString());
  },

  searchProducts: async (query: string, category?: string, source: string = 'all'): Promise<Product[]> => {
    const all = await mockBackend.getProducts(1000);
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
      const all = await mockBackend.getProducts(50);
      return all.slice(0, 8).map(p => ({ ...p, price: parseFloat((p.price * 0.8).toFixed(2)) }));
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
