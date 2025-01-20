import {CreateWhiteboardModal} from "@/components/whiteboard/create-whiteboard";
import {WhiteboardList} from "@/components/whiteboard/whiteboard-list";
import {createClient} from "@/utils/supabase/server";

export default async function WhiteboardPage() {
    const supabase = await createClient()

    const { data: whiteboards, error } = await supabase
        .from('whiteboards')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching whiteboards:', error)
        return <div>Error loading whiteboards. Please try again later.</div>
    }
    const {data : {user}} = await supabase.auth.getUser();

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col justify-between my-8 md:flex-row">
                <h2 className="scroll-m-20 pb-2 text-4xl font-semibold tracking-tight first:mt-0 text-lightYellow">
                    Your Whiteboards
                </h2>
                <CreateWhiteboardModal/>
            </div>
            <WhiteboardList initWhiteboards={whiteboards} userId={user!.id} />
        </div>
    );
}