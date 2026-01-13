"use client";
import React from 'react';
import { RECOMMENDED_ANCHORS, getAspectRatioCategory } from '../lib/adSizes';

export default function AnchorWorkflowModal({
    isOpen,
    onClose,
    currentAnchors = [],
    onSelectAnchor,
    allSizes = []
}) {
    if (!isOpen) return null;

    const requiredCategories = ['square', 'horizontal', 'vertical'];
    const completedCategories = currentAnchors.map(a => getAspectRatioCategory(a.width, a.height));
    const nextCategory = requiredCategories.find(cat => !completedCategories.includes(cat));

    const isComplete = requiredCategories.every(cat => completedCategories.includes(cat));

    // Filter sizes by the next required category
    const availableSizes = nextCategory
        ? allSizes.filter(s => getAspectRatioCategory(s.width, s.height) === nextCategory)
        : [];

    const recommendedSize = nextCategory ? RECOMMENDED_ANCHORS[nextCategory] : null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>🎯 Anchor Setup Workflow</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {!isComplete ? (
                        <>
                            <div className="workflow-progress">
                                <div className="progress-steps">
                                    {requiredCategories.map((cat, i) => {
                                        const isDone = completedCategories.includes(cat);
                                        const isCurrent = cat === nextCategory;

                                        return (
                                            <div key={cat} className={`step ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                                                <div className="step-number">
                                                    {isDone ? '✓' : i + 1}
                                                </div>
                                                <div className="step-label">
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="instruction-box">
                                <h3>Step {completedCategories.length + 1}: Select a {nextCategory} anchor</h3>
                                <p>
                                    Choose a {nextCategory} format to manually adjust. This will serve as the template
                                    for all other {nextCategory} sizes in your campaign.
                                </p>
                                {recommendedSize && (
                                    <div className="recommendation">
                                        <span className="rec-badge">Recommended</span>
                                        <strong>{recommendedSize.name}</strong> ({recommendedSize.width}×{recommendedSize.height})
                                    </div>
                                )}
                            </div>

                            <div className="sizes-grid">
                                {availableSizes.map(size => {
                                    const isRecommended = recommendedSize && size.id === recommendedSize.id;

                                    return (
                                        <div
                                            key={size.id}
                                            className={`size-card ${isRecommended ? 'recommended' : ''}`}
                                            onClick={() => onSelectAnchor(size)}
                                        >
                                            {isRecommended && <div className="rec-star">⭐</div>}
                                            <div className="size-visual">
                                                <div
                                                    className="ratio-box"
                                                    style={{
                                                        aspectRatio: `${size.width} / ${size.height}`
                                                    }}
                                                />
                                            </div>
                                            <div className="size-info">
                                                <div className="size-name">{size.name}</div>
                                                <div className="size-dims">{size.width}×{size.height}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="completion-message">
                            <div className="success-icon">✅</div>
                            <h3>Anchor Setup Complete!</h3>
                            <p>
                                You've configured all three anchor types. Now you can add more sizes,
                                and the system will automatically apply the closest anchor's layout.
                            </p>
                            <button className="continue-btn" onClick={onClose}>
                                Continue to Add Sizes
                            </button>
                        </div>
                    )}
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
                    z-index: 1001;
                }

                .modal-container {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 800px;
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
                    padding: 24px;
                    overflow-y: auto;
                }

                .workflow-progress {
                    margin-bottom: 32px;
                }

                .progress-steps {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                }

                .step {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .step-number {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1.2rem;
                }

                .step.current .step-number {
                    background: #8b5cf6;
                    color: white;
                }

                .step.done .step-number {
                    background: #10b981;
                    color: white;
                }

                .step-label {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .step.current .step-label {
                    color: #8b5cf6;
                }

                .instruction-box {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                }

                .instruction-box h3 {
                    margin: 0 0 8px 0;
                    color: #0f172a;
                    font-size: 1.1rem;
                }

                .instruction-box p {
                    margin: 0 0 16px 0;
                    color: #475569;
                    line-height: 1.6;
                }

                .recommendation {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #fef3c7;
                    border-radius: 8px;
                }

                .rec-badge {
                    background: #92400e;
                    color: #fef3c7;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .sizes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 16px;
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
                    border-color: #8b5cf6;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
                }

                .size-card.recommended {
                    border-color: #fbbf24;
                    background: #fffbeb;
                }

                .rec-star {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 1.2rem;
                }

                .size-visual {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 80px;
                    margin-bottom: 12px;
                }

                .ratio-box {
                    background: #8b5cf6;
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 4px;
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

                .completion-message {
                    text-align: center;
                    padding: 40px 20px;
                }

                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                }

                .completion-message h3 {
                    margin: 0 0 12px 0;
                    color: #0f172a;
                    font-size: 1.5rem;
                }

                .completion-message p {
                    margin: 0 0 24px 0;
                    color: #475569;
                    line-height: 1.6;
                }

                .continue-btn {
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
