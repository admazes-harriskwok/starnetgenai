"use client";
import React, { memo, useRef } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && data.onImageUpload) {
            data.onImageUpload(id, file);
        }
    };

    const onBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && data.onImageUpload) {
            data.onImageUpload(id, file);
        }
    };

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="icon">📷</span>
                Source Image
            </div>

            <div
                className="node-content"
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {data.image ? (
                    <div className="image-wrapper" onClick={onBoxClick} title="Click to replace">
                        <img src={data.image} alt="Source" className="preview-img" />
                    </div>
                ) : (
                    <div className="upload-placeholder" onClick={onBoxClick}>
                        <span className="upload-icon">☁️</span>
                        <p>Click to Upload</p>
                        <p className="sub-text">or drag & drop</p>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

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

        .node-container.selected {
            border-color: #ff6b3d;
            box-shadow: 0 0 0 4px rgba(255, 107, 61, 0.2);
        }

        .node-header {
            background: #f8f9fa;
            padding: 10px 16px;
            border-bottom: 1px solid #eee;
            font-size: 0.9rem;
            font-weight: 600;
            color: #444;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .node-content {
            padding: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 160px;
            background: #fff;
        }

        .image-wrapper {
            width: 100%;
            cursor: pointer;
        }

        .preview-img {
            width: 100%;
            height: 140px;
            object-fit: cover;
            border-radius: 8px;
            transition: opacity 0.2s;
        }
        
        .image-wrapper:hover .preview-img {
            opacity: 0.8;
        }

        .upload-placeholder {
            border: 2px dashed #ddd;
            border-radius: 8px;
            width: 100%;
            height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #888;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .upload-placeholder:hover {
            border-color: #ff6b3d;
            background: #fffaf5;
        }

        .upload-icon { font-size: 1.5rem; margin-bottom: 4px; }
        .sub-text { font-size: 0.7rem; opacity: 0.7; }

        :global(.handle-dot) {
            background: #ff6b3d !important;
            width: 12px !important;
            height: 12px !important;
            border: 2px solid white !important;
        }
      `}</style>
        </div>
    );
});
