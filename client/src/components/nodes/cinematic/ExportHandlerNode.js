"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const assets = data.assets || [];

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => alert('Zipping clips...')}>Download All</button>
                    <button className="toolbar-btn">⚙️</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">📦</span>
                Final Assets
            </div>

            <div className="node-content">
                {assets.length > 0 ? (
                    <div className="assets-status">
                        <div className="status-badge">✅ {assets.length} Ready</div>
                        <p className="hint">All video clips generated and optimized.</p>
                        <button className="download-btn" onClick={() => alert('Zipping clips for download...')}>
                            Download All Footage
                        </button>
                    </div>
                ) : (
                    <div className="placeholder">
                        <p>Complete flow to export</p>
                    </div>
                )}

                <div className="done-text">
                    <p>DONE! Import these clips into your editing tool to finalize your ad.</p>
                </div>
            </div>

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 12px;
                    width: 240px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .node-container.selected { border-color: #00d68f; }
                .node-header {
                    background: #e6fff7;
                    padding: 10px 16px;
                    border-bottom: 1px solid #ccffeb;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #00ab72;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .node-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .assets-status { display: flex; flex-direction: column; gap: 8px; }
                .status-badge { background: #00d68f; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-align: center; }
                .hint { font-size: 0.75rem; color: #888; text-align: center; }
                .placeholder { 
                    background: #f8f9fa; 
                    height: 60px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.8rem; 
                    color: #999; 
                    border-radius: 8px;
                }
                .download-btn {
                    background: #00d68f;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    width: 100%;
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
                .done-text { font-size: 0.7rem; color: #555; font-style: italic; border-top: 1px solid #f0f0f0; padding-top: 8px; margin-top: 8px; }
                :global(.handle-dot) { background: #00d68f !important; width: 10px !important; height: 10px !important; }
            `}</style>
        </div>
    );
});
