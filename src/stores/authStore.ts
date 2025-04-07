import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  confirmSignIn,
  updateUserAttributes,
  resendSignUpCode,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";
import { toast } from "sonner";

interface User {
  username: string;
  userId: string;
  email: string;
  isAdmin: boolean;
  attributes: Record<string, string>;
  idToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  rememberedEmail: string | null;
  rememberMe: boolean;

  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{
    isSuccess: boolean;
    requiresNewPassword?: boolean;
    requiresConfirmation?: boolean;
  }>;
  setNewPasswordOnFirstLogin: (
    email: string,
    password: string,
    newPassword: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;

  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<boolean>;

  confirmSignUp: (email: string, code: string) => Promise<boolean>;
  resendConfirmationCode: (email: string) => Promise<boolean>;

  fetchCurrentUser: () => Promise<User | null>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;

  setRememberedEmail: (email: string | null) => void;
  setRememberMe: (remember: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
  clearAuthState: () => void;
  ensurePreferredUsername: (username: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      rememberedEmail: null,
      rememberMe: false,

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      setRememberedEmail: (email: string | null) =>
        set({ rememberedEmail: email }),
      setRememberMe: (remember: boolean) => set({ rememberMe: remember }),

      clearAuthState: () =>
        set({
          isAuthenticated: false,
          user: null,
          error: null,
        }),

      refreshSession: async () => {
        try {
          await fetchAuthSession({ forceRefresh: true });
        } catch (error) {
          console.error("Error refreshing session:", error);
        }
      },

      login: async (email: string, password: string, rememberMe: boolean) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          if (rememberMe) {
            state.setRememberedEmail(email);
            state.setRememberMe(true);
          } else {
            state.setRememberedEmail(null);
            state.setRememberMe(false);
          }

          const { isSignedIn, nextStep } = await signIn({
            username: email,
            password,
          });

          if (isSignedIn) {
            await state.fetchCurrentUser();
            toast.success("Login successful");
            return { isSuccess: true };
          } else {
            if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
              toast.info("Please confirm your email account");
              return { isSuccess: false, requiresConfirmation: true };
            } else if (
              nextStep.signInStep ===
              "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
            ) {
              toast.info("You need to create a new password");
              return { isSuccess: false, requiresNewPassword: true, nextStep };
            }
            return { isSuccess: false };
          }
        } catch (error: unknown) {
          console.error("Login error:", error);

          let errorMessage = "Login failed. Please try again.";

          if (
            error instanceof Error &&
            error.name === "UserNotConfirmedException"
          ) {
            errorMessage = "Please confirm your email before logging in";
            toast.error(errorMessage);
            return { isSuccess: false, requiresConfirmation: true };
          } else if (
            error instanceof Error &&
            error.name === "NotAuthorizedException"
          ) {
            errorMessage = "Incorrect username or password";
          } else if (
            error instanceof Error &&
            error.name === "UserNotFoundException"
          ) {
            errorMessage = "User does not exist";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "An error occurred during login";
          }

          state.setError(errorMessage);
          toast.error(errorMessage);
          return { isSuccess: false };
        } finally {
          state.setLoading(false);
        }
      },

      setNewPasswordOnFirstLogin: async (
        email: string,
        password: string,
        newPassword: string
      ) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          const { nextStep } = await signIn({
            username: email,
            password,
          });

