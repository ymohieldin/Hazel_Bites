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
                {children}
            </main>
        </div>
    );
}
