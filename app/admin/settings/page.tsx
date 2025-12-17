"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, CreditCard, Building } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        instapayUsername: "",
        taxId: "",
        name: "",
        currency: "EGP"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                setSettings(prev => ({ ...prev, ...data }));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 font-sans pb-32">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 mb-2 md:hidden">
                            <Link href="/admin" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurant Settings</h1>
                        <p className="text-gray-500">Manage payments, tax info, and general configuration.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Payment Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Payment & Instapay</h2>
                                <p className="text-sm text-gray-500">Configure online payment methods.</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="instapay" className="text-gray-700 font-medium">Instapay Username</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                                    <Input
                                        id="instapay"
                                        placeholder="username"
                                        className="pl-7 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        value={settings.instapayUsername?.replace("@", "") || ""}
                                        onChange={e => setSettings({ ...settings, instapayUsername: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">This will be shown to customers using Instapay.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-gray-700 font-medium">Currency</Label>
                                <Input
                                    id="currency"
                                    value={settings.currency}
                                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Legal & Tax */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Building className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Legal & Tax Information</h2>
                                <p className="text-sm text-gray-500">Required for Egyptian Tax Authority receipts.</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-gray-700 font-medium">Tax ID Number</Label>
                                <Input
                                    id="taxId"
                                    placeholder="e.g. 123-456-789"
                                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    value={settings.taxId || ""}
                                    onChange={e => setSettings({ ...settings, taxId: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-medium">Restaurant Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Holiday Cafe"
                                    className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    value={settings.name || ""}
                                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 rounded-xl shadow-lg shadow-orange-200 font-bold transition-all hover:scale-[1.02]"
                        >
                            {saving ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
