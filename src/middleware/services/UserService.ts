import supabase from "../database/SupabaseService";
import { User, UserCredentials, NewUser } from "../types";

const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL;

export class UserService {
  /**
   * Sign in with email and password
   */
  public async login(credentials: UserCredentials): Promise<{ 
    user: User | null; 
    error: Error | null;
    isAuthorized: boolean;
  }> {
    try {
      // First attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw error;
      }
      
      // If login successful, check if user is authorized
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_authorized')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // If user is not authorized, sign them out immediately
        if (!profileData.is_authorized) {
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error("Your account is not authorized. Please contact an administrator."),
            isAuthorized: false
          };
        }
        
        return { 
          user: data.user, 
          error: null,
          isAuthorized: true
        };
      }
      
      return { 
        user: null, 
        error: new Error("Unknown error during login"), 
        isAuthorized: false
      };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        user: null, 
        error: error as Error,
        isAuthorized: false
      };
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

  /**
   * Update user authorization status (admin only)
   */
  public async setUserAuthorization(userId: string, isAuthorized: boolean): Promise<{ 
    success: boolean; 
    error: Error | null 
  }> {
    try {
      // First check if current user is admin
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!currentUser.user || currentUser.user.email !== SUPER_ADMIN_EMAIL) {
        return {
          success: false,
          error: new Error("Only administrators can authorize users")
        };
      }
      
      // Update the user's authorization status
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_authorized: isAuthorized,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error("Set user authorization error:", error);
      return {
        success: false,
        error: error as Error
      };
    }
  }

  /**
   * Get all users with authorization status (admin only)
   */
  public async getAllUsers(): Promise<{ 
    users: Array<{
      id: string;
      email: string;
      full_name: string;
      is_authorized: boolean;
      created_at: string;
    }> | null; 
    error: Error | null 
  }> {
    try {
      // Check admin status first
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!currentUser.user || currentUser.user.email !== SUPER_ADMIN_EMAIL) {
        return {
          users: null,
          error: new Error("Only administrators can view all users")
        };
      }
      
      // Use the RPC function
      const { data, error } = await supabase.rpc('get_users_with_emails');
      
      if (error) {
        throw error;
      }
      
      return {
        users: data,
        error: null
      };
    } catch (error) {
      console.error("Get all users error:", error);
      return {
        users: null,
        error: error as Error
      };
    }
  }
}