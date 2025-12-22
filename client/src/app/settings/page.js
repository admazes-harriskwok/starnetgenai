"use client";
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gemini-3-pro-image');
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Load from local storage
        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        if (config.apiKey) setApiKey(config.apiKey);
        if (config.model) setModel(config.model);
    }, []);

    const handleSave = () => {
        const config = { apiKey, model };
        localStorage.setItem('starnet_config', JSON.stringify(config));
        setStatus('Settings saved successfully!');
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Configure your AI preferences and API connections.</p>
                </div>
            </div>

            <div className="settings-card">
                <h2>Gemini Configuration</h2>

                <div className="form-group">
                    <label>Gemini API Key</label>
                    <input
                        type="password"
                        placeholder="Enter your API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="help-text">Your key is stored locally in your browser.</p>
                </div>

                <div className="form-group">
                    <label>Model Selection</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)}>
                        <option value="gemini-3-pro-image">Gemini 3 Pro Image (Nano Banana)</option>
                        <option value="gemini-3-flash">Gemini 3 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                </div>

                <div className="actions">
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                    {status && <span className="status-msg">{status}</span>}
                </div>
            </div>

            <style jsx>{`
                .page-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding-bottom: 60px;
                }

                .page-header {
                    margin-bottom: 40px;
                    background: var(--bg-white);
                    padding: 32px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                }

                .page-title { 
                    font-size: 2rem; 
                    font-weight: 700; 
                    color: var(--text-heading); 
                    margin-bottom: 4px;
                }
                .page-subtitle { color: var(--text-body); font-size: 1.05rem; }

                .settings-card {
                    background: var(--bg-white);
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                }

                h2 {
                    font-size: 1.5rem;
                    color: var(--text-heading);
                    margin-bottom: 32px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 16px;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--text-heading);
                }

                input, select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                    transition: border-color 0.2s;
                }

                input:focus, select:focus {
                    outline: none;
                    border-color: var(--primary-start);
                    background: white;
                }

                .help-text {
                    font-size: 0.85rem;
                    color: var(--text-meta);
                    margin-top: 8px;
                }

                .actions {
                    margin-top: 40px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .save-btn {
                    background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 30px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 107, 61, 0.3);
                    transition: all 0.2s;
                }

                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 61, 0.4);
                }

                .status-msg {
                    color: #10B981; /* Green */
                    font-weight: 600;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
}
