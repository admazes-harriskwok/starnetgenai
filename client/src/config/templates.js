
export const TEMPLATES = {
    'seasonal-showcase': {
        id: 'seasonal-showcase',
        name: 'Image Ad',
        ratio: '1:1',
        nodes: [
            {
                id: '1',
                type: 'source',
                position: { x: 100, y: 200 },
                data: { label: 'Source Product', description: 'Product asset', image: 'https://picsum.photos/seed/bottle/300/300' }
            },
            {
                id: 'text-1',
                type: 'text',
                position: { x: 100, y: 50 },
                data: { text: 'Winter Promo: Snowy podium with soft morning light, 4k, minimalist' }
            },
            {
                id: '2',
                type: 'generation',
                position: { x: 400, y: 100 },
                data: { label: 'Background Generator', prompt: '', output: null }
            },
            {
                id: '3',
                type: 'generation',
                position: { x: 400, y: 300 },
                data: { label: 'Product Placement', prompt: 'Composite Source 1 onto Background 2', output: null }
            },
            {
                id: '4',
                type: 'generation',
                position: { x: 700, y: 200 },
                data: { label: 'Sales Badge', prompt: 'Add text overlay: "YEAR-END SALE"', output: null }
            },
            {
                id: '5',
                type: 'generation',
                position: { x: 1000, y: 200 },
                data: { label: 'Final Banner', prompt: 'Final render', output: null }
            }
        ],
        edges: [
            { id: 'e-text-2', source: 'text-1', target: '2', animated: true },
            { id: 'e1-3', source: '1', target: '3', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
            { id: 'e3-4', source: '3', target: '4', animated: true },
            { id: 'e4-5', source: '4', target: '5', animated: true }
        ]
    },
    'cinematic-video': {
        id: 'cinematic-video',
        name: 'Image to Video Ad',
        ratio: '16:9',
        nodes: [
            {
                id: 'cv1',
                type: 'sourceUpload',
                position: { x: 50, y: 250 },
                data: { label: 'Reference Image', image: null }
            },
            {
                id: 'cv2',
                type: 'aiAnalysis',
                position: { x: 350, y: 250 },
                data: { label: 'Director AI', analysis: null }
            },
            {
                id: 'cv3',
                type: 'imageGen',
                position: { x: 650, y: 250 },
                data: { label: 'NanoBanana Storyboard', output: null }
            },
            {
                id: 'cv4',
                type: 'imageSplitter',
                position: { x: 950, y: 250 },
                data: { label: 'Frame Splitter', frames: [] }
            },
            {
                id: 'cv5',
                type: 'videoGen',
                position: { x: 1250, y: 250 },
                data: { label: 'Video Production', clips: [] }
            },
            {
                id: 'cv6',
                type: 'exportHandler',
                position: { x: 1550, y: 250 },
                data: { label: 'Final Export', assets: [] }
            }
        ],
        edges: [
            { id: 'e-cv1-cv2', source: 'cv1', target: 'cv2', animated: true },
            { id: 'e-cv2-cv3', source: 'cv2', target: 'cv3', animated: true },
            { id: 'e-cv3-cv4', source: 'cv3', target: 'cv4', animated: true },
            { id: 'e-cv4-cv5', source: 'cv4', target: 'cv5', animated: true },
            { id: 'e-cv5-cv6', source: 'cv5', target: 'cv6', animated: true }
        ]
    }
};
