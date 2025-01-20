import {createClient} from "@/utils/supabase/server";
import ErrorComponent from "@/components/error-component";
import {Whiteboard} from "@/components/whiteboard/whiteboard";
import {getUserProfile} from "@/utils/profile";

export default async function UserWhiteboardPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const supabase = await createClient();
    const { data: { session }} = await supabase.auth.getSession()

    const { data: accessData, error: accessError } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .eq('whiteboard_id', id)
        .eq('user_id', session?.user.id)
        .single();

    if (accessError || !accessData) {
        return <ErrorComponent error="Failed to load whiteboard!" returnTo="/dashboard/whiteboard" />
    }

    const profile = await getUserProfile(session!.user.id);

    return (
        <div className="h-screen w-full">
            <Whiteboard id={id} token={session!.access_token} profile={profile!} />
        </div>
    )
}