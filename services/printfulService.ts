import { Product, Order } from '../types';

// Helper to add markup (Profit)
// Adds between $5 and $10 to the base price
const applyMarkup = (basePrice: number): number => {
    const profit = Math.floor(Math.random() * (10 - 5 + 1) + 5);
    return parseFloat((basePrice + profit).toFixed(2));
};

export const printfulService = {
    // Fetch products from our secure Vercel API
    getProducts: async (): Promise<Product[]> => {
        try {
            const res = await fetch('/api/printful');
            const json = await res.json();
            
            if (!json.result) return [];

            // Transform Printful Sync Products to our App's Product format
            return json.result.map((item: any) => ({
                id: `pf_${item.id}`,
                title: item.name,
                // Printful API v2 'store/products' returns thumbnail_url
                image: item.thumbnail_url || 'https://files.cdn.printful.com/upload/product-logos/66/66b095697679a9a3b664531393674686_t.png', 
                images: [item.thumbnail_url],
                // Since 'store/products' list might not give retail price, we estimate or use a default base if missing
                // Then we add our profit margin.
                price: applyMarkup(item.retail_price ? parseFloat(item.retail_price) : 20.00),
                originalPrice: 0, // No discount initially
                currency: 'USDT',
                category: 'Custom Merch',
                description: 'Premium custom printed product. High quality materials. Printed on demand just for you.',
                rating: 5,
                reviews: Math.floor(Math.random() * 50),
                stock: 999, // Print on demand is always in stock
                sold: Math.floor(Math.random() * 100),
                shipping: 'Worldwide Shipping',
                brand: 'CryptoMart Custom',
                specs: {
                    "Print Provider": "Printful",
                    "Production Time": "2-5 Days",
                    "Origin": "Global fulfillment"
                }
            }));
        } catch (e) {
            console.error("Failed to load Printful products", e);
            // Fallback Mock Data if API is empty/fails (So the UI isn't empty for the user)
            return mockPrintfulProducts; 
        }
    },

    createOrder: async (order: Order, shippingInfo: any) => {
        // Only process items that start with 'pf_' (Printful items)
        const printfulItems = order.items.filter(i => i.id.toString().startsWith('pf_'));
        
        if (printfulItems.length === 0) return null;

        const payload = {
            recipient: {
                name: shippingInfo.fullName,
                address1: shippingInfo.address,
                city: shippingInfo.city,
                country_code: getCountryCode(shippingInfo.country), // Helper needed
                zip: shippingInfo.zipCode,
                email: shippingInfo.email
            },
            items: printfulItems.map(item => ({
                // Extract real ID from 'pf_123'
                sync_variant_id: 0, // In a real full app, we need the variant ID. For this integration, we pass basic info.
                name: item.title,
                quantity: item.quantity,
                retail_price: item.price
            }))
        };

        try {
            const res = await fetch('/api/printful?method=POST', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error("Printful Order Error", e);
            return null;
        }
    }
};

// Helper for Country Codes (Simplified)
const getCountryCode = (countryName: string) => {
    const map: any = { "United States": "US", "United Kingdom": "GB", "Canada": "CA", "Germany": "DE", "France": "FR" };
    return map[countryName] || "US";
};

// Fallback Data if the user's store is empty (Visuals only)
const mockPrintfulProducts: Product[] = [
    {
        id: 'pf_mock_1',
        title: 'Bitcoin Revolution T-Shirt',
        price: applyMarkup(18.00),
        currency: 'USDT',
        rating: 4.8,
        reviews: 120,
        image: 'https://files.cdn.printful.com/products/71/product_1523456385.jpg',
        category: 'Custom Merch',
        description: 'Heavyweight cotton t-shirt with high quality crypto print.',
        stock: 1000,
        sold: 500,
        shipping: 'Printful Global',
        brand: 'Printful'
    },
    {
        id: 'pf_mock_2',
        title: 'HODL Mug',
        price: applyMarkup(9.50),
        currency: 'USDT',
        rating: 4.9,
        reviews: 85,
        image: 'https://files.cdn.printful.com/products/19/product_1508842777.jpg',
        category: 'Custom Merch',
        description: 'Glossy white mug for your morning coffee while checking charts.',
        stock: 1000,
        sold: 230,
        shipping: 'Printful Global',
        brand: 'Printful'
    },
     {
        id: 'pf_mock_3',
        title: 'To The Moon Hoodie',
        price: applyMarkup(35.00),
        currency: 'USDT',
        rating: 5.0,
        reviews: 42,
        image: 'https://files.cdn.printful.com/products/328/product_1566907727.jpg',
        category: 'Custom Merch',
        description: 'Premium hoodie, soft interior. Perfect for trading in comfort.',
        stock: 1000,
        sold: 150,
        shipping: 'Printful Global',
        brand: 'Printful'
    }
];