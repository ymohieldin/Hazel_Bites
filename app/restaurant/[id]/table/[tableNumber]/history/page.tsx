"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Clock, ChefHat, CheckCircle2, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderHistoryPage({ params }: { params: Promise<{ id: string; tableNumber: string }> }) {
    const { id, tableNumber } = use(params);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("order_history") || "[]");

        const fetchOrders = async () => {
            if (history.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch details for all orders in history
                // In a real app we'd have a bulk fetch or user session
                // Here we parallel fetch individual orders (not efficient but fine for MVP)
                const promises = history.map((oid: string) =>
                    fetch(`/api/orders/${oid}`).then(res => res.ok ? res.json() : null)
                );
                const results = await Promise.all(promises);
                setOrders(results.filter(o => o !== null).reverse()); // Newest first
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusIcon = (status: string) => {
        if (status === 'served') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        if (status === 'preparing') return <ChefHat className="w-5 h-5 text-blue-600" />;
        return <Clock className="w-5 h-5 text-orange-600" />;
    };

    const getStatusText = (status: string) => {
        if (status === 'payment_verification') return "Verifying Payment";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
                <Link href={`/restaurant/${id}/table/${tableNumber}`} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div className="flex-1 text-center pr-10">
                    <h1 className="font-bold text-lg">Your Orders</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
                        <p className="text-gray-500">Loading history...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Receipt className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
                        <p className="text-gray-500">Your past orders will appear here.</p>
                        <Link href={`/restaurant/${id}/table/${tableNumber}`}>
                            <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                                Browse Menu
                            </Button>
                        </Link>
                    </div>
                ) : (
                    orders.map(order => (
                        <Link
                            key={order._id}
                            href={`/restaurant/${id}/table/${tableNumber}/status/${order._id}`}
                            className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400">Order #{order._id.slice(-4)}</span>
                                    <h3 className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${order.status === 'served' ? 'bg-green-100 text-green-700' :
                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                    }`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                </div>
                            </div>

                            <div className="space-y-1 mb-3">
                                {order.items.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="text-sm text-gray-600 flex justify-between">
                                        <span>{item.quantity}x {item.name || item.productId?.name}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="text-xs text-gray-400 font-medium">
                                        + {order.items.length - 3} more items
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total</span>
                                <span className="font-bold text-lg text-gray-900">{order.totalAmount} EGP</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
