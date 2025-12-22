"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    return (
        <div className={`node-container gen-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Generate</button>
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎬</span>
                Video Generator
            </div>

            <div className="node-content">
                <div className="input-group">
                    <label>Motion Prompt (Editable)</label>
                    <textarea
                        className="prompt-input"
                        placeholder="Describe camera movement or motion..."
                        value={data.prompt || ''}
                        onChange={(e) => data.onDataChange(id, { prompt: e.target.value })}
                        rows={2}
                    />
                </div>

                {data.output ? (
                    <div className="output-wrapper" onClick={() => data.onExpand && data.onExpand(data.output)}>
                        <video src={data.output} className="gen-media" autoPlay muted loop />
                        <div className="expand-hint">Click to Save / View</div>
                    </div>
                ) : (
                    <div className="gen-placeholder">
                        {data.loading ? (
                            <div className="spinner" />
                        ) : (
                            <p>Connect image to generate</p>
                        )}
                    </div>
                )}

                {data.usedPrompt && (
                    <div className="used-prompt-section">
                        <label>Generated with Prompt:</label>
                        <p>{data.usedPrompt}</p>
                    </div>
                )}

                <button
                    className="action-btn"
                    onClick={() => data.onGenerate(id)}
                    disabled={data.loading}
                >
                    {data.loading ? 'Generating...' : 'Generate Video'}
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
                    border-color: #ec4899;
                }
                .node-header {
                    background: #fdf2f8;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #ec4899;
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
                .input-group label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .prompt-input {
                    width: 100%;
                    min-height: 50px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px;
                    font-size: 0.8rem;
                    font-family: inherit;
                    resize: vertical;
                    outline: none;
                    background: #fdfbff;
                }
                .prompt-input:focus {
                    border-color: #ec4899;
                    background: white;
                }
                .output-wrapper {
                    height: 150px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f8fafc;
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: 1px solid #e2e8f0;
                }
                .output-wrapper:hover {
                    transform: scale(1.02);
                }
                .expand-hint {
                    position: absolute;
                    inset: 0;
                    background: rgba(236, 72, 153, 0.4);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .output-wrapper:hover .expand-hint {
                    opacity: 1;
                }
                .used-prompt-section {
                    background: #f8fafc;
                    padding: 10px;
                    border-radius: 8px;
                    border-left: 3px solid #ec4899;
                }
                .used-prompt-section label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #ec4899;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .used-prompt-section p {
                    margin: 0;
                    font-size: 0.75rem;
                    color: #475569;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
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
                    background: #ec4899;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .action-btn:hover {
                    background: #db2777;
                }
                .action-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #ec4899;
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
                .toolbar-btn.delete:hover {
                    background: #ef4444;
                    color: white;
                }
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #ec4899 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
