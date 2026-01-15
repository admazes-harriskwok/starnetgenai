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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { TEMPLATES } from '../../config/templates';

import MediaNode from '../../components/nodes/MediaNode';
import SourceNode from '../../components/nodes/SourceNode';
import TextNode from '../../components/nodes/TextNode';
import InputTextNode from '../../components/nodes/InputTextNode';
import AIImageNode from '../../components/nodes/AIImageNode';
import AIVideoNode from '../../components/nodes/AIVideoNode';
import AssistantNode from '../../components/nodes/AssistantNode';

// Cinematic Nodes
import DirectorAnalysisNode from '../../components/nodes/cinematic/DirectorAnalysisNode';
import StoryboardNode from '../../components/nodes/cinematic/StoryboardNode';
import FrameSplitterNode from '../../components/nodes/cinematic/FrameSplitterNode';
import VideoGenNode from '../../components/nodes/cinematic/VideoGenNode';
import AdAdapterNode from '../../components/nodes/AdAdapterNode';
import VerticalAdSuiteNode from '../../components/nodes/VerticalAdSuiteNode';
import ExportHandlerNode from '../../components/nodes/cinematic/ExportHandlerNode';
import InstructionNode from '../../components/nodes/InstructionNode';
import SmartResizeNode from '../../components/nodes/SmartResizeNode';
import SizeSelectionModal from '../../components/SizeSelectionModal';
import CampaignDashboard from '../../components/CampaignDashboard';
import CanvasEditor from '../../components/CanvasEditor';
import AnchorWorkflowModal from '../../components/AnchorWorkflowModal';

const nodeTypes = {
    source: SourceNode,
    sourceUpload: SourceNode,
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
    adAdapter: AdAdapterNode,
    verticalSuite: VerticalAdSuiteNode,
    exportHandler: ExportHandlerNode,
    instruction: InstructionNode,
    smartResize: SmartResizeNode,
    inputText: InputTextNode,
};

function CanvasInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('projectId');
    const [currentProjectId, setCurrentProjectId] = useState(projectId);

    // Sync currentProjectId if URL param changes (e.g. after redirect/pushState)
    useEffect(() => {
        if (projectId && projectId !== currentProjectId) {
            setCurrentProjectId(projectId);
        }
    }, [projectId]);

    // 1. Credit State
    const [credits, setCredits] = useState(250);
    const creditsRef = useRef(credits);

    const [projectName, setProjectName] = useState("Untitled Project");
    const [lastSaved, setLastSaved] = useState(Date.now());

    // 2. Nodes & Edges State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    // 1. Credit Sync with Storage
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        if (config.credits !== undefined) {
            setCredits(config.credits);
        }
    }, []);

    // 2. Model Sync with Nodes - Runs on mount and whenever nodes are added
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        const textModel = config.model || 'gemini-3-flash';
        const imageModel = config.imageModel || 'nano-banana-pro-preview';
        const videoModel = config.videoModel || 'veo-2.0-generate-001';

        setNodes((nds) => nds.map(node => {
            let modelToDisplay = textModel;
            if (node.type === 'aiImage' || node.type === 'imageGen' || node.type === 'adAdapter') {
                modelToDisplay = imageModel;
            } else if (node.type === 'videoGen' || node.type === 'aiVideo') {
                modelToDisplay = videoModel;
            }

            if (node.data.model !== modelToDisplay) {
                return { ...node, data: { ...node.data, model: modelToDisplay } };
            }
            return node;
        }));
    }, [nodes.length]); // Re-sync when nodes are added, and on initial mount

    // Persist credits when they change
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        localStorage.setItem('starnet_config', JSON.stringify({ ...config, credits }));
        creditsRef.current = credits;
    }, [credits]);


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
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    // Smart Resize state
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [activeResizeNodeId, setActiveResizeNodeId] = useState(null);
    const [isCanvasEditorOpen, setIsCanvasEditorOpen] = useState(false);
    const [editorSize, setEditorSize] = useState(null);
    const [isAnchorWorkflowOpen, setIsAnchorWorkflowOpen] = useState(false);

    // 3. Handlers
    const takeSnapshot = useCallback(() => {
        setPast((prev) => [...prev, {
            nodes: JSON.parse(JSON.stringify(nodesRef.current)),
            edges: JSON.parse(JSON.stringify(edgesRef.current))
        }]);
        setFuture([]);
    }, [nodesRef, edgesRef]);

    const onConnect = useCallback((params) => {
        takeSnapshot();
        setEdges((eds) => addEdge(params, eds));
    }, [setEdges, takeSnapshot]);

    const onNodeDataChange = useCallback((id, newData) => {
        takeSnapshot();
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
    }, [setNodes, takeSnapshot]);

    const onNodeDelete = useCallback((id) => {
        takeSnapshot();
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [setNodes, setEdges, takeSnapshot]);

    // Smart Resize handlers
    const handleAddSize = useCallback((nodeId) => {
        const node = nodesRef.current.find(n => n.id === nodeId);
        const { areAnchorsComplete } = require('../../lib/batchGenerator');

        // Check if anchors are complete
        if (!areAnchorsComplete(node?.data.anchors || [])) {
            // Open anchor workflow instead
            setActiveResizeNodeId(nodeId);
            setIsAnchorWorkflowOpen(true);
        } else {
            // Anchors complete, open size selection
            setActiveResizeNodeId(nodeId);
            setIsSizeModalOpen(true);
        }
    }, []);

    const handleSizeSelect = useCallback(async (selectedSizeIds) => {
        if (!activeResizeNodeId) return;

        const { getAllSizes } = require('../../lib/adSizes');
        const { generateBatchLayouts, generatePreviewFromLayout } = require('../../lib/batchGenerator');
        const allSizes = getAllSizes();
        const rawSizes = allSizes.filter(s => selectedSizeIds.includes(s.id));

        const node = nodesRef.current.find(n => n.id === activeResizeNodeId);

        // Filter out duplicates to avoid key collisions
        const existingIds = new Set((node?.data.sizes || []).map(s => s.id));
        const selectedSizes = rawSizes.filter(s => !existingIds.has(s.id));

        if (selectedSizes.length === 0) {
            setIsSizeModalOpen(false);
            return;
        }
        const masterNode = nodesRef.current.find(n =>
            edgesRef.current.some(e => e.source === n.id && e.target === activeResizeNodeId)
        );

        // Generate layouts for new sizes using batch engine
        const batchResults = generateBatchLayouts(
            selectedSizes,
            node?.data.anchors || [],
            node?.data.layouts || {}
        );

        // Generate previews
        for (const result of batchResults) {
            result.preview = await generatePreviewFromLayout(
                result.layout,
                result.size,
                masterNode?.data.image
            );
        }

        setNodes(nds => nds.map(n => {
            if (n.id === activeResizeNodeId) {
                const newLayouts = { ...n.data.layouts };
                batchResults.forEach(r => {
                    newLayouts[r.sizeId] = r.layout;
                });

                return {
                    ...n,
                    data: {
                        ...n.data,
                        sizes: [...(n.data.sizes || []), ...selectedSizes],
                        layouts: newLayouts,
                        previews: {
                            ...(n.data.previews || {}),
                            ...Object.fromEntries(batchResults.map(r => [r.sizeId, r.preview]))
                        }
                    }
                };
            }
            return n;
        }));

        setIsSizeModalOpen(false);
    }, [activeResizeNodeId, setNodes]);

    const handleAnchorSelect = useCallback((size) => {
        if (!activeResizeNodeId) return;

        setNodes(nds => nds.map(node => {
            if (node.id === activeResizeNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        anchors: (node.data.anchors || []).some(a => a.id === size.id)
                            ? node.data.anchors
                            : [...(node.data.anchors || []), size],
                        sizes: (node.data.sizes || []).some(s => s.id === size.id)
                            ? node.data.sizes
                            : [...(node.data.sizes || []), size]
                    }
                };
            }
            return node;
        }));

        // Open canvas editor for this anchor
        setEditorSize(size);
        setIsCanvasEditorOpen(true);
        setIsAnchorWorkflowOpen(false);
    }, [activeResizeNodeId, setNodes]);

    const handleViewDashboard = useCallback((nodeId) => {
        setActiveResizeNodeId(nodeId);
        setIsDashboardOpen(true);
    }, []);

    const handleCloseDashboard = useCallback(() => {
        setIsDashboardOpen(false);
    }, []);

    const handleEditSize = useCallback((size) => {
        setEditorSize(size);
        setIsCanvasEditorOpen(true);
    }, []);

    const handleSaveLayout = useCallback((layoutData) => {
        if (!activeResizeNodeId || !layoutData) return;

        setNodes(nds => nds.map(node => {
            if (node.id === activeResizeNodeId) {
                const newLayouts = { ...node.data.layouts };
                newLayouts[layoutData.sizeId] = layoutData.layoutData;

                const newPreviews = { ...node.data.previews };
                newPreviews[layoutData.sizeId] = layoutData.preview;

                return {
                    ...node,
                    data: {
                        ...node.data,
                        layouts: newLayouts,
                        previews: newPreviews
                    }
                };
            }
            return node;
        }));

        setIsCanvasEditorOpen(false);
        setEditorSize(null);
    }, [activeResizeNodeId, setNodes]);

    const handleDeleteSize = useCallback((sizeId) => {
        if (!activeResizeNodeId) return;

        setNodes(nds => nds.map(node => {
            if (node.id === activeResizeNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        sizes: (node.data.sizes || []).filter(s => s.id !== sizeId),
                        anchors: (node.data.anchors || []).filter(a => a.id !== sizeId)
                    }
                };
            }
            return node;
        }));
    }, [activeResizeNodeId, setNodes]);

    const handleGenerate = useCallback(async (nodeId) => {
        const { generateBatchLayouts, generatePreviewFromLayout } = require('../../lib/batchGenerator');

        const node = nodesRef.current.find(n => n.id === nodeId);
        if (!node) return;

        const masterNode = nodesRef.current.find(n =>
            edgesRef.current.some(e => e.source === n.id && e.target === nodeId)
        );

        const sizes = node.data.sizes || [];
        const anchors = node.data.anchors || [];
        const layouts = node.data.layouts || {};

        if (anchors.length < 3) {
            alert('Please set up all 3 anchor sizes (square, horizontal, vertical) before generating.');
            return;
        }

        // Update node to show generating status
        setNodes(nds => nds.map(n => {
            if (n.id === nodeId) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        status: 'Generating...'
                    }
                };
            }
            return n;
        }));

        try {
            // Generate layouts for all non-anchor sizes
            const nonAnchorSizes = sizes.filter(s => !anchors.some(a => a.id === s.id));
            const batchResults = generateBatchLayouts(nonAnchorSizes, anchors, layouts);

            // Generate previews
            const newPreviews = {};
            for (const result of batchResults) {
                const preview = await generatePreviewFromLayout(
                    result.layout,
                    result.size,
                    masterNode?.data.image
                );
                newPreviews[result.sizeId] = preview;
            }

            // Update node with generated previews
            setNodes(nds => nds.map(n => {
                if (n.id === nodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            previews: {
                                ...(n.data.previews || {}),
                                ...newPreviews
                            },
                            status: `Generated ${Object.keys(newPreviews).length} formats`
                        }
                    };
                }
                return n;
            }));

            alert(`Successfully generated ${Object.keys(newPreviews).length} ad formats!`);
        } catch (error) {
            console.error('Generation failed:', error);
            setNodes(nds => nds.map(n => {
                if (n.id === nodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            status: 'Generation failed'
                        }
                    };
                }
                return n;
            }));
            alert('Failed to generate ad formats. Please try again.');
        }
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

    // Ensure image is not too large for API payloads (Prevents "fetch failed" on server)
    const ensureSafeImageSize = async (base64, maxDim = 1536) => {
        if (!base64 || !base64.startsWith('data:')) return base64;
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                let targetW = img.width;
                let targetH = img.height;

                if (targetW > maxDim || targetH > maxDim) {
                    if (ratio > 1) {
                        targetW = maxDim;
                        targetH = maxDim / ratio;
                    } else {
                        targetH = maxDim;
                        targetW = maxDim * ratio;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetW, targetH);
                    resolve(canvas.toDataURL('image/jpeg', 0.85)); // Use JPEG for better compression
                } else {
                    resolve(base64);
                }
            };
            img.onerror = () => resolve(base64);
            img.src = base64;
        });
    };

    const adaptiveResizeVerticalSuite = async (base64, targetW, targetH) => {
        if (!base64) throw new Error("Invalid source image for adaptation.");

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext('2d');

                    // 1. Sample Background Color (Top-Left Pixel as per PRD)
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 1;
                    tempCanvas.height = 1;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
                    const [r, g, b, a] = tempCtx.getImageData(0, 0, 1, 1).data;
                    const bgColor = `rgba(${r},${g},${b},${a / 255})`;

                    // 2. Fill Canvas with Background
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, targetW, targetH);

                    // 3. Logic: Fit Width maintaining aspect ratio
                    const imgRatio = img.width / img.height;
                    const targetRatio = targetW / targetH;

                    let newW, newH;
                    if (imgRatio > targetRatio) {
                        newW = targetW;
                        newH = targetW / imgRatio;
                    } else {
                        newH = targetH;
                        newW = targetH * imgRatio;
                    }

                    // 4. Position: Vertical centering with "Optical Center" offset (35% down)
                    const pasteX = (targetW - newW) / 2;
                    const pasteY = (targetH - newH) * 0.35;

                    ctx.drawImage(img, pasteX, pasteY, newW, newH);
                    resolve(canvas.toDataURL('image/png'));
                } catch (err) {
                    console.error("Canvas draw failed:", err);
                    reject(new Error("Failed to process image canvas. This may be due to security restrictions on the source image."));
                }
            };
            img.onerror = () => reject(new Error("Failed to load source image for Suite adaptation."));
            img.src = base64;
        });
    };

    const resizeBase64Image = async (base64, width, height) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                const imgRatio = img.width / img.height;
                const targetRatio = width / height;

                // SMART RESIZE LOGIC:
                // If aspect ratios differ significantly (>25%), use "Contain" (Fit) with Background Extension.
                // This solves the issue where AI models return Square images for extreme formats.
                const ratioDiff = Math.max(imgRatio / targetRatio, targetRatio / imgRatio);
                const isRatioMismatch = ratioDiff > 1.25;

                if (isRatioMismatch) {
                    // Strategy: CONTAIN + BACKGROUND EXTENSION

                    // 1. Sample Background Color
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 1;
                    tempCanvas.height = 1;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);

                    try {
                        const [r, g, b, a] = tempCtx.getImageData(0, 0, 1, 1).data;
                        const bgColor = `rgba(${r},${g},${b},${a / 255})`;
                        ctx.fillStyle = bgColor;
                    } catch (e) {
                        // Fallback for tainted canvas
                        ctx.fillStyle = '#ffffff';
                    }

                    ctx.fillRect(0, 0, width, height);

                    // 2. Draw Image Centered (Contain)
                    let newW, newH;
                    if (imgRatio > targetRatio) {
                        // Image is wider relative to target -> Fit Width
                        newW = width;
                        newH = width / imgRatio;
                    } else {
                        // Image is taller relative to target -> Fit Height
                        newH = height;
                        newW = height * imgRatio;
                    }

                    // Center Position
                    const x = (width - newW) / 2;
                    const y = (height - newH) / 2;

                    ctx.drawImage(img, x, y, newW, newH);

                } else {
                    // Strategy: COVER (Crop) - Best for small adjustments
                    // HIGH FIDELITY RESIZE: Maintain aspect ratio by using an 'aspect-cover' Strategy
                    let sw, sh, sx, sy;
                    if (imgRatio > targetRatio) {
                        // Source is wider than target
                        sh = img.height;
                        sw = img.height * targetRatio;
                        sx = (img.width - sw) / 2;
                        sy = 0;
                    } else {
                        // Source is taller than target
                        sw = img.width;
                        sh = img.width / targetRatio;
                        sx = 0;
                        sy = (img.height - sh) / 2;
                    }

                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
                }

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                console.warn("Resize failed: Image load error");
                resolve(base64);
            };
            img.src = base64;
        });
    };

    const checkBillingPlan = useCallback(() => {
        window.open('https://aistudio.google.com/app/plan', '_blank');
    }, []);

    // Save Project Logic
    const saveProject = useCallback(async () => {
        // Allow saving if we have an ID or if it's a template (blank projects get an ID on mount now)
        if (!currentProjectId && !searchParams.get('template')) return;

        setIsSaving(true);
        const pid = currentProjectId || `p_${Date.now()}`;

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
                aspectRatio: n.data.aspectRatio,
                loading: undefined,
                // Remove function references
                onGenerate: undefined,
                onDataChange: undefined,
                onImageUpload: undefined,
                onExpand: undefined,
                onDelete: undefined,
                onModelToggle: undefined
            }
        }));

        const projectData = {
            id: pid,
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

            // If this was a new project from a template, promote it to a permanent project
            if (!currentProjectId) {
                setCurrentProjectId(pid);
                const newParams = new URLSearchParams(searchParams);
                newParams.set('projectId', pid);
                newParams.delete('template');
                router.replace(`/canvas?${newParams.toString()}`, { scroll: false });
            }

            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error('Save failed:', error);
            setIsSaving(false);
        }
    }, [currentProjectId, projectName, searchParams, router]);

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

    // Helper: Get nodes in topological order (dependency order)
    const getTopologicalOrder = useCallback((targetIds = null) => {
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;

        // If targetIds provided, only get ancestors of those targets
        let relevantNodeIds = new Set();
        if (targetIds) {
            const stack = [...targetIds];
            while (stack.length > 0) {
                const id = stack.pop();
                if (!relevantNodeIds.has(id)) {
                    relevantNodeIds.add(id);
                    const incoming = currentEdges.filter(e => e.target === id);
                    incoming.forEach(e => stack.push(e.source));
                }
            }
        } else {
            currentNodes.forEach(n => relevantNodeIds.add(n.id));
        }

        const sorted = [];
        const visited = new Set();
        const temporary = new Set();

        const visit = (id) => {
            if (visited.has(id)) return;
            if (temporary.has(id)) return; // Simple cycle break

            temporary.add(id);
            const outgoing = currentEdges.filter(e => e.source === id);
            outgoing.forEach(e => {
                if (relevantNodeIds.has(e.target)) visit(e.target);
            });
            temporary.delete(id);
            visited.add(id);
            sorted.unshift(id);
        };

        // We want roots first, so we reverse the visit logic slightly 
        // or just visit all and reverse the result
        const roots = currentNodes.filter(n => !currentEdges.some(e => e.target === n.id));

        const visitRootsFirst = (id) => {
            if (visited.has(id)) return;
            if (temporary.has(id)) return;
            temporary.add(id);

            const incoming = currentEdges.filter(e => e.target === id);
            incoming.forEach(e => visitRootsFirst(e.source));

            temporary.delete(id);
            visited.add(id);
            sorted.push(id);
        };

        const listToVisit = targetIds ? Array.from(relevantNodeIds) : currentNodes.map(n => n.id);
        listToVisit.forEach(id => visitRootsFirst(id));

        return sorted;
    }, []);

    // Handle Generation Logic
    const onGenerate = useCallback(async (id, customPrompt, isSubCall = false) => {
        const targetNode = nodesRef.current.find(n => n.id === id);
        if (!targetNode) return;

        // If this is a main entry point (not a sub-call from a chain) and it's a generation node,
        // we should run the entire upstream flow first to ensure data consistency.
        if (!isSubCall && ['aiImage', 'imageGen', 'aiVideo', 'videoGen', 'imageSplitter', 'adAdapter'].includes(targetNode.type)) {
            console.log(`🚀 CHAIN EXECUTION: Starting flow for ${id}`);
            const order = getTopologicalOrder([id]);
            for (const stepId of order) {
                if (stepId === id) break; // We will run the target node manually at the end
                const sn = nodesRef.current.find(n => n.id === stepId);
                // Only trigger generation nodes in the chain if they don't already have results
                if (['text', 'assistant', 'aiAnalysis', 'aiImage', 'imageGen', 'videoGen', 'imageSplitter', 'adAdapter', 'verticalSuite'].includes(sn.type)) {
                    const hasResult =
                        sn.data.output ||
                        sn.data.text ||
                        sn.data.analysis ||
                        (sn.data.frames && sn.data.frames.length > 0) ||
                        (sn.data.clips && sn.data.clips.length > 0) ||
                        (sn.data.outputs && Object.keys(sn.data.outputs).length > 0);

                    if (!hasResult || sn.data.error) {
                        await onGenerate(stepId, null, true);
                    }
                }
            }
        }

        // Determine credit cost based on node type
        let cost = 2;
        if (targetNode.type === 'aiImage') cost = 4;
        if (targetNode.type === 'imageGen') cost = 4;
        if (targetNode.type === 'imageSplitter') cost = 5;
        if (targetNode.type === 'videoGen') cost = 10;
        if (targetNode.type === 'adAdapter') cost = 8;
        if (targetNode.type === 'verticalSuite') cost = 6;
        if (targetNode.type === 'aiAnalysis') cost = 1;
        if (targetNode.type === 'assistant') cost = 1;
        if (targetNode.type === 'text') cost = 1;
        if (targetNode.type === 'media') cost = 1;

        if (creditsRef.current < cost) {
            alert(`Insufficient credits! This operation costs ${cost} 🪙.`);
            return;
        }

        console.log(`--- GENERATION START (${targetNode.type}) ---`);

        const getAllUpstreamData = (nodeId, visited = new Set()) => {
            if (visited.has(nodeId)) return { images: [], texts: [], analysis: null, frames: [] };
            visited.add(nodeId);

            const incoming = edgesRef.current.filter(e => e.target === nodeId);
            let results = { images: [], texts: [], analysis: null, frames: [] };

            for (const edge of incoming) {
                const sn = nodesRef.current.find(n => n.id === edge.source);
                if (!sn) continue;

                // 1. Collect Data from immediate source
                const asset = sn.data.output || sn.data.image || sn.data.video;
                if (asset) results.images.push({ id: sn.id, image: asset });

                // FIX: Strictly ensure we don't treat Image/Video outputs as text context
                // 'text' node and 'inputText' node use data.text explicitly. 
                // 'assistant' and 'aiAnalysis' output text in data.output or data.text.
                let textVal = sn.data.text;

                // If text is not explicitly set, check data.output ONLY for specific text-producing nodes
                if (!textVal && sn.data.output && typeof sn.data.output === 'string') {
                    if (['text', 'inputText', 'assistant', 'aiAnalysis'].includes(sn.type)) {
                        textVal = sn.data.output;
                    }
                }

                // Additional safety: If it contains base64 markers, ignore it for text context
                if (textVal && (textVal.startsWith('data:') || textVal.includes(';base64,'))) {
                    textVal = null;
                }

                const isPlaceholder = textVal && (
                    textVal.includes("Upload Product Info") ||
                    textVal.includes("Set custom preferences") ||
                    textVal.includes("Enter prompt or text content") ||
                    textVal.includes("Type your text here") ||
                    textVal.length < 5
                );

                // Additional safety: If it looks like a Data URI, reject it absolutely
                if (textVal && textVal.startsWith('data:')) {
                    textVal = null;
                }

                if (textVal && !isPlaceholder && !results.texts.includes(textVal)) {
                    results.texts.push(textVal);
                }

                if (sn.data.analysis) results.analysis = sn.data.analysis;
                if (sn.data.frames) results.frames = sn.data.frames;

                // 2. Recurse to gather all ancestors
                const upstream = getAllUpstreamData(sn.id, visited);
                results.images = [...results.images, ...upstream.images];
                results.texts = [...new Set([...results.texts, ...upstream.texts])];
                if (!results.analysis) results.analysis = upstream.analysis;
                if (!results.frames) results.frames = upstream.frames;
            }
            return results;
        };

        setNodes((nds) => {
            const next = nds.map(node => {
                if (node.id !== id) return node;

                // For Splitter/VideoGen/Suite, we don't clear output because it's in clips/frames/outputs
                if (['imageSplitter', 'videoGen', 'adAdapter', 'verticalSuite'].includes(node.type)) {
                    return { ...node, data: { ...node.data, loading: true } };
                }
                return { ...node, data: { ...node.data, loading: true, output: null } };
            });
            nodesRef.current = next;
            return next;
        });

        try {
            const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
            const { apiKey, model: textModel, imageModel: selectedImageModel, videoModel: selectedVideoModel } = config;
            const model = textModel || 'gemini-3-flash';
            const imageModel = selectedImageModel || 'gemini-2.5-flash-image';
            const videoModel = selectedVideoModel || 'veo-2.0-generate-001';
            let data;


            const incomingEdges = edgesRef.current.filter(e => e.target === id);
            const sourceNodes = incomingEdges.map(e => nodesRef.current.find(n => n.id === e.source)).filter(Boolean);
            const upstreamData = getAllUpstreamData(id);

            const inputImagesRaw = Array.from(new Map(upstreamData.images.map(item => [item.id, item])).values())
                .sort((a, b) => {
                    const nodeA = nodesRef.current.find(n => n.id === a.id);
                    const nodeB = nodesRef.current.find(n => n.id === b.id);
                    return (nodeA?.position?.y || 0) - (nodeB?.position?.y || 0);
                });

            // Safety Guard: Detect if any upstream source is still in 'loading' / 'uploading' state
            const loadingNodes = inputImagesRaw.filter(img => {
                const node = nodesRef.current.find(n => n.id === img.id);
                return node?.data.loading;
            });
            if (loadingNodes.length > 0) {
                const msg = `Upstream asset "${loadingNodes[0].data?.label || loadingNodes[0].id}" is still uploading. Please wait until the upload is complete before generating.`;
                alert(msg);

                // Safely abort generation and reset loading state
                setNodes((nds) => {
                    const next = nds.map(node => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, loading: false } };
                        }
                        return node;
                    });
                    nodesRef.current = next;
                    return next;
                });
                return;
            }

            let inputAnalysis = upstreamData.analysis;
            let hdImages = upstreamData.frames;
            let connectedPrompt = upstreamData.texts.reverse().join('\n\n'); // Prioritize distant context, closest text at bottom

            const inputImagesBase64 = await Promise.all(
                inputImagesRaw.map(async item => await ensureSafeImageSize(await imageToBase64(item.image)))
            );

            // 1. Resolve Best Prompt/Instruction for THIS node
            const nodeInstruction = customPrompt || targetNode.data.prompt || targetNode.data.text || targetNode.data.aiPlaceholder;

            // 2. Build Comprehensive Context from ALL upstream sources
            // 2. Build Comprehensive Context from ALL upstream sources
            let contextParts = [];
            if (connectedPrompt) contextParts.push(`<upstream_context>${connectedPrompt}</upstream_context>`);

            // Optimization: If we have specific analysis data, only include relevant parts to save tokens
            if (inputAnalysis) {
                // If targeting Video Gen, we don't need the full text, just the structured keyframes usually.
                // But for general context, let's truncate significantly.
                // If it's the Director Node output, it might be huge JSON.
                if (targetNode.type === 'videoGen') {
                    // Video Gen handles its own prompt logic downstream, so we can skip adding huge analysis text here
                } else {
                    const analysisSummary = `Theme: ${inputAnalysis.theme}. Strategy: ${inputAnalysis.full_text?.substring(0, 300)}...`;
                    contextParts.push(`<director_analysis>${analysisSummary}</director_analysis>`);
                }
            }

            // 3. Multi-image Numbering Context
            if (inputImagesBase64.length > 1) {
                contextParts.push(`[System: You are provided with ${inputImagesBase64.length} images, numbered 1 to ${inputImagesBase64.length} based on their vertical layout (top-to-bottom). Please reference them as "Image 1", "Image 2", etc. in your analysis or generation.]`);
            }

            const PRODUCT_FIDELITY_INSTRUCTION = `[System: Maintain 1:1 product visual fidelity. Do not hallucinate features.]`;

            const contextString = contextParts.join('\n');
            let finalPrompt = nodeInstruction;

            // If we have upstream context, wrap the prompt to ensure AI sees both
            if (contextString && nodeInstruction) {
                finalPrompt = `[BACKGROUND CONTEXT]\n${contextString}\n\n[PRIMARY USER DIRECTIVE]\nFollow these instructions precisely:\n${nodeInstruction}\n\n${PRODUCT_FIDELITY_INSTRUCTION}`;
            } else if (!nodeInstruction) {
                finalPrompt = contextString ? `${contextString}\n${PRODUCT_FIDELITY_INSTRUCTION}` : PRODUCT_FIDELITY_INSTRUCTION;
            }

            let modelToUse = model;

            // Validation: Ensure we have SOMETHING to work with (either instructions, context, or an image)
            if (!finalPrompt && targetNode.type !== 'imageSplitter' && targetNode.type !== 'videoGen') {
                if (inputImagesBase64.length > 0) {
                    finalPrompt = PRODUCT_FIDELITY_INSTRUCTION;
                } else if (targetNode.type === 'aiAnalysis') {
                    finalPrompt = STORYBOARD_PROMPT;
                } else {
                    throw new Error("Prompt, upstream context, or an image is required. Please type a prompt or connect a source node.");
                }
            }

            // Specialized Logic Per Node Type
            if (targetNode.type === 'aiAnalysis' || targetNode.type === 'assistant' || targetNode.type === 'text') {
                if (targetNode.type === 'aiAnalysis' && inputImagesBase64.length === 0) {
                    const hasSource = edgesRef.current.some(e => e.target === id);
                    if (!hasSource) throw new Error("No source connected. Please connect an Image or Media node to the Director AI.");
                    throw new Error("Reference Image is required. If you just uploaded, please wait for the image to appear before analyzing.");
                }
                // Ensure Analysis always uses its master system prompt if none is provided
                if (targetNode.type === 'aiAnalysis' && !nodeInstruction) {
                    finalPrompt = `${contextString}\n\n${STORYBOARD_PROMPT}`;
                }
                modelToUse = model;
            } else if (targetNode.type === 'imageGen' || targetNode.type === 'aiImage') {
                if (targetNode.type === 'imageGen' && !customPrompt && !targetNode.data.prompt) {
                    const sheetDesc = inputAnalysis?.contact_sheet_description || "3x3 Grid Contact Sheet, cinematic storyboard";
                    const fallbackPrompt = inputAnalysis ?
                        `Create a 3x3 Grid Contact Sheet based on these keyframes: ${sheetDesc}. Keep visual consistency with the reference image style.` :
                        "Create a professional 3x3 cinematic storyboard grid following a cohesive theme. High-fidelity cinematic photography style.";

                    finalPrompt = `${contextString}\n\n<instruction>\n${fallbackPrompt}\n</instruction>\n\n${PRODUCT_FIDELITY_INSTRUCTION}`;
                }
                modelToUse = imageModel;
            } else if (targetNode.type === 'videoGen' || targetNode.type === 'aiVideo') {
                modelToUse = videoModel;
            }

            // 2. Generation Work
            if (targetNode.type === 'imageSplitter') {
                // Find storyboard grid source and original reference
                const allNodes = nodesRef.current;
                const storyboardNode = sourceNodes.find(n => n.type === 'imageGen' || (n.data.output && !n.data.frames));
                const refNode = allNodes.find(n => ['source', 'sourceUpload', 'media'].includes(n.type) || n.id === 'cv1');

                const storyboardImg = storyboardNode ? (storyboardNode.data.output || storyboardNode.data.image) : null;
                const refImg = refNode ? (refNode.data.image || refNode.data.output) : null;

                if (!storyboardImg) throw new Error("Storyboard Grid output image is required for Keyframe Restoration.");
                if (!refImg) throw new Error("Original Reference Image (Step 1) is required for continuity.");

                console.log("🛠️ --- ANALYZING STORYBOARD FOR HD RESTORATION (Gemini Intelligence) ---");
                const gridBase64 = await ensureSafeImageSize(await imageToBase64(storyboardImg));
                const refBase64 = await ensureSafeImageSize(await imageToBase64(refImg));

                // 1. Analyze Storyboard Grid with Original Reference for Continuity
                const analysisResponse = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: SPLITTER_ANALYSIS_PROMPT,
                        apiKey,
                        model: 'gemini-3-flash-preview',
                        images: [refBase64, gridBase64] // Original Ref + Storyboard Grid
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
                            model: imageModel,
                            images: [refBase64] // Match with original reference for perfect continuity
                        })
                    }).then(res => res.json())
                );

                const frameResults = await Promise.all(hdFrameTasks);
                const successfulFrames = frameResults.map(r => r.output || "https://picsum.photos/seed/error/400/225");

                data = { frames: successfulFrames };
            } else if (targetNode.type === 'adAdapter') {
                const masterImg = inputImagesRaw[inputImagesRaw.length - 1]?.image;
                if (!masterImg) throw new Error("A Master Canvas or Source Image is required for IAB Adaptation.");

                const masterBase64 = await ensureSafeImageSize(await imageToBase64(masterImg));
                const IAB_TASKS = [
                    // Rectangles
                    { w: 300, h: 250, label: "Medium Rectangle" },
                    { w: 336, h: 280, label: "Large Rectangle" },
                    // Tall Vertical Units
                    { w: 300, h: 600, label: "Half-Page Ad" },
                    { w: 160, h: 600, label: "Wide Skyscraper" },
                    { w: 300, h: 1050, label: "Portrait" },
                    // Horizontal
                    { w: 970, h: 250, label: "Billboard" },
                    // Squares
                    { w: 250, h: 250, label: "Square" },
                    { w: 200, h: 200, label: "Small Square" },
                    // Mobile
                    { w: 300, h: 100, label: "Mobile Banner" },
                    { w: 320, h: 100, label: "Mobile Banner (L)" }
                ];

                console.log(`📐 --- PROGRAMMATIC AD ADAPTATION: Processing all ${IAB_TASKS.length} variants ---`);

                // We split the 16 tasks into two batches to respect API limits while ensuring all variants are generated
                const finalOutputs = new Array(IAB_TASKS.length).fill(null);
                const batchSize = 2; // Reduced from 8 to 2 to prevent timeouts on Netlify functions

                for (let b = 0; b < IAB_TASKS.length; b += batchSize) {
                    const batchIndices = Array.from({ length: Math.min(batchSize, IAB_TASKS.length - b) }, (_, i) => b + i);

                    console.log(`Processing Batch: ${b / batchSize + 1} (${batchIndices.length} variants)...`);

                    const batchTasks = batchIndices.map(idx => {
                        const task = IAB_TASKS[idx];
                        const ratio = task.w > task.h ? "landscape" : (task.w === task.h ? "square" : "portrait");
                        const isExtremeTall = task.h / task.w >= 3;
                        const isExtremeWide = task.w / task.h >= 3.0;

                        const iabBrandingLevel = `
                        1. BRANDING: Extract the exact Logo and Brand Name from the source image.
                        2. TEXT CONTENT: Identify and preserve ALL text from the source image (Headline, CTA, Price, Disclaimer).
                        3. PRODUCT: Maintain 1:1 visual fidelity of the primary product or subject.
                        4. STYLE: Preserve the exact color palette, typography style, and lighting setup from the source.
                        `;

                        const layoutRule = isExtremeTall
                            ? "CRITICAL NARROW VERTICAL LAYOUT: Rearrange ALL elements from the reference image. Stack elements vertically: Headline (Top), Product (Middle), Price (Below Product), Footer (Bottom). IMPORTANT: Use a 'Safe Margin' - leave at least 10% empty space on the left and right edges. Shrink the font size of the Headline and Footer so they do NOT touch the edges."
                            : (isExtremeWide
                                ? "CRITICAL EXTREME WIDE LAYOUT: Rearrange ALL elements horizontally to fit this short, wide span. Stack elements: Headline (Left), Product (Center), Price & Date (Right). IMPORTANT: Use a 'Safe Margin' - leave at least 15% empty space on the top and bottom edges. Shrink font sizes significantly so no text is sliced off at the top or bottom."
                                : (ratio === "landscape"
                                    ? "Horizontal Layout: Branding on left, Product on right, Price badge in middle. Ample padding."
                                    : (ratio === "square" ? "Square Layout: Centered branding, Product below, Price badge corner. Clean margins." : "Vertical Layout: Branding top, Product center, Price badge bottom. Stacked alignment.")));

                        const preferredModel = targetNode.data.model || imageModel;

                        // Helper for verification loop
                        const checkSimilarityWithRetry = async (attempt = 1) => {
                            // 1. Generate the Image
                            const res = await fetch('/api/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    prompt: `Role: You are an expert Creative Technologist and Production Artist specializing in Programmatic Advertising. You have deep expertise in IAB (Interactive Advertising Bureau) standards, visual hierarchy, and Python-based image processing.
Task: Your objective is to take the single uploaded advertisement image and generate distinct adaptations corresponding to the specific dimensions listed below. You must rearrange the visual elements (Logo, Product, Copy, CTA) to suit each aspect ratio while preserving brand identity and legibility.

[SYSTEM INSTRUCTIONS]:
${iabBrandingLevel}

[LAYOUT RULE FOR THIS SIZE]:
${layoutRule}

[NEGATIVE CONSTRAINTS - DO NOT IGNORE]:
- DO NOT CHANGE THE FONT. Use the exact same font style as the source.
- DO NOT CHANGE THE MODEL/PERSON. The person in the image must remain exactly identical (1:1 fidelity).
- DO NOT ALTER THE PRODUCT.
- DO NOT HALLUCINATE NEW ELEMENTS.

Critical Constraint (Pixel Accuracy): You must guarantee 100% pixel accuracy for the downloadable files. The generative model's native output is often approximate. Therefore, you MUST use your internal Python Code Execution capabilities to process the final images. You will generate the visual assets and then programmatically resize/crop them to the exact integers provided using the PIL (Pillow) library before presenting them to me.
Input Data (Target Dimensions):

[Target Dimension]: ${task.w} x ${task.h}

Workflow Execution Instructions:
Phase 1: Semantic Analysis & Thinking (Mental Scratchpad)
Analyze the Source: Identify the "Hero" element (product/person), the "Brand" element (logo), and the "Message" (text/CTA).
Plan the Layouts:
For Vertical High-Impact (e.g., 300x600): Plan to stack elements: Logo Top -> Hero Image Middle -> Text/CTA Bottom. Use "Outpainting" to extend the background vertically (floor/sky) to fill the space without stretching the product.

Phase 2: Generative Creation (The Art)
Generate the necessary visual variations. You may need to generate a few "Master Canvases" (e.g., one ultra-wide canvas for leaderboards, one ultra-tall canvas for skyscrapers) from which you will crop the final assets.
IMPORTANT: Do not simply stretch the original image. You must use your generative capabilities to rearrange the elements. If moving from Square to Leaderboard, move the text to the side of the product.
Text Preservation: Ensure any text generated is legible. If the source text is complex, you may use Python to overlay text, or prioritize preserving the visual text clarity in the generation.
Phase 3: Deterministic Processing (The Code)
Write and execute a Python script.
Library: Use PIL (Pillow).
Logic:
Load the generated Master Canvas(es).
Create a dictionary of the 3 target dimensions.
Iterate through the dictionary. For each dimension:
Create a new blank image of the exact target size (e.g., Image.new('RGB', (${task.w}, ${task.h}))).
Resize/Crop the generated content to fit this target, using Image.Resampling.LANCZOS for quality. Ensure the aspect ratio of the content is preserved (fit-to-width or fit-to-height) and center it, or use the layout logic defined in Phase 1.
Save the file with a descriptive name: Ad_Variant_${task.h}.png.
Verification: The script must print the dimensions of the saved files to the console to verify they match the input list exactly.

Phase 4: Output
Present the verified image file for download.
User Input: [I have uploaded the advertisement image. Please proceed.]`,
                                    apiKey,
                                    model: preferredModel,
                                    temperature: 0.15,
                                    images: [masterBase64],
                                    aspectRatio: `${task.w}:${task.h}`
                                })
                            }).then(async res => {
                                if (!res.ok) {
                                    const txt = await res.text();
                                    return { error: `HTTP ${res.status}: ${txt}` };
                                }
                                try {
                                    return await res.json();
                                } catch (e) {
                                    return { error: "Invalid JSON response" };
                                }
                            }).catch(err => ({ error: err.message }));

                            // Handle basic failure / text output
                            if (res.error) return res;
                            const generatedImg = res.output || res.image;
                            if (!generatedImg || !generatedImg.startsWith('data:image')) return res;

                            // 2. AI Verification (Similarity Check) with Gemini 1.5 Flash (Fast/Cheap)
                            // Skip if we are out of retry attempts (attempt > 1)
                            if (attempt > 1) return res;

                            setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: `Verifying consistency (${task.w}x${task.h})...` } } : n));

                            try {
                                const verifyBase64 = await ensureSafeImageSize(await imageToBase64(generatedImg));
                                const verifyRes = await fetch('/api/generate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        prompt: `Role: Brand Compliance Officer.
Task: Compare Image 1 (Original Source) and Image 2 (Generated Variant).
Check for strict visual consistency:
1. Is the human model exactly the same person? (Face, hair, skin tone) -> Yes/No
2. Is the font/typography style identical? -> Yes/No
3. Is the main product identical? -> Yes/No

If ANY answer is "No", output STRICTLY and ONLY: {"sim": false, "reason": "reason here"}
If ALL answers are "Yes" (minor crop differences allowed), output STRICTLY and ONLY: {"sim": true}
Return JSON only.`,
                                        apiKey,
                                        model: 'gemini-2.5-flash', // Fast verification model
                                        images: [masterBase64, verifyBase64],
                                        preferText: true // We want the JSON analysis text
                                    })
                                });

                                const verifyData = await verifyRes.json();
                                const verifyText = verifyData.text || verifyData.output;

                                let isPass = true;
                                if (verifyText && (verifyText.includes('"sim": false') || verifyText.includes('"sim":false'))) {
                                    isPass = false;
                                }

                                if (!isPass) {
                                    console.warn(`⚠️ QA CHECK FAILED for ${task.w}x${task.h}. Retrying... Reason: ${verifyText}`);
                                    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: `Low similarity detected. Regenerating ${task.w}x${task.h}...` } } : n));
                                    // Retry recursively (attempt 2)
                                    return await checkSimilarityWithRetry(attempt + 1);
                                } else {
                                    console.log(`✅ QA CHECK PASSED for ${task.w}x${task.h}`);
                                }

                            } catch (e) {
                                console.warn("Verification failed, accepting image anyway:", e);
                            }

                            return res;
                        };

                        return checkSimilarityWithRetry();
                    });

                    const batchResults = await Promise.all(batchTasks);
                    for (let i = 0; i < batchResults.length; i++) {
                        const res = batchResults[i];
                        const idx = batchIndices[i];
                        const task = IAB_TASKS[idx];
                        const rawOutput = res.output || res.image || masterImg;

                        if (rawOutput && rawOutput.startsWith('data:image')) {
                            finalOutputs[idx] = await resizeBase64Image(rawOutput, task.w, task.h);
                        } else {
                            finalOutputs[idx] = rawOutput;
                        }
                    }
                }

                data = { outputs: finalOutputs };
            } else if (targetNode.type === 'verticalSuite') {
                const masterImg = inputImagesRaw[inputImagesRaw.length - 1]?.image;
                if (!masterImg) throw new Error("A Master Creative or Source Image is required for the Vertical Suite.");

                const masterBase64 = await ensureSafeImageSize(await imageToBase64(masterImg));
                const targets = [
                    { id: 'half-page', w: 300, h: 600, label: "Half-Page Ad", strategy: "Balanced composition. Extract all text and branding elements from the source image. Stack elements: Headline (Top), Product (Center), CTA (Bottom). Maintain background style and lighting." },
                    { id: 'wide-skyscraper', w: 160, h: 600, label: "Wide Skyscraper", strategy: "Vertical reflow. Stack source text elements into multiple lines. Scale product to fit 160px width. Extend background vertically to create breathing room without distortion." },
                    { id: 'skyscraper', w: 120, h: 600, label: "Skyscraper", strategy: "Extreme narrow stacking. Prioritize source text legibility. Use stacked version of extracted logo/text. Maintain brand colors and atmosphere." },
                    { id: 'portrait', w: 300, h: 1050, label: "Portrait (Tall)", strategy: "Luxury vertical space. Brand Logo at top, Product in optical center (approx 35% down), Price/CTA Footer at the very bottom. Preserve all original elements faithfully." }
                ];

                console.log(`📐 --- ADAPTIVE VERTICAL SUITE: Processing ${targets.length} AI-Generated formats ---`);

                const finalOutputs = {};

                const suiteGeneratorTasks = targets.map(t =>
                    fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: `IAB Vertical Suite Adaptation: ${t.label} (${t.w}x${t.h}). 
                            [Design Rules]:
                            1. PRODUCT: Maintain 1:1 fidelity of the subject from the source image.
                            2. TEXT: Extract ALL text from the source image and re-compose it based on the ratio. Do NOT change words.
                            3. STYLE: Preserve the exact color theme, lighting, and aesthetic mood from the source.
                            4. [LAYOUT STRATEGY]: ${t.strategy}`,
                            apiKey,
                            model: imageModel,
                            images: [masterBase64],
                            aspectRatio: `${t.w}:${t.h}`
                        })
                    }).then(res => res.json())
                );

                const suiteResults = await Promise.all(suiteGeneratorTasks);

                for (let i = 0; i < suiteResults.length; i++) {
                    const res = suiteResults[i];
                    const t = targets[i];
                    const rawOutput = res.output || res.image || masterImg;

                    if (rawOutput && rawOutput.startsWith('data:image')) {
                        finalOutputs[t.id] = await resizeBase64Image(rawOutput, t.w, t.h);
                    } else {
                        finalOutputs[t.id] = rawOutput;
                    }
                }

                data = { outputs: finalOutputs };
            } else if (targetNode.type === 'videoGen' || targetNode.type === 'aiVideo') {
                // Optimized Asset Selection (Image-to-Video Focus):
                // 1. Prioritize Direct Parent Nodes that specifically provide Images (ImageGen, AIImage, Storyboard)
                if (!hdImages || hdImages.length === 0) {
                    const directAssets = sourceNodes.flatMap(sn => {
                        // Priority 1: Storyboard frames
                        if (sn.data.frames && sn.data.frames.length > 0) return sn.data.frames;

                        // Priority 2: AI Generated outputs (This captures the hand showcase images)
                        if (sn.data.output && typeof sn.data.output === 'string') return [sn.data.output];

                        // Priority 3: Manual uploads / secondary image fields
                        if (sn.data.image) return [sn.data.image];

                        return [];
                    });

                    if (directAssets.length > 0) {
                        hdImages = directAssets;
                        console.log(`✅ Targeted ${hdImages.length} frames from direct parent(s) for Video Gen.`);
                    } else if (sourceNodes.length > 0) {
                        throw new Error(`The parent node "${sourceNodes[0].data?.label || sourceNodes[0].id}" has no generated output image. Please run it first.`);
                    } else {
                        // Truly isolated node (no edges), fallback to any available images in the project
                        hdImages = inputImagesRaw.map(item => item.image).filter(Boolean);
                    }
                }

                // 1b. Check for structured "Director Analysis" shots (New Template)
                // If we have a 'shots' array from the analysis (Director Mode), use that as the primary driver for batch count
                if (inputAnalysis && inputAnalysis.shots && inputAnalysis.shots.length > 0) {
                    // We allow reuse of the single source image across multiple distinct shot prompts
                    console.log(`🎬 Detected Director Analysis with ${inputAnalysis.shots.length} structured shots.`);
                }

                if (!inputAnalysis || (!inputAnalysis.keyframes && !inputAnalysis.shots)) {
                    // Create a dummy analysis structure for single-clip generation
                    inputAnalysis = {
                        keyframes: hdImages.map((_, i) => ({
                            action: "subtle cinematic motion",
                            camera: "slow zoom in"
                        }))
                    };
                }

                if (!hdImages || hdImages.length === 0) {
                    throw new Error("Missing inputs! Please connect an Image or Storyboard node to the Video Producer.");
                }

                // Determine loop count: 
                // - If we have structured "shots", we loop through THEM (reusing the image if needed).
                // - Otherwise, we loop through available images/keyframes.
                const directorShots = inputAnalysis.shots;
                const keyframeData = inputAnalysis.keyframes;

                const count = directorShots && directorShots.length > 0
                    ? directorShots.length
                    : Math.min(hdImages.length, keyframeData.length);

                const generatedClips = [];

                console.log(`🎬 --- STARTING BATCH VIDEO GENERATION (${count} clips) ---`);

                for (let i = 0; i < count; i++) {
                    const shot = directorShots ? directorShots[i] : null;
                    // If using Director Shots, we reuse the first image if there's only one source (common in E-com template)
                    // Otherwise we try to match indices (Storyboard mode)
                    const currentFrame = (directorShots && hdImages.length === 1) ? hdImages[0] : (hdImages[i] || hdImages[0]);
                    const kf = keyframeData ? keyframeData[i] : null;

                    // 1. Resolve individual motion prompt
                    let nodeMotionPrompt = "";

                    if (shot) {
                        // Director Mode: Use the structured shot details
                        // We construct a specific prompt for Veo that includes style, movement, and the visual description
                        nodeMotionPrompt = `Create a high-quality video.
Visual: ${shot.visual_description}
Camera Movement: ${shot.camera_movement || 'Static'}
Lighting: ${shot.lighting || 'Cinematic'}
Style: High-Fidelity Product Showcase`;
                    } else {
                        // Legacy / Manual Mode
                        nodeMotionPrompt = (targetNode.data.videoPrompts?.[i]) ||
                            `Cinematic shot, ${kf?.action || 'motion'}. Camera movement: ${kf?.camera || 'steady'}. High resolution, photorealistic.`;
                    }

                    // 2. VIDEO-SPECIFIC PROMPT LOGIC:
                    const promptToUse = nodeMotionPrompt;

                    console.log(`🎬 --- GENERATING VIDEO CLIP ${i + 1} ---`);
                    console.log(`Target Image (Start Frame): ${currentFrame.substring(0, 50)}...`);
                    console.log(`Motion Instruction: ${promptToUse.substring(0, 100)}...`);

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

                    let frameBase64 = await imageToBase64(currentFrame);
                    frameBase64 = await ensureSafeImageSize(frameBase64);

                    let opResult;
                    let attempts = 0;
                    const maxAttempts = 5;
                    let success = false;

                    while (attempts < maxAttempts && !success) {
                        const finalAspectRatio = targetNode.data.aspectRatio || sourceNodes[0]?.data?.aspectRatio || "1:1";

                        const response = await fetch('/api/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                prompt: promptToUse,
                                apiKey,
                                model: videoModel,
                                images: [frameBase64],
                                aspectRatio: finalAspectRatio
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
                                    await new Promise(r => setTimeout(r, waitTime));
                                    continue;
                                }
                                console.warn("API Quota Reached. Stopping batch generation gracefully.");
                                setNodes((nds) => nds.map(node => {
                                    if (node.id === id) {
                                        return { ...node, data: { ...node.data, status: `Quota Limit Hit. Partial results saved (${generatedClips.length}/${count}).` } };
                                    }
                                    return node;
                                }));
                                // Break the inner retry loop AND the outer batch loop (using a flag or labeled break)
                                success = false;
                                break;
                            }
                            throw new Error(errorMsg);
                        }
                        success = true;
                    }

                    // If loop broke due to quota failure (not success), stop the whole batch
                    if (!success) break;

                    // Handle Polling for this clip
                    if (opResult.type === 'operation') {
                        const opId = opResult.operationId;
                        let isDone = false;
                        let pollResult = null;

                        while (!isDone) {
                            await new Promise(r => setTimeout(r, 5000));
                            const pollRes = await fetch(`/api/operation?id=${encodeURIComponent(opId)}&key=${encodeURIComponent(apiKey)}`);
                            const pollData = await pollRes.json();

                            if (pollData.error) {
                                const msg = pollData.error.message || '';
                                const isOverloaded = msg.toLowerCase().includes('overloaded') || pollData.error.code === 429 || pollData.error.code === 503;

                                if (isOverloaded) {
                                    console.warn(`AI Engine Overloaded. Pausing polling for 10s... (Error: ${msg})`);
                                    await new Promise(r => setTimeout(r, 10000));
                                    continue;
                                }

                                throw new Error(`AI Engine Error: ${pollData.error.message || 'The operation failed.'}`);
                            }

                            if (pollData.done) {
                                isDone = true;

                                // Safety Filter Detection (RAI)
                                const filtered = pollData.response?.generateVideoResponse?.raiMediaFilteredReasons ||
                                    pollData.response?.results?.[0]?.raiMediaFilteredReasons;
                                if (filtered && filtered.length > 0) {
                                    throw new Error(`AI Safety Filter Triggered: ${filtered[0]}`);
                                }
                                pollResult = pollData.response?.results?.[0]?.video?.uri ||
                                    pollData.response?.video?.uri ||
                                    pollData.response?.output ||
                                    pollData.response?.uri ||
                                    pollData.metadata?.output_uri;

                                if (!pollResult) {
                                    const findFirstUrl = (val) => {
                                        if (!val) return null;
                                        if (typeof val === 'string' && val.startsWith('http')) return val;
                                        if (typeof val === 'object') {
                                            for (const k in val) {
                                                const res = findFirstUrl(val[k]);
                                                if (res) return res;
                                            }
                                        }
                                        return null;
                                    };
                                    pollResult = findFirstUrl(pollData.response) || findFirstUrl(pollData.metadata) || findFirstUrl(pollData);
                                }

                                if (pollResult && typeof pollResult === 'string' &&
                                    (pollResult.includes('generativelanguage.googleapis.com') || pollResult.includes('videointelligence.googleapis.com'))) {
                                    const separator = pollResult.includes('?') ? '&' : '?';
                                    pollResult = `${pollResult}${separator}key=${apiKey}`;
                                    console.log('🔐 [Auth] Appended key to video URI for browser access');
                                }

                                if (!pollResult) {
                                    console.error("🔎 Video Marked DONE but no URL found in response. Raw Data:", JSON.stringify(pollData, null, 2));
                                }
                            }
                        }

                        if (!pollResult) {
                            throw new Error("Video production completed but no video URI was found in the response. This often happens if the AI flags the content for safety or if the prompt is too complex. Check the browser console for 'Poll Data' to see the raw API response.");
                        }
                        generatedClips.push(pollResult);

                        // Incremental UI Update: Show the clip IMMEDIATELY
                        setNodes((nds) => nds.map(node => {
                            if (node.id === id) {
                                return {
                                    ...node,
                                    data: {
                                        ...node.data,
                                        clips: [...generatedClips], // Show clips gathered so far
                                        output: generatedClips[0],  // Ensure main output is set
                                        status: `Generated clip ${i + 1} of ${count}...`
                                    }
                                };
                            }
                            return node;
                        }));
                    }
                } // End of Batch Loop

                // 3. Post-Processing: Stitch Clips with FFmpeg (Client-Side)
                if (generatedClips.length > 1) {
                    try {
                        console.log('🧵 --- STITCHING CLIPS WITH FFMPEG ---');
                        setNodes((nds) => nds.map(node => node.id === id ? { ...node, data: { ...node.data, status: 'Stitching full video...' } } : node));

                        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
                        const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

                        const ffmpeg = new FFmpeg();
                        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

                        await ffmpeg.load({
                            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                        });

                        const inputFiles = [];
                        for (let i = 0; i < generatedClips.length; i++) {
                            const fileName = `clip${i}.mp4`;
                            await ffmpeg.writeFile(fileName, await fetchFile(generatedClips[i]));
                            inputFiles.push(fileName);
                        }

                        // Create file list for concatenation
                        const listContent = inputFiles.map(f => `file '${f}'`).join('\n');
                        await ffmpeg.writeFile('list.txt', listContent);

                        // Run concat command
                        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);

                        const data = await ffmpeg.readFile('output.mp4');
                        const blob = new Blob([data.buffer], { type: 'video/mp4' });
                        const stitchedUrl = URL.createObjectURL(blob);

                        console.log('✅ Stitching Complete:', stitchedUrl);

                        // Add stitched video as the primary output or an extra
                        generatedClips.unshift(stitchedUrl);

                        setNodes((nds) => nds.map(node => node.id === id ? { ...node, data: { ...node.data, status: 'Final Render Complete' } } : node));

                    } catch (stitchError) {
                        console.error('Stitching failed:', stitchError);
                        // Don't fail the whole process if stitching fails, just show individual clips
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
                            images: inputImagesBase64,
                            preferText: ['text', 'assistant', 'aiAnalysis'].includes(targetNode.type),
                            ...(['aiImage', 'imageGen'].includes(targetNode.type) ? { aspectRatio: targetNode.data.aspectRatio || "1:1" } : {})
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

            if (!data) throw new Error("Generation failed to produce output. Please try again.");

            // Skip credit deduction if its a batch since it happened or we skip for now 
            // (Standard credits logic applies below)
            setCredits((c) => Math.max(0, c - cost));

            // 1. Prepare updated node data
            let updatedData = { ...targetNode.data, loading: false, status: 'Complete' };

            const rawText = data.text || data.output;
            if (targetNode.type === 'aiAnalysis' && rawText) {
                let parsedJSON = { shots: [] };
                try {
                    // Try to harvest JSON from code blocks first
                    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedJSON = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    }
                } catch (e) {
                    console.warn("Failed to parse strict JSON from analysis, falling back to regex extraction", e);
                }

                updatedData.analysis = {
                    full_text: rawText,
                    theme: parsedJSON.theme || "Cinematic Sequence",
                    shots: parsedJSON.shots || [], // Store the structured shots
                    // Legacy support for older templates
                    keyframes: parsedJSON.shots ? parsedJSON.shots.map(s => ({ action: s.visual_description, camera: `Angle: ${s.camera_angle}, Move: ${s.camera_movement}` })) : [],
                };
            } else if (targetNode.type === 'imageSplitter') {
                updatedData.frames = data.frames;
            } else if (targetNode.type === 'videoGen' || targetNode.type === 'aiVideo') {
                updatedData.clips = data.clips || [data.output].filter(Boolean);
                updatedData.output = data.output || (data.clips && data.clips[0]);
            } else if (targetNode.type === 'assistant') {
                const userMsg = { role: 'user', content: customPrompt || targetNode.data.prompt || "Hello" };
                const aiMsg = { role: 'assistant', content: data.text || data.output };
                updatedData.history = [...(targetNode.data.history || []), userMsg, aiMsg];
            } else if (targetNode.type === 'text') {
                updatedData.text = data.text || data.output;
            } else if (targetNode.type === 'adAdapter' || targetNode.type === 'verticalSuite') {
                updatedData.outputs = data.outputs;
            } else {
                updatedData.output = data.output;
                updatedData.usedPrompt = finalPrompt;
            }

            // 2. Synchronous ref update for topological order / sequential calls
            const nextNodes = nodesRef.current.map(node => {
                if (node.id === id) {
                    return { ...node, data: updatedData };
                }
                return node;
            });
            nodesRef.current = nextNodes;

            // 3. React state update
            setNodes(nextNodes);

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

            const errorNodes = nodesRef.current.map(node => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, loading: false, output: null } };
                }
                return node;
            });
            nodesRef.current = errorNodes;
            setNodes(errorNodes);

            // Critical: Re-throw for chain interruption
            if (isSubCall) throw error;
        }
    }, [saveProject, checkBillingPlan]);

    // Generate All Logic
    const onGenerateAll = useCallback(async () => {
        const totalNodes = nodesRef.current.filter(n =>
            ['generation', 'aiImage', 'aiVideo', 'imageGen', 'videoGen', 'aiAnalysis', 'imageSplitter', 'text', 'assistant', 'adAdapter', 'verticalSuite'].includes(n.type)
        );

        if (totalNodes.length === 0) {
            alert("No generation nodes found to run.");
            return;
        }

        if (confirm(`Run complete workflow for all ${totalNodes.length} creative nodes?`)) {
            const order = getTopologicalOrder();
            for (const stepId of order) {
                const node = nodesRef.current.find(n => n.id === stepId);
                if (['generation', 'aiImage', 'aiVideo', 'imageGen', 'videoGen', 'aiAnalysis', 'imageSplitter', 'text', 'assistant', 'adAdapter', 'verticalSuite'].includes(node.type)) {
                    console.log(`🌊 Workflow Step: ${node.type} (${stepId})`);
                    await onGenerate(stepId, null, true);
                }
            }
        }
    }, [onGenerate, getTopologicalOrder]);

    // Handle Image Upload - Upload to server instead of Base64
    const handleImageUpload = useCallback(async (id, file) => {
        if (!id || !file) return;
        console.log('📤 Uploading file for node:', id, file.name);

        // Show loading state
        setNodes((nds) => {
            const next = nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, loading: true } };
                }
                return node;
            });
            nodesRef.current = next;
            return next;
        });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout for large files

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            const data = await response.json();
            console.log('✅ Upload successful:', data.url);

            // Update node with URL (works for 'source' or 'sourceUpload')
            const isVideo = file.type.startsWith('video/');
            setNodes((nds) => {
                const next = nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                [isVideo ? 'video' : 'image']: data.url,
                                // Clear the other one to avoid conflicts
                                [isVideo ? 'image' : 'video']: null,
                                loading: false
                            }
                        };
                    }
                    return node;
                });
                nodesRef.current = next;
                return next;
            });

            // Autosave will be triggered by the useEffect observing `nodes`
            // saveProject(); removed to prevent race conditions with nodesRef


        } catch (error) {
            console.error('Upload failed:', error);

            // Clear loading state and show error info
            setNodes((nds) => {
                const next = nds.map((node) => {
                    if (node.id === id) {
                        return { ...node, data: { ...node.data, loading: false } };
                    }
                    return node;
                });
                nodesRef.current = next;
                return next;
            });
            alert(`Upload failed: ${error.message}`);
        }
    }, [saveProject, setNodes]);

    const applyCallbacks = useCallback((nds) => nds.map(node => {
        const isMedia = ['media', 'source', 'sourceUpload', 'instruction'].includes(node.type);
        const isGen = ['generation', 'aiImage', 'aiVideo', 'imageGen', 'videoGen', 'aiAnalysis', 'imageSplitter', 'assistant', 'text', 'adAdapter', 'verticalSuite'].includes(node.type);

        return {
            ...node,
            data: {
                ...node.data,
                onGenerate: isGen ? onGenerate : undefined,
                onDataChange: onNodeDataChange,
                onImageUpload: isMedia ? handleImageUpload : undefined,
                onExpand: (url) => setExpandedMedia(url),
                onDelete: onNodeDelete,
                onModelToggle: (id, currentModel) => {
                    let nextModel;
                    if (currentModel.includes('veo')) {
                        // Toggle video models
                        const videoModels = ['veo-2.0-generate-001', 'veo-3.0-fast-generate-001', 'veo-3.1-generate-preview'];
                        const idx = videoModels.indexOf(currentModel);
                        nextModel = videoModels[(idx + 1) % videoModels.length];
                        if (idx === -1) nextModel = videoModels[0];
                    } else if (currentModel.includes('banana') || currentModel.includes('image')) {
                        // Toggle image models
                        const imageModels = ['nano-banana-pro-preview', 'gemini-2.5-flash-image'];
                        nextModel = currentModel === imageModels[0] ? imageModels[1] : imageModels[0];
                    } else {
                        // Toggle text models
                        const textModels = ['gemini-3-flash', 'gemini-3-pro'];
                        nextModel = currentModel === textModels[0] ? textModels[1] : textModels[0];
                    }
                    onNodeDataChange(id, { model: nextModel });
                }
            }
        };
    }), [onGenerate, onNodeDataChange, handleImageUpload, onNodeDelete]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((prev) => [{ nodes: JSON.parse(JSON.stringify(nodesRef.current)), edges: JSON.parse(JSON.stringify(edges)) }, ...prev]);
        setPast(newPast);

        setNodes(applyCallbacks(previous.nodes));
        setEdges(previous.edges);
    }, [past, nodesRef, edges, setNodes, setEdges, applyCallbacks]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, { nodes: JSON.parse(JSON.stringify(nodesRef.current)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setFuture(newFuture);

        setNodes(applyCallbacks(next.nodes));
        setEdges(next.edges);
    }, [future, nodesRef, edges, setNodes, setEdges, applyCallbacks]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            // Find if dropped over a media node
            const x = event.clientX;
            const y = event.clientY;
            const elementAtPos = document.elementFromPoint(x, y);
            const nodeElement = elementAtPos?.closest('.react-flow__node');
            const nodeId = nodeElement?.getAttribute('data-id');

            if (nodeId) {
                handleImageUpload(nodeId, file);
            }
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
            return;
        } else {
            // New Project (Blank or Template)
            if (tmplId && TEMPLATES[tmplId]) {
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

            // Generate a permanent ID for this new session
            const newPid = `p_${Date.now()}`;
            setCurrentProjectId(newPid);
            setProjectName(name);
            setNodes(applyCallbacks(initialNodes));
            setEdges(initialEdges);

            // Update URL so a refresh stays on this project
            const newParams = new URLSearchParams(searchParams);
            newParams.set('projectId', newPid);
            if (tmplId) newParams.delete('template');
            router.replace(`/canvas?${newParams.toString()}`, { scroll: false });
        }
    }, [projectId, searchParams, router]);

    const addNode = useCallback((type) => {
        takeSnapshot();
        const id = `node_${Date.now()}`;
        const newNode = {
            id: id,
            type: type,
            position: selectorPos,
            data: {
                label: type === 'aiVideo' ? 'Video Generator' :
                    type === 'videoGen' ? 'Cinematic Producer' :
                        type === 'aiAnalysis' ? 'Director AI' :
                            type === 'text' ? 'AI Text Gen' :
                                type === 'inputText' ? 'Input Text' : type,
                onGenerate: onGenerate,
                onDataChange: onNodeDataChange,
                onImageUpload: handleImageUpload,
                onExpand: (url) => setExpandedMedia(url),
                onDelete: onNodeDelete
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setIsNodeSelectorOpen(false);
    }, [selectorPos, onGenerate, onNodeDataChange, handleImageUpload, setNodes]);

    // Dynamic Reference Image Sync
    useEffect(() => {
        if (edges.length === 0) return;

        const getAllUpstreamImg = (nodeId, currentEdges, currentNodes, visited = new Set()) => {
            if (visited.has(nodeId)) return [];
            visited.add(nodeId);

            const incoming = currentEdges.filter(e => e.target === nodeId);
            let results = [];

            for (const edge of incoming) {
                const sn = currentNodes.find(n => n.id === edge.source);
                if (!sn) continue;

                const img = sn.data.output || sn.data.image;
                if (img) {
                    results.push({ url: img, y: sn.position.y });
                }

                // Recurse to find images from even further upstream
                results = [...results, ...getAllUpstreamImg(sn.id, currentEdges, currentNodes, visited)];
            }
            return results;
        };

        setNodes(nds => {
            let changed = false;
            const newNodes = nds.map(node => {
                const isGen = ['aiImage', 'imageGen', 'text', 'aiAnalysis', 'assistant', 'aiVideo', 'videoGen'].includes(node.type);
                if (!isGen) return node;

                const upstreamItems = getAllUpstreamImg(node.id, edges, nds);
                // Sort by Y position (top to bottom) as requested by user
                const sortedImages = upstreamItems
                    .sort((a, b) => a.y - b.y)
                    .map(item => item.url);

                // Deduplicate URLs while maintaining order
                const finalImages = [...new Set(sortedImages)];
                const firstImg = finalImages[0] || null;

                const currentRefImages = JSON.stringify(node.data.refImages || []);
                const nextRefImages = JSON.stringify(finalImages);

                if (currentRefImages !== nextRefImages || node.data.refImage !== firstImg) {
                    changed = true;
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            refImages: finalImages,
                            refImage: firstImg
                        }
                    };
                }
                return node;
            });
            return changed ? newNodes : nds;
        });
    }, [edges]);

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

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Create the Report Template
            const reportId = `report-${Date.now()}`;
            const reportDiv = document.createElement('div');
            reportDiv.id = reportId;
            reportDiv.style.position = 'absolute';
            reportDiv.style.left = '-9999px';
            reportDiv.style.width = '800px';
            reportDiv.style.background = '#ffffff';
            reportDiv.style.color = '#0f172a';
            reportDiv.style.fontFamily = 'Inter, sans-serif';
            reportDiv.style.padding = '40px';

            // Header
            let html = `
                <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 40px;">
                    <h1 style="font-size: 28px; margin: 0; color: #f97316;">Creative Process Report</h1>
                    <p style="color: #64748b; margin: 4px 0 0 0;">Project: ${projectName}</p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Generated on: ${new Date().toLocaleString()}</p>
                </div>
            `;

            // Nodes Section
            const workflowNodes = getTopologicalOrder();
            html += `<div style="display: flex; flex-direction: column; gap: 30px;">`;

            for (const stepId of workflowNodes) {
                const node = nodesRef.current.find(n => n.id === stepId);
                const isInstruction = node.type === 'instruction';
                const isMedia = ['media', 'source'].includes(node.type);
                const isGen = ['aiImage', 'imageGen', 'text', 'aiAnalysis', 'assistant'].includes(node.type);

                html += `
                    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <span style="font-weight: 800; font-size: 14px; text-transform: uppercase; color: #94a3b8;">${node.type}</span>
                            <span style="font-size: 12px; color: #64748b;">ID: ${node.id}</span>
                        </div>
                `;

                // Details
                if (isMedia && node.data.image) {
                    html += `
                        <p style="margin: 0 0 12px 0; font-weight: 600;">Action: Image Upload</p>
                        <img src="${node.data.image}" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px;" />
                    `;
                } else if (isGen) {
                    const prompt = node.data.prompt || node.data.text || "Automatic Workflow Prompt";
                    const output = node.data.output || node.data.text || node.data.analysis?.full_text;
                    const model = node.data.model || (node.type.includes('Image') ? 'nano-banana-pro-preview' : 'gemini-3-flash-preview');

                    html += `
                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #0f172a;">Prompt:</p>
                        <div style="background: white; border-radius: 8px; padding: 12px; font-size: 13px; color: #475569; margin-bottom: 16px; border: 1px solid #f1f5f9;">${prompt}</div>
                        
                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #0f172a;">AI Output (${model}):</p>
                        ${output && output.startsWith('data:image') || (output && output.includes('uploads/')) ?
                            `<img src="${output}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />` :
                            `<div style="background: white; border-radius: 8px; padding: 12px; font-size: 13px; color: #0f172a; line-height: 1.6; border-left: 4px solid #f97316;">${output || 'In Progress...'}</div>`
                        }
                    `;
                } else if (node.type === 'adAdapter' && node.data.outputs) {
                    html += `
                        <p style="margin: 0 0 12px 0; font-weight: 600;">Programmatic Ad Suite (16 Variants):</p>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                            ${node.data.outputs.map((img, i) => `
                                <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: white;">
                                    <img src="${img}" style="width: 100%; height: auto; display: block;" />
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    html += `<p style="margin: 0; color: #64748b;">Content: ${node.data.label || node.data.text || 'No data available'}</p>`;
                }

                html += `</div>`;
            }

            html += `</div>`;
            reportDiv.innerHTML = html;
            document.body.appendChild(reportDiv);

            // Wait for images to load
            await new Promise(r => setTimeout(r, 2000));

            const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${projectName.replace(/\s+/g, '_')} _process_report.pdf`);

            document.body.removeChild(reportDiv);
            setCredits(c => Math.max(0, c - 5));
            setIsExportModalOpen(false);
            alert("Process PDF exported successfully! (5 🪙 deducted)");

        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Failed to generate PDF report. Check console for details.");
        } finally {
            setIsExporting(false);
        }
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
                    <span className="back-arrow" onClick={() => router.push('/campaigns')}>←</span>
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
                    <button className="tool-btn" onClick={onGenerateAll} style={{ background: '#3b82f6', color: 'white', border: 'none' }}>
                        ▶ Generate All
                    </button>
                    <button className="tool-btn secondary" onClick={undo} disabled={past.length === 0}>↩️ Undo</button>
                    <button className="tool-btn secondary" onClick={redo} disabled={future.length === 0}>↪️ Redo</button>
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
                    nodes={applyCallbacks(nodes).map(node => {
                        if (node.type === 'smartResize') {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    onAddSize: handleAddSize,
                                    onViewDashboard: handleViewDashboard,
                                    onGenerate: handleGenerate,
                                    onDelete: onNodeDelete
                                }
                            };
                        }
                        return node;
                    })}
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
                    <Controls position="top-left" showZoom={false} showFitView={false} showInteractive={false}>
                        <ControlButton onClick={openSelectorAtCenter} title="Add Node">
                            <AddNodeIcon />
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
                    <MiniMap position="top-right" style={{ borderRadius: 12, overflow: 'hidden' }} />
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
                                <span className="icon">⚡</span>
                                <div className="info">
                                    <h3>AI Text Gen</h3>
                                    <p>Generative Copy</p>
                                </div>
                            </div>
                            <div className="selector-item" onClick={() => addNode('inputText')}>
                                <span className="icon">📝</span>
                                <div className="info">
                                    <h3>Input Text</h3>
                                    <p>Simple Text Input</p>
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
                            <div className="selector-item" onClick={() => addNode('adAdapter')}>
                                <span className="icon">📐</span>
                                <div className="info">
                                    <h3>Ad Adapter</h3>
                                    <p>16 IAB adaptations</p>
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
                        {expandedMedia && (
                            expandedMedia.includes('.mp4') ||
                            expandedMedia.startsWith('data:video') ||
                            expandedMedia.includes('generativelanguage.googleapis.com') ||
                            expandedMedia.includes('videointelligence.googleapis.com')
                        ) ? (
                            <video
                                src={expandedMedia}
                                controls
                                autoPlay
                                className="full-view-media"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.warn("Expanded video failed to load");
                                }}
                            />
                        ) : (
                            <img src={expandedMedia} alt="Full View" className="full-view-media" />
                        )}
                        <div className="lightbox-actions">
                            <a href={expandedMedia} download="campaign_output" className="download-link">Download Asset</a>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Resize Modal */}
            <SizeSelectionModal
                isOpen={isSizeModalOpen}
                onClose={() => setIsSizeModalOpen(false)}
                onSelect={handleSizeSelect}
                selectedSizes={activeResizeNodeId ? (nodes.find(n => n.id === activeResizeNodeId)?.data.sizes || []).map(s => s.id) : []}
            />

            {/* Campaign Dashboard */}
            {isDashboardOpen && activeResizeNodeId && (() => {
                const node = nodes.find(n => n.id === activeResizeNodeId);
                const masterNode = nodes.find(n => edges.some(e => e.source === n.id && e.target === activeResizeNodeId));
                return (
                    <CampaignDashboard
                        sizes={node?.data.sizes || []}
                        anchors={node?.data.anchors || []}
                        onEdit={handleEditSize}
                        onDelete={handleDeleteSize}
                        onClose={handleCloseDashboard}
                        masterImage={masterNode?.data.image}
                        previews={node?.data.previews || {}}
                    />
                );
            })()}

            {/* Canvas Editor */}
            {isCanvasEditorOpen && editorSize && activeResizeNodeId && (() => {
                const node = nodes.find(n => n.id === activeResizeNodeId);
                const masterNode = nodes.find(n => edges.some(e => e.source === n.id && e.target === activeResizeNodeId));
                const isAnchor = node?.data.anchors?.some(a => a.id === editorSize.id);
                const layoutData = node?.data.layouts?.[editorSize.id];

                return (
                    <CanvasEditor
                        size={editorSize}
                        masterImage={masterNode?.data.image}
                        layoutData={layoutData}
                        onSave={handleSaveLayout}
                        onClose={() => setIsCanvasEditorOpen(false)}
                        isAnchor={isAnchor}
                    />
                );
            })()}

            {/* Anchor Workflow Modal */}
            {isAnchorWorkflowOpen && activeResizeNodeId && (() => {
                const node = nodes.find(n => n.id === activeResizeNodeId);
                const { getAllSizes } = require('../../lib/adSizes');

                return (
                    <AnchorWorkflowModal
                        isOpen={isAnchorWorkflowOpen}
                        onClose={() => setIsAnchorWorkflowOpen(false)}
                        currentAnchors={node?.data.anchors || []}
                        onSelectAnchor={handleAnchorSelect}
                        allSizes={getAllSizes()}
                    />
                );
            })()}

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
                    background: rgba(0, 0, 0, 0.5);
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

                /* Export Modal */
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
                    background: rgba(0, 0, 0, 0.9);
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
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
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

                /* Move attribution and customize controls */
                :global(.react-flow__attribution) {
                    top: 10px!important;
                    bottom: auto!important;
                    background: rgba(255, 255, 255, 0.7)!important;
                    padding: 2px 8px!important;
                    border-top-right-radius: 0!important;
                    border-bottom-left-radius: 8px!important;
                }

                .tool-btn.secondary {
                    background: #f1f5f9;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                    margin-right: 8px;
                }
                .tool-btn.secondary:hover:not(:disabled) {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .tool-btn.secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                :global(.react-flow__controls) {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)!important;
                    border: 1px solid #e2e8f0!important;
                    border-radius: 12px!important;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

function AddNodeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#f9731633" stroke="#f97316" />
            <line x1="12" y1="8" x2="12" y2="16" stroke="#f97316"></line>
            <line x1="8" y1="12" x2="16" y2="12" stroke="#f97316"></line>
        </svg>
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
