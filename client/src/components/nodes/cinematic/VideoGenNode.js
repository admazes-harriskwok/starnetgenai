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
                    <div className="clips-grid-wrapper">
                        <div className="clips-grid">
                            {clips.map((clip, i) => (
                                <div key={i} className="clip-box" onClick={() => data.onExpand && data.onExpand(clip)}>
                                    <video src={clip} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                    <span className="clip-label">Clip {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="placeholder">
                        {data.loading ? (
                            <div className="loader">Rendering Veo Motion...</div>
                        ) : (
                            <p>Ready for Veo Production</p>
                        )}
                    </div>
                )}

                <div className="prep-section">
                    <label>Video Prompts (Refine Motion)</label>
                    <div className="prompts-list">
                        {(data.videoPrompts || Array(9).fill('')).map((p, i) => (
                            <div key={i} className="prompt-row">
                                <span className="row-idx">{i + 1}</span>
                                <input
                                    type="text"
                                    className="row-input"
                                    value={p}
                                    placeholder={`Motion prompt for KF ${i + 1}...`}
                                    onChange={(e) => {
                                        const newPrompts = [...(data.videoPrompts || Array(9).fill(''))];
                                        newPrompts[i] = e.target.value;
                                        data.onDataChange(id, { videoPrompts: newPrompts });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="node-actions">
                    <button
                        className="action-btn"
                        onClick={() => data.onGenerate(id)}
                        disabled={data.loading}
                    >
                        {data.loading ? 'Producing...' : clips.length > 0 ? 'Regenerate Video' : 'Begin Production (18 🪙)'}
                    </button>
                    {clips.length > 0 && (
                        <button className="secondary-btn" onClick={() => data.onExport && data.onExport()}>
                            Download All (ZIP)
                        </button>
                    )}
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
                .clips-grid-wrapper { max-height: 160px; overflow-y: auto; padding-right: 4px; }
                .clips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .clip-box { position: relative; border-radius: 6px; overflow: hidden; background: #000; cursor: pointer; aspect-ratio: 16/9; }
                .clip-box video { width: 100%; height: 100%; object-fit: cover; }
                .clip-label { position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; font-size: 0.5rem; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
                
                .prep-section { margin-top: 8px; border-top: 1px solid #fce4ec; pt: 8px; }
                .prep-section label { display: block; font-size: 0.65rem; font-weight: 700; color: #ad1457; text-transform: uppercase; margin-bottom: 6px; }
                .prompts-list { max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
                .prompt-row { display: flex; align-items: center; gap: 6px; background: #fff; padding: 4px 8px; border-radius: 6px; border: 1px solid #f8bbd0; }
                .row-idx { font-size: 0.7rem; font-weight: 800; color: #ff3d71; min-width: 14px; }
                .row-input { flex: 1; border: none; font-size: 0.75rem; color: #333; outline: none; background: transparent; }
                
                .node-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
                .action-btn {
                    background: linear-gradient(135deg, #ff3d71, #ff0055);
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    width: 100%;
                    box-shadow: 0 4px 10px rgba(255, 61, 113, 0.2);
                    transition: all 0.2s;
                }
                .secondary-btn {
                    background: white; border: 1px solid #ff3d71; color: #ff3d71;
                    padding: 8px; border-radius: 30px; font-weight: 600; font-size: 0.75rem; 
                    cursor: pointer; width: 100%;
                }
                .action-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255, 61, 113, 0.3); }
                .action-btn:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; box-shadow: none; }
                :global(.handle-dot) { background: #ff3d71 !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
