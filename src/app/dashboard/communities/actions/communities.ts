"use server";

import {
  communityCreateSchema,
  communityEditSchema,
  UserCommunities,
} from "@/types/communities/communities";
import {
  addUserToCommunity,
  clearCommunityCache,
  clearUserCommunitiesCache,
  getCommunities,
  getUserCommunities,
  getUserCommunity,
  getUserRecommendedCommunities,
  removeUserFromCommunity,
  updateCommunityIcon,
} from "@/utils/community/communities";
import { createClient } from "@/utils/supabase/server";
import z from "zod";
import { hasPermission, Permission } from "@/types/communities/permissions";
import { getUserCommunityPermissions } from "@/utils/community/roles";
import {createAdminClient} from "@/utils/supabase/admin";

/**
 * Fetches the communities joined by the current user.
 *
 * @returns {Promise<UserCommunities[]>} A promise that resolves to an array of user communities.
 */
export async function getJoinedCommunities(): Promise<UserCommunities[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("getJoinedCommunities Error:", error);
    return [];
  }

  return getUserCommunities(user.id);
}

/**
 * Fetches the recommended communities for the current user.
 *
 * @returns {Promise<UserCommunities[]>} A promise that resolves to an array of recommended user communities.
 */
export async function getRecommendedCommunities(): Promise<UserCommunities[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("getJoinedCommunities Error:", error);
    return [];
  }

  return getUserRecommendedCommunities(user.id);
}

/**
 * Deletes a community if the current user is the owner.
 *
 * @param {string} communityId - The ID of the community to delete.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating success or failure.
 */
export async function deleteCommunity(communityId: string): Promise<boolean> {
  const supabase = await createClient();
  const {data: {user}, error: userError} = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("deleteCommunity Error:", userError);
    return false;
  }

  const userCommunity = await getUserCommunity(user.id, communityId);

  if (!userCommunity || !userCommunity.isOwner) {
    console.error("deleteCommunity Error:", "User is not owner");
    return false;
  }

  const adminClient = createAdminClient()
  const { error: deleteError } = await adminClient
      .from("communities")
      .delete()
      .eq("id", communityId)
      .eq("created_by", user.id)

  if (deleteError) {
    console.error("deleteCommunity Error:", deleteError);
    return false;
  }

  // Clear cache
  clearCommunityCache(communityId);

  return true;
}

/**
 * Joins a community if it is discoverable.
 *
 * @param {string} communityId - The ID of the community to join.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and error message if any.
 */
export async function joinCommunity(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("joinCommunity Error:", error);
    return {
      status: "error",
      error: "User not found",
    };
  }

  const community = await getCommunities([communityId]);

  if (community.length === 0) {
    console.error("joinCommunity Error: Community not found");
    return {
      status: "error",
      error: "Community not found",
    };
  }

  if (!community[0].is_discoverable) {
    // Non-discoverable communities can only be joined by invitation
    console.error("joinCommunity Error: Community is not discoverable");
    return {
      status: "error",
      error: "Community not found",
    };
  }

  const result = await addUserToCommunity(user.id, communityId);

  return {
    status: result ? "success" : "error",
    error: result ? null : "Failed to join community",
  };
}

/**
 * Leaves a community.
 *
 * @param {string} communityId - The ID of the community to leave.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and error message if any.
 */
export async function leaveCommunity(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("leaveCommunity Error:", error);
    return {
      status: "error",
      error: "User not found",
    };
  }

  const result = await supabase
      .from("community_members")
      .delete()
      .eq("user_id", user.id)
      .eq("community_id", communityId);

  if (result.error) {
    console.error("leaveCommunity Error:", result.error);
    return {
      status: "error",
      error: "Failed to leave community",
    };
  }

  // Clear cache
  await removeUserFromCommunity(user.id, communityId);

  return {
    status: "success",
  };
}

/**
 * Creates a new community.
 *
 * @param {z.infer<typeof communityCreateSchema>} community - The community data to create.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and community ID if successful.
 */
export async function createCommunity(
    community: z.infer<typeof communityCreateSchema>,
) {
  const validatedData = communityCreateSchema.safeParse(community);

  if (!validatedData.success) {
    console.error("Invalid form data:", validatedData.error);
    return {
      status: "error",
      message: "Invalid form data",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("createCommunity Error:", error);
    return {
      status: "error",
      message: "User not found",
    };
  }
  const { name, description, icon, university, isDiscoverable, tags } =
      validatedData.data;

  const { data, error: communityError } = await supabase
      .from("communities")
      .insert({
        name,
        description,
        created_by: user.id,
        university,
        is_discoverable: isDiscoverable,
        tags,
      })
      .select();

  if (communityError) {
    console.error("createCommunity Error:", communityError);
    return {
      status: "error",
      message: "Failed to create community",
    };
  }

  // Clear user's communities cache
  clearUserCommunitiesCache(user.id);

  // Upload icon to supabase storage if it exists
  if (icon && icon.size > 0) {
    const iconUpload = await updateCommunityIcon(data[0].id, icon);

    if (!iconUpload) {
      console.error("createCommunity Error:", "Failed to upload icon");
      return {
        status: "error",
        message: "Failed to upload icon",
      };
    }
  }

  return {
    status: "success",
    id: data[0].id,
  };
}

/**
 * Fetches a community by its ID.
 *
 * @param {string} communityId - The ID of the community to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the community object or null if not found.
 */
export async function getCommunity(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("getUserCommunity Error:", error);
    return null;
  }

  return getUserCommunity(user.id, communityId);
}

/**
 * Edits an existing community.
 *
 * @param {z.infer<typeof communityEditSchema>} community - The community data to edit.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and community ID if successful.
 */
export async function editCommunity(
    community: z.infer<typeof communityEditSchema>,
) {
  const validatedData = communityEditSchema.safeParse(community);

  if (!validatedData.success) {
    console.error("Invalid form data:", validatedData.error);
    return {
      status: "error",
      message: "Invalid form data",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("createCommunity Error:", error);
    return {
      status: "error",
      message: "User not found",
    };
  }
  const { id, name, description, icon, university, isDiscoverable, tags } =
      validatedData.data;

  const userPermissions = await getUserCommunityPermissions(user.id, id);

  if (
      !userPermissions ||
      !hasPermission(userPermissions, Permission.EDIT_COMMUNITY)
  ) {
    console.error("editCommunity Error:", "User does not have permission");
    return {
      status: "error",
      message: "User does not have permission",
    };
  }

  const adminClient = createAdminClient()
  const { data, error: communityError } = await adminClient
      .from("communities")
      .update({
        name,
        description,
        university,
        is_discoverable: isDiscoverable,
        tags,
      })
      .eq("id", id)
      .select();

  if (communityError) {
    console.error("createCommunity Error:", communityError);
    return {
      status: "error",
      message: "Failed to update community",
    };
  }

  // Clear user's communities cache
  clearUserCommunitiesCache(user.id);

  // Upload icon to supabase storage if it exists
  if (icon && icon.size > 0) {
    const iconUpload = await updateCommunityIcon(data[0].id, icon);

    if (!iconUpload) {
      console.error("createCommunity Error:", "Failed to upload icon");
      return {
        status: "error",
        message: "Failed to upload icon",
      };
    }
  }

  clearCommunityCache(id);

  return {
    status: "success",
    id: data[0].id,
  };
}