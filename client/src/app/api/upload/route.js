import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Read file into memory and convert to Base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert to Base64 data URI to solve ephemeral storage issues in Cloud Run
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type || 'image/png'};base64,${base64}`;

        console.log('✅ File processed as Base64');

        return NextResponse.json({
            success: true,
            url: dataUri, // Base64 data URI
            filename: file.name,
            size: buffer.length
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed: ' + error.message },
            { status: 500 }
        );
    }
}
