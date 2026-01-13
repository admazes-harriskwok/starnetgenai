"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { getDisplayName } from '../../../lib/models';

export default memo(({ id, data, selected }) => {
    // 1. Initialize templatePrompt if missing (to preserve the original system instruction)
    React.useEffect(() => {
        if (!data.templatePrompt && data.prompt) {
            data.onDataChange(id, { templatePrompt: data.prompt });
        }
    }, []);

    const analysis = data.analysis;

    // 2. Handler for User Input (Bottom Box)
    const handleUserInput = (text) => {
        const base = data.templatePrompt || data.prompt || '';
        // Create combined prompt: Base Template + User Input
        const newPrompt = text.trim()
            ? `${base}\n\n# User Instructions\n${text}`
            : base;

        data.onDataChange(id, {
            userInput: text,
            prompt: newPrompt
        });
    };

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Analyze</button>
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎬</span>
                {data.label || 'Director AI Breakdown'}
            </div>

            <div className="node-content">
                {/* 1. Upper Box: Analysis Result (Square-ish) */}
                <div className="output-section">
                    {data.loading ? (
                        <div className="placeholder loading-state">
                            <div className="loader">Generative Thinking...</div>
                        </div>
                    ) : analysis ? (
                        <div className="analysis-result">
                            <textarea
                                className="script-editor"
                                value={analysis.full_text || ''}
                                onChange={(e) => data.onDataChange(id, {
                                    analysis: { ...analysis, full_text: e.target.value }
                                })}
                                placeholder="Generated concepts..."
                            />
                        </div>
                    ) : (
                        <div className="placeholder">
                            <p className="placeholder-text">Output will appear here...</p>
                        </div>
                    )}
                </div>

                {/* 2. Middle: Actions & Metadata */}
                <div className="node-actions-row">
                    <div className="model-badge">
                        <span className="dot"></span>
                        {getDisplayName(data.model || 'gemini-3-flash')}
                    </div>
                </div>

                {/* 3. Bottom Box: User Input (Rectangle) */}
                <div className="user-input-section">
                    <div className="input-wrapper">
                        <textarea
                            className="user-input-field"
                            placeholder="Prompt word to generate..."
                            value={data.userInput || ''}
                            onChange={(e) => handleUserInput(e.target.value)}
                            rows={2}
                        />
                        <button
                            className="run-icon-btn"
                            onClick={() => data.onGenerate(id)}
                            disabled={data.loading}
                            title="Run Analysis"
                        >
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
                    border-radius: 14px;
                    width: 340px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    color: #0f172a;
                    font-family: 'Inter', sans-serif;
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
                    padding: 0; 
                    display: flex; 
                    flex-direction: column; 
                }

                /* Upper Box Styles */
                .output-section {
                    padding: 12px;
                    background: #ffffff;
                    min-height: 200px;
                }
                
                .script-editor {
                    width: 100%;
                    min-height: 180px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px;
                    color: #334155;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    resize: vertical;
                    outline: none;
                }
                .script-editor:focus {
                    border-color: #f97316;
                    background: white;
                }
                .script-editor::placeholder { color: #94a3b8; }

                .placeholder {
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed #e2e8f0;
                    border-radius: 8px;
                    color: #94a3b8;
                    font-size: 0.8rem;
                    background: #f8fafc;
                }
                .loading-state { border-color: #f97316; background: #fffaf5; }
                .loader { color: #f97316; animation: pulse 1s infinite; font-weight: 600; }

                .node-actions-row {
                    padding: 6px 12px;
                    background: #ffffff;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                }

                .model-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 12px;
                }
                .dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; }

                /* Bottom Box Styles (Input) */
                .user-input-section {
                    padding: 12px;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }
                
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    background: white;
                    border-radius: 12px;
                    padding: 8px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                
                .user-input-field {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #1e293b;
                    font-size: 0.85rem;
                    outline: none;
                    resize: none;
                    min-height: 40px;
                    max-height: 100px;
                    padding: 4px;
                    font-family: inherit;
                    line-height: 1.4;
                }
                .user-input-field::placeholder { color: #94a3b8; }

                .run-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #0f172a;
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    margin-left: 8px;
                    flex-shrink: 0;
                }
                .run-icon-btn:hover:not(:disabled) { 
                    background: #f97316;
                    transform: translateY(-1px);
                }
                .run-icon-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #cbd5e1; }

                /* Toolbar */
                 .toolbar-wrapper {
                    display: flex;
                    gap: 4px;
                    background: #0f172a;
                    padding: 4px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .toolbar-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 4px 8px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .toolbar-btn:hover { background: rgba(255,255,255,0.1); }
                .handle-dot { 
                    background: #f97316 !important; 
                    border: 2px solid white !important; 
                    width: 10px !important;
                    height: 10px !important;
                }
            `}</style>
        </div>
    );
});
