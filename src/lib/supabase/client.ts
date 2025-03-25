import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

// Create a default supabase client
const supabaseClient = createClient();

export default supabaseClient;

/**
 * API liên quan đến xác thực
 */
export const authApi = {
  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async (): Promise<{ data: { user: User | null } }> => {
    return await supabaseClient.auth.getUser();
  },

  /**
   * Đăng xuất người dùng
   */
  signOut: async () => {
    return await supabaseClient.auth.signOut();
  },

  /**
   * Đăng nhập với OAuth
   */
  signInWithOAuth: async ({ provider }: { provider: string }) => {
    return await supabaseClient.auth.signInWithOAuth({
      provider: provider as "google" | "github" | "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  /**
   * Cập nhật thông tin metadata của người dùng
   */
  updateUser: async ({ data }: { data: Record<string, unknown> }) => {
    return await supabaseClient.auth.updateUser({
      data,
    });
  },
};

/**
 * API liên quan đến profiles
 */
export const profileApi = {
  /**
   * Lấy thông tin profile của người dùng
   */
  getProfile: async (userId: string) => {
    return await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
  },

  /**
   * Cập nhật thông tin profile
   */
  updateProfile: async (
    userId: string,
    data: { name?: string; avatar_url?: string | null }
  ) => {
    return await supabaseClient
      .from("profiles")
      .upsert({
        id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .single();
  },
};

// Export supabase client for storage access
export { supabaseClient };
