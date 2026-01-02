"use client";
import React, { memo, useRef } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && data.onImageUpload) {
            data.onImageUpload(id, file);
        }
    };

    const onBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={`node-container media-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={onBoxClick}>
                        {data.image || data.video ? 'Replace' : 'Upload'}
                    </button>
                    {(data.image || data.video) && (
                        <button className="toolbar-btn" onClick={() => data.onExpand && data.onExpand(data.image || data.video)}>
                            ⛶ Zoom
                        </button>
                    )}
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>

            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">📂</span>
                Media Asset
            </div>

            <div className="node-content">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />

                {data.image || data.video ? (
                    <div className="preview-wrapper" onClick={onBoxClick}>
                        {data.video ? (
                            <video src={data.video} className="preview-media" autoPlay muted loop />
                        ) : (
                            <img src={data.image} alt="Media" className="preview-media" />
                        )}
                    </div>
                ) : (
                    <div className="upload-zone" onClick={onBoxClick}>
                        <span className="up-icon">＋</span>
                        <p>Add Media</p>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 14px;
                    width: 200px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    overflow: hidden;
                }
                .node-container.selected {
                    border-color: #f97316;
                    transform: scale(1.02);
                }
                .node-header {
                    background: #fff7ed;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #f97316;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .node-content {
                    padding: 12px;
                }
                .upload-zone {
                    border: 2px dashed #e2e8f0;
                    border-radius: 10px;
                    height: 120px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #94a3b8;
                    transition: all 0.2s;
                }
                .upload-zone:hover {
                    border-color: #f97316;
                    background: #fffaf5;
                    color: #f97316;
                }
                .preview-wrapper {
                    border-radius: 8px;
                    overflow: hidden;
                    height: 120px;
                    cursor: pointer;
                }
                .preview-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .toolbar-wrapper {
                    display: flex;
                    gap: 4px;
                    background: #0f172a;
                    padding: 4px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    margin-bottom: 8px;
                }
                .toolbar-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .toolbar-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                .toolbar-btn.delete:hover {
                    background: #ef4444;
                    color: white;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #f97316 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
