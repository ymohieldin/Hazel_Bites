import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
                <AdminSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 min-h-screen transition-all duration-300">
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 mx-4 md:mx-8 mt-4 rounded shadow-sm" role="alert">
                    <p className="font-bold">⚠️ Demo Mode Active</p>
                    <p>You are running without a database. Changes (like menu updates) will <strong>reset</strong> when the page reloads or across different devices. <a href="https://github.com/ymohieldin/Hazel_Bites#database-setup-optional" target="_blank" className="underline font-semibold">Connect a Database</a> to save changes permanently.</p>
                </div>
                {children}
            </main>
        </div>
    );
}
