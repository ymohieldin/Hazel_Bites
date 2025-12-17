"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTicketProps {
    order: any; // Using any for now to simplify, ideally full type
    onAdvance: (orderId: string, currentStatus: string) => void;
}

export function OrderTicket({ order, onAdvance }: OrderTicketProps) {
    const [elapsed, setElapsed] = useState(0);

    // Calculate elapsed time in minutes
    useEffect(() => {
        const startTime = new Date(order.createdAt).getTime();

        const updateTime = () => {
            const now = new Date().getTime();
            const diffInMinutes = Math.floor((now - startTime) / 60000);
            setElapsed(diffInMinutes);
        };

        updateTime(); // Initial
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [order.createdAt]);

    const isLate = elapsed > 20;

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-orange-100 rounded-xl text-orange-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{(order.tableId?.number === 'pickup' || order.tableId?.number === 0) ? 'Pick' : 'Table'}</span>
                        <span className={cn("font-bold leading-none", (order.tableId?.number === 'pickup' || order.tableId?.number === 0) ? "text-xs" : "text-xl")}>
                            {(order.tableId?.number === 'pickup' || order.tableId?.number === 0) ? '& Go' : (order.tableId?.number || "?")}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">Order #{order.orderNumber || "?"}</span>
                        <span className="text-xs text-gray-400 font-mono">ID: {order._id.slice(-4)}</span>
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mt-1",
                            order.status === "pending" ? "bg-amber-100 text-amber-700" :
                                order.status === "preparing" ? "bg-blue-100 text-blue-700" :
                                    "bg-green-100 text-green-700"
                        )}>
                            {order.status}
                        </span>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
                    isLate ? "bg-red-50 text-red-600 border border-red-100 animate-pulse" : "bg-gray-50 text-gray-500 border border-gray-100"
                )}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}m</span>
                </div>
            </div>

            <div className="border-t border-dashed border-gray-100"></div>

            <div className="flex flex-col gap-3 flex-grow min-h-[100px]">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900 text-lg leading-tight">
                                <span className="text-orange-600 mr-2">{item.quantity}x</span>
                                {item.name}
                            </span>
                        </div>
                        {item.options && item.options.length > 0 && (
                            <div className="text-sm text-gray-500 pl-6 mt-1 space-y-0.5">
                                {item.options.map((opt: any, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                        {opt.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
                <Button
                    onClick={() => onAdvance(order._id, order.status)}
                    className={cn(
                        "w-full h-12 text-base rounded-xl shadow-none transition-all",
                        order.status === "pending" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-lg" :
                            order.status === "preparing" ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg" :
                                "bg-gray-900 hover:bg-black text-white"
                    )}
                >
                    {order.status === "pending" ? "Start Preparing" :
                        order.status === "preparing" ? "Mark Ready" : "Complete Order"}
                </Button>
            </div>
        </div>
    );
}
