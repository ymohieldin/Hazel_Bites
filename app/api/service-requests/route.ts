import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory_store";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // tableNumber is required
        if (!body.tableNumber) {
            return NextResponse.json({ error: "Table number required" }, { status: 400 });
        }

        const newRequest = memoryStore.addServiceRequest({
            tableNumber: body.tableNumber,
            message: body.message || "Assistance required",
            type: body.type || "general"
        });

        // In a real app, we would trigger a websocket/pusher event here
        return NextResponse.json(newRequest, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET() {
    // Only return pending requests for now
    const requests = memoryStore.getServiceRequests();
    return NextResponse.json(requests);
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        if (!body.id || !body.status) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

        // Only support resolving for now
        if (body.status === 'resolved') {
            const updated = memoryStore.resolveServiceRequest(body.id);
            return NextResponse.json(updated);
        }
        return NextResponse.json({ error: "Action not supported" }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
