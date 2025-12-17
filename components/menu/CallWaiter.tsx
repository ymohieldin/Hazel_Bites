"use client";

import { useState } from "react";
import { Bell, X, Send, CheckCircle2, Utensils, Receipt, Droplets, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const QUICK_OPTIONS = [
    { label: "Water", icon: Droplets, text: "Can we get some water please?" },
    { label: "Bill", icon: Receipt, text: "Check/Bill please." },
    { label: "Napkins", icon: User, text: "Extra napkins please." }, // energetic/clean icon
    { label: "Cutlery", icon: Utensils, text: "We need some cutlery." },
];

export function CallWaiter({ tableNumber }: { tableNumber: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleCall = async (msgOverride?: string) => {
        const msgToSend = msgOverride || message;
        if (!msgToSend.trim()) return;

        setSending(true);
        try {
            await fetch("/api/service-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tableNumber,
                    message: msgToSend,
                    type: "waiter_call"
                })
            });
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setIsOpen(false);
                setMessage("");
            }, 3000);
        } catch (error) {
            console.error(error);
            alert("Failed to call waiter.");
        } finally {
            setSending(false);
        }
    };

    const handleQuickOption = (optionText: string) => {
        setMessage(optionText);
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-orange-600 text-white shadow-xl shadow-orange-200 hover:bg-orange-700 hover:scale-105 transition-all flex items-center justify-center md:bottom-8 md:right-8 animate-in zoom-in slide-in-from-bottom-4 duration-500"
            >
                <Bell className="h-6 w-6" />
                <span className="sr-only">Call Waiter</span>
                {/* Ping animation effect */}
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl gap-0 [&>button]:hidden">
                    {/* Header */}
                    <div className="bg-orange-600 p-6 flex flex-col items-center justify-center text-white relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
                            <Bell className="w-7 h-7" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Call Waiter</DialogTitle>
                        <p className="text-orange-100 text-sm mt-1">Table {tableNumber}</p>
                    </div>

                    {!sent ? (
                        <div className="p-6 space-y-6">

                            {/* Quick Options */}
                            <div className="grid grid-cols-4 gap-3">
                                {QUICK_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleQuickOption(opt.text)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all hover:bg-orange-50 active:scale-95 ${message === opt.text ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-100 bg-gray-50'}`}
                                    >
                                        <div className={`p-2 rounded-full ${message === opt.text ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-500'}`}>
                                            <opt.icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${message === opt.text ? 'text-orange-700' : 'text-gray-600'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    Custom Request
                                </label>
                                <Textarea
                                    placeholder="Type your request here..."
                                    className="min-h-[100px] rounded-2xl bg-gray-50 border-gray-200 resize-none focus:bg-white focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base p-4"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={() => handleCall()}
                                disabled={!message.trim() || sending}
                                className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-14 font-bold shadow-lg shadow-gray-200 text-lg transition-transform active:scale-[0.98]"
                            >
                                {sending ? "Sending..." : (
                                    <><Send className="mr-2 h-5 w-5" /> Send Request</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Request Sent!</h3>
                            <p className="text-gray-500 text-center font-medium leading-relaxed">
                                A waiter has been notified and will be at Table {tableNumber} shortly.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
