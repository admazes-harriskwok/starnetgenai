
export const TEMPLATES = {
    'seasonal-showcase': {
        id: 'seasonal-showcase',
        name: 'Image Ad',
        category: 'Generate Image',
        ratio: '1:1',
        nodes: [
            {
                id: '1',
                type: 'sourceUpload',
                position: { x: 100, y: 200 },
                data: { label: 'Source Product', description: 'Product asset', image: null }
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
            },
            {
                id: '6',
                type: 'adAdapter',
                position: { x: 1300, y: 200 },
                data: { label: 'Programmatic Suite', outputs: [] }
            }
        ],
        edges: [
            { id: 'e-text-2', source: 'text-1', target: '2', animated: true },
            { id: 'e1-3', source: '1', target: '3', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
            { id: 'e3-4', source: '3', target: '4', animated: true },
            { id: 'e4-5', source: '4', target: '5', animated: true },
            { id: 'e5-6', source: '5', target: '6', animated: true }
        ]
    },
    'cinematic-video': {
        id: 'cinematic-video',
        name: 'Image to Video Ad',
        category: 'Generate Video',
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
        category: 'Generate Image',
        ratio: '2:3',
        nodes: [
            // Inputs
            {
                id: 'cp-source-1',
                type: 'sourceUpload',
                position: { x: 50, y: 50 },
                data: { label: '1. Upload Product Info', image: null }
            },
            {
                id: 'cp-product-info',
                type: 'text',
                position: { x: 50, y: 300 },
                data: {
                    label: '2. Upload Product Info',
                    placeholder: '[Product Name]: Luxury Scents\n[Category]: Fragrance\n[Target Audience]: Women aged 25-40\n[Key Features]: Floral notes, long-lasting, elegant bottle design\n[Promotion Details]: Christmas Special, Buy 1 Get 1 Free',
                    text: ''
                }
            },
            {
                id: 'cp-pref-1',
                type: 'text',
                position: { x: 50, y: 550 },
                data: {
                    label: '3. Set custom preferences',
                    placeholder: 'E.g., "Minimalist, luxury, gold and black theme" or "Fun, colorful, cartoon style"',
                    text: 'Objective: We need to create a [Christmas Promotion Poster] for our product.'
                }
            },

            // Brain / Analysis
            {
                id: 'cp-analysis-1',
                type: 'aiAnalysis',
                position: { x: 450, y: 300 },
                data: {
                    label: 'Inspire',
                    prompt: `Objective: We need to create a [Christmas Promotion Poster] for this product. The poster must align with the theme of the best-selling discount promotion, showcase the necessary discount information, and convey a sense of sophistication.

Task: Carefully study the provided product information, stay tightly focused on the promotional theme, and incorporate the user’s custom preferences. Output three different poster concepts, each beginning with a label such as “Poster 1,” “Poster 2,” etc. Each concept should adopt a distinctly different style—for example, with or without a model, product perspective, color tone, artistic style, degree of creative exaggeration, visual impact, amount of text (but text is required), composition method, information hierarchy, and so on. Apart from the product itself, the posters should avoid similarity as much as possible.

Note:
Your concepts must not compromise the consistency of the product’s features. For example, you cannot change the product’s color or material, nor distort parts that cannot be altered in shape. Each concept will be used independently as a design direction, so each one must, on its own, remain tightly aligned with and clearly convey the theme.`
                }
            },

            // Branch 1
            {
                id: 'cp-desc-1',
                type: 'text',
                position: { x: 850, y: 50 },
                data: {
                    label: 'Poster 1 Description Generator',
                    placeholder: 'Reference inspiration poster 2. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.',
                    prompt: 'Based on the analysis, write a highly detailed image generation prompt for **Concept 1**. Focus on lighting, texture, and composition. Do not include introductory text, just the prompt.'
                }
            },
            {
                id: 'cp-img-1',
                type: 'aiImage',
                position: { x: 1250, y: 50 },
                data: { label: 'Image Generator 1', output: null }
            },

            // Branch 2
            {
                id: 'cp-desc-2',
                type: 'text',
                position: { x: 850, y: 300 },
                data: {
                    label: 'Poster 2 Description Generator',
                    placeholder: 'Reference inspiration poster 3. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.',
                    prompt: 'Based on the analysis, write a highly detailed image generation prompt for **Concept 2**. Focus on lighting, texture, and composition. Do not include introductory text, just the prompt.'
                }
            },
            {
                id: 'cp-img-2',
                type: 'aiImage',
                position: { x: 1250, y: 300 },
                data: { label: 'Image Generator 2', output: null }
            },

            // Branch 3
            {
                id: 'cp-desc-3',
                type: 'text',
                position: { x: 850, y: 550 },
                data: {
                    label: 'Poster 3 Description Generator',
                    placeholder: 'Reference inspiration poster 1. Based on the product information and the white background image, generate a marketing creative poster for this product. Use no more than 200 English words to describe the image: first, give a precise, detailed, and vivid description of the core content (especially composition, character posture, color tone, required text content, etc.); then cover other parts with just one sentence each. Prefer declarative sentences. Your first sentence should set the stylistic tone by stating the theme of the current image, such as Black Friday promotion, Christmas promotion, etc. Your description should be vivid and imaginative, so that even a blind person could picture the scene by reading it. You may use emotional expression or business purpose to help convey the image. Note that your description must not alter the product’s features, such as changing its color or material. Your output must be in English, and directly provide the content without any preface, greetings, or self-introduction. Begin with “Maintain product appearance consistency”.',
                    prompt: 'Based on the analysis, write a highly detailed image generation prompt for **Concept 3**. Focus on lighting, texture, and composition. Do not include introductory text, just the prompt.'
                }
            },
            {
                id: 'cp-img-3',
                type: 'aiImage',
                position: { x: 1250, y: 550 },
                data: { label: 'Image Generator 3', output: null }
            }
        ],
        edges: [
            // Inputs to Analysis
            { id: 'e-cp-src-an', source: 'cp-source-1', target: 'cp-analysis-1', animated: true },
            { id: 'e-cp-info-an', source: 'cp-product-info', target: 'cp-analysis-1', animated: true },
            { id: 'e-cp-pref-an', source: 'cp-pref-1', target: 'cp-analysis-1', animated: true },

            // Analysis to Descriptions
            { id: 'e-cp-an-d1', source: 'cp-analysis-1', target: 'cp-desc-1', animated: true },
            { id: 'e-cp-an-d2', source: 'cp-analysis-1', target: 'cp-desc-2', animated: true },
            { id: 'e-cp-an-d3', source: 'cp-analysis-1', target: 'cp-desc-3', animated: true },

            // Descriptions to Images
            { id: 'e-cp-d1-i1', source: 'cp-desc-1', target: 'cp-img-1', animated: true },
            { id: 'e-cp-d2-i2', source: 'cp-desc-2', target: 'cp-img-2', animated: true },
            { id: 'e-cp-d3-i3', source: 'cp-desc-3', target: 'cp-img-3', animated: true }
        ]
    },
    'skincare-hand-showcase': {
        id: 'skincare-hand-showcase',
        name: 'Skincare Hand Showcase Video',
        category: 'Generate Video',
        ratio: '9:16',
        nodes: [
            { id: 'sh-1', type: 'sourceUpload', position: { x: 50, y: 300 }, data: { label: 'Source Image', image: null } },
            { id: 'sh-shot-1', type: 'aiImage', position: { x: 450, y: 50 }, data: { label: 'Shot 1', prompt: 'Ultra-realistic close-up of an elegant hand holding a skincare bottle against a soft, clean aesthetic background. Natural soft lighting, 8k resolution.', output: null } },
            {
                id: 'sh-clip-1',
                type: 'videoGen',
                position: { x: 850, y: 50 },
                data: {
                    label: 'Clip 1',
                    status: 'Ready',
                    prompt: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and product placement. Maintain the same hand characteristics, including hand shape, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing. The hand should be in a neutral, relaxed starting position: fingers gently resting with a slight wrist angle, and the product clearly visible under soft light. The hands should perform subtle, minimal movement—just a slight tilt or rotation—enough to add a natural sense of motion without altering the overall composition. The composition should match the reference, ensuring the product remains fully visible.\n\nNegative constraints: no color changes, no product changes, no new objects, no background changes, no distortion, no extra fingers, no watermark.',
                    aiPlaceholder: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and product placement. Maintain the same hand characteristics, including hand shape, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing. The hand should be in a neutral, relaxed starting position: fingers gently resting with a slight wrist angle, and the product clearly visible under soft light. The hands should perform subtle, minimal movement—just a slight tilt or rotation—enough to add a natural sense of motion without altering the overall composition. The composition should match the reference, ensuring the product remains fully visible.\n\nNegative constraints: no color changes, no product changes, no new objects, no background changes, no distortion, no extra fingers, no watermark.',
                    clips: []
                }
            },
            { id: 'sh-shot-2', type: 'aiImage', position: { x: 450, y: 300 }, data: { label: 'Shot 2', prompt: 'Elegant hands showcasing skincare product, luxurious atmosphere, editorial lighting, 4K.', output: null } },
            {
                id: 'sh-clip-2',
                type: 'videoGen',
                position: { x: 850, y: 300 },
                data: {
                    label: 'Clip 2',
                    status: 'Ready',
                    prompt: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and skincare product placement. Maintain the same hand, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing.',
                    aiPlaceholder: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and skincare product placement. Maintain the same hand, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing.',
                    clips: []
                }
            },
            { id: 'sh-shot-3', type: 'aiImage', position: { x: 450, y: 550 }, data: { label: 'Shot 3', prompt: 'Close up of hands with skincare product, dramatic contrast, cinematic spotlighting, 4k.', output: null } },
            {
                id: 'sh-clip-3',
                type: 'videoGen',
                position: { x: 850, y: 550 },
                data: {
                    label: 'Clip 3',
                    status: 'Ready',
                    prompt: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and skincare product placement. Maintain the same hand, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing.',
                    aiPlaceholder: 'This is a pose editing task only; do not generate a new hand. Use the uploaded reference image as the sole reference for hand identity and skincare product placement. Maintain the same hand, skin tone, nail length/shape, product type/design/placement, background, lighting, and framing.',
                    clips: []
                }
            }
        ],
        edges: [
            { id: 'e-sh1-s1', source: 'sh-1', target: 'sh-shot-1', animated: true },
            { id: 'e-sh1-s2', source: 'sh-1', target: 'sh-shot-2', animated: true },
            { id: 'e-sh1-s3', source: 'sh-1', target: 'sh-shot-3', animated: true },
            { id: 'e-s1-c1', source: 'sh-shot-1', target: 'sh-clip-1', animated: true },
            { id: 'e-s2-c2', source: 'sh-shot-2', target: 'sh-clip-2', animated: true },
            { id: 'e-s3-c3', source: 'sh-shot-3', target: 'sh-clip-3', animated: true }
        ]
    },
    'resize-ad-banners': {
        id: 'resize-ad-banners',
        name: 'Resize Ad Banners',
        category: 'Edit Image',
        ratio: 'Multi-Format',
        nodes: [
            { id: 'v1', type: 'sourceUpload', position: { x: 50, y: 200 }, data: { label: 'Master Creative', image: null } },
            { id: 'v2', type: 'adAdapter', position: { x: 450, y: 150 }, data: { label: 'Programmatic Ad Suite', outputs: {} } }
        ],
        edges: [
            { id: 'e-v1-v2', source: 'v1', target: 'v2', animated: true }
        ]
    },
    'ecommerce-video-maker': {
        id: 'ecommerce-video-maker',
        name: 'E-commerce Video Maker',
        category: 'Generate Video',
        ratio: '9:16',
        nodes: [
            {
                id: 'ec-text-1',
                type: 'text',
                position: { x: 50, y: 100 },
                data: { label: 'TEXT', text: '', placeholder: '[Spoken copy] Want a pure bass experience? Introducing the Pro Sound Pods. Feel every note deeply. Enjoy immersive sound daily. Experience Audio freedom today. Click below to purchase yours!' }
            },
            {
                id: 'ec-image-1',
                type: 'sourceUpload',
                position: { x: 50, y: 350 },
                data: { label: 'MEDIA', image: null }
            },
            {
                id: 'ec-analysis-1',
                type: 'aiAnalysis',
                position: { x: 450, y: 225 },
                data: {
                    label: 'Director Analysis',
                    prompt: `# Role
You are an expert AI Video Director. Your goal is to analyze the provided [Product Image] and [Spoken Copy] to generate a structured 5-shot video storyboard JSON. 

# Inputs
- Product Image: (The image attached to this node)
- Spoken Copy: (The text input from the previous node)

# Task
Generate a JSON object with a "shots" array containing 5 distinct shots that form a 10-12 second video. 
For each shot, you must define:
1. **shot_number**: Sequential order (1-5).
2. **visual_description**: A highly detailed prompt for a video generation AI describing the subject, background, and action. MUST include visual details from the Product Image.
3. **camera_angle**: (e.g., Eye-level, Top-down, Low angle).
4. **camera_movement**: (e.g., Static, Slow Pan, Zoom In).
5. **lighting**: (e.g., Soft Studio, Natural, Neon).
6. **duration**: Time in seconds (Total must equal ~12s).
7. **voiceover**: The specific script line for this shot.

# Constraints
- Do NOT ask questions. Generate the result immediately based on the inputs.
- Ensure the "visual_description" is purely descriptive (e.g., "A close-up of the white earbuds case opening," NOT "Show the product").
- Total duration must be exactly 12 seconds.
- Output ONLY valid JSON.

Example Output:
{
  "shots": [
    {
      "shot_number": 1,
      "visual_description": "Close-up of sleek white earbuds case on a dark surface, soft rim lighting highlighting the logo.",
      "camera_angle": "Eye-level",
      "camera_movement": "Slow Pan Right",
      "lighting": "Cinematic Dark Mode",
      "duration": 2,
      "voiceover": "Want a pure bass experience?"
    }
  ]
}`
                }
            },
            {
                id: 'ec-video-1',
                type: 'videoGen',
                position: { x: 850, y: 225 },
                data: {
                    label: 'Video Generator',
                    clips: [],
                    prompt: `Create a high-quality video based on the following description:
{{Director Analysis.shots[0].visual_description}}

Style: High-fidelity Product Showcase
Camera Movement: {{Director Analysis.shots[0].camera_movement}}
Lighting: {{Director Analysis.shots[0].lighting}}`
                }
            }
        ],
        edges: [
            { id: 'e-text-1-analysis', source: 'ec-text-1', target: 'ec-analysis-1', animated: true },
            { id: 'e-image-1-analysis', source: 'ec-image-1', target: 'ec-analysis-1', animated: true },
            { id: 'e-analysis-1-video', source: 'ec-analysis-1', target: 'ec-video-1', animated: true },
            { id: 'e-image-1-video', source: 'ec-image-1', target: 'ec-video-1', animated: true }
        ]
    },
    'qa-testing-matrix': {
        id: 'qa-testing-matrix',
        name: 'QA Testing Matrix',
        category: 'Development',
        ratio: 'Multi-Format',
        nodes: [
            // Core Inputs
            { id: 'qa-t1', type: 'inputText', position: { x: 50, y: 50 }, data: { label: 'Input Text', text: 'Write a 50-word marketing tagline for these professional studio headphones.' } },
            { id: 'qa-i1', type: 'sourceUpload', position: { x: 50, y: 300 }, data: { label: 'Input Image', image: null } },
            { id: 'qa-v1', type: 'sourceUpload', position: { x: 50, y: 550 }, data: { label: 'Input Video', video: null } },

            // 1. Text -> Text
            { id: 'qa-path-1', type: 'text', position: { x: 450, y: 0 }, data: { label: 'T -> T', prompt: 'Summarize the input text into 3 bullet points.' } },

            // 2. Text + Image -> Text
            { id: 'qa-path-2', type: 'text', position: { x: 450, y: 150 }, data: { label: 'T+I -> T', prompt: 'Based on the image and text, suggest a matching headline.' } },

            // 3. Text -> Image
            { id: 'qa-path-3', type: 'aiImage', position: { x: 450, y: 300 }, data: { label: 'T -> I', prompt: 'A cinematic high-end store interior for the product mentioned.' } },

            // 4. Text + Image -> Image
            { id: 'qa-path-4', type: 'aiImage', position: { x: 450, y: 450 }, data: { label: 'T+I -> I', prompt: 'Place the product from input into a beach sunset setting.' } },

            // 5. Text -> Video
            { id: 'qa-path-5', type: 'aiVideo', position: { x: 450, y: 600 }, data: { label: 'T -> V', prompt: 'Slow elegant camera zoom into the leather texture of the headphones.' } },

            // 6. Text + Image -> Video
            { id: 'qa-path-6', type: 'aiVideo', position: { x: 450, y: 750 }, data: { label: 'T+I -> V', prompt: 'Animate subtle light reflections across the earcups of the headphones.' } },

            // 7. Text + Video -> Text (Assistant for conversation)
            { id: 'qa-path-7', type: 'assistant', position: { x: 850, y: 0 }, data: { label: 'T+V -> T', prompt: 'What happens in this video?' } },

            // 8. Image + Video -> Text
            { id: 'qa-path-8', type: 'aiAnalysis', position: { x: 850, y: 150 }, data: { label: 'I+V -> T', prompt: 'Analyze the common theme between the image and video.' } },

            // 9. Text + Image + Video -> Text
            { id: 'qa-path-9', type: 'aiAnalysis', position: { x: 850, y: 300 }, data: { label: 'T+I+V -> T', prompt: 'Combine these inputs into a 5-shot script.' } },

            // 10. Image -> Text
            { id: 'qa-path-10', type: 'aiAnalysis', position: { x: 850, y: 450 }, data: { label: 'I -> T', prompt: '' } },

            // 11. Video -> Text
            { id: 'qa-path-11', type: 'aiAnalysis', position: { x: 850, y: 600 }, data: { label: 'V -> T', prompt: '' } },

            // 12. Image -> Multiple Images (Ad Adapter)
            { id: 'qa-path-12', type: 'adAdapter', position: { x: 850, y: 750 }, data: { label: 'I -> Mult-I', outputs: [] } },

            // 13. Analysis (JSON) + Image -> Image (Storyboard)
            { id: 'qa-path-13', type: 'imageGen', position: { x: 1250, y: 100 }, data: { label: 'An(JSON)+I -> I', output: null } },

            // 14. Multiple Images (Storyboard) + Text -> Video
            { id: 'qa-path-14', type: 'videoGen', position: { x: 1250, y: 350 }, data: { label: 'Mult-I+T -> V', clips: [] } },

            // 15. Layout (JSON) + Image -> Image (Smart Resize)
            { id: 'qa-path-15', type: 'smartResize', position: { x: 1250, y: 600 }, data: { label: 'Layout(JSON)+I -> I', previews: {} } }
        ],
        edges: [
            // 1. Text -> Text
            { id: 'e-1', source: 'qa-t1', target: 'qa-path-1', animated: true },
            // 2. Text + Image -> Text
            { id: 'e-2a', source: 'qa-t1', target: 'qa-path-2', animated: true },
            { id: 'e-2b', source: 'qa-i1', target: 'qa-path-2', animated: true },
            // 3. Text -> Image
            { id: 'e-3', source: 'qa-t1', target: 'qa-path-3', animated: true },
            // 4. Text + Image -> Image
            { id: 'e-4a', source: 'qa-t1', target: 'qa-path-4', animated: true },
            { id: 'e-4b', source: 'qa-i1', target: 'qa-path-4', animated: true },
            // 5. Text -> Video
            { id: 'e-5', source: 'qa-t1', target: 'qa-path-5', animated: true },
            // 6. Text + Image -> Video
            { id: 'e-6a', source: 'qa-t1', target: 'qa-path-6', animated: true },
            { id: 'e-6b', source: 'qa-i1', target: 'qa-path-6', animated: true },
            // 7. Text + Video -> Text
            { id: 'e-7a', source: 'qa-t1', target: 'qa-path-7', animated: true },
            { id: 'e-7b', source: 'qa-v1', target: 'qa-path-7', animated: true },
            // 8. Image + Video -> Text
            { id: 'e-8a', source: 'qa-i1', target: 'qa-path-8', animated: true },
            { id: 'e-8b', source: 'qa-v1', target: 'qa-path-8', animated: true },
            // 9. Text + Image + Video -> Text
            { id: 'e-9a', source: 'qa-t1', target: 'qa-path-9', animated: true },
            { id: 'e-9b', source: 'qa-i1', target: 'qa-path-9', animated: true },
            { id: 'e-9c', source: 'qa-v1', target: 'qa-path-9', animated: true },
            // 10. Image -> Text
            { id: 'e-10', source: 'qa-i1', target: 'qa-path-10', animated: true },
            // 11. Video -> Text
            { id: 'e-11', source: 'qa-v1', target: 'qa-path-11', animated: true },
            // 12. Image -> Multiple Images
            { id: 'e-12', source: 'qa-i1', target: 'qa-path-12', animated: true },
            // 13. Analysis + Image -> Image
            { id: 'e-13a', source: 'qa-path-10', target: 'qa-path-13', animated: true },
            { id: 'e-13b', source: 'qa-i1', target: 'qa-path-13', animated: true },
            // 14. Multiple Images + Text -> Video
            { id: 'e-14a', source: 'qa-path-13', target: 'qa-path-14', animated: true },
            { id: 'e-14b', source: 'qa-t1', target: 'qa-path-14', animated: true },
            // 15. Layout + Image -> Image
            { id: 'e-15a', source: 'qa-path-12', target: 'qa-path-15', animated: true }, // Logic: Use adAdapter layouts
            { id: 'e-15b', source: 'qa-i1', target: 'qa-path-15', animated: true }
        ]
    }
};
