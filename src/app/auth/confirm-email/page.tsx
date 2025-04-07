"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

// Component that uses search params
function ConfirmEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramEmail = searchParams.get("email") || "";

    const {
        error,
        isLoading,
        confirmSignUp,
        resendConfirmationCode,
        clearError
    } = useAuthStore();

    const [currentEmail, setCurrentEmail] = useState(paramEmail);
    const [code, setCode] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleConfirmEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        const success = await confirmSignUp(currentEmail, code);
        if (success) {
            router.push("/auth/login?email=" + encodeURIComponent(currentEmail));
        }
    };

    const handleResendCode = async () => {
        if (!currentEmail) {
            setLocalError("Please enter your email address");
            return;
        }

        setIsResending(true);
        await resendConfirmationCode(currentEmail);
        setIsResending(false);
    };

    return (
        <form onSubmit={handleConfirmEmail} className="space-y-4">
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

            <Button type="submit" className="w-full button-text" disabled={isLoading}>
                {isLoading ? "Confirming..." : "Confirm Email"}
            </Button>

            <div className="text-center">
                <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={isResending || isLoading}
                    className="mt-2 text-sm text-primary hover:underline"
                >
                    {isResending ? "Sending..." : "Didn't receive a code? Resend"}
                </Button>
            </div>
        </form>
    );
}

// Fallback component while the main content is loading
function ConfirmEmailFormFallback() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="flex justify-center">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-charcoal">ChainOpt AI</h1>
                    <p className="text-muted-foreground mt-2">AI-powered supply chain management</p>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-h2">Confirm Your Email</CardTitle>
                        <CardDescription>
                            Enter the verification code sent to your email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<ConfirmEmailFormFallback />}>
                            <ConfirmEmailForm />
                        </Suspense>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Already confirmed?{" "}
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