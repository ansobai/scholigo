import {NextRequest, NextResponse} from "next/server";
import {rateLimit} from "@/lib/rate-limit";
import {createClient} from "@/utils/supabase/server";
import {validateSharingToken} from "@/app/dashboard/whiteboard/actions/sharing";
import {addUserToWhiteboard} from "@/app/dashboard/whiteboard/actions/whiteboard";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return new NextResponse('Unauthorized', {status: 401});
    }

    const limiter = rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 500,
    });

    try {
        await limiter.check(req, 10, 'WHITEBOARD_INVITE');
    } catch {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    const supabase = await createClient();
    const { data: {user}, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error('Error getting user:', userError);
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const validToken = await validateSharingToken(id, token);
    if (!validToken) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await addUserToWhiteboard(id, user!.id);
    if (result.status === 'error') {
        return new NextResponse('Failed to add user to whiteboard', { status: 500 });
    }

    return new NextResponse(null, { status: 302, headers: { Location: `/dashboard/whiteboard/${id}` } });
}