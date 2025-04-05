"use client";
import { useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { BarChart3, PieChart, Settings, User, BoxIcon, ShoppingBag, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const SidebarComponent = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, fetchCurrentUser } = useAuthStore();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                await fetchCurrentUser();
            } catch (error) {
                console.error("Error checking auth status:", error);
            }
        };

        checkAuthStatus();
    }, [fetchCurrentUser]);

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/dashboard/products") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

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
                                <BoxIcon />
                                <span>Products</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/dashboard/orders")}>
                            <Link href="/dashboard/orders">
                                <ShoppingBag />
                                <span>Orders</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/forecasts")}>
                            <Link href="/dashboard/forecasts">
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
                        <SidebarMenuButton className="cursor-pointer">
                            <User />
                            <span>Profile</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="cursor-pointer" onClick={handleLogout}>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default SidebarComponent;