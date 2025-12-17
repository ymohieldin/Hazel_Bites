"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, X, Edit2, Check } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    order: number;
}

interface CategoryManagerProps {
    categories: Category[];
    onUpdate: () => void;
    restaurantId: string;
}

export function CategoryManager({ categories, onUpdate, restaurantId }: CategoryManagerProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName, restaurantId, order: categories.length }),
            });
            if (!res.ok) throw new Error("Failed to add");

            setNewCategoryName("");
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error("Failed to add category", error);
            alert("Failed to add category. Please make sure database is connected.");
        }
    };

    const startEditing = (cat: Category) => {
        setEditingId(cat._id);
        setEditName(cat.name);
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        try {
            const res = await fetch("/api/admin/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: id, name: editName }),
            });

            if (res.ok) {
                setEditingId(null);
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to update", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect products using this category.")) return;
        try {
            await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
            onUpdate();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Categories (Menu Tabs)</h3>
                    <p className="text-sm text-gray-500">Drag to reorder (coming soon)</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Adding New Category Card */}
                {isAdding && (
                    <div className="flex flex-col gap-3 p-4 bg-orange-50/50 border-2 border-orange-500/20 rounded-xl shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <Label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">New Category</Label>
                        <Input
                            autoFocus
                            placeholder="e.g. Desserts"
                            className="h-10 bg-white border-orange-200 focus:border-orange-500 focus:ring-orange-500/20"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAdd();
                                if (e.key === 'Escape') setIsAdding(false);
                            }}
                        />
                        <div className="flex gap-2 mt-auto">
                            <Button size="sm" onClick={handleAdd} disabled={!newCategoryName} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="px-3 text-gray-500 hover:text-gray-700 rounded-lg">Cancel</Button>
                        </div>
                    </div>
                )}

                {categories.map((cat) => (
                    <div key={cat._id} className="group relative flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
                        {editingId === cat._id ? (
                            <div className="flex items-center gap-2 w-full">
                                <Input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdate(cat._id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                />
                                <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleUpdate(cat._id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors cursor-move">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <span
                                        className="font-semibold text-gray-700 truncate cursor-pointer hover:text-orange-600"
                                        onClick={() => startEditing(cat)}
                                        title="Click to edit"
                                    >
                                        {cat.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100">
                                    <button
                                        onClick={() => startEditing(cat)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all"
                                        title="Edit Category"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {categories.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No categories yet. Add one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
