"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const frames = data.frames || [];

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Split</button>
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">✂️</span>
                HD Frame Restoration
            </div>

            <div className="node-content">
                {frames.length > 0 ? (
                    <div className="frames-grid-wrapper">
                        <div className="frames-grid">
                            {frames.map((frame, i) => (
                                <div key={i} className="frame-box" onClick={() => data.onExpand && data.onExpand(frame)}>
                                    <img src={frame} alt={`KF ${i + 1}`} />
                                    <span className="kf-label">KF {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="placeholder">
                        {data.loading ? (
                            <div className="loader">Restoring 9 Parallel KFs...</div>
                        ) : (
                            <p>Ready for HD Restoration</p>
                        )}
                    </div>
                )}

                <div className="node-actions">
                    <button
                        className="action-btn"
                        onClick={() => data.onGenerate(id)}
                        disabled={data.loading}
                    >
                        {data.loading ? 'Restoring...' : frames.length > 0 ? 'Regenerate HD Frames' : 'Restore HD Keyframes (9 🪙)'}
                    </button>
                </div>
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
                .node-container.selected { border-color: #00c2ff; }
                .node-header {
                    background: #e0faff;
                    padding: 10px 16px;
                    border-bottom: 1px solid #c7f2fe;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #0099cc;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .frames-grid-wrapper { max-height: 200px; overflow-y: auto; padding-right: 4px; }
                .frames-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .frame-box { position: relative; border-radius: 6px; overflow: hidden; background: #000; cursor: pointer; aspect-ratio: 16/9; }
                .frame-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
                .frame-box:hover img { transform: scale(1.1); }
                .kf-label { position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; font-size: 0.5rem; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
                .placeholder { 
                    background: #f0faff; 
                    height: 80px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #0099cc; 
                    border-radius: 8px;
                }
                .loader { color: #00c2ff; animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
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
                    background: #00c2ff;
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                }
                .action-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
                :global(.handle-dot) { background: #00c2ff !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
