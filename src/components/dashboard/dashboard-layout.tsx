"use client"

import type React from "react"

import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarComponent from "../navigation/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen w-dvw overflow-hidden">
            <SidebarComponent />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b">
                    <SidebarTrigger className="cursor-pointer">
                    </SidebarTrigger>
                </div>
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    )
}

