import { Utensils, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-md bg-white min-h-screen shadow-xl border-x border-gray-100 relative flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="bg-primary/10 p-4 rounded-full">
        <Utensils className="w-12 h-12 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          QuickOrder
        </h1>
        <p className="text-gray-500 max-w-[280px] mx-auto">
          Scan, Order, and Pay. The fastest way to dine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <button className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary/50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
              <QrCode className="w-5 h-5 text-gray-600 group-hover:text-primary" />
            </div>
            <span className="font-medium text-gray-900">Scan QR Code</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
        </button>

        <Link href="/dashboard/kitchen" className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary/50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
              <Utensils className="w-5 h-5 text-gray-600 group-hover:text-primary" />
            </div>
            <span className="font-medium text-gray-900">Kitchen Display</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
        </Link>

        <Link href="/admin" className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary/50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
              <Utensils className="w-5 h-5 text-gray-600 group-hover:text-primary" />
            </div>
            <span className="font-medium text-gray-900">Admin Dashboard</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
        </Link>
      </div>

      <div className="absolute bottom-8 text-xs text-gray-400">
        <p>Powered by Hazel Bites</p>
      </div>
    </main>
  );
}
