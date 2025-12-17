"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, X, Upload } from "lucide-react";

interface ProductOption {
    name: string;
    price: number;
}

interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
    options: ProductOption[];
}

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData?: Product | null;
    categories: any[];
}

export function ProductForm({ isOpen, onClose, onSubmit, initialData, categories }: ProductFormProps) {
    const [formData, setFormData] = useState<Product>({
        name: "",
        description: "",
        price: 0,
        image: "",
        categoryId: "",
        options: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                description: "",
                price: 0,
                image: "",
                categoryId: categories[0]?._id || "",
                options: []
            });
        }
    }, [initialData, categories, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value
        }));
    };

    const handleOptionChange = (index: number, field: keyof ProductOption, value: any) => {
        const newOptions = [...formData.options];
        newOptions[index] = {
            ...newOptions[index],
            [field]: field === "price" ? parseFloat(value) || 0 : value
        };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: "", price: 0 }]
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white p-0 gap-0 rounded-2xl md:rounded-xl">
                <DialogHeader className="p-6 pb-4 border-b border-gray-100">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {initialData ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                                placeholder="e.g. Classic Burger"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (EGP)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>

                        {categories.length === 0 && (
                            <div className="p-3 mb-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex flex-col gap-2">
                                <span className="font-semibold">No categories found!</span>
                                <span>You must create a category (e.g., "Burgers") before adding products.</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Ideally checks if we can close and open query param, 
                                        // or just tell user to close and add.
                                        alert("Please close this form and click 'Add Category' on the menu page.");
                                        onClose();
                                    }}
                                    className="bg-white border-amber-300 hover:bg-amber-100 text-amber-900 w-fit"
                                >
                                    Go to Categories
                                </Button>
                            </div>
                        )}

                        <select
                            id="category"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your delicious product..."
                            className="flex min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="image" className="text-sm font-medium text-gray-700">Product Image</Label>

                        <div className="flex flex-col gap-4">
                            {/* Image Preview */}
                            {formData.image && (
                                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                        className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="flex items-center gap-2">
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const data = new FormData();
                                        data.append('file', file);

                                        try {
                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: data
                                            });
                                            if (res.ok) {
                                                const { url } = await res.json();
                                                setFormData(prev => ({ ...prev, image: url }));
                                            }
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Failed to upload image");
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor="image-upload"
                                    className="flex-1 cursor-pointer h-11 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all text-sm font-medium text-gray-600"
                                >
                                    <Upload className="h-4 w-4" />
                                    {formData.image ? "Change Image" : "Upload Image"}
                                </Label>
                            </div>

                            {/* Manual URL Input (Fallback) */}
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">URL</span>
                                <Input
                                    id="image"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="h-9 pl-10 bg-white border-gray-200 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Options / Add-ons */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-gray-900">Add-ons / Options</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-9 rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                <Plus className="mr-2 h-3 w-3" /> Add Option
                            </Button>
                        </div>

                        {formData.options.length === 0 && (
                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500">No add-ons created yet.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex gap-3 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <div className="flex-1 space-y-1">
                                        <Input
                                            placeholder="Option Name"
                                            value={option.name}
                                            onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                                            className="h-9 bg-white border-gray-200 text-sm"
                                        />
                                    </div>
                                    <div className="w-28 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                                        <Input
                                            type="number"
                                            value={option.price}
                                            onChange={(e) => handleOptionChange(index, "price", e.target.value)}
                                            className="h-9 pl-10 bg-white border-gray-200 text-sm"
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-9 w-9 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl w-full sm:w-auto">Cancel</Button>
                        <Button type="submit" className="h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto shadow-lg shadow-orange-200">
                            {initialData ? "Save Changes" : "Create Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
