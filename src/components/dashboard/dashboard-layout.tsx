"use client"

import { useEffect, useState } from "react"
import type React from "react"

import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarComponent from "../navigation/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Use state to track if we've hydrated the sidebar state
    const [mounted, setMounted] = useState(false)

    // This effect ensures we only render the sidebar on the client side
    // and only once we've hydrated the component
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <SidebarProvider>
            {mounted && <SidebarComponent />}
            <SidebarInset>
                <div className="flex h-16 shrink-0 items-center border-b px-4">
                    <SidebarTrigger className="cursor-pointer" />
                </div>
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}

