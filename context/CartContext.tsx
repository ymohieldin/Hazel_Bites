"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
    productId: string; // Product ID
    name: string;
    price: number;
    quantity: number;
    options?: { name: string; price: number }[];
    instruction?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, options?: string) => void;
    updateQuantity: (productId: string, quantity: number, options?: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from session storage
    useEffect(() => {
        const savedCart = sessionStorage.getItem("quickorder_cart");
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to session storage
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem("quickorder_cart", JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (newItem: CartItem) => {
        setCartItems((prev) => {
            // Create a unique key for the item based on ID and options to group correctly
            const newItemKey = getItemKey(newItem);

            const existingItemIndex = prev.findIndex((item) => getItemKey(item) === newItemKey);

            if (existingItemIndex > -1) {
                // Update quantity if exists
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += newItem.quantity;
                return newCart;
            }
            // Add new
            return [...prev, newItem];
        });
    };

    const removeFromCart = (productId: string, optionsKey: string = "") => {
        setCartItems((prev) => prev.filter((item) => getItemKey(item) !== `${productId}-${optionsKey}`));
    };

    const updateQuantity = (productId: string, quantity: number, optionsKey: string = "") => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (getItemKey(item) === `${productId}-${optionsKey}`) {
                    return { ...item, quantity: Math.max(0, quantity) };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => {
        const itemTotal = (item.price + (item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0)) * item.quantity;
        return acc + itemTotal;
    }, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// Helper to generate a unique key for items based on options
function getItemKey(item: CartItem): string {
    const optionsString = item.options
        ? item.options
            .map((o) => o.name)
            .sort()
            .join(",")
        : "";
    return `${item.productId}-${optionsString}`;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
