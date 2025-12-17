"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2, QrCode } from "lucide-react";
import jsPDF from "jspdf";

export default function QrGeneratorPage() {
    const [tableCount, setTableCount] = useState(10);
    const [restaurantId, setRestaurantId] = useState("1");
    const [origin, setOrigin] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Helper to create array of N items
    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            for (let i = 0; i < tables.length; i++) {
                if (i > 0) {
                    doc.addPage();
                }

                const tableNum = tables[i];
                const canvas = document.getElementById(`qr-code-${tableNum}`) as HTMLCanvasElement;

                if (canvas) {
                    // Title
                    doc.setFontSize(24);
                    doc.setFont("helvetica", "bold");
                    doc.text("Scan to Order", width / 2, 40, { align: "center" });

                    doc.setFontSize(16);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100);
                    doc.text("Hazel Bites", width / 2, 50, { align: "center" });

                    // Add QR Code
                    const imgData = canvas.toDataURL("image/png");
                    const qrSize = 100; // mm
                    doc.addImage(imgData, "PNG", (width - qrSize) / 2, (height - qrSize) / 2, qrSize, qrSize);

                    // Table Number
                    doc.setFontSize(32);
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Table ${tableNum}`, width / 2, (height / 2) + (qrSize / 2) + 20, { align: "center" });

                    // Footer
                    doc.setFontSize(10);
                    doc.setTextColor(150);
                    doc.text("Powered by Hazel Bites", width / 2, height - 20, { align: "center" });
                }
            }

            doc.save("table-qr-codes.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!origin) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">QR Code Generator</h1>
                    <p className="text-gray-500 text-lg">Generate and download QR codes for your tables.</p>
                </div>
                <Button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-200 rounded-xl"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-5 w-5" />
                            Download all QR Codes
                        </>
                    )}
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-gray-100/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">Configuration</span>
                    </div>
                    <CardTitle className="text-xl">Setup Parameters</CardTitle>
                    <CardDescription>Configure the base URL and identifiers for your QR codes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="baseurl" className="text-sm font-semibold text-gray-700">Base URL</Label>
                            <Input
                                type="text"
                                id="baseurl"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="https://example.com"
                                className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl bg-gray-50/50"
                            />
                            <p className="text-xs text-gray-500 font-medium ml-1">
                                The domain where your menu is hosted.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tables" className="text-sm font-semibold text-gray-700">Number of Tables</Label>
                            <Input
                                type="number"
                                id="tables"
                                value={tableCount}
                                onChange={(e) => setTableCount(parseInt(e.target.value) || 0)}
                                min={1}
                                max={100}
                                className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl bg-gray-50/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rid" className="text-sm font-semibold text-gray-700">Restaurant ID</Label>
                            <Input
                                type="text"
                                id="rid"
                                value={restaurantId}
                                onChange={(e) => setRestaurantId(e.target.value)}
                                className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl bg-gray-50/50"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pick & Go Section */}
            <Card className="border-none shadow-xl shadow-gray-100/50 bg-orange-50/50 backdrop-blur-xl border border-orange-100">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">Pick & Go</span>
                    </div>
                    <CardTitle className="text-xl">Pick & Go Menu</CardTitle>
                    <CardDescription>A single QR code for walk-in customers. Orders get sequential numbers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <QRCodeCanvas
                                id="qr-code-pickup"
                                value={`${origin}/restaurant/${restaurantId}/table/pickup`}
                                size={180}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">How it works</h3>
                                <p className="text-sm text-gray-500">Scan this code to place an order without a specific table. Each scan starts a fresh session. Order numbers increment automatically (1, 2, 3...).</p>
                            </div>
                            <div className="pt-2">
                                <Button
                                    onClick={() => {
                                        if (confirm("Reset order numbers to 1?")) {
                                            fetch("/api/admin/reset-counter", { method: "POST" })
                                                .then(() => alert("Counter reset! Next order will be #1"))
                                                .catch(() => alert("Failed to reset"));
                                        }
                                    }}
                                    variant="outline"
                                    className="border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                    Reset Daily Order Counter
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map((num) => {
                    const url = `${origin}/restaurant/${restaurantId}/table/${num}`;

                    return (
                        <div
                            key={num}
                            className="group relative flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 h-8 w-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {num}
                            </div>

                            <h3 className="font-bold text-xl mb-4 text-gray-900">Table {num}</h3>

                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-inner">
                                <QRCodeCanvas
                                    id={`qr-code-${num}`}
                                    value={url}
                                    size={150}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>

                            <p className="mt-4 text-sm font-medium text-gray-400 group-hover:text-orange-500 transition-colors">
                                Scan to Order
                            </p>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
