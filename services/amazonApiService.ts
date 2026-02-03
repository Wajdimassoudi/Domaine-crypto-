
import { Product } from '../types';

const PROXY_URL = '/api/amazon';

export const amazonApiService = {
  // Transform Amazon API response to our App Product type
  transformProduct: (p: any): Product => {
    // Amazon API returns prices in different formats, we normalize it
    const rawPrice = p.product_price ? parseFloat(p.product_price.replace(/[^0-9.]/g, '')) : 29.99;
    
    return {
      id: p.asin,
      title: p.product_title || p.title,
      price: rawPrice,
      originalPrice: p.product_original_price ? parseFloat(p.product_original_price.replace(/[^0-9.]/g, '')) : undefined,
      currency: 'USDT',
      rating: parseFloat(p.product_star_rating) || 4.5,
      reviews: parseInt(p.product_num_ratings) || 100,
      image: p.product_photo || (p.product_photos && p.product_photos[0]) || '',
      images: p.product_photos || [p.product_photo],
      category: 'Electronics', // Default, can be mapped
      description: p.product_description || "High-quality product from Amazon catalog.",
      stock: 50,
      sold: Math.floor(Math.random() * 1000) + 100,
      shipping: "Free Global Shipping",
      brand: p.product_byline || "Amazon Global",
      specs: {
        "ASIN": p.asin,
        "Source": "Amazon Real-time",
        "Condition": "New"
      }
    };
  },

  searchProducts: async (query: string, page: number = 1): Promise<Product[]> => {
    try {
      const res = await fetch(`${PROXY_URL}?endpoint=search&q=${encodeURIComponent(query)}&page=${page}`);
      const data = await res.json();
      if (data.data && data.data.products) {
        return data.data.products.map(amazonApiService.transformProduct);
      }
      return [];
    } catch (e) {
      console.error("Amazon Search Error", e);
      return [];
    }
  },

  getProductsByCategory: async (categoryId: string, page: number = 1): Promise<Product[]> => {
    try {
      const res = await fetch(`${PROXY_URL}?endpoint=products-by-category&category_id=${categoryId}&page=${page}`);
      const data = await res.json();
      if (data.data && data.data.products) {
        return data.data.products.map(amazonApiService.transformProduct);
      }
      return [];
    } catch (e) {
      console.error("Amazon Category Error", e);
      return [];
    }
  },

  getProductDetails: async (asin: string): Promise<Product | null> => {
    try {
      const res = await fetch(`${PROXY_URL}?endpoint=product-details&asin=${asin}`);
      const data = await res.json();
      if (data.data) {
        return amazonApiService.transformProduct(data.data);
      }
      return null;
    } catch (e) {
      console.error("Amazon Details Error", e);
      return null;
    }
  }
};
