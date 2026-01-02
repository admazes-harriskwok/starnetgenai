"use client";
import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const [text, setText] = useState(data.text || '');
    const [aiInput, setAiInput] = useState('');

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

            <div className="ai-input-bar">
                <div className="input-top">
                    <div className="ref-image-mini">
                        <img src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=50" alt="ref" />
                        <span className="badge">1</span>
                    </div>
                </div>
                <div className="input-middle">
                    <textarea
                        className="ai-chat-input"
                        placeholder={data.aiPlaceholder || "Explain your objective or press '/' for commands..."}
                        rows={2}
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                    />
                </div>
                <div className="input-bottom">
                    <div className="model-selector">
                        <span className="g-icon">G</span>
                        Gemini 2.5 Flash Lite
                        <span className="chevron">⌄</span>
                    </div>
                    <div className="actions-right">
                        <span className="ratio-text">1x</span>
                        <div className="credit-cost">
                            <span className="coin">🪙</span>
                            1
                        </div>
                        <button className="send-btn" onClick={() => {
                            data.onGenerate(id, aiInput);
                            setAiInput('');
                        }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 16px;
                    width: 280px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    color: #0f172a;
                    padding: 8px;
                }
                .node-container.selected {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .node-header {
                    padding: 6px 10px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #3b82f6;
                    text-transform: uppercase;
                    background: #eff6ff;
                    border-radius: 8px;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .node-content {
                    padding: 4px;
                    background: #f8fafc;
                    border-radius: 12px;
                    margin-bottom: 8px;
                }
                .text-input {
                    width: 100%;
                    min-height: 120px;
                    border: none;
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 0.9rem;
                    font-family: inherit;
                    resize: none;
                    outline: none;
                    background: transparent;
                    color: #1e293b;
                    line-height: 1.5;
                }
                
                .ai-input-bar {
                    background: white;
                    border-radius: 14px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    border: 1px solid #e2e8f0;
                }
                .input-top {
                    display: flex;
                    align-items: center;
                }
                .ref-image-mini {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    overflow: visible;
                    border: 1px solid #e2e8f0;
                }
                .ref-image-mini img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 6px;
                }
                .ref-image-mini .badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #3b82f6;
                    color: white;
                    font-size: 0.6rem;
                    width: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-weight: 800;
                }
                .ai-chat-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: #1e293b;
                    font-size: 0.85rem;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    line-height: 1.4;
                }
                .input-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 8px;
                }
                .model-selector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: #64748b;
                    cursor: pointer;
                }
                .g-icon {
                    background: #f1f5f9;
                    color: #3b82f6;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 0.6rem;
                    font-weight: 900;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ratio-text { font-size: 0.75rem; color: #94a3b8; }
                .credit-cost {
                    background: #f8fafc;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                }
                .send-btn {
                    background: #0f172a;
                    color: white;
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
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
