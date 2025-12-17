import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/lib/models/Order";
import Table from "@/lib/models/Table";
import { memoryStore } from "@/lib/memory_store";

export async function GET() {
    try {
        await connectToDatabase();
        // Health check
        await Table.findOne().select("_id").lean();

        const orders = await Order.find({
            status: { $in: ["payment_verification", "pending", "preparing", "ready"] },
        })
            .populate("tableId", "number")
            .sort({ createdAt: 1 });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Failed to fetch orders (using fallback):", error);
        // Fallback: active orders only
        const activeOrders = memoryStore.getOrders().filter(o =>
            ["payment_verification", "pending", "preparing", "ready"].includes(o.status)
        );
        return NextResponse.json(activeOrders);
    }
}

export async function PUT(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) { }

    try {
        await connectToDatabase();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            throw new Error("Order not found in DB");
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Failed to update order (trying fallback):", error);

        // Mock Update
        const activeOrders = memoryStore.updateOrder(body?.orderId, body?.status);
        if (activeOrders) {
            return NextResponse.json(activeOrders);
        }

        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
