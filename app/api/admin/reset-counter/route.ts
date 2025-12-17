
import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory_store";

export async function POST(req: Request) {
    try {
        memoryStore.resetOrderCounter();
        return NextResponse.json({ success: true, message: "Order counter reset to 1" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to reset counter" }, { status: 500 });
    }
}
