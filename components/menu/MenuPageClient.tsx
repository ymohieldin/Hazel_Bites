"use client";

import React, { useState, useMemo } from "react";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductModal } from "@/components/menu/ProductModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Category {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isAvailable: boolean;
    options?: { name: string; price: number }[];
    categoryId: string;
}

export default function MenuPageClient({ categories, products, restaurantName }: { categories: Category[], products: Product[], restaurantName: string }) {
    const params = useParams();
    const tableNumber = params.tableNumber;
    const restaurantId = params.id;
    const { clearCart } = useCart();

    // Clear previous sessions for Pick & Go
    React.useEffect(() => {
        if (tableNumber === 'pickup') {
            // We want to clear on *initial* mount of a new session/scan
            // Since this runs on client, and we want to ensure fresh start:
            // Check if we already cleared for this session? Or just always clear?
            // "When scanning... clear". Scanning opens the page.
            // If I refresh, it might clear again? That might be annoying if I'm in middle of order.
            // But usually 'pickup' is a transient flow.
            // Let's use a sessionStorage flag to avoid clearing on refresh if desired, 
            // BUT user requirement is specific: "scanning... clear".
            // Scanning = new tab/window usually. 
            // If I just reload, I am technically not scanning again.
            // However, distinguishing scan vs reload is hard without query param.
            // Let's just clear on mount for now as per "Pick & Go" nature (fast, one-off). 
            // Actually, if a user adds items, then reloads, they lose items. 
            // Maybe check if 'order_history' exists?
            // The requirement says "clear [your orders] and the cart".
            // Implementation:
            clearCart();
            localStorage.removeItem("order_history");
        }
    }, []); // Run once on mount

    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        // First filter by availability
        const availableProducts = products.filter(p => p.isAvailable);

        if (activeCategory === "all") return availableProducts;
        return availableProducts.filter(p => {
            // Handle both object populate and string ID
            const pCatId = typeof p.categoryId === 'object' ? (p.categoryId as any)._id : p.categoryId;
            return pCatId === activeCategory;
        });
    }, [activeCategory, products]);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between max-w-md mx-auto">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">{restaurantName}</h1>
                        <p className="text-xs text-gray-500 font-medium">Table {tableNumber} • Welcome Guest</p>
                    </div>
                    <Link href={`/restaurant/${restaurantId}/table/${tableNumber}/history`}>
                        <Button variant="ghost" size="sm" className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100">
                            <Clock className="w-3.5 h-3.5 mr-1" /> Orders
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Categories */}
            <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <div className="p-6 space-y-6 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 pb-32">
                {activeCategory === "all" && (
                    <h2 className="font-bold text-2xl text-gray-900 col-span-full mb-2">Popular Items</h2>
                )}
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onClick={() => handleProductClick(product)}
                    />
                ))}
            </div>

            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
