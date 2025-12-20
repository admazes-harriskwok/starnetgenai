"use client";
import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

export default memo(({ id, data, selected }) => {
    const [input, setInput] = useState('');

    return (
        <div className={`node-container assistant-node ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn">Clear Chat</button>
                    <button className="toolbar-btn">⚙️</button>
                    <button className="toolbar-btn">View Prompt</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🤖</span>
                AI Assistant
            </div>

            <div className="node-content">
                <div className="chat-history">
                    {data.history ? (
                        data.history.map((msg, i) => (
                            <div key={i} className={`msg ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))
                    ) : (
                        <p className="hint">How can I help you today?</p>
                    )}
                </div>

                <div className="input-row">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="chat-input"
                    />
                    <button className="send-btn">Send</button>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="handle-dot" />

            <style jsx>{`
                .node-container {
                    background: white;
                    border-radius: 14px;
                    width: 300px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }
                .node-container.selected {
                    border-color: #10b981;
                }
                .node-header {
                    background: #f0fdf4;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #10b981;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-transform: uppercase;
                    border-radius: 14px 14px 0 0;
                }
                .node-content {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .chat-history {
                    height: 120px;
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 8px;
                    overflow-y: auto;
                    font-size: 0.8rem;
                    border: 1px solid #e2e8f0;
                }
                .msg {
                    padding: 4px 8px;
                    border-radius: 6px;
                    margin-bottom: 4px;
                }
                .assistant { background: white; color: #1e293b; border: 1px solid #e2e8f0; }
                .user { background: #10b981; color: white; align-self: flex-end; }
                
                .hint { color: #94a3b8; text-align: center; margin-top: 40px; }
                
                .input-row {
                    display: flex;
                    gap: 6px;
                }
                .chat-input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    outline: none;
                }
                .send-btn {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .toolbar-wrapper {
                    display: flex;
                    gap: 4px;
                    background: #0f172a;
                    padding: 4px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
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
                :global(.handle-dot) {
                    width: 10px !important;
                    height: 10px !important;
                    background: #10b981 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
