"use client";

import React, { useState, useMemo } from "react";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductModal } from "@/components/menu/ProductModal";

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
    options: { name: string; price: number }[];
    categoryId: string;
}

export default function MenuPageClient({ categories, products }: { categories: Category[], products: Product[] }) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        if (activeCategory === "all") return products;
        return products.filter(p => p.categoryId === activeCategory);
    }, [activeCategory, products]);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <>
            <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <div className="p-4 space-y-4">
                {activeCategory === "all" && (
                    <h2 className="font-bold text-xl text-gray-900 mt-2">Popular Items</h2>
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
