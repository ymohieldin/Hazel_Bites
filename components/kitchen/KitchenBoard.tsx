"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderTicket } from "./OrderTicket";
import { CheckCircle2, Clock, ChefHat, Bell, CreditCard } from "lucide-react";

export function KitchenBoard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        try {
            // Fetch Orders
            const resOrders = await fetch("/api/kitchen/orders");
            if (resOrders.ok) {
                const data = await resOrders.json();
                setOrders(data);
            }
            // Fetch Service Requests
            const resReqs = await fetch("/api/service-requests");
            if (resReqs.ok) {
                const data = await resReqs.json();
                setRequests(data.filter((r: any) => r.status === 'pending'));
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAdvanceOrder = async (orderId: string, currentStatus: string) => {
        let nextStatus = "preparing";
        if (currentStatus === "payment_verification") nextStatus = "pending";
        if (currentStatus === "pending") nextStatus = "preparing";
        if (currentStatus === "preparing") nextStatus = "ready";
        if (currentStatus === "ready") nextStatus = "served";

        // Optimistic Update
        setOrders(prev => prev.map(o =>
            o._id === orderId ? { ...o, status: nextStatus } : o
        ).filter(o => o.status !== "served"));

        try {
            await fetch("/api/kitchen/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: nextStatus })
            });
            // Don't fetch immediately to avoid race condition with slow DB
        } catch (error) {
            console.error("Update failed", error);
            fetchData(); // Revert on error
        }
    };

    const resolveRequest = async (id: string) => {
        // Optimistic
        setRequests(prev => prev.filter(r => r._id !== id));
        try {
            await fetch("/api/service-requests", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: 'resolved' })
            });
        } catch (e) {
            fetchData();
        }
    };

    const verificationOrders = orders.filter(o => o.status === "payment_verification");
    const pendingOrders = orders.filter(o => o.status === "pending");
    const preparingOrders = orders.filter(o => o.status === "preparing");
    const readyOrders = orders.filter(o => o.status === "ready");

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-140px)] gap-6">

            {/* Service Requests Alert Bar */}
            {requests.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-red-700 font-bold">
                        <div className="animate-pulse bg-red-100 p-2 rounded-full"><Bell className="h-5 w-5" /></div>
                        <span>{requests.length} Waiter Calls!</span>
                    </div>
                    {requests.map(req => (
                        <div key={req._id} className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-red-100">
                            <span className="font-bold text-gray-900">Table {req.tableNumber}</span>
                            <span className="text-sm text-gray-500 border-l border-gray-100 pl-3">{req.message}</span>
                            <button
                                onClick={() => resolveRequest(req._id)}
                                className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                {/* Payment Verification */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-purple-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <CreditCard className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="font-bold text-gray-900 leading-tight">Verify Payment</h2>
                        </div>
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{verificationOrders.length}</span>
                    </div>
                    <div className="flex-1 bg-purple-50/30 rounded-xl border-2 border-dashed border-purple-100 p-4 overflow-y-auto space-y-4">
                        {verificationOrders.map(order => (
                            <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-lg">
                                        {order.tableId?.number === 0 || order.tableId?.number === 'pickup' ? 'Pick & Go' : `Table ${order.tableId?.number}`}
                                    </span>
                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">Instapay</span>
                                </div>
                                <div className="text-2xl font-black text-gray-900">{order.totalAmount} EGP</div>
                                <div className="text-xs text-gray-500">Wait for funds... {new Date(order.createdAt).toLocaleTimeString()}</div>
                                <button
                                    onClick={() => handleAdvanceOrder(order._id, order.status)}
                                    className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                                >
                                    Confirm Received
                                </button>
                            </div>
                        ))}
                        {verificationOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-purple-300 text-sm">
                                <CreditCard className="w-8 h-8 mb-2 opacity-50" />
                                No payments to verify
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-500" />
                            </div>
                            <h2 className="font-bold text-gray-900">Pending</h2>
                        </div>
                        <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold">{pendingOrders.length}</span>
                    </div>
                    <div className="flex-1 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-4 overflow-y-auto space-y-4">
                        {pendingOrders.map(order => (
                            <OrderTicket key={order._id} order={order} onAdvance={handleAdvanceOrder} />
                        ))}
                    </div>
                </div>

                {/* Preparing */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ChefHat className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">Preparing</h2>
                        </div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{preparingOrders.length}</span>
                    </div>
                    <div className="flex-1 bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-100 p-4 overflow-y-auto space-y-4">
                        {preparingOrders.map(order => (
                            <OrderTicket key={order._id} order={order} onAdvance={handleAdvanceOrder} />
                        ))}
                    </div>
                </div>

                {/* Ready */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-green-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">Ready</h2>
                        </div>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">{readyOrders.length}</span>
                    </div>
                    <div className="flex-1 bg-green-50/30 rounded-xl border-2 border-dashed border-green-100 p-4 overflow-y-auto space-y-4">
                        {readyOrders.map(order => (
                            <OrderTicket key={order._id} order={order} onAdvance={handleAdvanceOrder} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
