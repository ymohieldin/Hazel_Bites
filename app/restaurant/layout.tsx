import React from "react";

export default function RestaurantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-md bg-white min-h-screen shadow-xl border-x border-gray-100 relative">
            {children}
        </div>
    );
}
