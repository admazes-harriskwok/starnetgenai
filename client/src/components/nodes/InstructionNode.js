"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ id, data }) => {
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && data.onImageUpload) {
            data.onImageUpload(id, file);
        }
    };

    const onUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="instruction-node">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />
            <div className={`node-container ${data.showUpload ? 'has-upload' : ''}`}>
                <div className="node-header">
                    <span className="icon">💡</span>
                    {data.step || 'INFO'}
                </div>

                <div className="node-content">
                    <div className="text-section">
                        <h3>{data.title}</h3>
                        <p>{data.description}</p>
                    </div>

                    {(data.image || data.video || data.output) && (
                        <div className="image-section">
                            {((data.video && typeof data.video === 'string') ||
                                (data.output && typeof data.output === 'string' && (
                                    data.output.includes('.mp4') ||
                                    data.output.includes('generativelanguage.googleapis.com') ||
                                    data.output.includes('videointelligence.googleapis.com')
                                ))) ? (
                                <video
                                    src={data.video || data.output}
                                    autoPlay
                                    muted
                                    loop
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        console.warn("Video failed to load in InstructionNode:", data.video || data.output);
                                    }}
                                />
                            ) : (
                                <img src={data.image || data.output} alt={data.title} />
                            )}
                        </div>
                    )}

                    {data.showUpload && (
                        <div className="upload-btn-container">
                            <button className="upload-btn" onClick={onUploadClick}>
                                <span>📤</span> {data.loading ? '...' : 'Upload Asset'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .instruction-node {
                    position: relative;
                }
                .node-container {
                    background: white;
                    border-radius: 20px;
                    width: 300px;
                    padding: 8px;
                    color: #1e293b;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }
                .node-header {
                    padding: 6px 12px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #6366f1;
                    text-transform: uppercase;
                    background: #eef2ff;
                    border-radius: 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                    letter-spacing: 0.05em;
                }
                .node-content {
                    padding: 4px 12px 12px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .text-section h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0 0 6px 0;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .text-section p {
                    font-size: 0.85rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.6;
                }
                .image-section {
                    width: 100%;
                    height: 160px;
                    background: #f8fafc;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                img, video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .upload-btn-container {
                    margin-top: 4px;
                }
                .upload-btn {
                    width: 100%;
                    background: #6366f1;
                    color: white;
                    padding: 10px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                    transition: all 0.2s;
                }
                .upload-btn:hover {
                    background: #4f46e5;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
                }
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #6366f1 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
