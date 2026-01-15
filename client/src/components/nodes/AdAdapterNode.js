"use client";
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { getDisplayName } from '../../lib/models';

const IAB_DIMENSIONS = [
    // Rectangles
    { category: "Rectangles (Standard Content Units)", w: 300, h: 250, label: "Medium Rectangle" },
    { category: "Rectangles (Standard Content Units)", w: 336, h: 280, label: "Large Rectangle" },
    // Tall
    { category: "Tall Vertical Units (Skyscrapers)", w: 300, h: 600, label: "Half-Page Ad" },
    { category: "Tall Vertical Units (Skyscrapers)", w: 160, h: 600, label: "Wide Skyscraper" },
    { category: "Tall Vertical Units (Skyscrapers)", w: 300, h: 1050, label: "Portrait" },
    // Horizontal
    { category: "Horizontal & Panoramic Units", w: 970, h: 250, label: "Billboard" },
    // Squares
    { category: "Squares", w: 250, h: 250, label: "Square" },
    { category: "Squares", w: 200, h: 200, label: "Small Square" },
    // Mobile
    { category: "Mobile Specific Units", w: 300, h: 100, label: "Mobile Banner" },
    { category: "Mobile Specific Units", w: 320, h: 100, label: "Mobile Banner (L)" }
];

const AdAdapterNode = ({ id, data }) => {
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'details'

    const outputs = data.outputs || [];
    const isLoading = data.loading;

    return (
        <div className="node-wrapper">
            <div className={`node-container ${isLoading ? 'loading' : ''} ${data.selected ? 'selected' : ''}`}>
                <div className="node-header">
                    <div className="header-left">
                        <span className="node-icon">📐</span>
                        <div className="title-group">
                            <span className="node-title">IAB Ad Adapter</span>
                            <span className="node-subtitle">
                                {data.status ? (
                                    <span style={{ color: '#60a5fa', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                                        {data.status}
                                    </span>
                                ) : (
                                    '10 Programmatic Variants'
                                )}
                            </span>
                        </div>
                    </div>
                    {isLoading && <div className="spinner-small"></div>}
                </div>

                <div className="node-body">
                    {outputs.length > 0 ? (

                        <div className="variants-container">
                            {Object.entries(
                                IAB_DIMENSIONS.reduce((acc, dim, idx) => {
                                    if (!acc[dim.category]) acc[dim.category] = [];
                                    acc[dim.category].push({ ...dim, originalIdx: idx });
                                    return acc;
                                }, {})
                            ).map(([category, items]) => (
                                <div key={category} className="category-group">
                                    <h4 className="category-title">{category}</h4>
                                    <div className="variants-grid">
                                        {items.map((dim) => (
                                            <div key={dim.originalIdx} className="variant-item">
                                                <div className="variant-preview" title={`${dim.label} (${dim.w}x${dim.h})`}>
                                                    {outputs[dim.originalIdx] ? (
                                                        <img src={outputs[dim.originalIdx]} alt={dim.label} onClick={() => data.onExpand(outputs[dim.originalIdx])} />
                                                    ) : (
                                                        <div className="ghost-box">
                                                            <span>{dim.w}x{dim.h}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="variant-dim">{dim.w}x{dim.h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (

                        <div className="empty-state">
                            <div className="empty-icon">📏</div>
                            <p>Connect a Master Asset to generate 16 IAB variants</p>
                            <button
                                className="gen-btn-placeholder"
                                onClick={() => data.onGenerate(id)}
                            >
                                Start Adaptation Flow
                            </button>
                        </div>
                    )}
                </div>

                <div className="node-footer">
                    <div className="model-badge">
                        <span className="p-icon">P</span>
                        {getDisplayName(data.model || 'gemini-2.5-flash-image')}
                    </div>
                    <div className="credit-cost">
                        <span className="coin">🪙</span>
                        8
                    </div>
                </div>

                <Handle type="target" position={Position.Left} className="handle-dot" />
                <Handle type="source" position={Position.Right} className="handle-dot" />
            </div >

            <style jsx>{`
                .node-wrapper { padding: 10px; }
                .node-container {
                    background: #ffffff;
                    border-radius: 20px;
                    width: 440px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    color: #1e293b;
                }
                .node-container.selected { border-color: #f97316; transform: translateY(-5px); }
                
                .node-header {
                    background: #0f172a;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                }
                .header-left { display: flex; gap: 12px; align-items: center; }
                .node-icon { font-size: 1.5rem; }
                .title-group { display: flex; flex-direction: column; }
                .node-title { font-weight: 700; font-size: 0.95rem; }
                .node-subtitle { font-size: 0.7rem; color: #94a3b8; }

                .node-body {
                    padding: 16px;
                    background: #f8fafc;
                    min-height: 200px;
                }

                .category-group {
                    margin-bottom: 24px;
                }
                .category-group:last-child {
                    margin-bottom: 0;
                }
                .category-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin: 0 0 12px 4px;
                    letter-spacing: 0.05em;
                    border-bottom: 1px dashed #e2e8f0;
                    padding-bottom: 8px;
                }

                .variants-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .variant-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    padding: 4px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }

                .variant-preview {
                    width: 50px;
                    height: 50px;
                    background: #0f172a;
                    border-radius: 6px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s;
                    flex-shrink: 0;
                }
                .variant-preview:hover { transform: scale(1.1); border: 1px solid #f97316; }
                .variant-preview img { width: 100%; height: 100%; object-fit: contain; }

                .variant-dim {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #64748b;
                    font-family: 'Inter', sans-serif;
                }

                .ghost-box {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.55rem;
                    color: #cbd5e1;
                    background: #f1f5f9;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }
                .empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.2; }
                .empty-state p { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; }

                .gen-btn-placeholder {
                    background: #f97316;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
                }

                .node-footer {
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                }

                .model-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .p-icon {
                    background: #3b82f6;
                    color: white;
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                }

                .credit-cost {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #f97316;
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .spinner-small {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 
                    0% { opacity: 1; } 
                    50% { opacity: 0.5; } 
                    100% { opacity: 1; } 
                }
            `}</style>
        </div >
    );
};

export default AdAdapterNode;
