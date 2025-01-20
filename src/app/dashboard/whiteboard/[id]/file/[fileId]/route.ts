import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import {createClient} from "@/utils/supabase/server";

const fileSchema = z.object({
    id: z.string(),
    fileId: z.string(),
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string, fileId: string }> }) {
    const { id, fileId } = await props.params;
    const supabase = await createClient();
    const { data: { user }} = await supabase.auth.getUser()

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

    const { data: accessData, error: accessError } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .eq('whiteboard_id', id)
        .eq('user_id', user?.id)
        .single();

    if (accessError || !accessData) {
        console.error('Access error:', accessError);
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const raw = await req.blob();
    const { data, error } = await supabase.storage
        .from('whiteboard-assets')
        .upload(`${id}/${fileId}`, raw);

    if (error) {
        console.error('Upload error:', error);
        return new NextResponse('Upload failed', { status: 500 });
    }

    return NextResponse.json({ url: data.path });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; fileId: string }> }
) {
    const { id, fileId } = await params;

    try {
        fileSchema.parse({ id, fileId });
    } catch (error) {
        return new NextResponse('Invalid input', { status: 400 });
    }

    const limiter = rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 500,
    });

    try {
        await limiter.check(req, 10, 'FILE_DOWNLOAD');
    } catch {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user }} = await supabase.auth.getUser()
    const { data: accessData, error: accessError } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .eq('whiteboard_id', id)
        .eq('user_id', user?.id)
        .single();

    if (accessError || !accessData) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data, error } = await supabase.storage
        .from('whiteboard-assets')
        .download(`${id}/${fileId}`);

    if (error) {
        console.error('Download error:', error);
        return new NextResponse('Download failed', { status: 500 });
    }

    return new NextResponse(data, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${fileId}"`,
        },
    });
}



