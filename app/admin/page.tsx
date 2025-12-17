"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, QrCode, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyticsData {
    today: {
        totalOrders: number;
        totalRevenue: number;
    };
    topItems: {
        _id: string; // Name
        count: number;
        revenue: number;
    }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="p-4 md:p-8 w-full space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Real-time overview of your restaurant.</p>
                </div>
            </header>

            {/* Stats Cards - Fluid Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                <Card className="rounded-xl shadow-sm border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {loading ? "..." : `${data?.today.totalRevenue.toFixed(0) || "0"} EGP`}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">20.1%</span>
                            <span className="text-xs">from yesterday</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Total Orders</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {loading ? "..." : data?.today.totalOrders || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">+12</span>
                            <span className="text-xs">new since last hour</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">Avg. Order Value</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {loading ? "..." :
                                (data?.today.totalOrders
                                    ? `${(data.today.totalRevenue / data.today.totalOrders).toFixed(0)} EGP`
                                    : "0 EGP")
                            }
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            <span className="text-xs">Based on today's sales</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section - Analytical Views */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

                {/* Visual Chart Placeholder: Sales Overview */}
                <Card className="rounded-xl shadow-sm border-gray-200 bg-white min-h-[300px]">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/30 py-4">
                        <CardTitle className="text-base font-semibold text-gray-900">Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        {/* Placeholder for a chart library (recharts, chart.js) */}
                        <div className="flex gap-2 items-end h-32 w-full justify-center opacity-50">
                            <div className="w-8 bg-blue-500 h-16 rounded-t-sm"></div>
                            <div className="w-8 bg-blue-500 h-24 rounded-t-sm"></div>
                            <div className="w-8 bg-blue-500 h-20 rounded-t-sm"></div>
                            <div className="w-8 bg-blue-600 h-32 rounded-t-sm"></div>
                            <div className="w-8 bg-blue-500 h-28 rounded-t-sm"></div>
                            <div className="w-8 bg-blue-500 h-12 rounded-t-sm"></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Hourly sales performance</p>
                    </CardContent>
                </Card>

                {/* Top Selling Items List */}
                <Card className="rounded-xl shadow-sm border-gray-200 bg-white min-h-[300px]">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/30 py-4">
                        <CardTitle className="text-base font-semibold text-gray-900">Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading stats...</div>
                        ) : data?.topItems && data.topItems.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {data.topItems.map((item, i) => (
                                    <div key={item._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{item._id}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">{item.count} sold</div>
                                            <div className="text-xs text-gray-500">{item.revenue} EGP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
                                <ShoppingBag className="h-8 w-8 opacity-20" />
                                <p>No sales data yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders Link */}
            <div className="flex justify-center">
                <Link href="/admin/orders">
                    <Button variant="ghost" className="text-gray-500 hover:text-orange-600 hover:bg-orange-50">
                        View Full Order History →
                    </Button>
                </Link>
            </div>
        </div>
    );
}
