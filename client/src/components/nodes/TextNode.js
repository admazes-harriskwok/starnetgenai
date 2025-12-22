"use client";
import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const [text, setText] = useState(data.text || '');

    const handleChange = (e) => {
        setText(e.target.value);
        if (data.onDataChange) {
            data.onDataChange(id, { text: e.target.value });
        }
    };

    return (
        <div className={`node-container text-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">💬</span>
                Text / Prompt
            </div>

            <div className="node-content">
                <textarea
                    value={text}
                    onChange={handleChange}
                    placeholder="Enter prompt or text content..."
                    className="text-input"
                />
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 14px;
                    width: 240px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }
                .node-container.selected {
                    border-color: #3b82f6;
                    transform: scale(1.02);
                }
                .node-header {
                    background: #eff6ff;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-transform: uppercase;
                    border-radius: 14px 14px 0 0;
                }
                .node-content {
                    padding: 12px;
                }
                .text-input {
                    width: 100%;
                    min-height: 80px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px;
                    font-size: 0.85rem;
                    font-family: inherit;
                    resize: none;
                    outline: none;
                }
                .text-input:focus {
                    border-color: #3b82f6;
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
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #3b82f6 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