          if (
            nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
          ) {
            const preferredUsername = email.split("@")[0];

            const { isSignedIn } = await confirmSignIn({
              challengeResponse: newPassword,
              options: {
                userAttributes: {
                  preferred_username: preferredUsername,
                },
              },
            });

            if (isSignedIn) {
              await state.fetchCurrentUser();
              toast.success("Password updated successfully");
              return true;
            }
          }
          return false;
        } catch (error: unknown) {
          console.error("New password error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error setting new password";
          state.setError(errorMessage);
          toast.error(errorMessage);
          return false;
        } finally {
          state.setLoading(false);
        }
      },

      logout: async () => {
        const state = get();
        state.setLoading(true);

        try {
          await signOut();
          state.clearAuthState();
          toast.success("Logged out successfully");
        } catch (error: unknown) {
          console.error("Logout error:", error);
          toast.error("Error during logout");
        } finally {
          state.setLoading(false);
        }
      },

      requestPasswordReset: async (email: string) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          await resetPassword({ username: email });
          toast.success("Password reset code sent to your email");
          return true;
        } catch (error: unknown) {
          console.error("Reset password error:", error);

          let errorMessage = "Failed to send reset code";

          if (
            error instanceof Error &&
            error.name === "UserNotFoundException"
          ) {
            errorMessage = "No account found with this email address";
          } else if (
            error instanceof Error &&
            error.name === "LimitExceededException"
          ) {
            errorMessage = "Too many attempts. Please try again later";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to send reset code";
          }

          state.setError(errorMessage);
          toast.error(errorMessage);
          return false;
        } finally {
          state.setLoading(false);
        }
      },

      confirmPasswordReset: async (
        email: string,
        code: string,
        newPassword: string
      ) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          await confirmResetPassword({
            username: email,
            confirmationCode: code,
            newPassword,
          });

          toast.success("Password reset successful");
          return true;
        } catch (error: unknown) {
          console.error("Confirm reset password error:", error);

          let errorMessage = "Failed to reset password";

          if (
            error instanceof Error &&
            error.name === "CodeMismatchException"
          ) {
            errorMessage = "Invalid verification code";
          } else if (
            error instanceof Error &&
            error.name === "ExpiredCodeException"
          ) {
            errorMessage =
              "Verification code has expired. Please request a new one";
          } else if (
            error instanceof Error &&
            error.name === "InvalidPasswordException"
          ) {
            errorMessage =
              error.message || "Password does not meet requirements";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to reset password";
          }

          state.setError(errorMessage);
          toast.error(errorMessage);
          return false;
        } finally {
          state.setLoading(false);
        }
      },

      confirmSignUp: async (email: string, code: string) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          await confirmSignUp({ username: email, confirmationCode: code });
          toast.success("Email confirmed successfully");
          return true;
        } catch (error: unknown) {
          console.error("Confirm email error:", error);

          let errorMessage = "Failed to confirm email";

          if (
            error instanceof Error &&
            error.name === "CodeMismatchException"
          ) {
            errorMessage = "Invalid confirmation code";
          } else if (
            error instanceof Error &&
            error.name === "ExpiredCodeException"
          ) {
            errorMessage =
              "Confirmation code has expired. Please request a new one";
          } else if (
            error instanceof Error &&
            error.name === "UserNotFoundException"
          ) {
            errorMessage = "No account found with this email address";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to confirm email";
          }

          state.setError(errorMessage);
          toast.error(errorMessage);
          return false;
        } finally {
          state.setLoading(false);
        }
      },

      resendConfirmationCode: async (email: string) => {
        const state = get();
        state.setLoading(true);
        state.clearError();

        try {
          await resendSignUpCode({ username: email });
          toast.success("Verification code resent to your email");
          return true;
        } catch (error: unknown) {
          console.error("Resend code error:", error);

          let errorMessage = "Failed to resend verification code";

          if (
            error instanceof Error &&
            error.name === "UserNotFoundException"
          ) {
            errorMessage = "No account found with this email address";
          } else if (
            error instanceof Error &&
            error.name === "LimitExceededException"
          ) {
            errorMessage = "Too many attempts. Please try again later";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to resend verification code";
          }

          state.setError(errorMessage);
          toast.error(errorMessage);
          return false;
        } finally {
          state.setLoading(false);
        }
      },

      fetchCurrentUser: async () => {
        const state = get();
        state.setLoading(true);

        try {
          // Get authenticated user data
          const currentUserData = await getCurrentUser();

          if (!currentUserData) {
            state.clearUser();
            return null;
          }

          // Get user attributes
          const userAttributes = await fetchUserAttributes();

          // Get session to check for group membership
          const session = await fetchAuthSession();

          // Check if user is an admin by examining cognito groups in the token
          const groups =
            (session.tokens?.accessToken.payload[
              "cognito:groups"
            ] as string[]) || [];
          const isAdmin = groups.includes("Admin") || groups.includes("ADMINS");

          // Retrieve idToken - use the JWT string value directly
          const idToken = session.tokens?.idToken?.toString();

          // Log token details to help with debugging
          console.log(
            "ID Token retrieved:",
            idToken ? `${idToken.substring(0, 20)}...` : "No token"
          );

          // Construct user object
          const user: User = {
            username: currentUserData.username,
            userId: currentUserData.userId,
            email:
              userAttributes.email ||
              currentUserData.signInDetails?.loginId ||
              "",
            isAdmin,
            attributes: Object.fromEntries(
              Object.entries(userAttributes).filter(
                ([, value]) => value !== undefined
              )
            ) as Record<string, string>,
            idToken: idToken || "",
          };

          state.setUser(user);

          // Ensure preferred_username is set
          if (!userAttributes.preferred_username) {
            await state.ensurePreferredUsername(user.username);
          }

          return user;
        } catch (error) {
          console.error("Error fetching current user:", error);
          state.clearUser();
          return null;
        } finally {
          state.setLoading(false);
        }
      },

      ensurePreferredUsername: async (username: string) => {
        const state = get();
        state.setLoading(true);

        try {
          // Generate a preferred username from the username or email
          const preferredUsername = username.includes("@")
            ? username.split("@")[0]
            : username;

          // Update the user attribute
          await updateUserAttributes({
            userAttributes: {
              preferred_username: preferredUsername,
            },
          });

          // Update local user state if it exists
          if (state.user) {
            const updatedUser = {
              ...state.user,
              attributes: {
                ...state.user.attributes,
                preferred_username: preferredUsername,
              },
            };
            state.setUser(updatedUser);
          }

          return true;
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error updating preferred_username:", error.message);
          } else {
            console.error("Error updating preferred_username:", error);
          }
          console.error("Error updating preferred_username:", error);
          toast.error("Failed to update user profile");
          return false;
        } finally {
          state.setLoading(false);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        rememberedEmail: state.rememberedEmail,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
