// Simple in-memory store for Demo Mode when Database is offline
// Note: This data will reset when the server restarts.

export interface MockOrder {
    _id: string;
    tableId: { number: string; _id?: string };
    items: any[];
    status: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
}

export interface MockCategory {
    _id: string;
    name: string;
    restaurantId: string;
    order?: number;
}

export interface MockProduct {
    _id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string | any; // allow object for populate
    image?: string;
    isAvailable?: boolean;
    options?: any[];
    restaurantId?: string;
    createdAt?: string;
}

declare global {
    var _mockOrders: MockOrder[];
    var _mockCategories: MockCategory[];
    var _mockProducts: MockProduct[];
    var _mockRestaurantSettings: any;
    var _mockServiceRequests: any[];
    var _orderCounter: number;
}

// Initialize global store if not exists
if (global._orderCounter === undefined) {
    global._orderCounter = 1;
}

// Initialize global store if not exists
if (!global._mockOrders) {
    global._mockOrders = [
        {
            _id: "demo-kds-1",
            tableId: { number: "5" },
            status: "preparing",
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            totalAmount: 250,
            paymentMethod: "cash",
            items: [
                { name: "Koshary", quantity: 2, price: 60, options: [{ name: "Spicy" }] },
                { name: "Pepsi", quantity: 2, price: 65 }
            ]
        },
        {
            _id: "demo-kds-2",
            tableId: { number: "12" },
            status: "pending",
            createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            totalAmount: 180,
            paymentMethod: "online",
            items: [
                { name: "Hawawshi", quantity: 3, price: 50 },
                { name: "French Fries", quantity: 1, price: 30 }
            ]
        }
    ];
}

if (!global._mockCategories) {
    global._mockCategories = [
        { _id: "cat_popular", name: "Popular", restaurantId: "1" },
        { _id: "cat_burgers", name: "Burgers", restaurantId: "1" },
        { _id: "cat_egyptian", name: "Egyptian Classics", restaurantId: "1" },
        { _id: "cat_pizza", name: "Pizza", restaurantId: "1" },
        { _id: "cat_desserts", name: "Desserts", restaurantId: "1" },
        { _id: "cat_drinks", name: "Drinks", restaurantId: "1" }
    ];
}

import { EGYPTIAN_MENU_DATA } from "./mock_data";

if (!global._mockProducts) {
    // Seed from static data
    global._mockProducts = EGYPTIAN_MENU_DATA.products.map(p => ({
        ...p,
        restaurantId: "1",
        createdAt: new Date().toISOString()
    }));
}

export const memoryStore = {
    // Orders
    getOrders: () => global._mockOrders,
    addOrder: (order: MockOrder) => {
        global._mockOrders.push(order);
        return order;
    },
    updateOrder: (id: string, status: string) => {
        const order = global._mockOrders.find(o => o._id === id);
        if (order) {
            order.status = status;
            return order;
        }
        return null;
    },

    // Categories
    getCategories: () => global._mockCategories,
    addCategory: (category: MockCategory) => {
        if (!category._id) category._id = "mock-cat-" + Date.now();
        global._mockCategories.push(category);
        return category;
    },
    updateCategory: (id: string, updates: Partial<MockCategory>) => {
        const cat = global._mockCategories.find(c => c._id === id);
        if (cat) {
            Object.assign(cat, updates);
            return cat;
        }
        return null;
    },
    deleteCategory: (id: string) => {
        const initialLength = global._mockCategories.length;
        global._mockCategories = global._mockCategories.filter(c => c._id !== id);
        return global._mockCategories.length < initialLength;
    },

    // Products
    getProducts: () => global._mockProducts,
    addProduct: (product: MockProduct) => {
        if (!product._id) product._id = "mock-prod-" + Date.now();
        if (!product.createdAt) product.createdAt = new Date().toISOString();
        global._mockProducts.unshift(product); // Add to top
        return product;
    },
    updateProduct: (id: string, updates: Partial<MockProduct>) => {
        const prod = global._mockProducts.find(p => p._id === id);
        if (prod) {
            Object.assign(prod, updates);
            return prod;
        }
        return null;
    },
    deleteProduct: (id: string) => {
        const initialLength = global._mockProducts.length;
        global._mockProducts = global._mockProducts.filter(p => p._id !== id);
        return global._mockProducts.length < initialLength;
    },

    // Restaurant Settings
    getSettings: () => {
        if (!global._mockRestaurantSettings) {
            global._mockRestaurantSettings = {
                instapayUsername: "holiday_cafe",
                taxId: "123-456-789",
                name: "Hazel Bites Demo"
            };
        }
        return global._mockRestaurantSettings;
    },
    updateSettings: (updates: any) => {
        if (!global._mockRestaurantSettings) memoryStore.getSettings();
        Object.assign(global._mockRestaurantSettings, updates);
        return global._mockRestaurantSettings;
    },

    // Service Requests (Waiter Calls)
    getServiceRequests: () => global._mockServiceRequests || [],
    addServiceRequest: (req: any) => {
        if (!global._mockServiceRequests) global._mockServiceRequests = [];
        const newReq = { ...req, _id: "req-" + Date.now(), status: "pending", createdAt: new Date().toISOString() };
        global._mockServiceRequests.push(newReq);
        return newReq;
    },
    resolveServiceRequest: (id: string) => {
        if (!global._mockServiceRequests) return null;
        const req = global._mockServiceRequests.find(r => r._id === id);
        if (req) {
            req.status = "resolved";
            return req;
        }
        return null;
        return null;
    },

    // Global Order Counter
    getNextOrderNumber: () => {
        const current = global._orderCounter || 1;
        global._orderCounter = current + 1;
        return current;
    },
    resetOrderCounter: () => {
        global._orderCounter = 1;
        return 1;
    }
};

