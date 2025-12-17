"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, QrCode, ChefHat, LogOut, Store, Settings, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders History", icon: ClipboardList },
    { href: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
    { href: "/admin/qr", label: "QR Codes", icon: QrCode },
    { href: "/dashboard/kitchen", label: "Kitchen View", icon: ChefHat },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                    <Store className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight text-gray-900">Hazel Bites</h1>
                    <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-12 mb-1 gap-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 shadow-sm ring-1 ring-orange-200"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-orange-600" : "text-gray-400")} />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
