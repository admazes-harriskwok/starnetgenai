import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    // This is a dynamic route, but for simplicity we can use query params or just a segment.
    // In Next.js App Router, the filename should be [id]/route.js.
    // I'll create a single route that takes the operation name from query params for now.

    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('id'); // e.g. "operations/12345"
    const apiKey = searchParams.get('key');

    if (!operationId || !apiKey) {
        return NextResponse.json({ error: 'Operation ID and API Key are required' }, { status: 400 });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/${operationId}?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error?.message || 'Failed to fetch operation status' }, { status: response.status });
        }

        // Return the LRO state
        return NextResponse.json(data);
    } catch (error) {
        console.error('Polling Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
