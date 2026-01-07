"use client";
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

const SUITE_DIMENSIONS = [
    { id: 'half-page', w: 300, h: 600, label: "Half-Page Ad", desc: "1:2 High Impact" },
    { id: 'wide-skyscraper', w: 160, h: 600, label: "Wide Skyscraper", desc: "4:15 Standard" },
    { id: 'skyscraper', w: 120, h: 600, label: "Skyscraper", desc: "1:5 Legacy Narrow" },
    { id: 'portrait', w: 300, h: 1050, label: "Portrait", desc: "2:7 Premium" }
];

const VerticalAdSuiteNode = ({ id, data, selected }) => {
    const outputs = data.outputs || {};
    const isLoading = data.loading;

    return (
        <div className={`node-container vertical-suite-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <div className="header-left">
                    <span className="icon">📐</span>
                    <div className="title-group">
                        <span className="node-title">Vertical Ad Suite</span>
                        <span className="node-subtitle">Auto-Adaptive Layouts (4-Pack)</span>
                    </div>
                </div>
                {isLoading && <div className="spinner-small"></div>}
            </div>

            <div className="node-body">
                {Object.keys(outputs).length > 0 ? (
                    <div className="outputs-grid">
                        {SUITE_DIMENSIONS.map((dim) => (
                            <div key={dim.id} className="output-item">
                                <div
                                    className="preview-box"
                                    style={{ aspectRatio: `${dim.w}/${dim.h}` }}
                                    onClick={() => data.onExpand && data.onExpand(outputs[dim.id])}
                                >
                                    <img src={outputs[dim.id]} alt={dim.label} />
                                    <div className="hover-overlay">View {dim.w}x{dim.h}</div>
                                </div>
                                <div className="output-info">
                                    <span className="dim-label">{dim.w}x{dim.h}</span>
                                    <span className="format-name">{dim.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="drop-icon">🏗️</div>
                        <p>Connect a creative to generate the 4 vertical standard formats</p>
                        <button
                            className="gen-btn"
                            disabled={isLoading}
                            onClick={() => data.onGenerate(id)}
                        >
                            {isLoading ? 'Processing Suite...' : 'Generate Vertical Suite'}
                        </button>
                    </div>
                )}
            </div>

            <div className="node-footer">
                <div className="logic-badge">
                    <span className="l-icon">V</span>
                    Vertical Stack Algorithm
                </div>
                <div className="credit-cost">
                    <span className="coin">🪙</span>
                    6
                </div>
            </div>

            <Handle type="target" position={Position.Left} className="handle-dot" />
            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: #ffffff;
                    border-radius: 20px;
                    width: 480px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.12);
                    border: 2px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    color: #0f172a;
                }
                .node-container.selected { 
                    border-color: #3b82f6; 
                    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15);
                    transform: translateY(-4px);
                }

                .node-header {
                    background: linear-gradient(to right, #0f172a, #1e293b);
                    padding: 18px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                }
                .header-left { display: flex; gap: 14px; align-items: center; }
                .icon { font-size: 1.4rem; }
                .title-group { display: flex; flex-direction: column; gap: 2px; }
                .node-title { font-weight: 800; font-size: 1rem; letter-spacing: -0.01em; }
                .node-subtitle { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

                .node-body {
                    padding: 20px;
                    background: #f8fafc;
                    min-height: 240px;
                }

                .outputs-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    align-items: start;
                }

                .output-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .preview-box {
                    width: 100%;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    position: relative;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .preview-box:hover { transform: scale(1.04); border-color: #3b82f6; }
                .preview-box img { width: 100%; height: 100%; object-fit: cover; }
                
                .hover-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(59, 130, 246, 0.8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-align: center;
                    padding: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                    backdrop-filter: blur(2px);
                }
                .preview-box:hover .hover-overlay { opacity: 1; }

                .output-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: 0 4px;
                }
                .dim-label { font-size: 0.7rem; font-weight: 800; color: #1e293b; }
                .format-name { font-size: 0.6rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                    gap: 16px;
                }
                .drop-icon { font-size: 3rem; opacity: 0.15; }
                .empty-state p { font-size: 0.85rem; color: #64748b; max-width: 240px; line-height: 1.5; }

                .gen-btn {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    transition: all 0.2s;
                }
                .gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
                .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .node-footer {
                    padding: 14px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                }
                .logic-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .l-icon {
                    background: #3b82f6;
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: 900;
                }
                .credit-cost {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #3b82f6;
                    font-weight: 800;
                    font-size: 0.9rem;
                }
                .coin { font-size: 1rem; }

                .spinner-small {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(59, 130, 246, 0.2);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                :global(.handle-dot) {
                    width: 12px !important;
                    height: 12px !important;
                    background: #3b82f6 !important;
                    border: 3px solid white !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default memo(VerticalAdSuiteNode);
