"use client";
import React, { useState } from 'react';
import { AD_SIZES, getSizesByCategory } from '../lib/adSizes';

export default function SizeSelectionModal({ isOpen, onClose, onSelect, selectedSizes = [] }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [localSelected, setLocalSelected] = useState(selectedSizes);

    if (!isOpen) return null;

    const categories = [
        { id: 'all', label: 'All', icon: '📐' },
        { id: 'display', label: 'Display', icon: '🖥️' },
        { id: 'social', label: 'Social media', icon: '📱' },
        { id: 'vast', label: 'VAST', icon: '🎬' }
    ];

    const sizes = getSizesByCategory(activeCategory);

    const toggleSize = (sizeId) => {
        setLocalSelected(prev =>
            prev.includes(sizeId)
                ? prev.filter(id => id !== sizeId)
                : [...prev, sizeId]
        );
    };

    const selectAll = () => {
        const allIds = sizes.map(s => s.id);
        setLocalSelected(allIds);
    };

    const handleConfirm = () => {
        onSelect(localSelected);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Choose Size</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="sidebar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <span className="icon">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="sizes-grid">
                        <div className="grid-header">
                            <button className="select-all-btn" onClick={selectAll}>
                                Select all
                            </button>
                            <span className="count">{localSelected.length} selected</span>
                        </div>

                        <div className="grid-content">
                            {sizes.map(size => {
                                const isSelected = localSelected.includes(size.id);
                                const aspectRatio = size.width / size.height;
                                const isWide = aspectRatio > 1.5;
                                const isTall = aspectRatio < 0.67;

                                return (
                                    <div
                                        key={size.id}
                                        className={`size-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleSize(size.id)}
                                    >
                                        <div className="size-visual">
                                            <div
                                                className={`ratio-box ${isWide ? 'wide' : isTall ? 'tall' : 'square'}`}
                                                style={{
                                                    aspectRatio: `${size.width} / ${size.height}`
                                                }}
                                            />
                                        </div>
                                        <div className="size-info">
                                            <div className="size-name">{size.name}</div>
                                            <div className="size-dims">{size.width}×{size.height}</div>
                                        </div>
                                        {isSelected && <div className="check-badge">✓</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Add {localSelected.length} size{localSelected.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-container {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 900px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #0f172a;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #64748b;
                    cursor: pointer;
                    padding: 4px 8px;
                }

                .modal-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .sidebar {
                    width: 200px;
                    border-right: 1px solid #e2e8f0;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-btn {
                    background: white;
                    border: none;
                    padding: 12px 16px;
                    text-align: left;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #475569;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .category-btn:hover {
                    background: #f1f5f9;
                }

                .category-btn.active {
                    background: #3b82f6;
                    color: white;
                }

                .sizes-grid {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .grid-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .select-all-btn {
                    background: none;
                    border: 1px solid #3b82f6;
                    color: #3b82f6;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .count {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .grid-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 16px;
                    align-content: start;
                }

                .size-card {
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .size-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
                }

                .size-card.selected {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }

                .size-visual {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 80px;
                    margin-bottom: 12px;
                }

                .ratio-box {
                    background: #3b82f6;
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 4px;
                }

                .ratio-box.wide {
                    width: 100%;
                }

                .ratio-box.tall {
                    height: 100%;
                }

                .ratio-box.square {
                    width: 60px;
                    height: 60px;
                }

                .size-info {
                    text-align: center;
                }

                .size-name {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }

                .size-dims {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .check-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: #3b82f6;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                }

                .modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .cancel-btn, .confirm-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border: none;
                }

                .cancel-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                }

                .confirm-btn {
                    background: #3b82f6;
                    color: white;
                }

                .confirm-btn:hover {
                    background: #2563eb;
                }
            `}</style>
        </div>
    );
}
