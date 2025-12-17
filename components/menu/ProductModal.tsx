"use client";

import * as React from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/context/CartContext";

interface ProductOption {
    name: string;
    price: number;
}

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    options?: ProductOption[];
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = React.useState(1);
    const [selectedOptions, setSelectedOptions] = React.useState<ProductOption[]>([]);
    const [instruction, setInstruction] = React.useState("");

    // Reset state when product changes
    React.useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedOptions([]);
            setInstruction("");
        }
    }, [isOpen, product]);

    if (!product) return null;

    const toggleOption = (option: ProductOption) => {
        setSelectedOptions((prev) => {
            const exists = prev.find((o) => o.name === option.name);
            if (exists) {
                return prev.filter((o) => o.name !== option.name);
            }
            return [...prev, option];
        });
    };

    const totalPrice = (product.price + selectedOptions.reduce((acc, opt) => acc + opt.price, 0)) * quantity;

    const handleAddToCart = () => {
        addToCart({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            options: selectedOptions,
            instruction: instruction.trim(),
        });
        onClose();
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} dismissible={false}>
            <DrawerContent className="bg-white max-h-[90vh] flex flex-col after:hidden">
                <DrawerTitle className="sr-only">{product.name}</DrawerTitle>

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all active:scale-95"
                >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                </Button>

                <div className="mx-auto w-full max-w-md flex flex-col flex-1 font-sans overflow-hidden">
                    <div className="flex-1 overflow-y-auto bg-gray-50/50">
                        {product.image && (
                            <div className="relative w-full h-64 shrink-0 shadow-sm">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h2 className="text-3xl font-extrabold shadow-sm leading-tight">{product.name}</h2>
                                    <p className="text-white/90 font-medium mt-1 text-lg">{product.price} EGP</p>
                                </div>
                            </div>
                        )}
                        <div className="px-6 pt-8 pb-12 space-y-8">
                            {/* Description (if no image) */}
                            {!product.image && (
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h2>
                                    <p className="text-xl text-orange-600 font-bold">{product.price} EGP</p>
                                </div>
                            )}

                            {product.description && (
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {product.description}
                                </p>
                            )}

                            {/* Options Section */}
                            {product.options && product.options.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        Add-ons
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {product.options.map((option) => {
                                            const isSelected = selectedOptions.some(o => o.name === option.name);
                                            return (
                                                <div
                                                    key={option.name}
                                                    onClick={() => toggleOption(option)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${isSelected
                                                        ? "bg-white border-2 border-orange-500 shadow-md shadow-orange-500/10"
                                                        : "bg-white border-2 border-transparent shadow-sm hover:border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-base ${isSelected ? "text-gray-900" : "text-gray-700"}`}>{option.name}</span>
                                                        <span className="text-sm text-gray-400">+{option.price.toFixed(0)} EGP</span>
                                                    </div>
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-gray-100 text-transparent"
                                                        }`}>
                                                        <div className="w-2.5 h-2.5 bg-current rounded-full" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Special Instructions */}
                            <div className="space-y-3">
                                <label htmlFor="instructions" className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    Special Requests
                                </label>
                                <textarea
                                    id="instructions"
                                    className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-gray-100 bg-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400 resize-none shadow-sm"
                                    placeholder="Any allergies or dietary preferences? e.g. No onions..."
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                />
                            </div>

                        </div>
                    </div>

                    <DrawerFooter className="p-6 border-t border-gray-100 bg-white space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <span className="font-bold text-gray-900 text-lg ml-4">Quantity</span>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 disabled:opacity-30 transition-all active:scale-95"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <span className="text-2xl font-black w-8 text-center text-gray-900">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-orange-100/50 hover:bg-orange-100 text-orange-600 transition-all active:scale-95"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            size="lg"
                            className="w-full h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex justify-between items-center px-6"
                        >
                            <span>Add to Order</span>
                            <span>{totalPrice.toFixed(0)} EGP</span>
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
