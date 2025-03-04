import supabase from "../database/SupabaseService";
import { User, UserCredentials, NewUser } from "../types";

export class UserService {
  /**
   * Sign in with email and password
   */
  public async login(credentials: UserCredentials): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw error;
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Create a new user
   */
  public async register(userData: NewUser): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Registration error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out the current user
   */
  public async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: error as Error };
    }
  }

  /**
   * Get the current logged-in user
   */
  public async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Get user error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Send password reset email
   */
  public async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Password reset error:", error);
      return { error: error as Error };
    }
  }

  /**
   * Update user password
   */
  public async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Update password error:", error);
      return { error: error as Error };
    }
  }

  /**
   * Resend verification email
   */
  public async resendVerificationEmail(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Resend verification error:", error);
      return { error: error as Error };
    }
  }
}