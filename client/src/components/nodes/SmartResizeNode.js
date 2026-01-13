"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const sizes = data.sizes || [];
    const anchors = data.anchors || [];

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onAddSize && data.onAddSize(id)}>
                        ➕ Add Size
                    </button>
                    <button className="toolbar-btn" onClick={() => data.onViewDashboard && data.onViewDashboard(id)}>
                        📊 View All
                    </button>
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">📐</span>
                {data.label || 'Smart Resize'}
            </div>

            <div className="node-content">
                {sizes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📏</div>
                        <p>No sizes added yet</p>
                        <button className="add-btn" onClick={() => data.onAddSize && data.onAddSize(id)}>
                            Add Size
                        </button>
                    </div>
                ) : (
                    <div className="sizes-summary">
                        <div className="summary-header">
                            <span className="count">{sizes.length} size{sizes.length !== 1 ? 's' : ''}</span>
                            {anchors.length > 0 && (
                                <span className="anchors-badge">{anchors.length} anchor{anchors.length !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                        <div className="sizes-list">
                            {sizes.slice(0, 5).map((size, i) => (
                                <div key={i} className="size-item">
                                    <div className="size-preview" style={{ aspectRatio: `${size.width} / ${size.height}` }} />
                                    <span className="size-label">{size.width}×{size.height}</span>
                                    {anchors.includes(size.id) && <span className="anchor-star">⭐</span>}
                                </div>
                            ))}
                            {sizes.length > 5 && (
                                <div className="more-indicator">+{sizes.length - 5} more</div>
                            )}
                        </div>
                    </div>
                )}

                {sizes.length > 0 && anchors.length >= 3 && (
                    <button
                        className="generate-btn"
                        onClick={() => data.onGenerate && data.onGenerate(id)}
                    >
                        ✨ Generate All ({sizes.length} formats)
                    </button>
                )}

                <div className="status-bar">
                    <span className="status-text">
                        {data.status || (sizes.length === 0 ? 'Ready to configure' : anchors.length < 3 ? 'Set up 3 anchors first' : 'Ready to generate')}
                    </span>
                    {data.status && data.status.includes('Generated') && (
                        <button
                            className="view-dashboard-link"
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onViewDashboard && data.onViewDashboard(id);
                            }}
                        >
                            View Results ➜
                        </button>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 20px;
                    width: 320px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    color: #1e293b;
                    padding: 8px;
                }
                .node-container.selected {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
                }
                .node-header {
                    padding: 6px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #8b5cf6;
                    text-transform: uppercase;
                    background: #f5f3ff;
                    border-radius: 10px;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .node-content {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .empty-state {
                    text-align: center;
                    padding: 32px 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 2px dashed #e2e8f0;
                }
                .empty-icon {
                    font-size: 2.5rem;
                    margin-bottom: 8px;
                }
                .empty-state p {
                    color: #64748b;
                    margin: 0 0 16px 0;
                    font-size: 0.9rem;
                }
                .add-btn {
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .sizes-summary {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 12px;
                }
                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .count {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 0.9rem;
                }
                .anchors-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .sizes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .size-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px;
                    background: white;
                    border-radius: 6px;
                }
                .size-preview {
                    width: 32px;
                    height: 32px;
                    background: #8b5cf6;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                .size-label {
                    font-size: 0.8rem;
                    color: #475569;
                    flex: 1;
                }
                .anchor-star {
                    font-size: 0.9rem;
                }
                .more-indicator {
                    text-align: center;
                    color: #64748b;
                    font-size: 0.8rem;
                    padding: 4px;
                }
                .generate-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                    color: white;
                    border: none;
                    padding: 12px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                }
                .generate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
                }
                .status-bar {
                    padding: 8px;
                    background: #eff6ff;
                    border-radius: 8px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    align-items: center;
                }
                .status-text {
                    font-size: 0.8rem;
                    color: #3b82f6;
                }
                .view-dashboard-link {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: underline;
                    padding: 2px;
                }
                .view-dashboard-link:hover {
                    color: #1d4ed8;
                }
                .toolbar-wrapper {
                    display: flex;
                    gap: 4px;
                    background: #0f172a;
                    padding: 4px;
                    border-radius: 8px;
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
                }
                :global(.handle-dot) {
                    width: 12px !important;
                    height: 12px !important;
                    background: #8b5cf6 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
