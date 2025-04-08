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
    SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { BarChart3, User, BoxIcon, ShoppingBag, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

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
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex items-center justify-center py-6">
                <div className="flex items-center space-x-2">
                    <Image src={"/logo.png"} alt="logo" width={32} height={32} />
                    <h1 className="text-xl font-bold text-white group-data-[collapsible=icon]:hidden ">ChainOpt AI</h1>

                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive("/")}
                            tooltip="Products"
                        >
                            <Link href="/dashboard/products">
                                <BoxIcon />
                                <span>Products</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive("/dashboard/orders")}
                            tooltip="Orders"
                        >
                            <Link href="/dashboard/orders">
                                <ShoppingBag />
                                <span>Orders</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive("/forecasts")}
                            tooltip="Forecasts"
                        >
                            <Link href="/dashboard/forecasts">
                                <BarChart3 />
                                <span>Forecasts</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive("/dashboard/profile")}
                            tooltip="Profile"
                        >
                            <Link href="/dashboard/profile">
                                <User />
                                <span>Profile</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="cursor-pointer"
                            onClick={handleLogout}
                            tooltip="Logout"
                        >
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default SidebarComponent;