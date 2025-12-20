import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        console.log('Request body size:', rawBody.length, 'bytes');

        if (!rawBody) {
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { prompt, apiKey: userKey, model: userModel } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Prioritize User Key -> Env Key
        const apiKey = userKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('API Key Missing');
            return NextResponse.json({ error: 'API Key is missing. Please set it in Settings.' }, { status: 500 });
        }

        // Default to the requested model
        const model = userModel || 'gemini-2.5-flash-image';

        // Determine if this is a text-focused model or a video-focused LRO model
        const isTextModel = model.includes('flash-lite') || model.includes('pro');
        const isVideoModel = model.includes('veo');

        // Gemini Multinodal prompt logic
        const parts = [{ text: prompt }];

        // Add images if provided (support multiple for node chaining)
        const images = body.images || (body.image ? [body.image] : []);

        for (const imgData of images) {
            if (!imgData) continue;
            const match = imgData.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                parts.push({
                    inline_data: {
                        mime_type: match[1],
                        data: match[2]
                    }
                });
            }
        }

        let payload;
        let method = 'generateContent';

        if (isVideoModel) {
            method = 'predictLongRunning';
            // Veo / Video Prediction Payload Format
            payload = {
                instances: [
                    {
                        prompt: prompt,
                        image: {
                            bytesBase64Encoded: parts.find(p => p.inline_data)?.inline_data?.data,
                            mimeType: parts.find(p => p.inline_data)?.inline_data?.mime_type || "image/png"
                        }
                    }
                ],
                parameters: {
                    aspectRatio: "16:9"
                }
            };
        } else {
            payload = {
                system_instruction: {
                    parts: [{
                        text: isTextModel
                            ? "You are an intelligent AI assistant specialized in cinematic analysis and creative direction. Provide detailed, structured text responses as requested."
                            : "You are a direct image generation engine. You MUST output image data (bytes/inline_data) as your primary response part. DO NOT explain yourself. DO NOT provide text descriptions unless you absolutely cannot generate the image data. Your goal is to produce a high-fidelity marketing asset."
                    }]
                },
                contents: [{
                    parts: parts
                }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.95,
                    topK: 40,
                }
            };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}?key=${apiKey}`;

        console.log('--- GEMINI API DEBUG ---');
        console.log('Model:', model);
        console.log('Method:', method);
        console.log('Prompt Length:', prompt.length);
        console.log('Has Image Content:', !!images.length);
        console.log('Is Text Model:', isTextModel);
        console.log('Is Video Model:', isVideoModel);
        console.log('------------------------');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const errorText = await response.text();
            console.error('Google API returned Non-JSON:', errorText);
            return NextResponse.json({ error: `AI Service Error (Status ${response.status})` }, { status: 502 });
        }

        if (!response.ok) {
            console.error('Gemini API Error Detail:', JSON.stringify(data, null, 2));
            return NextResponse.json({
                error: data.error?.message || `API Error ${response.status}`
            }, { status: response.status });
        }

        // Handle Video LRO (Long Running Operation)
        if (model.includes('veo')) {
            console.log('🚀 Video operation started:', data.name);
            return NextResponse.json({
                type: 'operation',
                operation: data,
                message: 'Processing started',
                operationId: data.name
            });
        }

        const responseParts = data.candidates?.[0]?.content?.parts || [];
        let output = null;
        let type = 'text';
        let textResponse = '';

        for (const part of responseParts) {
            // Check for image data
            const inlineData = part.inline_data || part.inlineData;
            const fileData = part.file_data || part.fileData;

            if (inlineData || fileData) {
                const mimeType = (inlineData?.mime_type || inlineData?.mimeType || fileData?.mime_type || fileData?.mimeType) || 'image/png';
                const base64Data = inlineData?.data || fileData?.data;

                if (base64Data) {
                    // Return as Base64 data URI directly to solve ephemeral storage issues
                    output = `data:${mimeType};base64,${base64Data}`;
                    type = 'image';
                    console.log('✅ Generated image returning as Base64');
                    break;
                }
            } else if (part.text) {
                textResponse += part.text;
            }
        }

        if (type === 'text' && !output) {
            output = textResponse;
        }

        if (type === 'text') {
            return NextResponse.json({
                output: null,
                text: output,
                type: 'text',
                error: isTextModel ? null : `Model returned text instead of an image: "${output.substring(0, 100)}${output.length > 100 ? '...' : ''}"`
            }, { status: 200 });
        }

        return NextResponse.json({
            output: output,
            type: type
        });

    } catch (error) {
        console.error('Detailed API Error:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
