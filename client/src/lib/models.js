
export const MODEL_DISPLAY_NAMES = {
    // Text Models
    'gemini-3-flash': 'Gemini 3 Flash',
    'gemini-3-pro': 'Gemini 3 Pro',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',

    // Image Models
    'gemini-2.5-flash-image-preview': 'Gemini 2.5 Flash Image Preview',
    'gemini-2.5-flash-image': 'Gemini 2.5 Flash Image (Balanced)',
    'gemini-3-pro-image-preview': 'Gemini 3 Pro Image (Ultra)',
    'nano-banana-pro-preview': 'Nano Banana Pro Preview',

    // Video Models
    'veo-2.0-generate-001': 'Veo 2.0 (Stable)',
    'veo-3.0-fast-generate-001': 'Veo 3.0 Fast',
    'veo-3.1-generate-preview': 'Veo 3.1 Preview',
    'veo-3.1-fast-generate-preview': 'Veo 3.1 Fast'
};

export const getDisplayName = (modelId) => {
    return MODEL_DISPLAY_NAMES[modelId] || modelId;
};
