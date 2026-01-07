"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { getDisplayName } from '../../../lib/models';

export default memo(({ id, data, selected }) => {
    const analysis = data.analysis;

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
                <div className="instruction-box">
                    <label>Analysis Instructions (Editable)</label>
                    <textarea
                        className="instruction-input"
                        placeholder="Special instructions for Director AI..."
                        value={data.prompt || ''}
                        onChange={(e) => data.onDataChange(id, { prompt: e.target.value })}
                        rows={data.analysis ? 2 : 5}
                    />
                </div>

                {data.loading ? (
                    <div className="placeholder">
                        <div className="loader">Analyzing Scene...</div>
                    </div>
                ) : analysis ? (
                    <div className="analysis-result">
                        <div className="section">
                            <label>📽️ Generated Director Script</label>
                            <textarea
                                className="script-editor"
                                value={analysis.full_text || ''}
                                onChange={(e) => data.onDataChange(id, {
                                    analysis: { ...analysis, full_text: e.target.value }
                                })}
                                placeholder="The full director's script..."
                            />
                        </div>

                        {analysis.keyframes && analysis.keyframes.length > 0 && (
                            <div className="section">
                                <label>🎬 Extracted Keyframes</label>
                                <div className="keyframes-summary">
                                    {analysis.keyframes.slice(0, 3).map((kf, i) => (
                                        <div key={i} className="kf-mini-row">
                                            <span className="kf-idx">{i + 1}</span>
                                            <div className="kf-details">
                                                <p className="kf-action">{kf.action}</p>
                                                <p className="kf-camera">{kf.camera}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {analysis.keyframes.length > 3 && (
                                        <div className="kf-more">...and {analysis.keyframes.length - 3} more shots</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="compact-meta">
                            <div className="meta-item">
                                <label>Theme</label>
                                <span>{analysis.theme || 'Proposing...'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder">
                        <p>Ready to Analyze Reference</p>
                    </div>
                )}

                <div className="node-actions">
                    <button
                        className="action-btn"
                        onClick={() => data.onGenerate(id)}
                        disabled={data.loading}
                    >
                        {data.loading ? 'Generating...' : analysis ? 'Regenerate Analysis' : 'Run Director AI (1 🪙)'}
                    </button>
                    <div className="model-badge">
                        <span className="dot"></span>
                        AI Engine: {getDisplayName(data.model || 'gemini-3-flash')}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .model-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: #94A3B8;
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid #f1f5f9;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .model-badge .dot {
                    width: 6px;
                    height: 6px;
                    background: #10B981;
                    border-radius: 50%;
                }
                .node-container {
                    background: white;
                    border-radius: 12px;
                    width: 320px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .node-container.selected { border-color: #ff6b3d; }
                .node-header {
                    background: #fff5f0;
                    padding: 10px 16px;
                    border-bottom: 1px solid #ffe8db;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #ff6b3d;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .placeholder { 
                    background: #fdfdfd; 
                    border: 1px dashed #eee; 
                    min-height: 120px; 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #94A3B8; 
                    border-radius: 8px;
                    text-align: center;
                    padding: 12px;
                    gap: 12px;
                }
                .instruction-box { width: 100%; text-align: left; }
                .instruction-box label { font-size: 0.6rem; font-weight: 800; color: #ff6b3d; text-transform: uppercase; display: block; margin-bottom: 4px; }
                .instruction-input {
                    width: 100%;
                    min-height: 50px;
                    background: #fff;
                    border: 1px solid #ffe8db;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 0.75rem;
                    color: #333;
                    outline: none;
                    resize: vertical;
                    font-family: inherit;
                }
                .instruction-input:focus { border-color: #ff6b3d; }
                .loader { color: #ff6b3d; animation: pulse 1s infinite; font-weight: 600; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                
                .analysis-result { display: flex; flex-direction: column; gap: 12px; }
                .section label { display: block; font-weight: 700; font-size: 0.65rem; color: #94A3B8; text-transform: uppercase; margin-bottom: 6px; }
                
                .script-editor {
                    width: 100%;
                    min-height: 200px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 0.8rem;
                    line-height: 1.5;
                    color: #1A1C1E;
                    resize: vertical;
                    font-family: 'DM Sans', sans-serif;
                    outline: none;
                }
                .script-editor:focus { border-color: #ff6b3d; background: white; }

                .compact-meta {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 12px;
                    background: #f1f5f9;
                    padding: 10px;
                    border-radius: 8px;
                }
                .keyframes-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    background: #f8fafc;
                    padding: 8px;
                    border-radius: 8px;
                }
                .kf-mini-row {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #edf2f7;
                }
                .kf-mini-row:last-child { border-bottom: none; }
                .kf-idx {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #ff6b3d;
                    background: #fff5f0;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    margin-top: 2px;
                }
                .kf-details { flex: 1; pointer-events: none; }
                .kf-action { font-size: 0.75rem; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.2; }
                .kf-camera { font-size: 0.65rem; color: #64748b; margin: 2px 0 0 0; font-style: italic; }
                .kf-more { font-size: 0.65rem; color: #94a3b8; text-align: center; margin-top: 4px; font-weight: 600; }

                .meta-item { display: flex; flex-direction: column; gap: 2px; }
                .meta-item label { font-size: 0.6rem; font-weight: 800; color: #64748B; text-transform: uppercase; }
                .meta-item span { font-size: 0.75rem; font-weight: 600; color: #1A1C1E; }

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
                .toolbar-btn:hover { background: rgba(255,255,255,0.1); }
                .toolbar-btn.delete:hover {
                    background: #ef4444;
                    color: white;
                }
                
                .node-actions { margin-top: 8px; }
                .action-btn {
                    background: linear-gradient(135deg, #ff9a5a, #ff5e3a);
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    width: 100%;
                    box-shadow: 0 4px 10px rgba(255, 107, 61, 0.2);
                    transition: all 0.2s;
                }
                .action-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255, 107, 61, 0.3); }
                .action-btn:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; box-shadow: none; }
                :global(.handle-dot) { background: #ff6b3d !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
