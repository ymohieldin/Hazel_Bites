import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import { ChefHat } from "lucide-react";

export const metadata = {
    title: "Kitchen Display System - QuickOrder",
};

export default function KitchenPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
                <div className="max-w-[1920px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-200">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">Kitchen Display System</h1>
                            <p className="text-gray-500 text-sm font-medium">Managing Live Orders</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 text-sm font-medium">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            Live Connection
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="text-sm font-mono text-gray-400">v1.2</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden">
                <div className="max-w-[1920px] mx-auto h-full">
                    <KitchenBoard />
                </div>
            </main>
        </div>
    );
}
