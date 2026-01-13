"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

export default function CanvasEditor({
    size,
    masterImage,
    layoutData,
    onSave,
    onClose,
    isAnchor = false
}) {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const [zoom, setZoom] = useState(100);
    const [selectedObject, setSelectedObject] = useState(null);
    const [showClipping, setShowClipping] = useState(true);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: size.width,
            height: size.height,
            backgroundColor: '#ffffff'
        });

        fabricCanvasRef.current = canvas;

        const loadContent = async () => {
            try {
                // Load master image or layout
                if (masterImage) {
                    try {
                        const img = await fabric.Image.fromURL(masterImage, { crossOrigin: 'anonymous' });
                        // Scale image to fit canvas
                        const scale = Math.min(
                            size.width / img.width,
                            size.height / img.height
                        );

                        img.scale(scale);
                        img.set({
                            left: (size.width - img.width * scale) / 2,
                            top: (size.height - img.height * scale) / 2,
                            selectable: false,
                            evented: false
                        });

                        canvas.add(img);
                        canvas.sendObjectToBack(img);
                    } catch (err) {
                        console.error("Error loading master image:", err);
                    }
                }

                // If layout data exists (from anchor), apply it
                if (layoutData) {
                    await applyLayout(canvas, layoutData);
                } else if (!masterImage) {
                    // Only add default elements if no master image and no layout
                    addDefaultElements(canvas);
                }

                canvas.requestRenderAll();
            } catch (error) {
                console.error("Error initializing canvas content:", error);
            }
        };

        loadContent();

        // Selection events
        canvas.on('selection:created', (e) => {
            setSelectedObject(e.selected[0]);
        });

        canvas.on('selection:updated', (e) => {
            setSelectedObject(e.selected[0]);
        });

        canvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });

        return () => {
            canvas.dispose();
        };
    }, [size, masterImage, layoutData]);

    const addDefaultElements = (canvas) => {
        // Add sample text
        const title = new fabric.Textbox('YEAR-END SALE', {
            left: 50,
            top: 50,
            width: size.width - 100,
            fontSize: 48,
            fontWeight: '900',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            textAlign: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 2, offsetY: 2 })
        });

        const subtitle = new fabric.Textbox('Up to 50% OFF', {
            left: 50,
            top: 120,
            width: size.width - 100,
            fontSize: 24,
            fontWeight: '300',
            fontFamily: 'Arial',
            fill: '#ffffff',
            textAlign: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 5, offsetX: 1, offsetY: 1 })
        });

        // Add button/CTA
        const button = new fabric.Rect({
            left: size.width / 2 - 80,
            top: size.height - 80,
            width: 160,
            height: 44,
            fill: '#ffffff',
            rx: 22,
            ry: 22,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 10, offsetX: 0, offsetY: 4 })
        });

        const buttonText = new fabric.Text('Shop Now', {
            left: size.width / 2,
            top: size.height - 68,
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Arial',
            fill: '#0f172a',
            originX: 'center'
        });

        canvas.add(title, subtitle, button, buttonText);
    };

    const applyLayout = async (canvas, layout) => {
        // Apply saved layout from anchor
        if (layout.objects) {
            try {
                const objects = await fabric.util.enlivenObjects(layout.objects);
                objects.forEach(o => canvas.add(o));
                canvas.requestRenderAll();
            } catch (err) {
                console.error("Failed to restore layout:", err);
            }
        }
    };

    const handleSave = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Extract layout data
        const layoutData = {
            objects: canvas.toJSON().objects,
            width: size.width,
            height: size.height
        };

        // Generate preview image
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        onSave({
            sizeId: size.id,
            layoutData,
            preview: dataURL,
            isAnchor
        });
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    const handleAddText = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const text = new fabric.Textbox('New Text', {
            left: 100,
            top: 100,
            width: 200,
            fontSize: 20,
            fill: '#000000'
        });

        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const handleAddShape = (type) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        let shape;
        if (type === 'rect') {
            shape = new fabric.Rect({
                left: 100,
                top: 100,
                width: 150,
                height: 100,
                fill: '#3b82f6'
            });
        } else if (type === 'circle') {
            shape = new fabric.Circle({
                left: 100,
                top: 100,
                radius: 50,
                fill: '#8b5cf6'
            });
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
    };

    const handleDelete = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !selectedObject) return;

        canvas.remove(selectedObject);
        setSelectedObject(null);
    };

    return (
        <div className="editor-overlay">
            <div className="editor-container">
                {/* Header */}
                <div className="editor-header">
                    <div className="header-left">
                        <button className="back-btn" onClick={onClose}>
                            ← Back
                        </button>
                        <div className="size-info">
                            <h2>{size.name}</h2>
                            <span className="dims">{size.width} × {size.height}</span>
                            {isAnchor && <span className="anchor-badge">⭐ Anchor</span>}
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="save-btn" onClick={handleSave}>
                            Save Layout
                        </button>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="editor-body">
                    {/* Toolbar */}
                    <div className="toolbar">
                        <div className="tool-group">
                            <button className="tool-btn" onClick={handleAddText}>
                                <span className="icon">T</span>
                                Text
                            </button>
                            <button className="tool-btn" onClick={() => handleAddShape('rect')}>
                                <span className="icon">▭</span>
                                Rectangle
                            </button>
                            <button className="tool-btn" onClick={() => handleAddShape('circle')}>
                                <span className="icon">●</span>
                                Circle
                            </button>
                        </div>

                        <div className="tool-group">
                            <button
                                className={`tool-btn ${showClipping ? 'active' : ''}`}
                                onClick={() => setShowClipping(!showClipping)}
                            >
                                <span className="icon">👁️</span>
                                Clipping
                            </button>
                        </div>

                        <div className="tool-group">
                            <button
                                className="tool-btn danger"
                                onClick={handleDelete}
                                disabled={!selectedObject}
                            >
                                <span className="icon">🗑️</span>
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="canvas-area">
                        <div
                            className="canvas-wrapper"
                            style={{
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <canvas ref={canvasRef} />
                            {showClipping && (
                                <div className="clipping-overlay" style={{
                                    width: size.width,
                                    height: size.height
                                }} />
                            )}
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="properties-panel">
                        <h3>Properties</h3>

                        <div className="property-group">
                            <label>Canvas Size</label>
                            <div className="size-display">
                                {size.width} × {size.height}
                            </div>
                        </div>

                        <div className="property-group">
                            <label>Zoom</label>
                            <div className="zoom-controls">
                                <button onClick={handleZoomOut}>-</button>
                                <span>{zoom}%</span>
                                <button onClick={handleZoomIn}>+</button>
                            </div>
                        </div>

                        {selectedObject && (
                            <>
                                <div className="property-group">
                                    <label>Object Type</label>
                                    <div className="value">{selectedObject.type}</div>
                                </div>

                                {selectedObject.type === 'textbox' && (
                                    <div className="property-group">
                                        <label>Font Size</label>
                                        <input
                                            type="number"
                                            value={selectedObject.fontSize || 20}
                                            onChange={(e) => {
                                                selectedObject.set('fontSize', parseInt(e.target.value));
                                                fabricCanvasRef.current?.renderAll();
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {isAnchor && (
                            <div className="anchor-info">
                                <h4>⭐ Anchor Mode</h4>
                                <p>This layout will be used as a template for similar aspect ratios.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .editor-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #0f172a;
                    z-index: 1000;
                }

                .editor-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .editor-header {
                    background: #1e293b;
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #334155;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-btn {
                    background: #334155;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .size-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .size-info h2 {
                    margin: 0;
                    color: white;
                    font-size: 1.2rem;
                }

                .dims {
                    color: #94a3b8;
                    font-size: 0.9rem;
                }

                .anchor-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .save-btn {
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .editor-body {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .toolbar {
                    width: 80px;
                    background: #1e293b;
                    border-right: 1px solid #334155;
                    padding: 16px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .tool-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tool-btn {
                    background: #334155;
                    color: white;
                    border: none;
                    padding: 12px 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.7rem;
                    transition: all 0.2s;
                }

                .tool-btn:hover {
                    background: #475569;
                }

                .tool-btn.active {
                    background: #8b5cf6;
                }

                .tool-btn.danger {
                    background: #dc2626;
                }

                .tool-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .icon {
                    font-size: 1.2rem;
                }

                .canvas-area {
                    flex: 1;
                    background: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: auto;
                    position: relative;
                }

                .canvas-wrapper {
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .clipping-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    box-shadow: inset 0 0 0 2px #ef4444;
                }

                .properties-panel {
                    width: 280px;
                    background: #1e293b;
                    border-left: 1px solid #334155;
                    padding: 24px;
                    overflow-y: auto;
                }

                .properties-panel h3 {
                    margin: 0 0 20px 0;
                    color: white;
                    font-size: 1.1rem;
                }

                .property-group {
                    margin-bottom: 20px;
                }

                .property-group label {
                    display: block;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    margin-bottom: 8px;
                }

                .size-display, .value {
                    color: white;
                    font-size: 0.95rem;
                }

                .zoom-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .zoom-controls button {
                    background: #334155;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.2rem;
                }

                .zoom-controls span {
                    color: white;
                    font-weight: 600;
                }

                .property-group input {
                    width: 100%;
                    background: #334155;
                    border: 1px solid #475569;
                    color: white;
                    padding: 8px;
                    border-radius: 6px;
                }

                .anchor-info {
                    margin-top: 24px;
                    padding: 16px;
                    background: #fef3c7;
                    border-radius: 8px;
                }

                .anchor-info h4 {
                    margin: 0 0 8px 0;
                    color: #92400e;
                    font-size: 0.95rem;
                }

                .anchor-info p {
                    margin: 0;
                    color: #92400e;
                    font-size: 0.85rem;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
