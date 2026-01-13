"use client";
import React, { memo, useState, useRef } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { getDisplayName } from '../../../lib/models';

export default memo(({ id, data, selected }) => {
    const clips = data.clips || [];
    const [isMerging, setIsMerging] = useState(false);

    // --- Video Stitching Algorithm (Client-Side Canvas Recording) ---
    const handleMerge = async (force = false) => {
        if ((!force && data.mergedVideo) || clips.length < 2) return;

        setIsMerging(true);
        console.log("🎬 Stitching started...");

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = "anonymous"; // Important for CORS

            // Wait for metadata to set canvas size
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth || 1024;
                    canvas.height = video.videoHeight || 576;
                    resolve();
                };
                video.onerror = reject;
                video.src = clips[0];
            });

            const stream = canvas.captureStream(30); // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.start();

            // Playback Loop
            for (const clipUrl of clips) {
                await new Promise((resolve, reject) => {
                    video.src = clipUrl;
                    video.onloadeddata = () => {
                        video.play();

                        const draw = () => {
                            if (video.paused || video.ended) return;
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            requestAnimationFrame(draw);
                        };
                        draw();
                    };
                    video.onended = resolve;
                    video.onerror = (e) => {
                        console.error("Clip Error:", e);
                        resolve(); // Skip bad clips
                    };
                });
            }

            mediaRecorder.stop();
            await new Promise(r => { mediaRecorder.onstop = r; });

            const blob = new Blob(chunks, { type: 'video/webm' });
            const finalUrl = URL.createObjectURL(blob);

            console.log("✅ Stitching complete:", finalUrl);
            data.onDataChange(id, { mergedVideo: finalUrl });

        } catch (err) {
            console.error("Stitching failed:", err);
            alert("Failed to combine videos. See console.");
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className={`node-container ${selected ? 'selected' : ''}`}>
            <NodeToolbar isVisible={selected} position={Position.Top}>
                <div className="toolbar-wrapper">
                    <button className="toolbar-btn" onClick={() => data.onGenerate(id)}>Produce</button>
                    {clips.length > 0 && (
                        <>
                            <button className="toolbar-btn" onClick={() => data.onExpand && data.onExpand(clips[0])}>
                                ⛶ Zoom
                            </button>
                            <a
                                href={clips[0]}
                                download={`starnet-video-${id}.mp4`}
                                className="toolbar-btn"
                                style={{ textDecoration: 'none' }}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ⬇️ Download
                            </a>
                            <button className="toolbar-btn" onClick={() => alert('Film Analysis: Sequence optimized for social media engagement. Content: High-fidelity product showcase.')}>
                                🎞️ Film Analysis
                            </button>
                        </>
                    )}
                    <button className="toolbar-btn delete" onClick={() => data.onDelete(id)}>🗑️ Delete</button>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Left} className="handle-dot" />

            <div className="node-header">
                <span className="icon">🎥</span>
                {data.label || 'Video Production'}
            </div>

            <div className="node-content">
                {/* 1. Clips Grid */}
                {clips.length > 0 ? (
                    <div className="clips-grid-wrapper">
                        <div className="clips-grid">
                            {clips.map((clip, i) => (
                                <div key={i} className="clip-box" onClick={() => data.onExpand && data.onExpand(clip)}>
                                    {clip && (
                                        <video
                                            src={clip}
                                            className="clip-video"
                                            onMouseOver={e => e.target.play()}
                                            onMouseOut={e => e.target.pause()}
                                            muted
                                            playsInline
                                            onError={(e) => {
                                                console.warn(`Clip ${i + 1} failed to load:`, clip);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="clip-label">Clip {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="gen-placeholder">
                        {data.loading ? (
                            <div className="spinner" />
                        ) : (
                            <p>Ready for Veo Production</p>
                        )}
                    </div>
                )}

                {/* 2. Full Video Merger Section */}
                {clips.length > 1 && (
                    <div className="merge-section">
                        <div className="merge-header">
                            <span className="icon">🎞️</span> Final Cut
                        </div>

                        {data.mergedVideo ? (
                            <div className="merged-preview">
                                <video src={data.mergedVideo} controls className="merged-video" />
                                <div className="merged-actions">
                                    <button className="mini-btn" onClick={() => data.onExpand && data.onExpand(data.mergedVideo)}>⛶</button>
                                    <a href={data.mergedVideo} download={`full_sequence_${id}.webm`} className="mini-btn">⬇</a>
                                    <button className="mini-btn" onClick={() => handleMerge(true)}>↻</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="merge-btn"
                                onClick={() => handleMerge(false)}
                                disabled={isMerging}
                            >
                                {isMerging ? 'Stitching...' : 'Combine All Clips into One Video'}
                            </button>
                        )}
                    </div>
                )}

                {/* 3. AI Controls */}
                <div className="ai-input-bar">
                    <div className="input-top">
                        <button className="tool-btn-square">
                            <span className="plus">+</span>
                            Motion
                        </button>
                        <button className="tool-btn-square mag">
                            <span className="wand">🎬</span>
                        </button>
                        <div className="ref-image-mini">
                            <span className="badge">LRO</span>
                        </div>
                    </div>

                    <div className="input-middle">
                        {data.videoPrompts ? (
                            <div className="prompts-list">
                                {data.videoPrompts.map((p, i) => (
                                    <div key={i} className="prompt-row">
                                        <span className="row-idx">{i + 1}</span>
                                        <input
                                            type="text"
                                            className="row-input"
                                            value={p}
                                            placeholder={`Motion KF ${i + 1}...`}
                                            onChange={(e) => {
                                                const newPrompts = [...data.videoPrompts];
                                                newPrompts[i] = e.target.value;
                                                data.onDataChange(id, { videoPrompts: newPrompts });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="ai-chat-input"
                                placeholder="Describe the motion (e.g., slow pan, subtle rotation)..."
                                rows={2}
                                value={data.prompt || ''}
                                onChange={(e) => data.onDataChange(id, { prompt: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="input-bottom">
                        <div className="model-selector" onClick={() => data.onModelToggle(id, data.model || 'veo-2.0-generate-001')}>
                            <span className="g-icon">V</span>
                            {getDisplayName(data.model || 'veo-2.0-generate-001')}
                            <span className="chevron">⌄</span>
                        </div>
                        <div className="actions-right">
                            <div className="credit-cost">
                                <span className="coin">🪙</span>
                                10
                            </div>
                            <button className="send-btn" onClick={() => data.onGenerate(id, data.prompt)}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
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
                    border-color: #ff3d71;
                    box-shadow: 0 0 0 4px rgba(255, 61, 113, 0.1);
                }
                .node-header {
                    padding: 6px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #ff3d71;
                    text-transform: uppercase;
                    background: #fff0f5;
                    border-radius: 10px;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .node-content {
                    padding: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .clips-grid-wrapper {
                    max-height: 180px;
                    overflow-y: auto;
                    border-radius: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 4px;
                }
                .clips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .clip-box { position: relative; border-radius: 8px; overflow: hidden; background: #000; cursor: pointer; min-height: 120px; }
                .clip-box video { width: 100%; height: 100%; object-fit: contain; display: block; }
                .clip-label { position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; font-size: 0.5rem; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
                
                .merge-section {
                    background: #f1f5f9;
                    border-radius: 12px;
                    padding: 8px;
                    margin: 4px 0;
                    border: 1px solid #e2e8f0;
                }
                .merge-header {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #475569;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .merge-btn {
                    width: 100%;
                    background: #334155;
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .merge-btn:hover:not(:disabled) { background: #475569; }
                .merge-btn:disabled { opacity: 0.7; cursor: wait; }
                
                .merged-preview { position: relative; border-radius: 8px; overflow: hidden; }
                .merged-video { width: 100%; display: block; border-radius: 8px; }
                .merged-actions {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    display: flex;
                    gap: 4px;
                }
                .mini-btn {
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 0.8rem;
                    text-decoration: none;
                }
                .mini-btn:hover { background: #ff3d71; border-color: #ff3d71; }

                .gen-placeholder {
                    height: 120px;
                    border-radius: 16px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    border: 1px dashed #e2e8f0;
                    font-size: 0.85rem;
                }

                .ai-input-bar {
                    background: white;
                    border-radius: 18px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border: 1px solid #e2e8f0;
                }
                .input-top {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tool-btn-square {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    padding: 6px 10px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    min-width: 48px;
                    transition: all 0.2s;
                }
                .tool-btn-square:hover {
                    border-color: #ff3d71;
                    color: #ff3d71;
                }
                .tool-btn-square.mag {
                    padding: 10px;
                    justify-content: center;
                }
                .tool-btn-square .plus { font-size: 1rem; margin-bottom: -2px; }
                .tool-btn-square .wand { font-size: 1.1rem; }

                .ref-image-mini {
                    position: relative;
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    margin-left: auto;
                    border: 1px solid #e2e8f0;
                    background: #fff0f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ref-image-mini .badge {
                    color: #ff3d71;
                    font-size: 0.6rem;
                    font-weight: 800;
                }

                .ai-chat-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: #1e293b;
                    font-size: 0.85rem;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    line-height: 1.4;
                }
                
                .prompts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    max-height: 120px;
                    overflow-y: auto;
                }
                .prompt-row { display: flex; align-items: center; gap: 6px; background: #fff8fa; padding: 4px 8px; border-radius: 8px; border: 1px solid #fce4ec; }
                .row-idx { font-size: 0.7rem; font-weight: 800; color: #ff3d71; min-width: 14px; }
                .row-input { flex: 1; border: none; font-size: 0.75rem; color: #1e293b; outline: none; background: transparent; }

                .input-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 10px;
                }
                .model-selector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: #64748b;
                    cursor: pointer;
                }
                .g-icon {
                    background: #fff0f5;
                    color: #ff3d71;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 900;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .credit-cost {
                    background: #f8fafc;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                }
                .send-btn {
                    background: #ff3d71;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .send-btn:hover {
                    background: #e91e63;
                    transform: scale(1.05);
                }
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #ff3d71;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

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
                .toolbar-btn.delete:hover { background: #ef4444; }
                :global(.handle-dot) {
                    width: 12px !important;
                    height: 12px !important;
                    background: #ff3d71 !important;
                    border: 2px solid white !important;
                }
            `}</style>
        </div>
    );
});
