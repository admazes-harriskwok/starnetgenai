"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { getDisplayName } from '../../lib/models';

export default memo(({ id, data, selected }) => {
    return (
        <div className={`node-container gen-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Generate</button>
                    {data.output && (
                        <button className="toolbar-btn" onClick={() => data.onExpand && data.onExpand(data.output)}>
                            ⛶ Zoom
                        </button>
                    )}
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎬</span>
                Video Generator
            </div>

            <div className="node-content">
                {data.output ? (
                    <div className="output-wrapper" onClick={() => data.onExpand && data.onExpand(data.output)}>
                        <video
                            src={data.output}
                            className="gen-media"
                            autoPlay
                            muted
                            loop
                            onError={(e) => {
                                e.target.style.display = 'none';
                                console.warn("Video failed to load in AIVideoNode:", data.output);
                            }}
                        />
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

                <div className="ai-input-bar">
                    <div className="input-top">
                        <button className="tool-btn-square">
                            <span className="plus">+</span>
                            Motion
                        </button>
                        <button className="tool-btn-square mag">
                            <span className="wand">🪄</span>
                        </button>
                        {data.refImage && (
                            <div className="ref-image-mini">
                                <img src={data.refImage} alt="ref" />
                                <span className="badge">1</span>
                            </div>
                        )}
                    </div>
                    <div className="input-middle">
                        <textarea
                            className="ai-chat-input"
                            placeholder={data.aiPlaceholder || "Describe camera movement or motion..."}
                            rows={2}
                            value={data.prompt || ''}
                            onChange={(e) => data.onDataChange(id, { prompt: e.target.value })}
                        />
                    </div>
                    <div className="input-bottom">
                        <div className="model-selector" onClick={() => data.onModelToggle(id, data.model || 'veo-2.0-generate-001')}>
                            <span className="g-icon">V</span>
                            {getDisplayName(data.model || 'veo-2.0-generate-001')}
                            <span className="chevron">⌄</span>
                        </div>
                        <div className="actions-right">
                            <div className="credit-cost">
                                <span className="coin">🪙</span>
                                10
                            </div>
                            <button className="send-btn" onClick={() => data.onGenerate(id, data.prompt)}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {data.usedPrompt && (
                    <div className="used-prompt-section">
                        <label>Generated with Prompt:</label>
                        <p>{data.usedPrompt}</p>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 20px;
                    width: 320px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    color: #1e293b;
                    padding: 8px;
                }
                .node-container.selected {
                    border-color: #ff3d71;
                    box-shadow: 0 0 0 4px rgba(255, 61, 113, 0.1);
                }
                .node-header {
                    padding: 6px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #ff3d71;
                    text-transform: uppercase;
                    background: #fff0f5;
                    border-radius: 10px;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .node-content {
                    padding: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .output-wrapper {
                    height: 180px;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #f8fafc;
                    position: relative;
                    cursor: pointer;
                    border: 1px solid #e2e8f0;
                }
                .gen-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .expand-hint {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 61, 113, 0.1);
                    backdrop-filter: blur(4px);
                    color: #ff3d71;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .output-wrapper:hover .expand-hint { opacity: 1; }
                
                .gen-placeholder {
                    height: 120px;
                    border-radius: 16px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    border: 1px dashed #e2e8f0;
                }

                .ai-input-bar {
                    background: white;
                    border-radius: 18px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border: 1px solid #e2e8f0;
                }
                .input-top {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tool-btn-square {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    padding: 6px 10px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    min-width: 48px;
                    transition: all 0.2s;
                }
                .tool-btn-square:hover {
                    border-color: #ff3d71;
                    color: #ff3d71;
                }
                .tool-btn-square.mag {
                    padding: 10px;
                    justify-content: center;
                }
                .tool-btn-square .plus { font-size: 1rem; margin-bottom: -2px; }
                .tool-btn-square .wand { font-size: 1.1rem; }

                .ref-image-mini {
                    position: relative;
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    margin-left: auto;
                    border: 1px solid #e2e8f0;
                }
                .ref-image-mini img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .ref-image-mini .badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #ff3d71;
                    color: white;
                    font-size: 0.6rem;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 1px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
                    padding-top: 10px;
                }
                .model-selector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: #64748b;
                    cursor: pointer;
                }
                .g-icon {
                    background: #fff0f5;
                    color: #ff3d71;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 900;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .credit-cost {
                    background: #f8fafc;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                }
                .send-btn {
                    background: #ff3d71;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #ff3d71;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .used-prompt-section {
                    background: #f8fafc;
                    padding: 10px;
                    border-radius: 12px;
                    border-left: 3px solid #ff3d71;
                    margin-top: 4px;
                }
                .used-prompt-section label {
                    display: block;
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #ff3d71;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }
                .used-prompt-section p {
                    margin: 0;
                    font-size: 0.7rem;
                    color: #64748b;
                    line-height: 1.4;
                }

                .toolbar-wrapper {
                    display: flex;
                    gap: 4px;
                    background: #0f172a;
                    padding: 4px;
                    border-radius: 8px;
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
                .toolbar-btn.delete:hover { background: #ef4444; }
                :global(.handle-dot) {
                    width: 12px !important;
                    height: 12px !important;
                    background: #ec4899 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
