import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Category from "@/lib/models/Category";
import Restaurant from "@/lib/models/Restaurant";

export const dynamic = "force-dynamic";

export async function GET() {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ order: 1 });
    return NextResponse.json(categories);
}

export async function POST(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    await connectToDatabase();
    if (!body?.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    let restaurantId = body.restaurantId;

    // Auto-resolve restaurant ID if missing or invalid
    if (!restaurantId || restaurantId.length !== 24) {
        let constRestaurant = await Restaurant.findOne({});
        if (!constRestaurant) {
            // Create default restaurant if none exists
            constRestaurant = await Restaurant.create({ name: "Hazel Bites", ownerId: "default" });
        }
        restaurantId = constRestaurant._id;
    }

    const newCategory = await Category.create({ ...body, restaurantId });
    return NextResponse.json(newCategory, { status: 201 });
}

export async function PUT(request: Request) {
    let body;
    try { body = await request.json(); } catch (e) { }

    await connectToDatabase();
    const { _id, ...updates } = body;

    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updated = await Category.findByIdAndUpdate(_id, updates, { new: true });
    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const result = await Category.findByIdAndDelete(id);

    if (!result) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
