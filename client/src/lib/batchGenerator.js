import { findClosestAnchor, getAspectRatioCategory } from './adSizes';

/**
 * Batch Generation Engine
 * Applies anchor layouts to new sizes based on aspect ratio matching
 */

export function generateBatchLayouts(targetSizes, anchors, layouts) {
    const results = [];

    for (const size of targetSizes) {
        // Find the closest anchor for this size
        const closestAnchor = findClosestAnchor(size.width, size.height, anchors);

        if (!closestAnchor || !layouts[closestAnchor.id]) {
            console.warn(`No anchor layout found for ${size.name}`);
            continue;
        }

        // Apply the anchor's layout with transformations
        const transformedLayout = applyLayoutTransformations(
            layouts[closestAnchor.id],
            closestAnchor,
            size
        );

        results.push({
            sizeId: size.id,
            size,
            layout: transformedLayout,
            sourceAnchor: closestAnchor.id
        });
    }

    return results;
}

function applyLayoutTransformations(anchorLayout, anchorSize, targetSize) {
    const scaleX = targetSize.width / anchorSize.width;
    const scaleY = targetSize.height / anchorSize.height;

    // Clone the layout
    const transformedLayout = JSON.parse(JSON.stringify(anchorLayout));

    // Transform each object
    transformedLayout.objects = transformedLayout.objects.map(obj => {
        const transformed = { ...obj };

        // Scale position
        if (transformed.left !== undefined) {
            transformed.left = transformed.left * scaleX;
        }
        if (transformed.top !== undefined) {
            transformed.top = transformed.top * scaleY;
        }

        // Scale dimensions
        if (transformed.width !== undefined) {
            transformed.width = transformed.width * scaleX;
        }
        if (transformed.height !== undefined) {
            transformed.height = transformed.height * scaleY;
        }

        // Scale text properties
        if (transformed.type === 'textbox' || transformed.type === 'text') {
            // Scale font size proportionally (use smaller scale to prevent overflow)
            const minScale = Math.min(scaleX, scaleY);
            if (transformed.fontSize) {
                transformed.fontSize = Math.round(transformed.fontSize * minScale);
            }

            // Adjust text width for textbox
            if (transformed.type === 'textbox' && transformed.width) {
                transformed.width = transformed.width * scaleX;
            }
        }

        // Scale shape properties
        if (transformed.type === 'circle' && transformed.radius) {
            const avgScale = (scaleX + scaleY) / 2;
            transformed.radius = transformed.radius * avgScale;
        }

        if (transformed.type === 'rect') {
            if (transformed.rx) transformed.rx = transformed.rx * scaleX;
            if (transformed.ry) transformed.ry = transformed.ry * scaleY;
        }

        // Scale stroke width
        if (transformed.strokeWidth) {
            const avgScale = (scaleX + scaleY) / 2;
            transformed.strokeWidth = transformed.strokeWidth * avgScale;
        }

        return transformed;
    });

    transformedLayout.width = targetSize.width;
    transformedLayout.height = targetSize.height;

    return transformedLayout;
}

/**
 * Generate preview images from layouts using canvas
 */
export async function generatePreviewFromLayout(layout, size, masterImage) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size.width, size.height);

        // If master image exists, draw it first
        if (masterImage) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Scale to fit
                const scale = Math.min(
                    size.width / img.width,
                    size.height / img.height
                );
                const x = (size.width - img.width * scale) / 2;
                const y = (size.height - img.height * scale) / 2;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Draw layout elements on top
                drawLayoutElements(ctx, layout);

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                // Fallback: just draw layout elements
                drawLayoutElements(ctx, layout);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = masterImage;
        } else {
            // No master image, just draw layout
            drawLayoutElements(ctx, layout);
            resolve(canvas.toDataURL('image/png'));
        }
    });
}

function drawLayoutElements(ctx, layout) {
    if (!layout.objects) return;

    layout.objects.forEach(obj => {
        ctx.save();

        // Apply transformations
        if (obj.angle) {
            ctx.translate(obj.left + obj.width / 2, obj.top + obj.height / 2);
            ctx.rotate((obj.angle * Math.PI) / 180);
            ctx.translate(-(obj.left + obj.width / 2), -(obj.top + obj.height / 2));
        }

        // Draw based on type
        if (obj.type === 'rect') {
            ctx.fillStyle = obj.fill || '#000000';
            if (obj.rx && obj.ry) {
                roundRect(ctx, obj.left, obj.top, obj.width, obj.height, obj.rx);
            } else {
                ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
            }
        } else if (obj.type === 'circle') {
            ctx.fillStyle = obj.fill || '#000000';
            ctx.beginPath();
            ctx.arc(obj.left, obj.top, obj.radius, 0, 2 * Math.PI);
            ctx.fill();
        } else if (obj.type === 'text' || obj.type === 'textbox') {
            ctx.fillStyle = obj.fill || '#000000';
            ctx.font = `${obj.fontWeight || 'normal'} ${obj.fontSize || 20}px ${obj.fontFamily || 'Arial'}`;
            ctx.textAlign = obj.textAlign || 'left';

            const text = obj.text || '';
            const lines = text.split('\n');
            const lineHeight = (obj.fontSize || 20) * 1.2;

            lines.forEach((line, i) => {
                ctx.fillText(line, obj.left, obj.top + (i * lineHeight));
            });
        }

        ctx.restore();
    });
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

/**
 * Check if anchors are complete (one of each category)
 */
export function areAnchorsComplete(anchors) {
    const categories = anchors.map(a => getAspectRatioCategory(a.width, a.height));
    return ['square', 'horizontal', 'vertical'].every(cat => categories.includes(cat));
}
