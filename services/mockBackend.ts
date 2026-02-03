
import { Product, User, Order, Domain } from '../types';
import { printfulService } from './printfulService';
import { amazonApiService } from './amazonApiService';

const STORAGE_KEYS = {
  CART: 'cryptomart_cart_v1',
  USER: 'cryptoreg_user_v3',
  ORDERS: 'cryptomart_orders_v1'
};

const APIs = {
  dummyjson: 'https://dummyjson.com/products',
  fakestore: 'https://fakestoreapi.com/products',
};

// خوارزمية التوليد الضخم (Massive Generation) لإنشاء آلاف المنتجات
const expandProducts = (baseProducts: any[]): Product[] => {
    const expanded: Product[] = [];
    const years = ["2022", "2023", "2024", "2025"];
    const conditions = ["جديد تغليف مصنع", "مجدد درجة أولى", "مفتوح الكرتون - ممتاز"];
    const colors = ["أسود ملكي", "فضي مطفي", "أزرق محيطي", "ذهبي فاخر", "أبيض لؤلؤي"];
    
    baseProducts.forEach((p) => {
        const cat = mapCategory(p.category);
        
        // توليد 50 نسخة فريدة من كل منتج أساسي للوصول لآلاف المنتجات
        for (let i = 0; i < 50; i++) {
            const year = years[i % years.length];
            const color = colors[i % colors.length];
            
            // تسعير تنافسي (أقل من سعر الجملة العالمي بـ 15%)
            let wholesaleBase = p.price || 200;
            const variance = 0.8 + (Math.random() * 0.3); // تفاوت بسيط في السعر
            const finalPrice = parseFloat((wholesaleBase * 0.85 * variance).toFixed(2));

            expanded.push({
                id: `${p.source || 'gen'}_${p.id}_variation_${i}`,
                title: `${p.title} ${color} - إصدار ${year}`,
                price: finalPrice,
                originalPrice: parseFloat((finalPrice * 1.4).toFixed(2)),
                currency: 'USDT',
                rating: 4.5 + (Math.random() * 0.5),
                reviews: Math.floor(Math.random() * 10000) + 150,
                image: p.image || p.thumbnail,
                images: p.images || [p.image || p.thumbnail],
                category: cat,
                description: `منتج عالي الجودة من فئة ${cat}. هذا الموديل (${year}) يأتي بمواصفات مطورة وسعر منافس جداً وحصري لمستخدمي المنصة بالعملات الرقمية.`,
                stock: Math.floor(Math.random() * 2000) + 100,
                sold: Math.floor(Math.random() * 15000) + 1000,
                shipping: "شحن دولي سريع ومؤمن",
                brand: p.brand || "ماركة عالمية",
                specs: {
                    "تاريخ الصنع": year,
                    "الحالة": conditions[i % conditions.length],
                    "الضمان": "سنتين دولي",
                    "اللون": color,
                    "رمز الجملة": `WHL-${Math.floor(Math.random() * 1000000)}`
                }
            });
        }
    });
    return expanded;
};

const mapCategory = (cat: string): string => {
    const c = cat.toLowerCase();
    if (c.includes('phone') || c.includes('mobile')) return 'الهواتف الذكية';
    if (c.includes('laptop') || c.includes('pc') || c.includes('computer')) return 'الحواسيب واللابتوب';
    if (c.includes('tv') || c.includes('home') || c.includes('lighting')) return 'المنزل والتلفاز';
    if (c.includes('jewelery') || c.includes('watch')) return 'المجوهرات والساعات';
    if (c.includes('clothing') || c.includes('fashion') || c.includes('shirt')) return 'الموضة والأزياء';
    if (c.includes('game') || c.includes('console')) return 'الألعاب والترفيه';
    if (c.includes('beauty') || c.includes('fragrance')) return 'الجمال والصحة';
    return 'إلكترونيات عامة';
};

export const mockBackend = {
  getProducts: async (limit: number = 500, skip: number = 0, source: string = 'all'): Promise<Product[]> => {
    try {
        if (source === 'printful') return await printfulService.getProducts();
        
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
        return allExpanded.slice(skip, skip + limit);
    } catch (e) {
        return [];
    }
  },

  // FIX: Added getProductById to satisfy ProductDetails page requirements
  getProductById: async (id: string | number): Promise<Product | null> => {
    // If it looks like an Amazon ASIN (e.g. 10 char string)
    if (typeof id === 'string' && id.length === 10 && !id.includes('_')) {
        try {
            const amazonProduct = await amazonApiService.getProductDetails(id);
            if (amazonProduct) return amazonProduct;
        } catch (e) {}
    }

    // Otherwise look in the expanded pool
    const all = await mockBackend.getProducts(5000);
    return all.find(p => p.id.toString() === id.toString()) || null;
  },

  getCategories: async (): Promise<string[]> => {
      return ['الهواتف الذكية', 'الحواسيب واللابتوب', 'المنزل والتلفاز', 'الموضة والأزياء', 'المجوهرات والساعات', 'الألعاب والترفيه', 'الجمال والصحة'];
  },

  searchProducts: async (query: string, category?: string): Promise<Product[]> => {
    const all = await mockBackend.getProducts(5000); // جلب كمية ضخمة للبحث
    let filtered = all;
    
    if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    
    return filtered;
  },

  getFlashDeals: async () => (await mockBackend.getProducts(20)).slice(0, 12),
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
  createPrintfulOrder: async (o: any, s: any) => ({ success: true }),
  getDomainById: (id: string) => undefined,
  // FIX: Updated purchaseDomain to accept parameters used in DomainDetails page
  purchaseDomain: (id: string | number, years: number, nameservers: string[], emailForwarding: any) => {
      console.log(`Purchase finalized for domain ${id}`);
  }
};
