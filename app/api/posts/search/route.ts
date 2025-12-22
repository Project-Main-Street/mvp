import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/db';
import { stackServerApp } from '@/stack/server';

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const userId = searchParams.get('userId');

        const posts = await searchPosts(query, userId || undefined);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
