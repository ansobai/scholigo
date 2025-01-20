import { NextRequest, NextResponse } from 'next/server';
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import got from 'got';

const scraper = metascraper([
    metascraperTitle(),
    metascraperDescription(),
    metascraperImage()
]);

/**
 * Handles GET requests to fetch metadata from a given URL.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing the metadata or an error message.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const url = req.nextUrl.searchParams.get('url');

        if (!url) {
            return NextResponse.json({ success: 0, error: 'URL is required' }, { status: 400 });
        }

        const { body: html, url: responseUrl } = await got(url);
        const metadata = await scraper({ html, url: responseUrl });

        return NextResponse.json({
            success: 1,
            link: url,
            meta: {
                title: metadata.title,
                description: metadata.description,
                image: {
                    url: metadata.image
                }
            }
        });
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return NextResponse.json({ success: 0, error: 'Failed to fetch URL metadata' }, { status: 500 });
    }
}