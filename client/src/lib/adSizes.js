// IAB Standard Ad Sizes with categorization
export const AD_SIZES = {
    display: [
        { id: 'medium-rectangle', name: 'Medium Rectangle', width: 300, height: 250, category: 'display', anchor: 'square' },
        { id: 'large-rectangle', name: 'Large Rectangle', width: 336, height: 280, category: 'display', anchor: 'square' },
        { id: 'leaderboard', name: 'Leaderboard', width: 728, height: 90, category: 'display', anchor: 'horizontal' },
        { id: 'wide-skyscraper', name: 'Wide Skyscraper', width: 160, height: 600, category: 'display', anchor: 'vertical' },
        { id: 'skyscraper', name: 'Skyscraper', width: 120, height: 600, category: 'display', anchor: 'vertical' },
        { id: 'half-page', name: 'Half-Page Ad', width: 300, height: 600, category: 'display', anchor: 'vertical' },
        { id: 'portrait', name: 'Portrait', width: 300, height: 1050, category: 'display', anchor: 'vertical' },
        { id: 'billboard', name: 'Billboard', width: 970, height: 250, category: 'display', anchor: 'horizontal' },
        { id: 'large-leaderboard', name: 'Large Leaderboard', width: 970, height: 90, category: 'display', anchor: 'horizontal' },
        { id: 'banner', name: 'Banner', width: 468, height: 60, category: 'display', anchor: 'horizontal' },
        { id: 'square', name: 'Square', width: 250, height: 250, category: 'display', anchor: 'square' },
        { id: 'small-square', name: 'Small Square', width: 200, height: 200, category: 'display', anchor: 'square' },
        { id: 'small-rectangle', name: 'Small Rectangle', width: 180, height: 150, category: 'display', anchor: 'square' }
    ],
    social: [
        { id: 'fb-feed', name: 'Facebook Feed', width: 1200, height: 628, category: 'social', anchor: 'horizontal' },
        { id: 'fb-story', name: 'Facebook Story', width: 1080, height: 1920, category: 'social', anchor: 'vertical' },
        { id: 'ig-square', name: 'Instagram Square', width: 1080, height: 1080, category: 'social', anchor: 'square' },
        { id: 'ig-story', name: 'Instagram Story', width: 1080, height: 1920, category: 'social', anchor: 'vertical' },
        { id: 'twitter-card', name: 'Twitter Card', width: 1200, height: 675, category: 'social', anchor: 'horizontal' },
        { id: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627, category: 'social', anchor: 'horizontal' }
    ],
    vast: [
        { id: 'vast-16-9', name: 'VAST 16:9', width: 1920, height: 1080, category: 'vast', anchor: 'horizontal' },
        { id: 'vast-4-3', name: 'VAST 4:3', width: 640, height: 480, category: 'vast', anchor: 'square' }
    ]
};

// Recommended anchor sizes for the 3-step workflow
export const RECOMMENDED_ANCHORS = {
    square: { id: 'large-rectangle', name: 'Large Rectangle', width: 336, height: 280 },
    horizontal: { id: 'leaderboard', name: 'Leaderboard', width: 728, height: 90 },
    vertical: { id: 'wide-skyscraper', name: 'Wide Skyscraper', width: 160, height: 600 }
};

// Calculate aspect ratio category
export function getAspectRatioCategory(width, height) {
    const ratio = width / height;
    if (ratio > 1.5) return 'horizontal';
    if (ratio < 0.67) return 'vertical';
    return 'square';
}

// Find closest anchor for a given size
export function findClosestAnchor(width, height, anchors) {
    const targetRatio = width / height;
    const targetCategory = getAspectRatioCategory(width, height);

    // Filter anchors by category first
    const categoryAnchors = anchors.filter(a =>
        getAspectRatioCategory(a.width, a.height) === targetCategory
    );

    if (categoryAnchors.length === 0) return anchors[0]; // Fallback to first anchor

    // Find closest by aspect ratio
    let closest = categoryAnchors[0];
    let minDiff = Math.abs(targetRatio - (closest.width / closest.height));

    for (const anchor of categoryAnchors) {
        const anchorRatio = anchor.width / anchor.height;
        const diff = Math.abs(targetRatio - anchorRatio);
        if (diff < minDiff) {
            minDiff = diff;
            closest = anchor;
        }
    }

    return closest;
}

// Get all sizes flattened
export function getAllSizes() {
    return [...AD_SIZES.display, ...AD_SIZES.social, ...AD_SIZES.vast];
}

// Get sizes by category
export function getSizesByCategory(category) {
    if (category === 'all') return getAllSizes();
    return AD_SIZES[category] || [];
}
