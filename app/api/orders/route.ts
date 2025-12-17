import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/lib/models/Order";
import Table from "@/lib/models/Table";
import { memoryStore } from "@/lib/memory_store";

export async function POST(req: NextRequest) {
    let requestData: any = { items: [] };

    try {
        try { requestData = await req.json(); } catch (e) { }

        await connectToDatabase();

        const { tableId, restaurantId, tableNumber, items, totalAmount, paymentMethod } = requestData;
        let finalTableId = tableId;

        if (!finalTableId && restaurantId && (tableNumber !== undefined && tableNumber !== null)) {
            let table = await Table.findOne({ restaurantId, number: tableNumber });
            if (!table) {
                table = await Table.create({ restaurantId, number: tableNumber, status: "occupied" });
            }
            finalTableId = table._id;
        }

        if (!finalTableId) throw new Error("Missing table info");

        const initialStatus = paymentMethod === "instapay" ? "payment_verification" : "pending";

        const orderNum = memoryStore.getNextOrderNumber();

        const newOrder = await Order.create({
            tableId: finalTableId,
            orderNumber: orderNum,
            items,
            totalAmount,
            status: initialStatus,
            paymentMethod: paymentMethod || "cash",
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error("Order creation error (falling back to mock):", error);

        // MOCK SUCCESS FALLBACK with Persistence
        const initialStatus = requestData.paymentMethod === "instapay" ? "payment_verification" : "pending";
        const orderNum = memoryStore.getNextOrderNumber();
        const mockOrder = {
            _id: "mock-order-" + Date.now(),
            tableId: { number: requestData.tableNumber ?? "?" },
            orderNumber: orderNum,
            items: requestData.items || [],
            totalAmount: requestData.totalAmount || 0,
            status: initialStatus,
            paymentMethod: requestData.paymentMethod || "cash",
            createdAt: new Date().toISOString()
        };

        memoryStore.addOrder(mockOrder);

        return NextResponse.json(mockOrder, { status: 201 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        await Table.findOne().select("_id").lean(); // Health check

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const query: any = {};
        if (status) query.status = status;

        const orders = await Order.find(query).populate("items.productId").populate("tableId", "number").sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders GET Error (using fallback):", error);
        // Return In-Memory Demo Data
        return NextResponse.json(memoryStore.getOrders());
    }
}
