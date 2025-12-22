"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Generate</button>
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎨</span>
                Storyboard Generator
            </div>

            <div className="node-content">
                {data.output ? (
                    <div className="output-preview" onClick={() => data.onExpand && data.onExpand(data.output)}>
                        <img src={data.output} alt="Storyboard Grid" className="storyboard-img" />
                        <div className="expand-hint">Click to Expand</div>
                    </div>
                ) : (
                    <div className="placeholder">
                        {data.loading ? (
                            <div className="loader">Rendering 3x3 Grid...</div>
                        ) : (
                            <p>Waiting for Director's Script</p>
                        )}
                    </div>
                )}

                <div className="prompt-section">
                    <label>Grid Prompt (Editable)</label>
                    <textarea
                        className="prompt-editor"
                        value={data.prompt || ''}
                        onChange={(e) => data.onDataChange(id, { prompt: e.target.value })}
                        placeholder="Define visual style/continuity here..."
                    />
                </div>

                <button
                    className="action-btn"
                    onClick={() => data.onGenerate(id)}
                    disabled={data.loading}
                >
                    {data.loading ? 'Generating...' : data.output ? 'Regenerate Storyboard' : 'Generate Storyboard (4 🪙)'}
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
                .node-container.selected { border-color: #785df2; }
                .node-header {
                    background: #f0f4ff;
                    padding: 10px 16px;
                    border-bottom: 1px solid #e0e7ff;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .output-preview { 
                    width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; 
                    position: relative; cursor: pointer; transition: all 0.2s;
                }
                .output-preview:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .expand-hint {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white;
                    display: flex; align-items: center; justify-content: center; font-size: 0.75rem; 
                    font-weight: 700; opacity: 0; transition: opacity 0.2s;
                }
                .output-preview:hover .expand-hint { opacity: 1; }
                .storyboard-img { width: 100%; height: 160px; object-fit: cover; }
                .placeholder { 
                    background: #f8f9fa; 
                    height: 80px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #999; 
                    border-radius: 8px;
                }
                .loader { color: #785df2; animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                
                .prompt-section { margin-top: 8px; }
                .prompt-section label { display: block; font-size: 0.65rem; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 4px; }
                .prompt-editor {
                    width: 100%;
                    min-height: 60px;
                    border: 1px solid #e0e7ff;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 0.75rem;
                    color: #444;
                    background: #fbfbff;
                    resize: vertical;
                    font-family: inherit;
                    outline: none;
                }
                .prompt-editor:focus { border-color: #785df2; background: white; }

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

                .action-btn {
                    background: linear-gradient(90deg, #785df2 0%, #df58b3 100%);
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                }
                .action-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
                :global(.handle-dot) { background: #785df2 !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
