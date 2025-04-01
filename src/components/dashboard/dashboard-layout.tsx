"use client"

import type React from "react"

import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarComponent from "../navigation/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen">
            <SidebarComponent />
            <SidebarTrigger className="flex-1 cursor-pointer">
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </SidebarTrigger>
        </div>
    )
}

