"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { updateUserAttributes } from "aws-amplify/auth";
import { toast } from "sonner";

export default function ProfileView() {
    const { user, isLoading, error, clearError, fetchCurrentUser } = useAuthStore();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [preferredUsername, setPreferredUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        clearError();

        // Load user data into the form
        if (user) {
            setEmail(user.email || "");
            setUsername(user.username || "");
            setIsAdmin(user.isAdmin || false);
            setPreferredUsername(user.attributes?.preferred_username || "");
        }
    }, [user, clearError]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");
        setIsSaving(true);

        try {
            // Update the preferred_username attribute
            await updateUserAttributes({
                userAttributes: {
                    preferred_username: preferredUsername,
                },
            });

            // Refresh user data to get updated attributes
            await fetchCurrentUser();

            toast.success("Profile updated successfully");
        } catch (error: unknown) {
            console.error("Error updating profile:", error);

            const errorMessage = error instanceof Error
                ? error.message
                : "An error occurred while updating your profile";

            setLocalError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-h2">Profile</CardTitle>
                        <CardDescription>Your profile information is not available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please log in to view your profile information.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-h2">Your Information</CardTitle>
                    <CardDescription>View and update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                                value={email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display-name">Display Name</Label>
                            <Input
                                id="display-name"
                                value={preferredUsername}
                                onChange={(e) => setPreferredUsername(e.target.value)}
                                placeholder="Enter your display name"
                            />
                            <p className="text-xs text-muted-foreground">
                                This name will be displayed to others in the application
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={isAdmin ? "Administrator" : "User"}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <Button type="submit" className="w-full button-text" disabled={isLoading || isSaving}>
                            {isSaving ? "Saving changes..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground w-full text-center">
                        For security related changes, please contact your administrator
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}