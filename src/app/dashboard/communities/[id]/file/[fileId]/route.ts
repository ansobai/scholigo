import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from "@/utils/supabase/server";
import { getUserCommunityPermissions } from "@/utils/community/roles";
import { hasPermission, uploadPermissions } from "@/types/communities/permissions";
import { createAdminClient } from "@/utils/supabase/admin";

const fileSchema = z.object({
    id: z.string(),
    fileId: z.string(),
});

/**
 * Handles the POST request to upload a file to a community.
 *
 * @param {NextRequest} req - The incoming request object.
 * @param {Object} props - The properties object containing route parameters.
 * @param {Promise<{ id: string, fileId: string }>} props.params - The route parameters containing community ID and file ID.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string, fileId: string }> }) {
    const { id, fileId } = await props.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        fileSchema.parse({ id, fileId });
    } catch (error) {
        console.error("Error parsing file schema", error);
        return new NextResponse('Invalid input', { status: 400 });
    }

    const limiter = rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 500,
    });

    try {
        await limiter.check(req, 5, 'FILE_UPLOAD');
    } catch {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    const userPerms = await getUserCommunityPermissions(user?.id, id);

    if (!userPerms || !hasPermission(userPerms, uploadPermissions)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${randomString}-${fileId}`;
    const raw = await req.blob();

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage
        .from('community')
        .upload(`${id}/${fileName}`, raw);

    if (error) {
        console.error('Upload error:', error);
        return new NextResponse('Upload failed', { status: 500 });
    }

    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community/${id}/${fileName}` });
}