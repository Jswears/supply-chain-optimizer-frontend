"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Home, BarChart3, PieChart, Settings, User } from "lucide-react"
import { usePathname } from "next/navigation"
const SidebarComponent = () => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/dashboard/products") return true
        if (path !== "/" && pathname.startsWith(path)) return true
        return false
    }
    return (
        <Sidebar>
            <SidebarHeader className="flex items-center justify-center py-6">
                <h1 className="text-xl font-bold text-white">Bakery Dashboard</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/")}>
                            <Link href="/dashboard/products">
                                <Home />
                                <span>Products</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/forecasts")}>
                            <Link href="/forecasts">
                                <BarChart3 />
                                <span>Forecasts</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/analytics")}>
                            <Link href="/analytics">
                                <PieChart />
                                <span>Analytics</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/settings")}>
                            <Link href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <User />
                            <span>Profile</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default SidebarComponent;