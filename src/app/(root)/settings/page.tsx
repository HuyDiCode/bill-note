/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Camera,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  UserCircle,
  Sliders,
  ShieldCheck,
  AlertOctagon,
  Save,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import type { User } from "@/contexts/AppContext";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

type SettingSection = "profile" | "preferences" | "security" | "danger";

interface SidebarItemProps {
  section: SettingSection;
  icon: React.ReactNode;
  label: string;
  activeSection: SettingSection;
  onClick: (section: SettingSection) => void;
}

function SidebarItem({
  section,
  icon,
  label,
  activeSection,
  onClick,
}: SidebarItemProps) {
  return (
    <Button
      variant={activeSection === section ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 text-left",
        activeSection === section ? "bg-primary text-primary-foreground" : ""
      )}
      onClick={() => onClick(section)}
    >
      {icon}
      {label}
    </Button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { state, dispatch } = useApp();
  const { theme, notifications, user } = state;
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");

  // Password change states
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const scrollToSection = (section: SettingSection) => {
    setActiveSection(section);
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (!authUser || !isMounted) {
          return;
        }

        if (userError) {
          toast({
            title: "Error fetching user",
            description: userError.message,
            variant: "destructive",
          });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          toast({
            title: "Error fetching profile",
            description: profileError.message,
            variant: "destructive",
          });
          return;
        }

        const avatarUrl =
          profile?.avatar_url || authUser.user_metadata?.avatar_url;

        if (isMounted) {
          const userData: User = {
            id: authUser.id,
            email: authUser.email || null,
            avatar_url: avatarUrl || null,
            name: profile?.name || authUser.user_metadata?.name || null,
          };
          dispatch({ type: "SET_USER", payload: userData });
        }
      } catch (error: unknown) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Could not fetch user data";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    };

    getUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          name: user.name,
          avatar_url: user.avatar_url,
        },
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Use the avatars bucket which is already set up in Supabase
      const bucketName = "avatars";

      // Create a unique file path in the bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${Date.now()}`;
      const filePath = `${user.id}/${fileName}.${fileExt}`;

      const supabase = createClient();
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      // Update the user's avatar_url in the profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        toast({
          title: "Profile update failed",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      // Update the user in the context
      dispatch({
        type: "UPDATE_USER",
        payload: { avatar_url: avatarUrl },
      });

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update your avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
        variant: "success",
      });

      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to update your password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Need to create a server-side API endpoint for account deletion
      // Client side cannot access admin functions
      toast({
        title: "Action Incomplete",
        description:
          "Account deletion requires a server-side API call. Please contact support.",
        variant: "destructive",
      });

      // Signing out the user instead
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Update the theme handler
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    dispatch({ type: "SET_THEME", payload: value });
  };

  // Update the notifications handler
  const handleNotificationsChange = (checked: boolean) => {
    dispatch({ type: "SET_NOTIFICATIONS", payload: checked });
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 shrink-0">
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </div>
          <div className="flex-1 space-y-8">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold ml-4">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="md:w-64 shrink-0">
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-2 sticky top-8">
            <SidebarItem
              section="profile"
              icon={<UserCircle className="h-5 w-5" />}
              label="Profile"
              activeSection={activeSection}
              onClick={scrollToSection}
            />
            <SidebarItem
              section="preferences"
              icon={<Sliders className="h-5 w-5" />}
              label="Preferences"
              activeSection={activeSection}
              onClick={scrollToSection}
            />
            <SidebarItem
              section="security"
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Security"
              activeSection={activeSection}
              onClick={scrollToSection}
            />
            <SidebarItem
              section="danger"
              icon={<AlertOctagon className="h-5 w-5 text-destructive" />}
              label="Danger Zone"
              activeSection={activeSection}
              onClick={scrollToSection}
            />
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-8">
          {/* Profile Section */}
          <div
            id="section-profile"
            className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6"
          >
            <h2 className="text-xl font-semibold">Profile</h2>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt="Profile" />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(user.name || user.email || "UN")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 shadow-md"
                  disabled={uploading}
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.name || user.email?.split("@")[0]}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={user.name || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_USER",
                      payload: { name: e.target.value || null },
                    })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>

          {/* Preferences Section */}
          <div
            id="section-preferences"
            className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6"
          >
            <h2 className="text-xl font-semibold">Preferences</h2>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred theme
                  </p>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-[180px] flex-shrink-0">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your notes
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div
            id="section-security"
            className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6"
          >
            <h2 className="text-xl font-semibold">Security</h2>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={
                  loading ||
                  !passwords.current ||
                  !passwords.new ||
                  !passwords.confirm
                }
                className="mt-2"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            id="section-danger"
            className="bg-destructive/5 p-6 rounded-lg border border-destructive/20 space-y-6"
          >
            <h2 className="text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
            <Separator className="bg-destructive/30" />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
