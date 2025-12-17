"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ProductForm } from "@/components/admin/ProductForm";

export default function MenuManagementPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch("/api/admin/products"),
                fetch("/api/admin/categories")
            ]);

            if (prodRes.ok) setProducts(await prodRes.json());
            if (catRes.ok) setCategories(await catRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: !currentStatus } : p));
        try {
            await fetch("/api/admin/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: id, isAvailable: !currentStatus })
            });
        } catch (error) {
            console.error(error);
            fetchData();
        }
    };

    const deleteProduct = async (id: string) => {
        console.log("Delete requested for ID:", id);
        if (!id) {
            alert("Error: Invalid Product ID");
            return;
        }

        if (!confirm("Are you sure you want to delete this product?")) {
            console.log("Delete cancelled");
            return;
        }

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
            console.log("Delete response:", res.status);

            if (res.ok) {
                setProducts(prev => prev.filter(p => p._id !== id));
                console.log("Product removed locally");
            } else {
                const err = await res.text();
                console.error("Delete failed:", err);
                alert("Failed to delete product from server");
            }
        } catch (error) {
            console.error("Delete network error:", error);
            alert("Network error while deleting");
        }
    };

    const handleSaveProduct = async (productData: any) => {
        try {
            console.log("Saving product...", productData);
            const isEdit = !!productData._id;
            const res = await fetch("/api/admin/products", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...productData, restaurantId: "1" }) // Ensure restaurantId
            });

            console.log("Save response status:", res.status);

            if (res.ok) {
                await fetchData(); // Wait for fetch
                setIsFormOpen(false);
                setEditingProduct(null);
            } else {
                const err = await res.json();
                console.error("Save failed:", err);
                alert(`Failed to save: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to save product", error);
            alert("An error occurred while saving. Check console.");
        }
    };

    const openAddProduct = () => {
        console.log("Opening Add Product Form");
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const openEditProduct = (product: any) => {
        console.log("Opening Edit Product Form for:", product);
        if (!product) {
            alert("Error: Invalid product data");
            return;
        }
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    // Delete Confirmation State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const openDeleteConfirm = (id: string) => {
        setProductToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        const id = productToDelete;
        console.log("Processing Delete for ID:", id);

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p._id !== id));
                console.log("Product successfully removed");
                setIsDeleteOpen(false);
                setProductToDelete(null);
            } else {
                const err = await res.text();
                console.error("Delete failed:", err);
                alert("Failed to delete product. Server error.");
            }
        } catch (error) {
            console.error("Delete network error:", error);
            alert("Network error while deleting.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 font-sans pb-32">
            {/* Same Header/Category Manager code as before... (omitted for brevity in replace, but ensuring structure flows) */}
            <div className="w-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 mb-2 md:hidden">
                            <Link href="/admin" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Menu Management</h1>
                        <p className="text-gray-500">Manage categories, items, and add-ons.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <CategoryManager
                        categories={categories}
                        onUpdate={fetchData}
                        restaurantId="1"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
                        <Button onClick={openAddProduct} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md shadow-orange-200">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </div>

                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[100px] pl-6 py-4">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Add-ons</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                {product.image ? (
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-xs flex items-center justify-center h-full text-gray-400">No Img</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-gray-900 text-base">{product.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                {product.categoryId?.name || "Uncategorized"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.price.toFixed(0)} EGP</TableCell>
                                        <TableCell className="text-gray-500 text-sm">{product.options?.length || 0} options</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={product.isAvailable}
                                                onCheckedChange={() => toggleAvailability(product._id, product.isAvailable)}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" onClick={() => openEditProduct(product)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => openDeleteConfirm(product._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-32 text-gray-500">
                                            No products found. Click "Add Product" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-4">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                                <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <span className="text-xs flex items-center justify-center h-full text-gray-400">No Img</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 truncate pr-2">{product.name}</h3>
                                            <p className="text-sm text-gray-500">{product.categoryId?.name || "Uncategorized"}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-orange-600" onClick={() => openEditProduct(product)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-orange-600">{product.price.toFixed(0)} EGP</span>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => openDeleteConfirm(product._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Switch
                                                checked={product.isAvailable}
                                                onCheckedChange={() => toggleAvailability(product._id, product.isAvailable)}
                                                className="data-[state=checked]:bg-green-500 scale-90"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <ProductForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSaveProduct}
                    initialData={editingProduct}
                    categories={categories}
                />

                {/* Delete Confirmation Dialog */}
                {isDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this product? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="rounded-xl h-10 px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 shadow-red-200 shadow-lg"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

