import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Restaurant from "@/lib/models/Restaurant";
import { memoryStore } from "@/lib/memory_store";

export async function GET() {
    try {
        await connectToDatabase();
        // Assume single restaurant for MVP context, id="1"
        const settings = await Restaurant.findOne({ ownerId: "1" }); // using ownerId as proxy for now
        if (settings) return NextResponse.json(settings);
    } catch (e) {
        console.warn("DB offline for settings fetch, using fallback");
    }
    return NextResponse.json(memoryStore.getSettings());
}

export async function PUT(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const settings = await Restaurant.findOneAndUpdate(
            { ownerId: "1" },
            body,
            { new: true, upsert: true }
        );
        return NextResponse.json(settings);
    } catch (e) {
        console.warn("DB offline for settings update, using fallback");
        const updated = memoryStore.updateSettings(body);
        return NextResponse.json(updated);
    }
}
