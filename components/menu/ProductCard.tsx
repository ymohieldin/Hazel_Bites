import { Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

interface ProductCardProps {
    product: Product;
    onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-3xl p-3 shadow-sm border border-transparent transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-100 active:scale-[0.98] cursor-pointer flex gap-4 overflow-hidden"
        >
            {/* Image Container */}
            <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-xs">No Img</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 py-1">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors leading-tight mb-1.5">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-xl text-gray-900">
                        {product.price.toFixed(0)} <span className="text-xs font-bold text-gray-400 uppercase">EGP</span>
                    </span>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm group-active:scale-95"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
