"use client";
import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveProjectToDB, getProjectsFromDB } from '../../lib/db';
import ReactFlow, {
    Background,
    Controls,
    ControlButton,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TEMPLATES } from '../../config/templates';

import MediaNode from '../../components/nodes/MediaNode';
import TextNode from '../../components/nodes/TextNode';
import AIImageNode from '../../components/nodes/AIImageNode';
import AIVideoNode from '../../components/nodes/AIVideoNode';
import AssistantNode from '../../components/nodes/AssistantNode';

// Cinematic Nodes
import DirectorAnalysisNode from '../../components/nodes/cinematic/DirectorAnalysisNode';
import StoryboardNode from '../../components/nodes/cinematic/StoryboardNode';
import FrameSplitterNode from '../../components/nodes/cinematic/FrameSplitterNode';
import VideoGenNode from '../../components/nodes/cinematic/VideoGenNode';
import ExportHandlerNode from '../../components/nodes/cinematic/ExportHandlerNode';

const nodeTypes = {
    source: MediaNode,
    sourceUpload: MediaNode,
    generation: AIImageNode,
    media: MediaNode,
    text: TextNode,
    aiImage: AIImageNode,
    aiVideo: AIVideoNode,
    assistant: AssistantNode,
    aiAnalysis: DirectorAnalysisNode,
    imageGen: StoryboardNode,
    imageSplitter: FrameSplitterNode,
    videoGen: VideoGenNode,
    exportHandler: ExportHandlerNode,
};

function CanvasInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('projectId');

    // 1. Credit State
    const [credits, setCredits] = useState(250);
    const creditsRef = useRef(credits);

    const [projectName, setProjectName] = useState("Untitled Project");
    const [lastSaved, setLastSaved] = useState(Date.now());

    // 1. Credit Sync with Storage
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        if (config.credits !== undefined) {
            setCredits(config.credits);
        }
    }, []);

    // Persist credits when they change
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        localStorage.setItem('starnet_config', JSON.stringify({ ...config, credits }));
        creditsRef.current = credits;
    }, [credits]);

    // 2. Nodes & Edges State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
    }, [nodes, edges]);

    const [isSaving, setIsSaving] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
    const [expandedMedia, setExpandedMedia] = useState(null);
    const reactFlowInstance = useRef(null);
    const [selectedRatios, setSelectedRatios] = useState(['9:16']);
    const [isExporting, setIsExporting] = useState(false);
    const [selectorPos, setSelectorPos] = useState({ x: 100, y: 100 });

    // 3. Handlers
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeDataChange = useCallback((id, newData) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
    }, [setNodes]);

    // Help convert any image (URL or Blob) to Base64 for the API
    const imageToBase64 = async (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('data:')) return imageUrl;

        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Failed to convert image to base64:', e);
            return null;
        }
    };

    const checkBillingPlan = useCallback(() => {
        window.open('https://aistudio.google.com/app/plan', '_blank');
    }, []);

    // Save Project Logic
    const saveProject = useCallback(async () => {
        if (!projectId && !searchParams.get('template')) return;

        setIsSaving(true);
        const currentId = projectId || `p_${Date.now()}`;

        // Pick a thumbnail (prioritize generated outputs)
        const thumbnailNode = nodesRef.current.find(n => n.data.output) || nodesRef.current.find(n => n.data.image);
        const thumb = thumbnailNode ? (thumbnailNode.data.output || thumbnailNode.data.image) : null;

        // Capture viewport state for restoration
        let viewport = { x: 0, y: 0, zoom: 1 };
        if (reactFlowInstance.current) {
            viewport = reactFlowInstance.current.getViewport();
        }

        // Serialize nodes with ALL data preserved
        const serializedNodes = nodesRef.current.map(n => ({
            ...n,
            data: {
                ...n.data,
                // Explicitly preserve critical data for restoration
                prompt: n.data.prompt,
                image: n.data.image,
                output: n.data.output,
                label: n.data.label,
                usedPrompt: n.data.usedPrompt,
                loading: undefined,
                // Remove function references
                onGenerate: undefined,
                onDataChange: undefined,
                onImageUpload: undefined
            }
        }));

        const projectData = {
            id: currentId,
            name: projectName,
            nodes: serializedNodes,
            edges: edgesRef.current,
            viewport: viewport,
            thumbnail: thumb,
            updatedAt: new Date().toISOString(),
            aspectRatio: '9:16'
        };

        try {
            await saveProjectToDB(projectData);
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error('Save failed:', error);
            setIsSaving(false);
        }
    }, [projectId, projectName, searchParams]);

    // Autosave Debounce Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            saveProject();
        }, 3000); // Increased from 2s to 3s for performance

        return () => clearTimeout(timer);
    }, [nodes, edges, projectName, saveProject]);

    const STORYBOARD_PROMPT = `
<role> 
You are an award-winning trailer director + cinematographer + storyboard artist. Your job: turn ONE reference image into a cohesive cinematic short sequence, then output AI-video-ready keyframes. 
</role>  

<input> 
User provides: one reference image (image). 
</input>  

<non-negotiable rules - continuity & truthfulness> 
1) First, analyze the full composition: identify ALL key subjects (person/group/vehicle/object/animal/props/environment elements) and describe spatial relationships and interactions. 
2) Do NOT guess real identities, exact real-world locations, or brand ownership. Stick to visible facts. 
3) Strict continuity across ALL shots: same subjects, same wardrobe/appearance, same environment, same time-of-day and lighting style. 
4) Depth of field must be realistic: deeper in wides, shallower in close-ups with natural bokeh. Keep ONE consistent cinematic color grade across the entire sequence. 
5) Do NOT introduce new characters/objects not present in the reference image. 
</non-negotiable rules - continuity & truthfulness>  

<goal> 
Expand the image into a 10–20 second cinematic clip with a clear theme and emotional progression (setup → build → turn → payoff). 
</goal>  

<step 1 - scene breakdown> Output (with clear subheadings): 
- Subjects
- Environment & Lighting
- Visual Anchors
</step 1 - scene breakdown>  

<step 2 - theme & story> Theme, Logline, Emotional Arc. 
</step 2 - theme & story>  

<step 3 - cinematic approach> Shot progression strategy, Camera movement plan, Lens & exposure, Light & color. 
</step 3 - cinematic approach>  

<step 4 - keyframes for AI video (primary deliverable)> Output a Keyframe List: default 9 frames. 
Use this exact format per frame:  [KF# | duration | shot type] - Composition: ... - Action/beat: ... - Camera: ... - Lens/DoF: ... - Lighting & grade: ...
</step 4 - keyframes for AI video>  

<step 5 - contact sheet output (MUST OUTPUT ONE BIG GRID IMAGE)> 
Output a prompt for ONE single master image: a Cinematic Contact Sheet / Storyboard Grid containing ALL 9 keyframes in a 3x3 grid.
</step 5 - contact sheet output>  

<final output format> Output in this order: A) Scene Breakdown B) Theme & Story C) Cinematic Approach D) Keyframe List E) Master Contact Sheet Prompt </final output format>
`;

    const SPLITTER_ANALYSIS_PROMPT = `
<role> 
You are an award-winning trailer director + cinematographer + storyboard artist. Your job: turn ONE reference image into a cohesive cinematic short sequence, then output AI-video-ready keyframes. 
</role>  

<input> 
User provides: one reference image (image) and a Storyboard Grid (image).
</input>  

<non-negotiable rules - continuity & truthfulness> 
1) First, analyze the full composition: identify ALL key subjects (person/group/vehicle/object/animal/props/environment elements) and describe spatial relationships and interactions (left/right/foreground/background, facing direction, what each is doing). 
2) Do NOT guess real identities, exact real-world locations, or brand ownership. Stick to visible facts. Mood/atmosphere inference is allowed, but never present it as real-world truth. 
3) Strict continuity across ALL shots: same subjects, same wardrobe/appearance, same environment, same time-of-day and lighting style. Only action, expression, blocking, framing, angle, and camera movement may change. 
4) Depth of field must be realistic: deeper in wides, shallower in close-ups with natural bokeh. Keep ONE consistent cinematic color grade across the entire sequence. 
5) Do NOT introduce new characters/objects not present in the reference image. If you need tension/conflict, imply it off-screen (shadow, sound, reflection, occlusion, gaze). 
</non-negotiable rules - continuity & truthfulness>  

<goal> 
Analyze the provided storyboard grid and its 9 distinct panels. Generate 9 individual, highly detailed, comprehensive image generation prompts (one for each keyframe) to restore each shot in high definition using NanoBanana Pro. 
</goal>  

<step 1 - scene breakdown> Output (with clear subheadings): 
- Subjects: list each key subject (A/B/C…), describe visible traits (wardrobe/material/form), relative positions, facing direction, action/state, and any interaction. 
- Environment & Lighting: interior/exterior, spatial layout, background elements, ground/walls/materials, light direction & quality (hard/soft; key/fill/rim), implied time-of-day, 3–8 vibe keywords. 
- Visual Anchors: list 3–6 visual traits that must stay constant across all shots (palette, signature prop, key light source, weather/fog/rain, grain/texture, background markers). 
</step 1 - scene breakdown>  

<step 2 - theme & story> From the image, propose: - Theme: one sentence. - Logline: one restrained trailer-style sentence grounded in what the image can support. - Emotional Arc: 4 beats (setup/build/turn/payoff), one line each. 
</step 2 - theme & story>  

<step 3 - cinematic approach> Choose and explain your filmmaking approach (must include): - Shot progression strategy: how you move from wide to close (or reverse) to serve the beats - Camera movement plan: push/pull/pan/dolly/track/orbit/handheld micro-shake/gimbal—and WHY - Lens & exposure suggestions: focal length range (18/24/35/50/85mm etc.), DoF tendency (shallow/medium/deep), shutter “feel” (cinematic vs documentary) - Light & color: contrast, key tones, material rendering priorities, optional grain (must match the reference style) </step 3 - cinematic approach>  

<step 4 - keyframes for AI video (primary deliverable)> Output a Keyframe List: 9 frames. 
Use this exact format per frame:  
[KF# | suggested duration (sec) | shot type] - Composition: ... - Action/beat: ... - Camera: ... - Lens/DoF: ... - Lighting & grade: ... - Sound/atmos (optional): ...

Hard requirements:
- Ensure edit-motivated continuity between shots (eyeline match, action continuation, consistent screen direction / axis). 
</step 4 - keyframes for AI video>  

<step 5 - contact sheet output> Output a description for the 3x3 grid that was analyzed. </step 5 - contact sheet output>  

<final output format> Output in this order: A) Scene Breakdown B) Theme & Story C) Cinematic Approach D) Keyframes (KF# list) E) ONE Master Contact Sheet Image description </final output format>
`;

    // Handle Generation Logic
    const onGenerate = useCallback(async (id, customPrompt) => {
        const targetNode = nodesRef.current.find(n => n.id === id);
        if (!targetNode) return;

        // Determine credit cost based on node type
        let cost = 2;
        if (targetNode.type === 'imageGen') cost = 4;
        if (targetNode.type === 'imageSplitter') cost = 5;
        if (targetNode.type === 'videoGen') cost = 10;
        if (targetNode.type === 'aiAnalysis') cost = 1;

        if (creditsRef.current < cost) {
            alert(`Insufficient credits! This operation costs ${cost} 🪙.`);
            return;
        }

        console.log(`--- GENERATION START (${targetNode.type}) ---`);
        setNodes((nds) => nds.map(node => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, loading: true, output: null } };
            }
            return node;
        }));

        try {
            const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
            const { apiKey, model: defaultModel } = config;
            let data;

            const incomingEdges = edgesRef.current.filter(e => e.target === id);
            const sourceNodes = incomingEdges.map(e => {
                return nodesRef.current.find(n => n.id === e.source);
            }).filter(node => node);

            const inputImagesRaw = [];
            let inputAnalysis = null;
            let hdImages = null;
            let connectedPrompt = null;

            for (const sn of sourceNodes) {
                const img = sn.data.output || sn.data.image;
                if (img) {
                    inputImagesRaw.push({ id: sn.id, label: sn.data.label || sn.id, image: img });
                }
                if (sn.data.analysis) {
                    inputAnalysis = sn.data.analysis;
                }
                if (sn.data.frames) {
                    hdImages = sn.data.frames;
                }
                if (sn.type === 'text' && sn.data.text) {
                    connectedPrompt = sn.data.text;
                }
            }

            // Find missing inputs by traversing further back if needed (for templates)
            if (!inputAnalysis || !hdImages) {
                const allNodes = nodesRef.current;
                const analysisNode = allNodes.find(n => n.type === 'aiAnalysis' && n.data.analysis);
                const splitterNode = allNodes.find(n => n.type === 'imageSplitter' && n.data.frames);

                if (analysisNode && !inputAnalysis) inputAnalysis = analysisNode.data.analysis;
                if (splitterNode && !hdImages) hdImages = splitterNode.data.frames;
            }

            const inputImagesBase64 = await Promise.all(
                inputImagesRaw.map(item => imageToBase64(item.image))
            );

            let finalPrompt = customPrompt || connectedPrompt || targetNode.data.prompt;
            let modelToUse = defaultModel || 'gemini-2.5-flash-image';

            // Specialized Logic Per Node Type
            if (targetNode.type === 'aiAnalysis') {
                if (inputImagesBase64.length === 0) throw new Error("Reference Image is required for analysis.");
                finalPrompt = STORYBOARD_PROMPT;
                modelToUse = 'gemini-2.5-flash-lite';
            } else if (targetNode.type === 'imageGen' || targetNode.type === 'aiImage') {
                if (targetNode.type === 'imageGen' && !inputAnalysis) {
                    throw new Error("Director AI analysis is required first.");
                }
                if (targetNode.type === 'imageGen') {
                    // Use auto-prompt only if no override is provided manually
                    if (!customPrompt && !connectedPrompt && !targetNode.data.prompt) {
                        const sheetDesc = inputAnalysis.contact_sheet_description || "3x3 Grid Contact Sheet, cinematic storyboard";
                        finalPrompt = `Create a 3x3 Grid Contact Sheet based on these keyframes: ${sheetDesc}. Keep visual consistency with the reference image style.`;
                    }
                }
                modelToUse = 'gemini-2.5-flash-image';
            } else if (targetNode.type === 'imageSplitter') {
                // Find storyboard grid source
                const storyboardNode = sourceNodes.find(n => n.type === 'imageGen' || (n.data.output && !n.data.frames));
                const storyboardImg = storyboardNode ? (storyboardNode.data.output || storyboardNode.data.image) : null;

                if (!storyboardImg) throw new Error("Storyboard Grid output image is required for Keyframe Restoration.");

                console.log("🛠️ --- ANALYZING STORYBOARD FOR HD RESTORATION (Gemini Intelligence) ---");
                const gridBase64 = await imageToBase64(storyboardImg);

                // 1. Analyze Storyboard Grid with Original Reference for Continuity
                const analysisResponse = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: SPLITTER_ANALYSIS_PROMPT,
                        apiKey,
                        model: 'gemini-2.5-flash-image',
                        images: [inputImagesBase64[0], gridBase64] // Original Ref [0] + Storyboard Grid
                    })
                });

                const analysisResData = await analysisResponse.json();
                if (!analysisResponse.ok) throw new Error(analysisResData.error || "Storyboard analysis failed.");

                // 2. Extract 9 Prompts for NanoBanana Pro
                const kfText = analysisResData.text.split('[KF#')[1] ? analysisResData.text.split(/\[KF#/i).slice(1) : [];
                const framePrompts = kfText.map((block, i) => {
                    const cleanBlock = block.split('Sound/atmos')[0].trim();
                    return `High-fidelity cinematic HD cinematic restoration of Frame ${i + 1}. ${cleanBlock}. Photorealistic 8k, match reference exactly.`;
                }).slice(0, 9);

                console.log(`🛠️ --- GENERATING 9 PARALLEL HD KEYFRAMES (NanoBanana Pro / Google Image) ---`);

                const hdFrameTasks = framePrompts.map(prompt =>
                    fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: prompt,
                            apiKey,
                            model: 'gemini-2.5-flash-image',
                            images: [inputImagesBase64[0]] // Match with original reference for perfect continuity
                        })
                    }).then(res => res.json())
                );

                const frameResults = await Promise.all(hdFrameTasks);
                const successfulFrames = frameResults.map(r => r.output || "https://picsum.photos/seed/error/400/225");

                data = { frames: successfulFrames };
            }

            if (targetNode.type === 'videoGen') {
                if (!hdImages || !inputAnalysis || !inputAnalysis.keyframes) {
                    throw new Error("Missing inputs! Ensure Step 2 (Analysis) and Step 4 (HD Framing) are complete.");
                }

                const keyframeData = inputAnalysis.keyframes;
                const count = Math.min(hdImages.length, keyframeData.length);
                const generatedClips = [];

                console.log(`🎬 --- STARTING BATCH VIDEO GENERATION (${count} clips) ---`);

                for (let i = 0; i < count; i++) {
                    const currentFrame = hdImages[i];
                    const kf = keyframeData[i];
                    const motionPrompt = (targetNode.data.videoPrompts?.[i]) ||
                        `Cinematic shot, ${kf.action}. Camera movement: ${kf.camera}. High resolution, photorealistic.`;

                    console.log(`Generating Video for Index ${i} using Image: ${currentFrame.substring(0, 50)}... and Prompt: ${motionPrompt}`);

                    // Rate Limit Spacing: Wait if not the first clip
                    if (i > 0) {
                        console.log(`⏱️ Cooling down for 15s to respect API rate limits...`);
                        setNodes((nds) => nds.map(node => {
                            if (node.id === id) {
                                return { ...node, data: { ...node.data, status: `Rate limit cooling (15s)...` } };
                            }
                            return node;
                        }));
                        await new Promise(r => setTimeout(r, 15000));
                    }

                    // Update UI progress
                    setNodes((nds) => nds.map(node => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, status: `Generating clip ${i + 1} of ${count}...` } };
                        }
                        return node;
                    }));

                    const frameBase64 = await imageToBase64(currentFrame);
                    const promptToUse = motionPrompt;

                    let opResult;
                    let attempts = 0;
                    const maxAttempts = 5;
                    let success = false;

                    while (attempts < maxAttempts && !success) {
                        const response = await fetch('/api/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                prompt: promptToUse,
                                apiKey,
                                model: 'veo-3.0-generate-001',
                                images: [frameBase64]
                            })
                        });

                        opResult = await response.json();

                        if (!response.ok || opResult.error) {
                            const errorMsg = opResult.error?.message || opResult.error || `Failed at clip ${i + 1}`;
                            if (errorMsg.includes('quota') || errorMsg.includes('429')) {
                                attempts++;
                                if (attempts < maxAttempts) {
                                    const waitTime = 65000;
                                    console.warn(`Quota reached. Retrying attempt ${attempts}/${maxAttempts} in ${waitTime / 1000}s...`);
                                    setNodes((nds) => nds.map(node => {
                                        if (node.id === id) {
                                            return { ...node, data: { ...node.data, status: `Quota hit. Retrying in ${waitTime / 1000}s... (Attempt ${attempts}/${maxAttempts})` } };
                                        }
                                        return node;
                                    }));
                                    await new Promise(r => setTimeout(r, waitTime));
                                    continue;
                                }
                                throw new Error("API Quota Reached: Your current plan has hit its limit. Please wait 1-2 minutes or upgrade your Google Billing Plan.");
                            }
                            throw new Error(errorMsg);
                        }
                        success = true;
                    }

                    // Handle Polling for this clip
                    if (opResult.type === 'operation') {
                        const opId = opResult.operationId;
                        let isDone = false;
                        let pollResult = null;

                        while (!isDone) {
                            await new Promise(r => setTimeout(r, 5000));
                            const pollRes = await fetch(`/api/operation?id=${encodeURIComponent(opId)}&key=${encodeURIComponent(apiKey)}`);
                            const pollData = await pollRes.json();

                            if (pollData.done) {
                                isDone = true;
                                pollResult = pollData.response?.results?.[0]?.video?.uri ||
                                    pollData.response?.video?.uri ||
                                    pollData.response?.output;
                            }
                        }
                        generatedClips.push(pollResult || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
                    }
                }

                data = { output: generatedClips[0], clips: generatedClips, type: 'video' };
            } else {
                // Standard single generation for all other nodes (Analysis, ImageGen, Splitter, etc.)
                let attempts = 0;
                const maxAttempts = 5;
                let success = false;

                while (attempts < maxAttempts && !success) {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: finalPrompt,
                            apiKey,
                            model: modelToUse,
                            images: inputImagesBase64
                        })
                    });

                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        data = await response.json();
                    } else {
                        throw new Error(`Server Error (${response.status})`);
                    }

                    if (!response.ok || data.error) {
                        const errorMsg = data.error || `Generation failed`;
                        if (errorMsg.includes('quota') || errorMsg.includes('429')) {
                            attempts++;
                            if (attempts < maxAttempts) {
                                const waitTime = 60000;
                                console.warn(`Quota reached. Retrying standard gen attempt ${attempts}/${maxAttempts} in ${waitTime / 1000}s...`);
                                await new Promise(r => setTimeout(r, waitTime));
                                continue;
                            }
                        }
                        throw new Error(errorMsg);
                    }
                    success = true;
                }

                // Handle Asynchronous Polling for Operation (Single Node)
                if (data.type === 'operation') {
                    const opId = data.operationId || data.operation?.name;
                    let isDone = false;
                    let result = null;

                    while (!isDone) {
                        await new Promise(r => setTimeout(r, 5000));
                        const pollRes = await fetch(`/api/operation?id=${encodeURIComponent(opId)}&key=${encodeURIComponent(apiKey)}`);
                        const pollData = await pollRes.json();

                        if (pollData.done) {
                            isDone = true;
                            result = pollData.response?.results?.[0]?.video?.uri ||
                                pollData.response?.video?.uri ||
                                pollData.response?.output;
                        }
                    }
                    data = { ...data, output: result };
                }
            }

            // Skip credit deduction if its a batch since it happened or we skip for now 
            // (Standard credits logic applies below)
            setCredits((c) => Math.max(0, c - cost));

            setNodes((nds) => nds.map(node => {
                if (node.id === id) {
                    let updatedData = { ...node.data, loading: false, status: 'Complete' };

                    if (targetNode.type === 'aiAnalysis' && data.text) {
                        // Advanced Keyframe Extraction
                        const kfText = data.text.split('[KF#')[1] ? data.text.split(/\[KF#/i).slice(1) : [];
                        const themeMatch = data.text.match(/Theme:\s*(.*)/i);

                        const parsedKeyframes = kfText.map((block) => {
                            const actionMatch = block.match(/Action\/beat:\s*([^\n-]*)/i);
                            const cameraMatch = block.match(/Camera:\s*([^\n-]*)/i);
                            return {
                                action: actionMatch ? actionMatch[1].trim() : "Cinematic subject focus",
                                camera: cameraMatch ? cameraMatch[1].trim() : "Smooth movement"
                            };
                        });

                        // Ensure we have 9 keyframes exactly
                        const finalKFs = parsedKeyframes.length >= 9 ? parsedKeyframes.slice(0, 9) :
                            [...parsedKeyframes, ...Array(9 - parsedKeyframes.length).fill({ action: "Cinematic subject context", camera: "Cinematic camera" })];

                        updatedData.analysis = {
                            full_text: data.text,
                            theme: themeMatch ? themeMatch[1].trim() : "Cinematic Sequence",
                            keyframes: finalKFs,
                            contact_sheet_description: data.text.split('Master Contact Sheet Prompt')[1] ||
                                data.text.split('<step 5')[1]?.split('</')[0] ||
                                "3x3 Grid of 9 cinematic keyframes"
                        };
                    } else if (targetNode.type === 'imageSplitter') {
                        updatedData.frames = data.frames;
                    } else if (targetNode.type === 'videoGen') {
                        updatedData.clips = data.clips;
                        updatedData.output = data.clips[0];
                    } else {
                        updatedData.output = data.output;
                        updatedData.usedPrompt = finalPrompt;
                    }

                    return { ...node, data: updatedData };
                }
                return node;
            }));

            // Autosave after completion
            setTimeout(() => saveProject(), 100);

        } catch (error) {
            console.error('Generation Fault:', error);
            const isQuota = error.message.includes('Quota');

            if (isQuota) {
                if (confirm(`${error.message}\n\nWould you like to check your Google AI Studio billing plan now?`)) {
                    checkBillingPlan();
                }
            } else {
                alert(`Generation Failed: ${error.message}`);
            }

            setNodes((nds) => nds.map(node => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, loading: false, output: null } };
                }
                return node;
            }));
        }
    }, [saveProject, checkBillingPlan]);

    // Handle Image Upload - Upload to server instead of Base64
    const handleImageUpload = useCallback(async (id, file) => {
        console.log('📤 Uploading file for node:', id, file.name);

        // Show loading state
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, loading: true } };
            }
            return node;
        }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log('✅ Upload successful:', data.url);

            // Update node with URL (works for 'source' or 'sourceUpload')
            setNodes((nds) => nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, image: data.url, loading: false } };
                }
                return node;
            }));

            // Autosave after upload
            setTimeout(() => saveProject(), 500);

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');

            // Clear loading state
            setNodes((nds) => nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, loading: false } };
                }
                return node;
            }));
        }
    }, [saveProject, setNodes]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    // Initialize Nodes (Check Template or ID or Import)
    useEffect(() => {
        const tmplId = searchParams.get('template');
        const isImport = searchParams.get('import');

        let initialNodes = [];
        let initialEdges = [];
        let initialViewport = null;
        let name = "Untitled Project";

        if (projectId) {
            // Load existing project from IndexedDB
            const load = async () => {
                const savedProjects = await getProjectsFromDB();
                const project = savedProjects.find(p => p.id === projectId);

                if (project) {
                    initialNodes = project.nodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            loading: false
                        }
                    }));
                    initialEdges = project.edges || [];
                    initialViewport = project.viewport || null;

                    setProjectName(project.name);
                    setNodes(applyCallbacks(initialNodes));
                    setEdges(initialEdges);

                    if (initialViewport && reactFlowInstance.current) {
                        setTimeout(() => {
                            reactFlowInstance.current?.setViewport(initialViewport);
                        }, 100);
                    }
                }
            };
            load();
            return; // Exit here as load() handles the rest
        } else if (tmplId && TEMPLATES[tmplId]) {
            initialNodes = TEMPLATES[tmplId].nodes;
            initialEdges = TEMPLATES[tmplId].edges || [];
            name = TEMPLATES[tmplId].name;
        } else {
            // New Blank Canvas
            initialNodes = [];
            initialEdges = [];
            name = "Space - Blank Canvas";
            // Open Selector Immediately
            setTimeout(() => setIsNodeSelectorOpen(true), 500);
        }

        setProjectName(name);

        const applyCallbacks = (nds) => nds.map(node => {
            const isMedia = ['media', 'source', 'sourceUpload'].includes(node.type);
            const isGen = ['generation', 'aiImage', 'aiVideo', 'imageGen', 'videoGen', 'aiAnalysis', 'imageSplitter'].includes(node.type);

            return {
                ...node,
                data: {
                    ...node.data,
                    onGenerate: isGen ? onGenerate : undefined,
                    onDataChange: onNodeDataChange,
                    onImageUpload: isMedia ? handleImageUpload : undefined,
                    onExpand: (url) => setExpandedMedia(url)
                }
            };
        });

        setNodes(applyCallbacks(initialNodes));
        setEdges(initialEdges);

        if (initialViewport && reactFlowInstance.current) {
            setTimeout(() => {
                reactFlowInstance.current?.setViewport(initialViewport);
            }, 100);
        }
    }, [projectId, searchParams, onGenerate, onNodeDataChange, handleImageUpload, setNodes, setEdges]);

    const addNode = useCallback((type) => {
        const id = `node_${Date.now()}`;
        const newNode = {
            id: id,
            type: type,
            position: selectorPos,
            data: {
                label: type,
                onGenerate: onGenerate,
                onDataChange: onNodeDataChange,
                onImageUpload: handleImageUpload,
                onExpand: (url) => setExpandedMedia(url)
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setIsNodeSelectorOpen(false);
    }, [selectorPos, onGenerate, onNodeDataChange, handleImageUpload, setNodes]);

    const onAlign = useCallback((direction) => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length < 2) return;

        if (direction === 'horizontal') {
            const avgY = selectedNodes.reduce((acc, n) => acc + n.position.y, 0) / selectedNodes.length;
            setNodes((nds) => nds.map(n => n.selected ? { ...n, position: { ...n.position, y: avgY } } : n));
        } else {
            const avgX = selectedNodes.reduce((acc, n) => acc + n.position.x, 0) / selectedNodes.length;
            setNodes((nds) => nds.map(n => n.selected ? { ...n, position: { ...n.position, x: avgX } } : n));
        }
    }, [nodes, setNodes]);

    const onGroup = useCallback(() => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length < 2) return;
        alert(`Grouped ${selectedNodes.length} nodes! (In Canvas 2.0, you can now manage these as a set)`);
    }, [nodes]);

    const openSelectorAtCenter = useCallback(() => {
        if (!reactFlowInstance.current) return;

        // Get the center of the viewport in screen coordinates
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Convert to flow coordinates
        const position = reactFlowInstance.current.screenToFlowPosition({ x: centerX, y: centerY });

        // Offset to account for node selector size roughly (centered)
        setSelectorPos({ x: position.x - 100, y: position.y - 100 });
        setIsNodeSelectorOpen(true);
    }, []);

    const handleExport = () => {
        if (credits < 2) {
            alert("Insufficient credits for export!");
            return;
        }
        setIsExporting(true);

        // Simulate multi-format generation
        setTimeout(() => {
            const cost = selectedRatios.length * 2;
            if (credits < cost) {
                alert("Insufficient credits for selected variations!");
                setIsExporting(false);
                return;
            }

            setCredits(c => c - cost);
            setIsExporting(false);
            setIsExportModalOpen(false);

            // Save to Campaigns (LocalStorage)
            saveProject();

            alert(`${selectedRatios.length} variation(s) exported and project saved!`);
        }, 2000);
    };

    const toggleRatio = (ratio) => {
        if (selectedRatios.includes(ratio)) {
            setSelectedRatios(selectedRatios.filter(r => r !== ratio));
        } else {
            setSelectedRatios([...selectedRatios, ratio]);
        }
    };

    return (
        <div className="canvas-page">
            {/* Top Bar */}
            <header className="canvas-header">
                <div className="project-info">
                    <span className="back-arrow" onClick={() => router.push('/dashboard')}>←</span>
                    <div>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="project-name-input"
                        />
                        <span className="save-status">{isSaving ? 'Saving...' : 'Auto-saved'}</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="tool-btn" onClick={() => onAlign('horizontal')}>Align H</button>
                    <button className="tool-btn" onClick={() => onAlign('vertical')}>Align V</button>
                    <button className="tool-btn" onClick={onGroup}>Group</button>
                    <div className="credit-pill">
                        🪙 {credits}
                    </div>
                    <button className="export-btn" onClick={() => setIsExportModalOpen(true)}>Export</button>
                    <button className="add-node-fab" onClick={() => {
                        setSelectorPos({ x: 100, y: 100 });
                        setIsNodeSelectorOpen(true);
                    }}>+</button>
                </div>
            </header>

            {/* Main Canvas */}
            <div className="flow-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        const bounds = e.target.getBoundingClientRect();
                        setSelectorPos(reactFlowInstance.current.project({
                            x: e.clientX - bounds.left,
                            y: e.clientY - bounds.top
                        }));
                        setIsNodeSelectorOpen(true);
                    }}
                    onSelectionContextMenu={(e, nodes) => {
                        e.preventDefault();
                        if (nodes.length > 1) {
                            onGroup();
                        }
                    }}
                    onInit={(instance) => {
                        reactFlowInstance.current = instance;
                    }}
                    nodeTypes={nodeTypes}
                    fitView
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    defaultEdgeOptions={{
                        type: 'default',
                        animated: true,
                        style: { stroke: '#FF9A5A', strokeWidth: 2, strokeDasharray: '5 5' }
                    }}
                >
                    {nodes.length === 0 && (
                        <div className="canvas-watermark">
                            <p>Space is your infinite canvas for creating workflows.</p>
                            <p className="sub">Right-click or press '+' to add nodes.</p>
                        </div>
                    )}
                    <Background variant="dots" gap={24} size={1} color="#e2e8f0" />
                    <Controls showZoom={false} showFitView={false} showInteractive={false}>
                        <ControlButton onClick={openSelectorAtCenter} title="Add Node">
                            <PlusIcon />
                        </ControlButton>
                        <ControlButton onClick={() => reactFlowInstance.current?.zoomIn()} title="Zoom In">
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                        </ControlButton>
                        <ControlButton onClick={() => reactFlowInstance.current?.zoomOut()} title="Zoom Out">
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>-</span>
                        </ControlButton>
                        <ControlButton onClick={() => reactFlowInstance.current?.fitView()} title="Fit View">
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>[ ]</span>
                        </ControlButton>
                    </Controls>
                    <MiniMap style={{ borderRadius: 12, overflow: 'hidden' }} />
                </ReactFlow>
            </div>

            {/* Node Selector Modal */}
            {isNodeSelectorOpen && (
                <div className="modal-overlay" onClick={() => setIsNodeSelectorOpen(false)}>
                    <div className="selector-modal" onClick={e => e.stopPropagation()}>
                        <h2>How would you like to start?</h2>
                        <div className="selector-grid">
                            <div className="selector-item" onClick={() => addNode('media')}>
                                <span className="icon">📂</span>
                                <div className="info">
                                    <h3>Media</h3>
                                    <p>Uploads, Stock assets</p>
                                </div>
                            </div>
                            <div className="selector-item" onClick={() => addNode('text')}>
                                <span className="icon">💬</span>
                                <div className="info">
                                    <h3>Text</h3>
                                    <p>Prompts, Copy overlays</p>
                                </div>
                            </div>
                            <div className="selector-item" onClick={() => addNode('aiImage')}>
                                <span className="icon">🖼️</span>
                                <div className="info">
                                    <h3>Image Generator</h3>
                                    <p>Gemini/Imagen inputs</p>
                                </div>
                            </div>
                            <div className="selector-item" onClick={() => addNode('aiVideo')}>
                                <span className="icon">🎬</span>
                                <div className="info">
                                    <h3>Video Generator</h3>
                                    <p>Image-to-Video</p>
                                </div>
                            </div>
                            <div className="selector-item" onClick={() => addNode('assistant')}>
                                <span className="icon">🤖</span>
                                <div className="info">
                                    <h3>Assistant</h3>
                                    <p>AI Chat/Helper node</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Export Artwork</h2>
                        <div className="modal-body">
                            <div className="preview-section">
                                {nodes.find(n => n.data.output) ? (
                                    <img
                                        src={nodes.find(n => n.data.output).data.output}
                                        alt="Export Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                                    />
                                ) : (
                                    <div className="preview-box">No output to export</div>
                                )}
                            </div>
                            <div className="settings-section">
                                <h3>Target Dimensions</h3>
                                <div className="checkbox-group">
                                    {['9:16 (Story)', '1:1 (Square)', '16:9 (Landscape)', '4:5 (Portrait)'].map(label => {
                                        const val = label.split(' ')[0];
                                        return (
                                            <label key={val} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRatios.includes(val)}
                                                    onChange={() => toggleRatio(val)}
                                                />
                                                {label}
                                            </label>
                                        )
                                    })}
                                </div>

                                <div className="cost-info">
                                    <p>Est. Cost: <strong>2 🪙</strong></p>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setIsExportModalOpen(false)}>Cancel</button>
                                    <button className="btn-primary" onClick={handleExport} disabled={isExporting}>
                                        {isExporting ? 'Exporting...' : 'Export All'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {expandedMedia && (
                <div className="lightbox-overlay" onClick={() => setExpandedMedia(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="close-lightbox" onClick={() => setExpandedMedia(null)}>×</button>
                        {expandedMedia.includes('.mp4') || expandedMedia.startsWith('data:video') ? (
                            <video src={expandedMedia} controls autoPlay className="full-view-media" />
                        ) : (
                            <img src={expandedMedia} alt="Full View" className="full-view-media" />
                        )}
                        <div className="lightbox-actions">
                            <a href={expandedMedia} download="starnet_output" className="download-link">Download Asset</a>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .canvas-page {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                }

                /* Watermark */
                .canvas-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    pointer-events: none;
                    z-index: 0;
                }
                .canvas-watermark p {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #e2e8f0;
                    margin-bottom: 8px;
                }
                .canvas-watermark .sub {
                    font-size: 1rem;
                    color: #cbd5e1;
                }

                .canvas-header {
                    height: 72px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    z-index: 10;
                }

                .project-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-arrow {
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #64748b;
                }

                .project-name-input {
                    font-size: 1.1rem;
                    font-weight: 700;
                    border: none;
                    background: transparent;
                    color: #0f172a;
                    outline: none;
                    width: 250px;
                }

                .save-status {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: block;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .tool-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                }
                .tool-btn:hover { background: #f1f5f9; color: #0f172a; }

                .add-node-fab {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #f97316;
                    color: white;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                }

                .credit-pill {
                    background: #fff7ed;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-weight: 600;
                    color: #f97316;
                    font-size: 0.9rem;
                    border: 1px solid #ffedd5;
                }

                .export-btn {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.85rem;
                }

                .flow-container {
                    flex: 1;
                    position: relative;
                }

                /* Modals common */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                /* Selector Modal */
                .selector-modal {
                    background: white;
                    padding: 32px;
                    border-radius: 24px;
                    width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .selector-modal h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .selector-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .selector-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .selector-item:hover {
                    border-color: #f97316;
                    background: #fff7ed;
                    transform: translateY(-2px);
                }
                .selector-item .icon { font-size: 1.8rem; }
                .selector-item .info h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 2px; }
                .selector-item .info p { font-size: 0.75rem; color: #64748b; }

                /* Export Modal (Restored) */
                .modal-content {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    width: 700px;
                    max-width: 90%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .modal-body { display: flex; gap: 32px; margin-top: 24px; }
                .preview-section { flex: 1; background: #f1f5f9; border-radius: 16px; display: flex; align-items: center; justify-content: center; min-height: 240px; border: 2px dashed #cbd5e1; }
                .settings-section { flex: 0.8; display: flex; flex-direction: column; }
                .checkbox-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
                .checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; cursor: pointer; color: #64748b; }
                .cost-info { margin-top: auto; margin-bottom: 20px; font-size: 0.95rem; background: #fff7ed; padding: 12px; border-radius: 12px; color: #f97316; border: 1px solid #ffedd5; display: flex; align-items: center; gap: 8px; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
                .btn-cancel { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #64748b; }
                .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-width: 120px; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Lightbox */
                .lightbox-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 40px;
                }
                .lightbox-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .full-view-media {
                    max-width: 100%;
                    max-height: 80vh;
                    border-radius: 12px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .close-lightbox {
                    position: absolute;
                    top: -40px;
                    right: -20px;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 2.5rem;
                    cursor: pointer;
                }
                .lightbox-actions {
                    margin-top: 20px;
                }
                .download-link {
                    background: white;
                    color: black;
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-weight: 700;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .download-link:hover {
                    background: #f97316;
                    color: white;
                }
            `}</style>
        </div>
    );
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}

export default function CanvasPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px', color: '#666' }}>Loading Canvas...</div>}>
            <CanvasInterface />
        </Suspense>
    );
}
