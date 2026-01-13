"use client";
import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const [text, setText] = useState(data.text || '');

    // Sync local state when external data changes
    useEffect(() => {
        if (data.text !== undefined) {
            setText(data.text || '');
        }
    }, [data.text]);

    const handleChange = (e) => {
        setText(e.target.value);
        if (data.onDataChange) {
            data.onDataChange(id, { text: e.target.value });
        }
    };

    return (
        <div className={`node-container input-text-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            {/* Input Handle (Optional, if we want to allow chaining) */}
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">📝</span>
                {data.label || 'Input Text'}
            </div>

            <div className="node-content">
                <textarea
                    value={text}
                    onChange={handleChange}
                    placeholder={data.placeholder || "Type your text here..."}
                    className="text-input"
                    rows={4}
                />
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 12px;
                    width: 260px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .node-container.input-text-node {
                    border-left: 5px solid #10b981; /* Green accent for Input */
                }
                .node-container.selected {
                    border-color: #10b981;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
                }

                .node-header {
                    background: #ecfdf5;
                    padding: 8px 12px;
                    border-bottom: 1px solid #d1fae5;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #059669;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-transform: uppercase;
                }

                .node-content {
                    padding: 12px;
                }

                .text-input {
                    width: 100%;
                    min-height: 80px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 0.85rem;
                    resize: vertical;
                    font-family: inherit;
                    outline: none;
                    color: #334155;
                }
                .text-input:focus {
                    border-color: #10b981;
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
                .toolbar-btn.delete:hover {
                    background: #ef4444;
                    color: white;
                }

                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #10b981 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
