import { createClient } from "@/utils/supabase/client";
import { Result, success, failure } from "@/lib/result";

/**
 * Upload avatar image to Supabase Storage
 * @param file File to upload
 * @returns Result containing URL of the uploaded file or error
 */
export async function uploadAvatar(file: File): Promise<Result<string>> {
  try {
    // Create a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Get the current user ID
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (userError || !userId) {
      return failure("User not authenticated");
    }

    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      return failure(`Error uploading avatar: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return failure("Failed to get public URL for avatar");
    }

    return success(urlData.publicUrl);
  } catch (error) {
    return failure(
      `Unexpected error uploading avatar: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Update user profile with new avatar
 * @param name User's name
 * @param avatarUrl URL of the avatar image
 * @returns Result containing updated profile data or error
 */
export async function updateProfileWithAvatar(
  name: string,
  avatarUrl: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Result<any>> {
  try {
    // Get the current user
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return failure("User not authenticated");
    }

    // Update user profile in the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .single();

    if (error) {
      return failure(`Error updating profile: ${error.message}`);
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, avatar_url: avatarUrl },
    });

    if (updateError) {
      return failure(`Error updating user metadata: ${updateError.message}`);
    }

    return success(data);
  } catch (error) {
    return failure(
      `Unexpected error updating profile: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Upload receipt image to Supabase Storage
 * @param file File to upload
 * @param expenseId ID of the expense
 * @returns Result containing URL of the uploaded file or error
 */
export async function uploadReceiptImage(
  file: File,
  expenseId: string
): Promise<Result<string>> {
  try {
    // Create a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${expenseId}/${crypto.randomUUID()}.${fileExt}`;

    const supabase = createClient();
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, file);

    if (uploadError) {
      return failure(`Error uploading receipt: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return failure("Failed to get public URL for receipt");
    }

    return success(urlData.publicUrl);
  } catch (error) {
    return failure(
      `Unexpected error uploading receipt: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Upload group avatar image to Supabase Storage
 * @param file File to upload
 * @param groupId ID of the group
 * @returns Result containing URL of the uploaded file or error
 */
export async function uploadGroupAvatar(
  file: File,
  groupId: string
): Promise<Result<string>> {
  try {
    // Create a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${groupId}/${crypto.randomUUID()}.${fileExt}`;

    const supabase = createClient();
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("group_avatars")
      .upload(fileName, file);

    if (uploadError) {
      return failure(`Error uploading group avatar: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("group_avatars")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return failure("Failed to get public URL for group avatar");
    }

    return success(urlData.publicUrl);
  } catch (error) {
    return failure(
      `Unexpected error uploading group avatar: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Ensure a bucket exists, creating it if necessary
 */
export async function ensureBucketExists(
  bucketId: string
): Promise<Result<boolean>> {
  try {
    const supabase = createClient();
    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      return failure(`Error checking buckets: ${listError.message}`);
    }

    // If bucket doesn't exist, create it
    if (!buckets.some((bucket) => bucket.id === bucketId)) {
      const { error: createError } = await supabase.storage.createBucket(
        bucketId,
        {
          public: bucketId === "avatars" || bucketId === "group_avatars",
        }
      );

      if (createError) {
        return failure(`Error creating bucket: ${createError.message}`);
      }
    }

    return success(true);
  } catch (error) {
    return failure(
      `Unexpected error ensuring bucket exists: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
