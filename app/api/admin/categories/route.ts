import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Category from "@/lib/models/Category";
import Restaurant from "@/lib/models/Restaurant";
import { memoryStore } from "@/lib/memory_store";

export async function GET() {
    try {
        await connectToDatabase();
        // Health check
        await Restaurant.findOne().select("_id").lean();

        const categories = await Category.find({}).sort({ order: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Fetch Categories Error (using fallback):", error);
        return NextResponse.json(memoryStore.getCategories());
    }
}

export async function POST(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    try {
        await connectToDatabase();
        if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        let restaurantId = body.restaurantId;
        if (!restaurantId || restaurantId.length !== 24) {
            let constRestaurant = await Restaurant.findOne({});
            if (!constRestaurant) {
                constRestaurant = await Restaurant.create({ name: "Hazel Bites", ownerId: "default" });
            }
            restaurantId = constRestaurant._id;
        }

        const newCategory = await Category.create({ ...body, restaurantId });
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Create Category Error (using fallback):", error);

        // Mock Fallback
        const mockCategory = {
            _id: "mock-cat-" + Date.now(),
            name: body?.name || "New Category",
            restaurantId: body?.restaurantId || "1",
            order: body?.order || 0
        };
        const added = memoryStore.addCategory(mockCategory);
        return NextResponse.json(added, { status: 201 });
    }
}

export async function PUT(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    try {
        await connectToDatabase();
        const { _id, ...updates } = body;
        const updated = await Category.findByIdAndUpdate(_id, updates, { new: true });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update Category Error (using fallback):", error);

        // Mock Fallback
        const updated = memoryStore.updateCategory(body._id, body);
        if (updated) return NextResponse.json(updated);

        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        // Health Check
        await Restaurant.findOne().select("_id").lean();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await Category.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Category Error (using fallback):", error);

        // Mock Fallback
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (id) {
            memoryStore.deleteCategory(id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
