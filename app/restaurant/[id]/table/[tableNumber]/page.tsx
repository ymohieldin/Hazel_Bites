import React from "react";
// We would import db connect and models here to fetch data server-side
// For now we will mock data to verify UI flow as requested by the Plan.
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductModal } from "@/components/menu/ProductModal";
import { StickyCart } from "@/components/cart/StickyCart";
import { CallWaiter } from "@/components/menu/CallWaiter";
import { CartProvider } from "@/context/CartContext";
import { Utensils } from "lucide-react";

import { EGYPTIAN_MENU_DATA } from "@/lib/mock_data";

// Inner component to use hook contexts
import MenuPageClient from "@/components/menu/MenuPageClient";

export default async function MenuPage({ params }: { params: Promise<{ id: string; tableNumber: string }> }) {
    const { id, tableNumber } = await params;

    // Use memory store for consistent state between Admin and Customer views
    // This allows changes in Admin (Product/Category addition) to appear here even without DB.
    const { memoryStore } = await import("@/lib/memory_store");

    // We get the raw data from memory store
    const categories: any = memoryStore.getCategories();
    const products: any = memoryStore.getProducts();
    const settings = memoryStore.getSettings();

    const restaurantName = settings.name || "Hazel Bites";

    return (
        <CartProvider>
            <div className="bg-gray-50 min-h-screen pb-24 flex flex-col">
                <main className="flex-1">
                    <MenuPageClient categories={categories} products={products} restaurantName={restaurantName} />
                </main>

                <footer className="py-6 text-center text-gray-400 text-xs font-medium">
                    Powered by Hazel Bites
                </footer>

                <StickyCart restaurantId={id} tableNumber={tableNumber} />
                {tableNumber !== 'pickup' && <CallWaiter tableNumber={tableNumber} />}
            </div>
        </CartProvider>
    );
}
