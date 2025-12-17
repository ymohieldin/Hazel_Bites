"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Download, Trash2, Receipt, X, Printer, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Order {
    _id: string;
    tableId: { number: string | number; _id?: string } | string;
    items: { name: string; quantity: number; price: number; options?: any[] }[];
    status: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = () => {
        setIsDeleteConfirmOpen(true);
    };

    const performDelete = async () => {
        if (selectedOrders.size === 0) return;
        setIsDeleting(true);

        try {
            // Delete one by one for now as bulk delete API isn't set up
            const promises = Array.from(selectedOrders).map(id =>
                fetch(`/api/orders/delete?id=${id}`, { method: 'DELETE' })
            );

            await Promise.all(promises);
            setSelectedOrders(new Set());
            setIsDeleteConfirmOpen(false);
            fetchOrders();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete some orders");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelectOrder = (id: string) => {
        const newSet = new Set(selectedOrders);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedOrders(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
        }
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof order.tableId === 'object' ? order.tableId.number : order.tableId)?.toString().includes(searchQuery)
    );

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: "bg-green-100 text-green-700 border-green-200",
            served: "bg-green-100 text-green-700 border-green-200",
            cancelled: "bg-red-50 text-red-700 border-red-100",
            preparing: "bg-blue-50 text-blue-700 border-blue-100",
            pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
            payment_verification: "bg-purple-50 text-purple-700 border-purple-100"
        };
        const style = styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} capitalize`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    // Original receipt generator (kept for modal printing)
    const generateReceiptPDF = (orderList: Order[]) => {
        setIsExporting(true);
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: [80, 200]
            });

            orderList.forEach((order, index) => {
                if (index > 0) doc.addPage();

                let y = 10;
                const centerX = 40;

                // Header
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Hazel Bites", centerX, y, { align: "center" });
                y += 6;

                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text("Original Recipe", centerX, y, { align: "center" });
                y += 5;

                doc.setLineWidth(0.5);
                doc.line(5, y, 75, y);
                y += 5;

                // Order Info
                doc.setFontSize(9);
                doc.text(`Order: #${order._id.slice(-6).toUpperCase()}`, 5, y);
                y += 4;
                doc.text(`Date: ${format(new Date(order.createdAt), "MMM d, h:mm a")}`, 5, y);
                y += 4;
                doc.text(`Table: ${typeof order.tableId === 'object' ? order.tableId.number : order.tableId}`, 5, y);
                y += 6;

                doc.line(5, y, 75, y);
                y += 5;

                // Items
                doc.setFont("helvetica", "bold");
                doc.text("Item", 5, y);
                doc.text("Qty", 50, y);
                doc.text("Price", 75, y, { align: "right" });
                doc.setFont("helvetica", "normal");
                y += 5;

                order.items.forEach(item => {
                    const splitTitle = doc.splitTextToSize(item.name, 40);
                    doc.text(splitTitle, 5, y);
                    doc.text(`x${item.quantity}`, 50, y);
                    doc.text(`${(item.price * item.quantity).toFixed(0)}`, 75, y, { align: "right" });
                    y += (splitTitle.length * 4);

                    if (item.options && item.options.length > 0) {
                        doc.setFontSize(7);
                        doc.setTextColor(100);
                        item.options.forEach(opt => {
                            doc.text(`+ ${opt.name}`, 8, y);
                            y += 3;
                        });
                        doc.setFontSize(9);
                        doc.setTextColor(0);
                    }
                    y += 2;
                });

                y += 2;
                doc.line(5, y, 75, y);
                y += 6;

                // Totals
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text("TOTAL", 5, y);
                doc.text(`${order.totalAmount} EGP`, 75, y, { align: "right" });
                y += 6;

                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(`Payment: ${order.paymentMethod.toUpperCase()}`, 5, y);
                y += 10;

                doc.text("Thank you for dining with us!", centerX, y, { align: "center" });
            });

            doc.save(`receipt-${new Date().getTime()}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Error generating PDF");
        } finally {
            setIsExporting(false);
        }
    };

    // New tabular report generator (for the Export button)
    const exportReport = (orderList: Order[]) => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();

            const tableData = orderList.map(order => [
                `#${order._id.slice(-6).toUpperCase()}`,
                format(new Date(order.createdAt), "MMM d, h:mm a"),
                `T${typeof order.tableId === 'object' ? order.tableId.number : order.tableId}`,
                order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
                `${order.totalAmount} EGP`,
                order.paymentMethod.toUpperCase(),
                order.status
            ]);

            autoTable(doc, {
                head: [['Order ID', 'Date', 'Table', 'Items', 'Total', 'Payment', 'Status']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [234, 88, 12] } // Orange header
            });

            doc.save(`orders-report-${new Date().getTime()}.pdf`);
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportSelected = () => {
        if (selectedOrders.size === 0) return;
        const selectedList = orders.filter(o => selectedOrders.has(o._id));
        exportReport(selectedList);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Orders History</h1>
                    <p className="text-gray-500 font-medium">View and manage all customer orders.</p>
                </div>
                <div className="flex gap-2">
                    {selectedOrders.size > 0 && (
                        <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={confirmDelete}
                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border shadow-none"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedOrders.size})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportSelected}
                                disabled={isExporting}
                                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                Export ({selectedOrders.size})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-100/50 bg-white overflow-hidden rounded-2xl">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-gray-900">All Orders ({orders.length})</h2>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by Order ID or Table..."
                            className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-orange-500/20 focus:border-orange-500 rounded-xl transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 w-4">
                                    <Checkbox
                                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="rounded-md border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                    />
                                </th>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Table</th>
                                <th className="px-6 py-4 font-semibold">Items</th>
                                <th className="px-6 py-4 font-semibold">Total</th>
                                <th className="px-6 py-4 font-semibold">Payment</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" /> Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer group ${selectedOrders.has(order._id) ? 'bg-orange-50/30' : ''}`}
                                        onClick={() => setViewOrder(order)}
                                    >
                                        <td className="p-4 w-4" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedOrders.has(order._id)}
                                                onCheckedChange={() => toggleSelectOrder(order._id)}
                                                className="rounded-md border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-gray-400 group-hover:text-orange-600 transition-colors">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">
                                                    {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {order.createdAt ? format(new Date(order.createdAt), "h:mm a") : "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-8 px-3 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-gray-700 w-max shadow-sm text-xs">
                                                {(typeof order.tableId === 'object' ? order.tableId.number : order.tableId) === 0 ? "Pick & Go" : `T${typeof order.tableId === 'object' ? order.tableId.number : order.tableId}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-gray-900">{order.items.length} items</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                    {order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1} more`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900">
                                            {order.totalAmount} EGP
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 capitalize">{order.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Receipt Modal */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl gap-0 [&>button]:hidden">
                    <div className="bg-orange-600 p-6 flex flex-col items-center justify-center text-white relative">
                        <button
                            onClick={() => setViewOrder(null)}
                            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Order Receipt</DialogTitle>
                        <DialogDescription className="text-orange-100 flex items-center gap-2 mt-1">
                            #{viewOrder?._id.slice(-6).toUpperCase()} • {viewOrder && format(new Date(viewOrder.createdAt), "MMM d, h:mm a")}
                        </DialogDescription>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                        {viewOrder && (
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50 border-dashed">
                                        <span className="text-gray-500 text-sm font-medium">Table Number</span>
                                        <span className="font-bold text-lg text-gray-900">
                                            {(typeof viewOrder.tableId === 'object' ? viewOrder.tableId.number : viewOrder.tableId) === 0 ? "Pick & Go" : `T${typeof viewOrder.tableId === 'object' ? viewOrder.tableId.number : viewOrder.tableId}`}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {viewOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-sm">
                                                <div className="flex gap-3">
                                                    <span className="font-bold text-gray-400 w-4">{item.quantity}x</span>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{item.name}</span>
                                                        {item.options && item.options.length > 0 && (
                                                            <span className="text-xs text-gray-500">
                                                                {item.options.map(o => `+ ${o.name}`).join(", ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-700">
                                                    {(item.price * item.quantity).toFixed(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 border-dashed space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-medium">{viewOrder.totalAmount} EGP</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Tax</span>
                                            <span className="font-medium">Included</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 text-base">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-black text-xl text-orange-600">{viewOrder.totalAmount} EGP</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 font-medium px-2">
                                    <span>Payment: {viewOrder.paymentMethod.toUpperCase()}</span>
                                    <span className="flex items-center gap-1">
                                        Status: <span className="text-gray-600 capitalize">{viewOrder.status.replace("_", " ")}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                        <Button
                            className="flex-1 bg-gray-900 text-white hover:bg-black rounded-xl h-12 font-bold shadow-lg shadow-gray-200"
                            onClick={() => viewOrder && generateReceiptPDF([viewOrder])}
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print Receipt
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="py-4 text-gray-600">
                            Are you sure you want to delete {selectedOrders.size} selected order{selectedOrders.size !== 1 ? 's' : ''}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
