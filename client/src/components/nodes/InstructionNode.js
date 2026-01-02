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
            {data.step && <div className="step-badge">{data.step}</div>}
            <div className="node-container">
                <div className="node-content">
                    <div className="text-section">
                        <h3>{data.title}</h3>
                        <p>{data.description}</p>
                    </div>
                    {(data.image || data.output) && (
                        <div className="image-section">
                            <img src={data.image || data.output} alt={data.title} />
                        </div>
                    )}
                </div>
                {data.showUpload && (
                    <div className="upload-btn-container">
                        <button className="upload-btn" onClick={onUploadClick}>
                            <span></span> {data.loading ? '...' : 'Upload'}
                        </button>
                    </div>
                )}
            </div>
            <style jsx>{`
                .instruction-node {
                    position: relative;
                    padding-top: 15px;
                }
                .step-badge {
                    position: absolute;
                    top: -10px;
                    left: 0;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .node-container {
                    background: #1e293b;
                    border-radius: 12px;
                    width: 320px;
                    padding: 24px;
                    color: white;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                    border: 1px solid #334155;
                    position: relative;
                }
                .node-content {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }
                .text-section {
                    flex: 1;
                }
                h3 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: white;
                }
                p {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.5;
                }
                .image-section {
                    width: 90px;
                    height: 90px;
                    background: #334155;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid #475569;
                }
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .upload-btn-container {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                }
                .upload-btn {
                    background: #334155;
                    border: 1px solid #475569;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }
                .upload-btn:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
});
