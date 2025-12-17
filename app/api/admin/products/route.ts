import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { memoryStore } from "@/lib/memory_store";

export async function GET() {
    try {
        await connectToDatabase();
        // Health check
        await Product.findOne().select("_id").lean();

        const products = await Product.find({})
            .populate("categoryId", "name")
            .sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Fetch Products Error (using fallback):", error);
        // Emulate populate for category name
        const products = memoryStore.getProducts().map(p => {
            const cat = memoryStore.getCategories().find(c => c._id === p.categoryId);
            return {
                ...p,
                categoryId: typeof p.categoryId === 'string' ? { _id: p.categoryId, name: cat?.name || "Unknown" } : p.categoryId
            };
        });
        return NextResponse.json(products);
    }
}

export async function POST(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    await connectToDatabase();
    const newProduct = await Product.create(body);
    return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    await connectToDatabase();
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const updatedProduct = await Product.findByIdAndUpdate(_id, updates, { new: true });
    if (!updatedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(updatedProduct);
}

export async function DELETE(request: Request) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const result = await Product.findByIdAndDelete(id);

    if (!result) {
        return NextResponse.json({ error: "Product not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
