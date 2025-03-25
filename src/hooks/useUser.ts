import { useApp } from "@/contexts/AppContext";
import type { User } from "@/contexts/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, profileApi } from "@/lib/supabase/client";
import { useEffect } from "react";

/**
 * Hook để quản lý thông tin người dùng trong ứng dụng
 * Bao gồm các chức năng đọc, cập nhật thông tin và kiểm tra trạng thái đăng nhập
 */
export function useUser() {
  const { state, dispatch } = useApp();
  const queryClient = useQueryClient();

  /**
   * Đặt user data mới hoặc xóa user (nếu truyền vào null)
   */
  const setUser = (user: User | null) => {
    dispatch({ type: "SET_USER", payload: user });
  };

  /**
   * Cập nhật một phần thông tin user
   */
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  /**
   * Xóa user data (đăng xuất)
   */
  const clearUser = () => {
    dispatch({ type: "SET_USER", payload: null });
  };

  /**
   * Query để lấy thông tin user từ Supabase
   */
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user: authUser },
      } = await authApi.getCurrentUser();

      if (!authUser) {
        return null;
      }

      const { data: profile } = await profileApi.getProfile(authUser.id);

      return {
        id: authUser.id,
        email: authUser.email || null,
        avatar_url:
          profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        name:
          profile?.name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          null,
      } as User;
    },
  });

  // Cập nhật state từ query data
  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    } else if (
      userQuery.error ||
      (!userQuery.isLoading && !userQuery.isFetching && !userQuery.data)
    ) {
      clearUser();
    }
  }, [
    userQuery.data,
    userQuery.error,
    userQuery.isLoading,
    userQuery.isFetching,
  ]);

  /**
   * Mutation để đăng xuất
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.signOut();
    },
    onSuccess: () => {
      // Đăng xuất thành công
      clearUser();
      // Xóa cache
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });

  /**
   * Lấy chữ cái đầu từ tên người dùng làm avatar
   */
  const getInitials = (name?: string | null, fallback = "U") => {
    const nameToUse = name || state.user?.name;
    if (!nameToUse) return fallback;

    return nameToUse
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Cập nhật profile của user
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; avatar_url?: string | null }) => {
      if (!state.user?.id) {
        throw new Error("User not authenticated");
      }

      // Cập nhật profile trong database
      await profileApi.updateProfile(state.user.id, data);

      // Cập nhật metadata của user
      await authApi.updateUser({ data });
    },
    onSuccess: (_, variables) => {
      // Cập nhật local state
      updateUser(variables);
      // Làm mới dữ liệu user
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    user: state.user,
    isLoadingUser: userQuery.isLoading,
    refetchUser: userQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    setUser,
    updateUser,
    clearUser,
    fetchUser: userQuery.refetch,
    logout: logoutMutation.mutateAsync,
    getInitials,
    isLoggedIn: !!state.user,
  };
}
