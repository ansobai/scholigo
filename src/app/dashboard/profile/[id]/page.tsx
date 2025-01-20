import {createClient} from "@/utils/supabase/server";
import notFound from "@public/not_found.svg"
import ErrorComponent from "@/components/error-component";
import {UserProfile} from "@/components/user-profile";
import {getUserProfile} from "@/utils/profile";

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    const profile = await getUserProfile(id);

    if (!profile) {
        console.error("User not found");
        return (
            <ErrorComponent error="User mentioned couldn't be found!" returnTo="/dashboard" svg={notFound} />
        )
    }

    return (
        <div className="h-full w-full p-5 place-content-center items-center gap-3 place-items-center">
            <UserProfile profile={profile} isEditable={user.data.user?.id === id}  />
        </div>
    );
}