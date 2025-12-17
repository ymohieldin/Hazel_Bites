import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory_store";
import Order from "@/lib/models/Order";
import connectToDatabase from "@/lib/db";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        try {
            await connectToDatabase();
            await Order.findByIdAndDelete(id);
        } catch (e) {
            console.warn("DB offline for delete, using memory store");
            // If DB fails (or we are using mock), try memory store
            const order = memoryStore.getOrders().find(o => o._id === id);
            if (order) {
                // memoryStore update logic is limited in this simplified version, 
                // we'll just filter it out from the global array reference directly for MVP
                const index = memoryStore.getOrders().findIndex(o => o._id === id);
                if (index > -1) {
                    memoryStore.getOrders().splice(index, 1);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
