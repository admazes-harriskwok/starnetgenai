"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectsFromDB } from '../../lib/db';

export default function DashboardPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [filter, setFilter] = useState('All');
    const [projects, setProjects] = useState([]);
    const [credits, setCredits] = useState(250);

    // Initial load from IndexedDB
    React.useEffect(() => {
        const load = async () => {
            let savedProjects = await getProjectsFromDB();
            // Filter out corrupted projects (missing critical fields)
            savedProjects = savedProjects.filter(p => p && p.id && p.name);
            setProjects(savedProjects);
        };
        load();

        const config = JSON.parse(localStorage.getItem('starnet_config') || '{}');
        if (config.credits !== undefined) {
            setCredits(config.credits);
        } else {
            localStorage.setItem('starnet_config', JSON.stringify({ ...config, credits: 250 }));
        }
    }, []);

    // Mock Templates for starting new projects
    const templates = [
        { id: 'blank', name: 'Start Blank', type: 'blank', thumbnail: null, category: 'General' },
        { id: 'cinematic-video', name: 'Cinematic Ad', type: '16:9', category: 'Video' },
        { id: 'ugc-testimonial', name: 'UGC Testimonial', type: '9:16', category: 'Marketing' },
        { id: 'seasonal-showcase', name: 'Seasonal Showcase', type: '1:1', category: 'E-commerce' },
        { id: 'skincare-hand-showcase', name: 'Skincare Video', type: 'Dynamic', category: 'Premium', thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400' },
        { id: 'vertical-ad-suite', name: 'Vertical Ad Suite', type: 'IAB Vertical', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    ];

    // ... (keep filters logic)

    const renderThumbnail = (template) => {
        if (template.id === 'ugc-testimonial') {
            return (
                <div className="preview-ugc">
                    <div className="ugc-top">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300" alt="Reaction" />
                        <div className="hook-badge">STOP SCROLLING 🛑</div>
                    </div>
                    <div className="ugc-bottom">
                        <button className="shop-btn">Shop Now</button>
                    </div>
                    <div className="duration-tag">15s</div>
                </div>
            );
        }
        if (template.id === 'seasonal-showcase') {
            return (
                <div className="preview-seasonal">
                    <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" alt="Product" />
                    <div className="sale-overlay">
                        <span className="sale-text">50% OFF</span>
                        <span className="sale-sub">YEAR-END SALE</span>
                    </div>
                    <div className="format-badge">1:1</div>
                </div>
            );
        }
        if (template.id === 'vertical-ad-suite') {
            return (
                <div className="preview-vertical-suite">
                    <div className="v-column"></div>
                    <div className="v-column main"></div>
                    <div className="v-column"></div>
                    <div className="v-label">IAB VERTICAL</div>
                </div>
            );
        }
        // Fallback
        return (
            <div className="preview-generic">
                <img src={template.thumbnail || `https://placehold.co/300x533?text=${template.name}`} alt={template.name} />
                {template.duration && <div className="duration-tag">{template.duration}</div>}
            </div>
        );
    };

    // ...

    // Inside render loop:
    // <div className="thumbnail-wrapper">
    //      {renderThumbnail(template)}
    //      ... overlay button ...
    // </div>

    // Need to insert Styles for these specific previews at the bottom


    const filteredTemplates = filter === 'All'
        ? templates
        : templates.filter(t => t.type === filter || t.type === 'blank');

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                localStorage.setItem('starnet_imported_file', base64String);
                router.push('/canvas?import=true');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUseTemplate = (id) => {
        router.push(`/canvas?template=${id}`);
    };

    const handleResumeProject = (projectId) => {
        router.push(`/canvas?projectId=${projectId}`);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1>Campaigns</h1>
                    <p>Manage your creative projects and generation credits.</p>
                </div>
                <div className="header-actions">
                    <div className="credit-display">
                        🪙 <span>{credits}</span> Credits
                    </div>
                    <input
                        type="file"
                        accept="image/*, video/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <button className="btn-secondary" onClick={handleImportClick}>Import File</button>
                    <button className="btn-primary" onClick={() => handleUseTemplate('blank')}>+ Create New</button>
                </div>
            </header>

            {/* Search & Filter */}
            <div className="controls-section">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search templates..." />
                </div>

                <div className="filters">
                    {['All', '9:16', '16:9', '1:1'].map(f => (
                        <button
                            key={f}
                            className={`filter-pill ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'All' ? 'All Templates' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Section */}
            {projects.length > 0 && (
                <div className="section-group">
                    <h2 className="section-title">My Projects</h2>
                    <div className="templates-grid">
                        {projects.map(project => (
                            <div key={project.id} className="template-card">
                                <div className="thumbnail-wrapper" onClick={() => handleResumeProject(project.id)}>
                                    {renderThumbnail(project)}
                                    <div className="overlay">
                                        <button className="use-btn">Resume</button>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="card-info">
                                        <h3>{project.name}</h3>
                                        <span className="last-modified">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        className="rename-btn"
                                        title="Rename Project"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const newName = window.prompt("Enter new project name:", project.name);
                                            if (newName && newName !== project.name) {
                                                const updated = { ...project, name: newName, updatedAt: new Date().toISOString() };
                                                const { saveProjectToDB } = require('../../lib/db');
                                                await saveProjectToDB(updated);
                                                setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
                                            }
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Templates Section */}
            <div className="section-group">
                <h2 className="section-title">New Campaign</h2>
                <div className="templates-grid">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            className={`template-card ${template.id === 'blank' ? 'blank-card' : ''}`}
                            onClick={() => handleUseTemplate(template.id)}
                        >
                            {template.id === 'blank' ? (
                                <div className="blank-content">
                                    <div className="plus-icon">+</div>
                                    <h3>{template.name}</h3>
                                </div>
                            ) : (
                                <>
                                    <div className="thumbnail-wrapper">
                                        {renderThumbnail(template)}
                                        <div className="overlay">
                                            <button className="use-btn">Use Template</button>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <h3>{template.name}</h3>
                                        <span className="category-badge">{template.category}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .page-container {
                    max-width: 1400px; /* Wider for modern feel */
                    margin: 0 auto;
                    padding-top: 0;
                    padding-bottom: 60px;
                }

                /* Header */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                    padding-top: 20px;
                }
                
                .rename-btn {
                    background: #f1f5f9;
                    border: none;
                    border-radius: 8px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                }
                
                .rename-btn:hover {
                    background: #e2e8f0;
                    transform: scale(1.1);
                }
                
                .card-info {
                    display: flex;
                    flex-direction: column;
                }

                h1 { 
                    font-size: 2.5rem; 
                    font-weight: 700; 
                    color: var(--text-heading); 
                    margin-bottom: 12px; 
                    letter-spacing: -0.02em;
                }
                .page-header p { 
                    color: var(--text-body); 
                    font-size: 1.1rem; 
                    max-width: 600px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .credit-display {
                    background: #fff8f1;
                    padding: 8px 16px;
                    border-radius: 12px;
                    border: 1px solid #ffe4cc;
                    font-weight: 600;
                    color: var(--text-heading);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-right: 12px;
                }

                .credit-display span {
                    color: #ff6b3d;
                    font-size: 1.1rem;
                }

                .section-group {
                    margin-bottom: 60px;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: var(--text-heading);
                    letter-spacing: -0.01em;
                }

                .last-modified {
                    font-size: 0.8rem;
                    color: var(--text-meta);
                }

                button {
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .btn-secondary {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    color: var(--text-heading);
                    padding: 12px 24px;
                    border-radius: var(--border-radius-btn);
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-secondary:hover {
                    border-color: var(--primary-start);
                    color: var(--primary-start);
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
                    color: white;
                    border: none;
                    padding: 12px 28px;
                    border-radius: var(--border-radius-btn);
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 107, 61, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 61, 0.4);
                }

                /* Controls */
                .controls-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    background: var(--bg-white);
                    padding: 16px 24px;
                    border-radius: 16px;
                    box-shadow: var(--shadow-card);
                }

                .search-wrapper {
                    position: relative;
                    width: 350px;
                }

                .search-wrapper input {
                    width: 100%;
                    padding: 12px 16px 12px 44px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    background: #fcfcfc;
                    transition: border-color 0.2s;
                }
                .search-wrapper input:focus {
                    outline: none;
                    border-color: var(--primary-start);
                    background: white;
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-meta);
                }

                .filters {
                    display: flex;
                    gap: 10px;
                }

                .filter-pill {
                    padding: 8px 18px;
                    border-radius: 20px;
                    background: white;
                    border: 1px solid var(--border-color);
                    color: var(--text-body);
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                }

                .filter-pill:hover {
                    border-color: var(--primary-start);
                    color: var(--primary-start);
                }

                .filter-pill.active {
                    background: var(--text-heading);
                    color: white;
                    border-color: var(--text-heading);
                }

                /* Grid */
                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 32px;
                }

                .template-card {
                    background: var(--bg-white);
                    border-radius: var(--border-radius-card);
                    overflow: hidden;
                    border: 1px solid transparent; /* Smoother border transitions */
                    box-shadow: var(--shadow-card);
                    transition: transform 0.3s, box-shadow 0.3s;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }

                .template-card:hover {
                    transform: translateY(-6px);
                    box-shadow: var(--shadow-hover);
                }

                /* Blank Card */
                .blank-card {
                    border: 2px dashed var(--border-color);
                    background: transparent;
                    box-shadow: none;
                    align-items: center;
                    justify-content: center;
                    min-height: 100%;
                }
                .blank-card:hover {
                    border-color: var(--primary-start);
                    background: rgba(255, 255, 255, 0.5);
                }

                .blank-content {
                    text-align: center;
                    color: var(--text-meta);
                }
                .blank-content h3 { color: var(--text-body); font-weight: 600; }

                .plus-icon {
                    font-size: 3.5rem;
                    margin-bottom: 16px;
                    font-weight: 200;
                    color: var(--primary-start);
                }

                /* Standard Card */
                .thumbnail-wrapper {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 9/16;
                    background: #f0f0f0;
                    display: flex;
                    flex-direction: column;
                }
                
                .template-card:nth-child(4) .thumbnail-wrapper { aspect-ratio: 16/9; }
                .template-card:nth-child(6) .thumbnail-wrapper { aspect-ratio: 1/1; }

                /* Generic Preview */
                .preview-generic {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .preview-generic img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* UGC Preview */
                .preview-ugc {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .ugc-top {
                    flex: 2;
                    position: relative;
                    overflow: hidden;
                }
                .ugc-top img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .hook-badge {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ff0000;
                    color: white;
                    font-weight: 800;
                    font-size: 0.7rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                }
                .ugc-bottom {
                    flex: 1;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-top: 1px solid #eee;
                }
                .shop-btn {
                    background: #000;
                    color: white;
                    font-size: 0.8rem;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-weight: 600;
                }

                /* Seasonal Preview */
                .preview-seasonal {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .preview-seasonal img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .sale-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .sale-text {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .sale-sub {
                    font-size: 0.8rem;
                    color: white;
                    font-weight: 600;
                    background: #ff5e3a;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-top: 4px;
                }
                .format-badge {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    font-size: 0.65rem;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-weight: 700;
                }

                .duration-tag {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    color: white;
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }

                .overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 10;
                }

                .template-card:hover .overlay {
                    opacity: 1;
                }

                .use-btn {
                    background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
                    color: white;
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    transform: translateY(10px);
                    transition: transform 0.3s;
                }
                .template-card:hover .use-btn {
                    transform: translateY(0);
                }

                .card-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--bg-main);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-white);
                }

                .card-footer h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-heading);
                }

                .category-badge {
                    font-size: 0.75rem;
                    color: var(--text-body);
                    background: var(--bg-main);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                /* Vertical Suite Preview */
                .preview-vertical-suite {
                    width: 100%;
                    height: 100%;
                    background: #0f172a;
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    padding: 20px 10px;
                    position: relative;
                }
                .v-column {
                    width: 15%;
                    height: 100%;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
                .v-column.main {
                    width: 30%;
                    background: linear-gradient(to bottom, #3b82f6, #60a5fa);
                }
                .v-label {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: white;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
}

