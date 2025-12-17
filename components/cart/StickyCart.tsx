"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronUp, CreditCard, Banknote, Trash, CheckCircle2 } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StickyCartProps {
    restaurantId: string;
    tableNumber: string;
}

export function StickyCart({ restaurantId, tableNumber }: StickyCartProps) {
    const { totalItems, totalPrice, cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
    const [lastOrderNumber, setLastOrderNumber] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [view, setView] = useState<'cart' | 'instapay'>('cart');
    const [instapayHandle, setInstapayHandle] = useState("");


    // Fetch settings for Instapay
    useState(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (data.instapayUsername) setInstapayHandle(data.instapayUsername);
            })
            .catch(console.error);
    });



    const [isSplitMode, setIsSplitMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const toggleSplitMode = () => {
        setIsSplitMode(!isSplitMode);
        setSelectedItems(new Set());
    };

    const toggleItemSelection = (itemId: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        setSelectedItems(newSet);
    };

    // Calculate total for selected items or all items
    const activeItems = isSplitMode
        ? cartItems.filter(item => selectedItems.has(item.productId))
        : cartItems;

    const activeTotalPrice = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const activeTotalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async (method: string) => {
        if (isSplitMode && selectedItems.size === 0) {
            alert("Please select items to pay for.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber: tableNumber === 'pickup' ? 0 : parseInt(tableNumber),
                    items: activeItems,
                    totalAmount: activeTotalPrice,
                    paymentMethod: method
                }),
            });

            if (res.ok) {
                const order = await res.json();

                // Save to local history
                const history = JSON.parse(localStorage.getItem("order_history") || "[]");
                history.push(order._id);
                localStorage.setItem("order_history", JSON.stringify(history));

                setLastOrderNumber(order.orderNumber);
                setIsCheckoutSuccess(true);

                if (isSplitMode) {
                    // Remove ONLY selected items
                    selectedItems.forEach(id => removeFromCart(id));
                    setIsSplitMode(false);
                    setSelectedItems(new Set());
                } else {
                    clearCart();
                }

                // Redirect to status page after delay
                setTimeout(() => {
                    router.push(`/restaurant/${restaurantId}/table/${tableNumber}/status/${order._id}`);
                }, 2000);
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    const clearCartHandler = () => {
        if (confirm("Are you sure you want to clear your cart?")) {
            clearCart();
        }
    };

    // Update the RenderInstapayView to use activeTotalPrice
    const renderInstapayView = () => (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right">
            <DrawerHeader className="border-b border-gray-100 flex items-center justify-between pb-4">
                <Button variant="ghost" className="-ml-2" onClick={() => setView('cart')}>
                    <ChevronUp className="h-4 w-4 rotate-[-90deg] mr-1" /> Back
                </Button>
                <DrawerTitle className="text-xl font-bold">Instapay Payment</DrawerTitle>
                <div className="w-8"></div>
            </DrawerHeader>

            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-10 w-10 text-purple-600" />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Total: {activeTotalPrice.toFixed(0)} EGP</h3>
                    <p className="text-gray-500">Send the exact amount to:</p>
                </div>

                <div className="w-full bg-purple-50 p-6 rounded-2xl border border-purple-100 flex flex-col items-center gap-4">
                    <span className="text-3xl font-mono font-bold text-purple-700 select-all">
                        {instapayHandle ? instapayHandle.replace("@", "") : "N/A"}
                    </span>
                </div>

                <p className="text-xs text-center text-gray-400 max-w-xs">
                    After creating the transfer on Instapay, click "I have sent the money" below. A waiter will come to verify.
                </p>
            </div>

            <div className="p-6 border-t border-gray-100">
                <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-xl shadow-purple-200"
                    onClick={() => handleCheckout("instapay")}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Done - I have sent the money"}
                </Button>
            </div>
        </div>
    );

    if (totalItems === 0 && !isCheckoutSuccess) {
        return null;
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="fixed bottom-6 left-4 right-4 md:left-[50%] md:ml-[-240px] md:w-[480px] z-50 animate-in slide-in-from-bottom-5">
                    <Button
                        size="lg"
                        className="w-full h-16 rounded-2xl shadow-2xl shadow-black/20 bg-orange-600 hover:bg-orange-700 text-white flex justify-between items-center px-6 transition-all duration-300 transform active:scale-[0.98] border border-orange-500"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="font-bold text-lg">{totalItems} items</span>
                                <span className="text-xs opacity-90 font-medium">View Cart</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
                            <span className="font-bold text-xl">{totalPrice.toFixed(0)} EGP</span>
                        </div>
                    </Button>
                </div>
            </DrawerTrigger>

            <DrawerContent className="max-w-md mx-auto rounded-t-[2rem] bg-white">
                <DrawerTitle className="sr-only">Your Cart</DrawerTitle>
                <div className="mx-auto w-full max-w-md flex flex-col h-[85vh] font-sans">
                    {isCheckoutSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <ShoppingBag className="w-14 h-14 text-green-600" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-green-700 tracking-tight">Order Placed!</h2>
                                {lastOrderNumber && (
                                    <div className="bg-green-50 border-2 border-green-200 text-green-800 rounded-2xl py-3 px-6 inline-block">
                                        <div className="text-sm font-bold uppercase tracking-widest opacity-70">Order Number</div>
                                        <div className="text-5xl font-black tracking-tighter">#{lastOrderNumber}</div>
                                    </div>
                                )}
                                <p className="text-gray-500 text-xl font-medium max-w-[200px] mx-auto">Your food will be with you shortly.</p>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        view === 'instapay' ? renderInstapayView() : (
                            <>
                                <DrawerHeader className="flex items-center justify-between text-left border-b border-gray-100 pb-6 pt-6 px-6">
                                    <div>
                                        <DrawerTitle className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                                            Your Order
                                            <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full font-bold">
                                                {isSplitMode ? activeTotalItems : totalItems} items
                                            </span>
                                        </DrawerTitle>
                                        <DrawerDescription className="text-base text-gray-500 mt-1">
                                            {isSplitMode ? "Select items to pay for now." : "Review your items before placing the order."}
                                        </DrawerDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {tableNumber !== 'pickup' && (
                                            <Button
                                                variant={isSplitMode ? "default" : "outline"}
                                                size="sm"
                                                className={`rounded-xl ${isSplitMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 border-blue-200 bg-blue-50'}`}
                                                onClick={toggleSplitMode}
                                            >
                                                {isSplitMode ? "Cancel Split" : "Split Bill"}
                                            </Button>
                                        )}
                                        {!isSplitMode && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={clearCartHandler}
                                            >
                                                <Trash className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                </DrawerHeader>

                                <ScrollArea className="flex-1 px-6 py-6 bg-gray-50/50">
                                    <div className="space-y-4">
                                        {cartItems.map((item, idx) => (
                                            <div
                                                key={`${item.productId}-${idx}`}
                                                className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col gap-4 transition-all duration-200 ${isSplitMode
                                                    ? (selectedItems.has(item.productId) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-gray-100 opacity-60 grayscale-[0.5]')
                                                    : 'border-gray-100'
                                                    }`}
                                                onClick={isSplitMode ? () => toggleItemSelection(item.productId) : undefined}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    {isSplitMode && (
                                                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedItems.has(item.productId) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                            {selectedItems.has(item.productId) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                        </div>
                                                    )}
                                                    <div className="space-y-1 flex-1">
                                                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.name}</h3>
                                                        {item.options && item.options.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.options.map(o => (
                                                                    <span key={o.name} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                                        {o.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {item.instruction && (
                                                            <div className="mt-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-xl inline-block max-w-full break-words">
                                                                <span className="font-bold uppercase text-[10px] opacity-70 block mb-0.5">Note:</span>
                                                                {item.instruction}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                                                        {(item.price * item.quantity).toFixed(0)} EGP
                                                    </span>
                                                </div>

                                                {!isSplitMode && (
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.productId); }}
                                                            className="text-sm font-semibold text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            Remove
                                                        </button>

                                                        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1.5 border border-gray-200">
                                                            <button
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-gray-600 hover:scale-105 active:scale-95 transition-all font-bold text-lg"
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, item.quantity - 1); }}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="font-bold text-lg w-6 text-center text-gray-900">{item.quantity}</span>
                                                            <button
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 shadow-sm shadow-orange-200 text-white hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all font-bold text-lg"
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, item.quantity + 1); }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.05)] z-10">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-500 font-medium">
                                            <span>Subtotal ({isSplitMode ? activeTotalItems : totalItems} items)</span>
                                            <span>{activeTotalPrice.toFixed(0)} EGP</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xl font-bold text-gray-900">Total</span>
                                            <span className={`text-3xl font-black leading-none ${isSplitMode ? 'text-blue-600' : 'text-orange-600'}`}>
                                                {activeTotalPrice.toFixed(0)} EGP
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            size="lg"
                                            disabled={isLoading || (isSplitMode && activeTotalItems === 0)}
                                            className="h-16 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 hover:bg-gray-200 text-lg font-bold shadow-sm hover:shadow active:scale-[0.98] transition-all"
                                            onClick={() => handleCheckout("cash")}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="h-5 w-5" />
                                                    <span>Pay Cash</span>
                                                </div>
                                            </div>
                                        </Button>
                                        <Button
                                            size="lg"
                                            disabled={isLoading || (isSplitMode && activeTotalItems === 0)}
                                            className="h-16 rounded-2xl bg-gray-900 hover:bg-black text-white text-lg font-bold shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
                                            onClick={() => setView('instapay')}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5" />
                                                    <span>Pay Online</span>
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ))}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

