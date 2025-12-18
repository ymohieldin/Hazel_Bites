import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { memoryStore } from "@/lib/memory_store";

export const dynamic = "force-dynamic";

export async function GET() {
    await connectToDatabase();

    // Fetch products strictly from DB
    const products = await Product.find({})
        .populate("categoryId", "name")
        .sort({ createdAt: -1 });

    return NextResponse.json(products);
}

export async function POST(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    try {
        await connectToDatabase();
        if (!body.name || !body.price || !body.categoryId) {
            return NextResponse.json({ error: "Name, Price, and Category are required" }, { status: 400 });
        }

        const newProduct = await Product.create(body);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error("Create Product Error:", error);
        return NextResponse.json({
            error: `Create Failed: ${error.message || error.toString()}`,
            details: error
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    try {
        await connectToDatabase();
        const { _id, ...updates } = body;
        if (!_id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

        const updatedProduct = await Product.findByIdAndUpdate(_id, updates, { new: true });
        if (!updatedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("Update Product Error:", error);
        return NextResponse.json({
            error: `Update Failed: ${error.message || error.toString()}`,
            details: error
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

        const result = await Product.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ error: "Product not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Product Error:", error);
        return NextResponse.json({
            error: `Delete Failed: ${error.message || error.toString()}`,
            details: error
        }, { status: 500 });
    }
}
