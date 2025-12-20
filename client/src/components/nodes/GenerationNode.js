"use client";
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const [prompt, setPrompt] = useState(data.prompt || '');

    // Sync prompt if it changes from outside (e.g. Template swap)
    React.useEffect(() => {
        if (data.prompt !== undefined) {
            setPrompt(data.prompt);
        }
    }, [data.prompt]);

    // Handle prompt changes locally and update data
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
        if (data.onDataChange) {
            data.onDataChange(id, { prompt: e.target.value });
        }
    };

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">✨</span>
                Image Generation
            </div>

            <div className="node-content">
                <div className="input-group">
                    <label>Prompt</label>
                    <textarea
                        className="prompt-input"
                        placeholder="Describe your image..."
                        value={prompt}
                        onChange={handlePromptChange}
                        rows={3}
                    />
                </div>

                {data.output ? (
                    <div className="output-container">
                        <img src={data.output} alt="Generated" className="preview-img" />
                        {data.usedPrompt && (
                            <div className="prompt-tag" title={data.usedPrompt}>
                                🔍 {data.usedPrompt.substring(0, 20)}{data.usedPrompt.length > 20 ? '...' : ''}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="generate-placeholder">
                        {data.loading ? (
                            <div className="loader">Generating...</div>
                        ) : (
                            <div className="output-area">Output Preview</div>
                        )}
                    </div>
                )}

                <button
                    className="generate-btn"
                    onClick={() => data.onGenerate(id, prompt)}
                    disabled={data.loading || !prompt.trim()}
                >
                    {data.loading ? 'Processing...' : 'Generate (2 🪙)'}
                </button>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
        .node-container {
            background: white;
            border-radius: 12px;
            width: 280px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid transparent;
            transition: all 0.2s;
            overflow: hidden;
        }

        .output-container {
            position: relative;
        }

        .prompt-tag {
            position: absolute;
            bottom: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 500;
            max-width: 90%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            pointer-events: none;
        }

        .node-container.selected {
            border-color: #785df2;
            box-shadow: 0 0 0 4px rgba(120, 93, 242, 0.2);
        }

        .node-header {
            background: #f0f4ff;
            padding: 10px 16px;
            border-bottom: 1px solid #e0e7ff;
            font-size: 0.9rem;
            font-weight: 600;
            color: #3b82f6;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .node-content {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .input-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #666;
            margin-bottom: 4px;
        }

        .prompt-input {
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 8px;
            font-size: 0.85rem;
            resize: vertical;
            min-height: 60px;
            font-family: inherit;
        }

        .generate-placeholder {
            background: #f8f9fa;
            border-radius: 8px;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #eee;
        }
        
        .loader {
            color: #785df2;
            font-weight: 600;
            font-size: 0.9rem;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }

        .output-area {
            color: #aaa;
            font-size: 0.8rem;
        }

        .preview-img {
            width: 100%;
            height: 140px;
            object-fit: cover;
            border-radius: 8px;
        }

        .generate-btn {
            background: linear-gradient(90deg, #785df2 0%, #df58b3 100%);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
            text-align: center;
            width: 100%;
        }
        
        .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            background: #ccc;
        }

        .generate-btn:hover:not(:disabled) { opacity: 0.9; }

        :global(.handle-dot) {
            background: #785df2 !important;
            width: 12px !important;
            height: 12px !important;
            border: 2px solid white !important;
        }
      `}</style>
        </div>
    );
});
