"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const clips = data.clips || [];

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Produce</button>
                    <button className="toolbar-btn">⚙️</button>
                    <button className="toolbar-btn">View Prompts</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎥</span>
                Video Production
            </div>

            <div className="node-content">
                {clips.length > 0 ? (
                    <div className="clips-preview">
                        <div className="clip-thumb">
                            <video src={clips[0]} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                            <div className="count-overlay">{clips.length} Clips</div>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder">
                        {data.loading ? (
                            <div className="loader">Generating Motion...</div>
                        ) : (
                            <p>Ready for Veo 3.1</p>
                        )}
                    </div>
                )}

                <button
                    className="action-btn"
                    onClick={() => data.onGenerate(id)}
                    disabled={data.loading || clips.length > 0}
                >
                    {data.loading ? 'Producing...' : clips.length > 0 ? 'Video Production Ready' : 'Batch Generate Video (10 🪙)'}
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
                .node-container.selected { border-color: #ff3d71; }
                .node-header {
                    background: #fff0f5;
                    padding: 10px 16px;
                    border-bottom: 1px solid #ffe0e9;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ff3d71;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .clips-preview { width: 100%; position: relative; }
                .clip-thumb { width: 100%; height: 120px; border-radius: 6px; overflow: hidden; position: relative; background: #000; }
                .clip-thumb video { width: 100%; height: 100%; object-fit: cover; }
                .count-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); color: white; font-weight: 700; font-size: 1rem; pointer-events: none; }
                .placeholder { 
                    background: #fff0f5; 
                    height: 80px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #ff3d71; 
                    border-radius: 8px;
                }
                .loader { color: #ff3d71; animation: pulse 1s infinite; }
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
                .action-btn {
                    background: #ff3d71;
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                }
                .action-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
                :global(.handle-dot) { background: #ff3d71 !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
