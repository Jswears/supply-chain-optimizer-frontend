"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramEmail = searchParams.get("email") || "";

    const {
        error,
        isLoading,
        requestPasswordReset,
        confirmPasswordReset,
        clearError
    } = useAuthStore();

    const [currentEmail, setCurrentEmail] = useState(paramEmail);

    const [currentStep, setCurrentStep] = useState(1);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        const success = await requestPasswordReset(currentEmail);
        if (success) {
            setCurrentStep(2);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (newPassword !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        const success = await confirmPasswordReset(currentEmail, code, newPassword);
        if (success) {
            router.push("/auth/login?email=" + encodeURIComponent(currentEmail));
        }
    };

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
                            {currentStep === 1 ? "Forgot Password" : "Reset Password"}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1
                                ? "Enter your email to receive a password reset code"
                                : "Enter the code from your email and create a new password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentStep === 1 ? (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                {(error || localError) && (
                                    <Alert variant="destructive" className="bg-soft-alert text-soft-alert-foreground border-primary">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{localError || error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@company.com"
                                        value={currentEmail}
                                        onChange={(e) => setCurrentEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full button-text" disabled={isLoading}>
                                    {isLoading ? "Sending code..." : "Send Reset Code"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                {(error || localError) && (
                                    <Alert variant="destructive" className="bg-soft-alert text-soft-alert-foreground border-primary">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{localError || error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="code">Verification Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="Enter code from email"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                    />
                                </div>

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
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full button-text" disabled={isLoading}>
                                    {isLoading ? "Resetting password..." : "Reset Password"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Back to Request Code
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <Link href="/auth/login" className="text-primary hover:underline">
                                Back to login
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}