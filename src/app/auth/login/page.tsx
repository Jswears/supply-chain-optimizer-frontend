"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

// Component that uses search params
function LoginForm() {
    const searchParams = useSearchParams();
    const paramEmail = searchParams.get("email") || "";

    const {
        rememberedEmail,
        rememberMe,
        isLoading,
        error,
        login,
        setNewPasswordOnFirstLogin,
        clearError,
        setRememberMe
    } = useAuthStore();

    const [email, setEmail] = useState(paramEmail || rememberedEmail || "");
    const [password, setPassword] = useState("");
    const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const router = useRouter();

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await login(email, password, rememberMe);

        if (result.isSuccess) {
            router.push("/dashboard/products");
        } else if (result.requiresConfirmation) {
            router.push("/auth/confirm-email?email=" + encodeURIComponent(email));
        } else if (result.requiresNewPassword) {
            setIsNewPasswordRequired(true);
        }
    };

    const handleNewPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const success = await setNewPasswordOnFirstLogin(email, password, newPassword);

        if (success) {
            router.push("/dashboard/products");
        }
    };

    if (isNewPasswordRequired) {
        return (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive" className="bg-soft-alert text-soft-alert-foreground border-primary">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full button-text" disabled={isLoading}>
                    {isLoading ? "Setting password..." : "Set New Password"}
                </Button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive" className="bg-soft-alert text-soft-alert-foreground border-primary">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remember me
                </label>
            </div>

            <Button type="submit" className="w-full button-text" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}

// Fallback component while the main content is loading
function LoginFormFallback() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse flex justify-between">
                    <div className="w-20 h-full"></div>
                    <div className="w-28 h-full"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
    );
}

// Password reset form fallback
function NewPasswordFormFallback() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
    );
}

export default function LoginPage() {
    const [isNewPassword] = useState(false);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-charcoal">ChainOpt AI</h1>
                    <p className="text-muted-foreground mt-2">AI-powered supply chain management</p>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-h2">
                            {isNewPassword ? "Create New Password" : "Login"}
                        </CardTitle>
                        <CardDescription>
                            {isNewPassword
                                ? "Your administrator has created an account for you. Please set a new password to continue."
                                : "Enter your credentials to access your account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={isNewPassword ? <NewPasswordFormFallback /> : <LoginFormFallback />}>
                            <LoginForm />
                        </Suspense>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <a href="#" className="text-primary hover:underline">
                                Contact your administrator
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

