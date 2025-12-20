"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const analysis = data.analysis;

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Analyze</button>
                    <button className="toolbar-btn">⚙️</button>
                    <button className="toolbar-btn">View Prompt</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎬</span>
                Director AI Breakdown
            </div>

            <div className="node-content">
                {!analysis ? (
                    <div className="placeholder">
                        {data.loading ? (
                            <div className="loader">Analyzing Scene...</div>
                        ) : (
                            <p>Waiting for Reference Image</p>
                        )}
                    </div>
                ) : (
                    <div className="analysis-result">
                        <div className="section">
                            <label>Storyboard Prompt</label>
                            <textarea
                                className="prompt-editor"
                                value={analysis.contact_sheet_description || ''}
                                onChange={(e) => data.onDataChange(id, {
                                    analysis: { ...analysis, contact_sheet_description: e.target.value }
                                })}
                                placeholder="Edit the visual style or scene details here..."
                            />
                        </div>
                        <div className="section">
                            <label>Keyframe Prompts (Edit for Video)</label>
                            <div className="keyframes-editor">
                                {analysis.keyframes?.map((kf, idx) => (
                                    <div key={idx} className="kf-row">
                                        <span className="kf-idx">{idx + 1}</span>
                                        <input
                                            type="text"
                                            className="kf-input"
                                            value={kf.action || ''}
                                            onChange={(e) => {
                                                const newKFs = [...analysis.keyframes];
                                                newKFs[idx] = { ...kf, action: e.target.value };
                                                data.onDataChange(id, { analysis: { ...analysis, keyframes: newKFs } });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className="action-btn"
                    onClick={() => data.onGenerate(id)}
                    disabled={data.loading || analysis}
                >
                    {data.loading ? 'Generating Analysis...' : analysis ? 'Analysis Complete' : 'Run Director AI'}
                </button>
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
                .node-container.selected { border-color: #ff6b3d; }
                .node-header {
                    background: #fff5f0;
                    padding: 10px 16px;
                    border-bottom: 1px solid #ffe8db;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ff6b3d;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .placeholder { 
                    background: #fdfdfd; 
                    border: 1px dashed #eee; 
                    height: 80px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #999; 
                    border-radius: 8px;
                }
                .loader { color: #ff6b3d; animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                .analysis-result { font-size: 0.8rem; color: #444; }
                .section { margin-bottom: 8px; }
                .section label { display: block; font-weight: 700; font-size: 0.7rem; color: #888; text-transform: uppercase; margin-bottom: 2px; }
                .badge { background: #ff6b3d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; }
                .prompt-editor {
                    width: 100%;
                    min-height: 80px;
                    background: #fdfdfd;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 0.75rem;
                    color: #444;
                    resize: vertical;
                    font-family: inherit;
                    outline: none;
                }
                .prompt-editor:focus {
                    border-color: #ff6b3d;
                }
                .keyframes-editor {
                    max-height: 120px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding-right: 4px;
                }
                .kf-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fcfcfc;
                    padding: 4px 6px;
                    border-radius: 4px;
                    border: 1px solid #f0f0f0;
                }
                .kf-idx {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #ff6b3d;
                    min-width: 14px;
                }
                .kf-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 0.7rem;
                    color: #555;
                    outline: none;
                }
                .kf-input:focus { color: #000; }
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
                .action-btn {
                    background: #ff6b3d;
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                }
                .action-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
                :global(.handle-dot) { background: #ff6b3d !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
