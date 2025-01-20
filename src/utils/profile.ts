'use server'

import {Profile, profileSchema} from "@/types/profile";
import {cacheTag} from "next/dist/server/use-cache/cache-tag";
import {CacheTag} from "@/types/cache-tag";
import {createAdminClient} from "@/utils/supabase/admin";
import {z} from "zod";
import {createClient} from "@/utils/supabase/server";
import {revalidateTag} from "next/cache";

export async function getUserProfile(id: string): Promise<Profile | null> {
    'use cache';
    cacheTag(CacheTag.PROFILE, id);

    const supabase = createAdminClient();

    const { data, error } = await supabase.from('profiles').select().eq('id', id).single();
    const { data: interestsData, error: interestsError } = await supabase.from('interests').select().eq('user_id', id);

    if (error || interestsError) {
        console.error(error);
        return null;
    }

    const interests = interestsData.map((interest: { interest: string }) => interest.interest);
    return { ...data, interests };
}

export async function updateUserProfile(oldProfile: Profile, profile: z.infer<typeof profileSchema>) {
    const validatedData = profileSchema.safeParse(profile);

    if (!validatedData.success) {
        console.error("Invalid form data:", validatedData.error);
        return {
            status: "error",
            message: "Invalid form data",
        }
    }

    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    const { name, avatar, bio, field, university, dailyGoal, monthlyGoal, interests } = validatedData.data

    // Upload Image to supbase storage
    if (avatar && avatar.size > 0) {
        const { error } = await supabase.storage.from('avatars').upload(`${user.data.user?.id}/avatar.${avatar.name.split('.').pop()}`,
            avatar, {upsert: true});
        if (error) {
            console.error(error);
            return {
                status: "error",
                message: "Error uploading avatar",
            }
        }
    }

    const { error } = await supabase.from('profiles').update({
        name,
        bio,
        field,
        university,
        daily_goal: dailyGoal * 60,
        monthly_goal: monthlyGoal * 3600,
        avatar_url: avatar && avatar.size > 0 ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.data.user?.id}/avatar.${avatar.name.split('.').pop()}` : undefined,
    }).eq('id', user.data.user?.id);

    // Update interests
    if (interests) {
        console.log("Updating interests");
        // Check difference between old and new interests
        const oldInterests = oldProfile.interests;

        const toAdd = interests.filter((interest) => !oldInterests?.includes(interest));

        const toRemove = oldInterests == undefined ? [] : oldInterests.filter((interest) => !interests.includes(interest));

        // Add new interests
        for (const interest of toAdd) {
            await supabase.from('interests').insert({ user_id: user.data.user?.id, interest });
            console.log("Added interest:", interest);
        }

        // Remove old interests
        for (const interest of toRemove) {
            await supabase.from('interests').delete().eq('user_id', user.data.user?.id).eq('interest', interest);
            console.log("Removed interest:", interest);
        }
    }

    if (error) {
        console.error(error);
        return {
            status: "error",
            message: "Error updating profile",
        }
    }


    if (user.data.user) revalidateTag(user.data.user.id);

    return {
        status: "success",
        message: "Profile updated successfully",
    }
}