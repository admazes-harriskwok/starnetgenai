"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    return (
        <div className={`node-container gen-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Generate</button>
                    <button className="toolbar-btn">⚙️</button>
                    <button className="toolbar-btn">View Prompt</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🖼️</span>
                Image Generator
            </div>

            <div className="node-content">
                {data.output ? (
                    <div className="output-wrapper">
                        <img src={data.output} alt="Generated" className="gen-media" />
                    </div>
                ) : (
                    <div className="gen-placeholder">
                        {data.loading ? (
                            <div className="spinner" />
                        ) : (
                            <p>Connect prompt to generate</p>
                        )}
                    </div>
                )}

                <button
                    className="action-btn"
                    onClick={() => data.onGenerate(id)}
                    disabled={data.loading}
                >
                    {data.loading ? 'Generating...' : 'Generate Image'}
                </button>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 14px;
                    width: 260px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }
                .node-container.selected {
                    border-color: #8b5cf6;
                }
                .node-header {
                    background: #f5f3ff;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #8b5cf6;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-transform: uppercase;
                    border-radius: 14px 14px 0 0;
                }
                .node-content {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .output-wrapper {
                    height: 150px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f8fafc;
                }
                .gen-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .gen-placeholder {
                    height: 150px;
                    border-radius: 8px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    font-size: 0.8rem;
                    border: 1px solid #e2e8f0;
                }
                .action-btn {
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .action-btn:hover {
                    background: #7c3aed;
                }
                .action-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #8b5cf6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
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
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #8b5cf6 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
