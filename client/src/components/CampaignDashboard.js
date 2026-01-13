"use client";
import React, { useState } from 'react';

export default function CampaignDashboard({ sizes, anchors, onEdit, onDelete, onClose, masterImage, previews = {} }) {
    const [filter, setFilter] = useState('all');

    const filteredSizes = sizes.filter(size => {
        if (filter === 'all') return true;
        if (filter === 'anchors') return anchors.includes(size.id);
        return size.category === filter;
    });

    return (
        <div className="dashboard-overlay">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="back-btn" onClick={onClose}>
                            ← All sizes
                        </button>
                        <h1>Campaign Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <span className="count-badge">{sizes.length} formats</span>
                    </div>
                </div>

                <div className="filter-bar">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({sizes.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'anchors' ? 'active' : ''}`}
                        onClick={() => setFilter('anchors')}
                    >
                        ⭐ Anchors ({anchors.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'display' ? 'active' : ''}`}
                        onClick={() => setFilter('display')}
                    >
                        Display
                    </button>
                    <button
                        className={`filter-btn ${filter === 'social' ? 'active' : ''}`}
                        onClick={() => setFilter('social')}
                    >
                        Social
                    </button>
                </div>

                <div className="dashboard-grid">
                    {filteredSizes.map(size => {
                        const isAnchor = anchors.includes(size.id);

                        return (
                            <div key={size.id} className="ad-card">
                                {isAnchor && <div className="anchor-badge">⭐ Anchor</div>}

                                <div className="card-preview">
                                    <div
                                        className="preview-box"
                                        style={{
                                            aspectRatio: `${size.width} / ${size.height}`,
                                            backgroundImage: previews[size.id] ? `url(${previews[size.id]})` : masterImage ? `url(${masterImage})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {!previews[size.id] && !masterImage && (
                                            <div className="placeholder-content">
                                                <div className="placeholder-text">{size.width}×{size.height}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-info">
                                    <div className="info-top">
                                        <div className="format-name">{size.name}</div>
                                        <div className="format-dims">{size.width} × {size.height}</div>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => onEdit(size)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="status-btn"
                                            title="No status"
                                        >
                                            ☐
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDelete(size.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .dashboard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #f8fafc;
                    z-index: 999;
                    overflow-y: auto;
                }

                .dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .back-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: #475569;
                }

                .dashboard-header h1 {
                    margin: 0;
                    font-size: 1.8rem;
                    color: #0f172a;
                }

                .count-badge {
                    background: #8b5cf6;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .filter-bar {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    padding: 12px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .filter-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: #475569;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    border-color: #8b5cf6;
                    color: #8b5cf6;
                }

                .filter-btn.active {
                    background: #8b5cf6;
                    color: white;
                    border-color: #8b5cf6;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .ad-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    transition: all 0.2s;
                    position: relative;
                }

                .ad-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    transform: translateY(-2px);
                }

                .anchor-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #fef3c7;
                    color: #92400e;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    z-index: 10;
                }

                .card-preview {
                    padding: 24px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                }

                .preview-box {
                    max-width: 100%;
                    max-height: 180px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .placeholder-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .placeholder-text {
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .card-info {
                    padding: 16px;
                }

                .info-top {
                    margin-bottom: 12px;
                }

                .format-name {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 1rem;
                    margin-bottom: 4px;
                }

                .format-dims {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .card-actions {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn {
                    flex: 1;
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }

                .status-btn, .delete-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .delete-btn:hover {
                    background: #fee2e2;
                    border-color: #fecaca;
                }
            `}</style>
        </div>
    );
}
