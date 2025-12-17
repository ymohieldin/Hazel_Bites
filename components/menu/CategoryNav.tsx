import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
    _id: string;
    name: string;
}

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
}

export function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
    const allCategories = [{ _id: "all", name: "All Items" }, ...categories];

    return (
        <div className="sticky top-0 z-30 py-3 -mx-4 px-4 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-3 p-1">
                    {allCategories.map((category) => (
                        <button
                            key={category._id}
                            onClick={() => onSelectCategory(category._id)}
                            className={cn(
                                "px-6 py-3 rounded-full text-base font-bold transition-all duration-300 select-none",
                                activeCategory === category._id
                                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-105"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    );
}
