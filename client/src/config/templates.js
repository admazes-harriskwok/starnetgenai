
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
        // ... previous cinematic-video content ...
        id: 'cinematic-video',
        name: 'Image to Video Ad',
        ratio: '16:9',
        nodes: [
            { id: 'cv1', type: 'sourceUpload', position: { x: 50, y: 250 }, data: { label: 'Reference Image', image: null } },
            { id: 'cv2', type: 'aiAnalysis', position: { x: 350, y: 250 }, data: { label: 'Director AI', analysis: null } },
            { id: 'cv3', type: 'imageGen', position: { x: 650, y: 250 }, data: { label: 'NanoBanana Storyboard', output: null } },
            { id: 'cv4', type: 'imageSplitter', position: { x: 950, y: 250 }, data: { label: 'Frame Splitter', frames: [] } },
            { id: 'cv5', type: 'videoGen', position: { x: 1250, y: 250 }, data: { label: 'Video Production', clips: [] } },
            { id: 'cv6', type: 'exportHandler', position: { x: 1550, y: 250 }, data: { label: 'Final Export', assets: [] } }
        ],
        edges: [
            { id: 'e-cv1-cv2', source: 'cv1', target: 'cv2', animated: true },
            { id: 'e-cv2-cv3', source: 'cv2', target: 'cv3', animated: true },
            { id: 'e-cv3-cv4', source: 'cv3', target: 'cv4', animated: true },
            { id: 'e-cv4-cv5', source: 'cv4', target: 'cv5', animated: true },
            { id: 'e-cv5-cv6', source: 'cv5', target: 'cv6', animated: true }
        ]
    },
    'christmas-poster': {
        id: 'christmas-poster',
        name: 'Christmas Sale Poster Template',
        ratio: '2:3',
        nodes: [
            // Instructions
            {
                id: 'step1',
                type: 'instruction',
                position: { x: -400, y: 0 },
                data: { step: 'Step 1', title: 'Image Upload', description: 'Click the Upload icon, and upload the image you want', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', showUpload: true }
            },
            {
                id: 'step2',
                type: 'instruction',
                position: { x: -400, y: 250 },
                data: { step: 'Step 2', title: 'Input Text Content', description: 'Enter relevant content within the text node', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200' }
            },
            {
                id: 'step3',
                type: 'instruction',
                position: { x: -400, y: 500 },
                data: { step: 'Step 3', title: 'Run the Workflow', description: 'Click the blue icon "Generate" to run the workflow when the top toolbar shows up', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200' }
            },
            {
                id: 'step4',
                type: 'instruction',
                position: { x: -400, y: 750 },
                data: { step: 'Step 4', title: 'Zoom In', description: 'Click the node. The top toolbar will pop up, and click the icon to zoom-in the image or video', image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=200' }
            },

            // Workflow Nodes
            { id: 'w1', type: 'text', position: { x: 50, y: 50 }, data: { text: '1. Upload Product Info' } },
            { id: 'w2', type: 'sourceUpload', position: { x: 50, y: 300 }, data: { label: '2. Upload product white background', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200' } },
            { id: 'w3', type: 'text', position: { x: 50, y: 650 }, data: { text: '3. Set custom preferences' } },

            {
                id: 'inspire',
                type: 'text',
                position: { x: 450, y: 300 },
                data: {
                    text: 'Poster Concepts Generation Area',
                    aiPlaceholder: `Objective: We need to create a [Christmas Promotion Poster] for this product. The poster must align with the theme of the best-selling discount promotion, showcase the necessary discount information, and convey a sense of sophistication.

Task: Carefully study the provided product information, stay tightly focused on the promotional theme, and incorporate the user’s custom preferences. Output three different poster concepts, each beginning with a label such as “Poster 1,” “Poster 2,” etc. Each concept should adopt a distinctly different style—for example, with or without a model, product perspective, color tone, artistic style, degree of creative exaggeration, visual impact, amount of text (but text is required), composition method, information hierarchy, and so on. Apart from the product itself, the posters should avoid similarity as much as possible.

Note:
Your concepts must not compromise the consistency of the product’s features. For example, you cannot change the product’s color or material, nor distort parts that cannot be altered in shape. Each concept will be used independently as a design direction, so each one must, on its own, remain tightly aligned with and clearly convey the theme.`
                }
            },

            {
                id: 'p1',
                type: 'text',
                position: { x: 800, y: 50 },
                data: {
                    text: 'Poster 1 Description Generator',
                    aiPlaceholder: `Reference inspiration poster 2. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.`
                }
            },
            {
                id: 'p2',
                type: 'text',
                position: { x: 800, y: 300 },
                data: {
                    text: 'Maintain product appearance consistency. This Christmas promotion poster depicts a heartwarming holiday gifting scene. The Philips wireless portable charger, in its original sleek form, lies angled on a rustic wooden surface, appearing as a cherished gift. Beside it, a small, elegantly wrapped gift box with a simple ribbon enhances the festive atmosphere. A cozy, slightly out-of-focus hand gently reaches into the frame, suggesting a moment of giving. The blurred background features soft tartan blanket edges and golden, twinkling Christmas fairy lights, bathing the scene in inviting golden light. A natural sprig of pine, adorned with a single red berry, subtly accents the charger. The color palette is rich with warm Christmas reds, forest greens, and cozy browns. The headline, "Give the Gift of Untethered Power This Christmas," in an elegant script, is positioned in the top left. A central, subtle ‘gift tag’ overlay proudly announces, "HOLIDAY BEST-SELLER | 20% OFF" in a clear serif font. Below the product, "Wireless Charging. Fast Power. Philips." provides key features. The call to action, "Discover Your Perfect Present," is at the bottom center. The PHILIPS logo is discreetly placed in the bottom right corner.',
                    aiPlaceholder: `Reference inspiration poster 3. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.`
                }
            },
            {
                id: 'p3',
                type: 'text',
                position: { x: 800, y: 550 },
                data: {
                    text: 'Poster 3 Description Generator',
                    aiPlaceholder: `Reference inspiration poster 1. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.`
                }
            },

            { id: 'img1', type: 'aiImage', position: { x: 1200, y: 50 }, data: { label: 'Image', output: 'https://images.unsplash.com/photo-1512909002072-4aad7028ed8a?w=400' } },
            { id: 'img2', type: 'aiImage', position: { x: 1200, y: 350 }, data: { label: 'Image', output: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400' } },
            { id: 'img3', type: 'aiImage', position: { x: 1200, y: 650 }, data: { label: 'Image', output: 'https://images.unsplash.com/photo-1576748834432-0371800c010a?w=400' } }
        ],
        edges: [
            { id: 'e-w1-insp', source: 'w1', target: 'inspire', animated: true },
            { id: 'e-w2-insp', source: 'w2', target: 'inspire', animated: true },
            { id: 'e-w3-insp', source: 'w3', target: 'inspire', animated: true },
            { id: 'e-insp-p1', source: 'inspire', target: 'p1', animated: true },
            { id: 'e-insp-p2', source: 'inspire', target: 'p2', animated: true },
            { id: 'e-insp-p3', source: 'inspire', target: 'p3', animated: true },
            { id: 'e-p1-i1', source: 'p1', target: 'img1', animated: true },
            { id: 'e-p2-i2', source: 'p2', target: 'img2', animated: true },
            { id: 'e-p3-i3', source: 'p3', target: 'img3', animated: true }
        ]
    }
};
