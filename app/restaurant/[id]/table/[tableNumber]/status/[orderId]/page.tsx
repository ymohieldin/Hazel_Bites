"use client";

import { useEffect, useState, use } from "react";
import { CheckCircle2, Clock, ChefHat, ArrowLeft, Download, Share2, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderStatusPage({ params }: { params: Promise<{ id: string; tableNumber: string; orderId: string }> }) {
    const { id, tableNumber, orderId } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // We'll reuse the kitchen orders API but filtered, or fetch specific order
                // For MVP, since we don't have a specific GET /orders/:id yet, we can filter from customer orders list or add endpoint
                // Let's assume we can fetch all and filter for now, or use a new endpoint.
                // Actually, I should make a GET /api/orders/:id endpoint.
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 3000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading || !order) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    const steps = [
        { id: "ordered", label: "Ordered", icon: Clock },
        { id: "preparing", label: "Preparing", icon: ChefHat },
        { id: "served", label: "Served", icon: CheckCircle2 },
    ];

    // Determine current step index
    let currentStepIndex = 0;
    if (order.status === "payment_verification") currentStepIndex = 0; // effectively ordered but waiting
    if (order.status === "pending") currentStepIndex = 0;
    if (order.status === "preparing") currentStepIndex = 1;
    if (order.status === "ready") currentStepIndex = 1; // "Ready" is part of preparing or between? Let's say it's end of preparing.
    if (order.status === "served") currentStepIndex = 2;

    const isPaymentVerification = order.status === "payment_verification";

    return (
        <div className="min-h-screen bg-gray-50 pb-32 font-sans print:bg-white print:p-0 print:min-h-0 print:pb-0">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 print:hidden">
                <Link href={`/restaurant/${id}/table/${tableNumber}`} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <div className="flex-1 text-center pr-10">
                    <h1 className="font-bold text-lg">Order #{order.orderNumber || order._id.slice(-4)}</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8 print:p-0 print:max-w-none print:space-y-4">

                {/* Status Hero - Hide on print */}
                <div className="text-center space-y-4 print:hidden">
                    {isPaymentVerification ? (
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Clock className="w-10 h-10 text-purple-600" />
                        </div>
                    ) : (
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-colors duration-500 ${currentStepIndex === 2 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                            }`}>
                            {currentStepIndex === 1 ? <ChefHat className="w-10 h-10 animate-bounce" /> :
                                currentStepIndex === 2 ? <CheckCircle2 className="w-10 h-10" /> :
                                    <Clock className="w-10 h-10" />}
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isPaymentVerification ? "Verifying Payment" :
                                currentStepIndex === 0 ? "Order Received" :
                                    currentStepIndex === 1 ? "Preparing your meal" :
                                        "Enjoy your meal!"}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isPaymentVerification ? "Please wait while our staff confirms your transfer." :
                                currentStepIndex === 0 ? "The kitchen has received your order." :
                                    currentStepIndex === 1 ? "Our chefs are cooking up something reliable." :
                                        "Served at your table."}
                        </p>
                    </div>
                </div>

                {/* Tracking Steps - Hide on print */}
                {!isPaymentVerification && (
                    <div className="relative print:hidden">
                        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 rounded-full" />
                        <div
                            className="absolute left-6 top-0 w-1 bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        <div className="space-y-8 relative">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className="flex items-center gap-4">
                                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${isCompleted ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className={isCompleted ? "text-gray-900 font-bold" : "text-gray-400 font-medium"}>
                                            {step.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Summary & Receipt */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-900 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
                        <div className="flex flex-col">
                            <span className="text-xl print:text-2xl">Hazel Bites</span>
                            <div className="flex flex-col mt-1 text-sm font-normal text-gray-600 print:text-gray-900">
                                <span>{tableNumber === 'pickup' ? 'Pick & Go' : `Table ${tableNumber}`}</span>
                                <span>Order No: #{order.orderNumber}</span>
                                <span className="text-xs text-gray-400 mt-1">Receipt ID: {order._id}</span>
                                <span className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Receipt',
                                            text: `Order #${order._id} from Hazel Bites`,
                                            url: window.location.href,
                                        }).catch(console.error);
                                    } else {
                                        alert("Share not supported on this device");
                                    }
                                }}
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                                onClick={() => window.print()}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                                    <span className="text-gray-700">{item.name || item.productId?.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {((item.price || item.productId?.price || 0) * item.quantity).toFixed(0)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t border-dashed border-gray-200 pt-3 mt-3 flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>{order.totalAmount} EGP</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                            Tax ID: 123-456-789
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Link href={`/restaurant/${id}/table/${tableNumber}`}>
                        <Button className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-lg">
                            <Utensils className="mr-2 h-4 w-4" /> Order More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
