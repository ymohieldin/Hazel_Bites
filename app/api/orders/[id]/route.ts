import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/lib/models/Order";
import { memoryStore } from "@/lib/memory_store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await connectToDatabase();
        const order = await Order.findById(id).populate("items.productId");

        if (!order) {
            // Check memory store
            const mockOrder = memoryStore.getOrders().find(o => o._id === id);
            if (mockOrder) return NextResponse.json(mockOrder);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        // Check memory store on DB error
        const mockOrder = memoryStore.getOrders().find(o => o._id === id);
        if (mockOrder) return NextResponse.json(mockOrder);
        return NextResponse.json({ error: "Order not found or DB Error" }, { status: 404 });
    }
}
