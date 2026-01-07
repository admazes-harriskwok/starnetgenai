"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from '../../config/templates';
import { getProjectsFromDB, deleteProjectFromDB } from '../../lib/db';

export default function CampaignsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [ratioFilter, setRatioFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      let saved = await getProjectsFromDB();
      // Filter out corrupted projects (missing critical fields)
      saved = saved.filter(p => p && p.id && p.name);
      setProjects(saved);
    };
    load();
  }, []);
  const handleDeleteProject = async (id) => {
    if (confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) {
      try {
        await deleteProjectFromDB(id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project.');
      }
    }
  };

  const handleStartBlank = () => {
    router.push('/canvas');
  };

  const handleStartTemplate = (templateId) => {
    router.push(`/canvas?template=${templateId}`);
  };

  const openCanvas = (projectId) => {
    router.push(`/canvas?projectId=${projectId}`);
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredTemplates = Object.values(TEMPLATES).filter(tmpl => {

    const matchesSearch = tmpl.name.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesRatio = ratioFilter === 'All' || tmpl.ratio === ratioFilter;
    const matchesCategory = templateCategory === 'All' || tmpl.category === templateCategory;

    return matchesSearch && matchesRatio && matchesCategory;
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="campaigns-page">
      <div className="content-wrapper">
        {/* Banner Section */}
        <div className="banner">
          <div className="banner-content">
            <h1>Campaigns</h1>
            <p>Manage your creative projects and generation credits.</p>
          </div>
          <div className="banner-decoration"></div>
        </div>

        {/* Phase 2: Start a New Campaign Section */}
        <section className="create-section">
          <div className="section-header">
            <h2 className="section-title">Start a New Campaign</h2>
            <div className="filter-controls-column">
              <div className="category-tabs">
                {['All', 'Generate Image', 'Generate Video', 'Edit Image'].map(cat => (
                  <button
                    key={cat}
                    className={`cat-tab ${templateCategory === cat ? 'active' : ''}`}
                    onClick={() => setTemplateCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                  />
                </div>
                <div className="ratio-filters">
                  {['All', '9:16', '1:1', '16:9'].map(ratio => (
                    <button
                      key={ratio}
                      className={`ratio-btn ${ratioFilter === ratio ? 'active' : ''}`}
                      onClick={() => setRatioFilter(ratio)}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="template-grid">
            {/* Blank Canvas Card */}
            <div className="template-card blank" onClick={handleStartBlank}>
              <div className="card-visual">
                <span className="plus-icon">+</span>
              </div>
              <div className="card-info">
                <h3>Start from Blank Canvas</h3>
                <p>Infinite space for any workflow</p>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map(tmpl => (
              <div key={tmpl.id} className="template-card" onClick={() => handleStartTemplate(tmpl.id)}>
                <div className="card-visual template">
                  <span className="template-badge">Template</span>
                  <span className="ratio-tag-preview">{tmpl.ratio}</span>
                  <div className="node-preview">
                    {[1, 2, 3].map(i => <div key={i} className="mini-node" />)}
                  </div>
                </div>
                <div className="card-info">
                  <h3>{tmpl.name}</h3>
                  <div className="card-meta-row">
                    <span className="cat-pill">{tmpl.category || 'General'}</span>
                    <span className="node-count">{tmpl.nodes.length} nodes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Existing: Stored Projects Section */}
        <section className="projects-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="empty-projects">
              <p>{projectSearch ? 'No projects matching your search.' : 'No projects yet. Start one above!'}</p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map(project => (
                <div key={project.id} className="project-card" onClick={() => openCanvas(project.id)}>
                  <div className="thumbnail-container">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} />
                    ) : (
                      <div className="thumbnail-placeholder">No Preview</div>
                    )}
                    <div className="overlay">
                      <span className="open-label">Open Canvas</span>
                      <button
                        className="delete-project-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        title="Delete Project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <div className="project-meta">
                      <span className="ratio-tag">{project.aspectRatio || '9:16'}</span>
                      <span className="dot">•</span>
                      <span className="timestamp">{formatRelativeTime(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .campaigns-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* Banner */
        .banner {
          background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          border-radius: 16px;
          padding: 48px;
          color: white;
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
        }
        
        .banner-decoration {
          position: absolute;
          top: -30%;
          right: 5%;
          width: 280px;
          height: 280px;
          background: rgba(255,255,255,0.1);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          transform: rotate(15deg);
        }

        .banner h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .banner p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Create Section (Top Half) */
        .create-section {
          margin-bottom: 64px;
        }

        .create-section .section-header {
            margin-bottom: 24px;
        }

        /* Filter Layout */
        .filter-controls-column {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
        }

        .category-tabs {
            display: flex;
            gap: 12px;
            padding-bottom: 4px;
        }

        .cat-tab {
            background: white;
            border: 1px solid #e2e8f0;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
        }

        .cat-tab.active {
            background: #0f172a;
            color: white;
            border-color: #0f172a;
        }

        .cat-tab:hover:not(.active) {
            background: #f1f5f9;
        }

        .filter-row {
            display: flex;
            gap: 24px;
            align-items: center;
        }

        .ratio-filters {
            display: flex;
            gap: 8px;
            background: white;
            padding: 4px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .ratio-btn {
            padding: 6px 16px;
            border-radius: 8px;
            border: none;
            background: transparent;
            font-size: 0.85rem;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
        }

        .ratio-btn.active {
            background: #f97316;
            color: white;
        }

        .ratio-btn:hover:not(.active) {
            background: #f1f5f9;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .template-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .template-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #fdba74;
        }
        
        .delete-project-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.8rem;
            opacity: 0;
            transition: all 0.2s;
            z-index: 10;
        }
        
        .delete-project-btn:hover {
            background: #fee2e2;
            color: #ef4444;
            border-color: #fecaca;
        }

        .project-card:hover .delete-project-btn {
            opacity: 1;
        }

        .card-visual {
          height: 160px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .template-card.blank .card-visual {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
        }

        .plus-icon {
          font-size: 48px;
          color: #f97316;
          font-weight: 300;
        }

        .card-visual.template {
          background: #f8fafc;
          flex-direction: column;
          gap: 12px;
        }

        .template-badge {
          position: absolute;
          top: 12px;
          left: 12px; /* moved to left to make room for delete on right */
          background: #e2e8f0;
          color: #475569;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .ratio-tag-preview {
          display: none; /* Hide old tag, replacing with meta row */
        }

        .node-preview {
          display: flex;
          gap: 8px;
        }

        .mini-node {
          width: 32px;
          height: 32px;
          background: #cbd5e1;
          border-radius: 8px;
        }

        .card-info {
          padding: 20px;
        }

        .card-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .card-meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .cat-pill {
            font-size: 0.7rem;
            font-weight: 700;
            background: #f1f5f9;
            color: #64748b;
            padding: 4px 8px;
            border-radius: 6px;
            text-transform: uppercase;
        }

        .node-count {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        /* Projects Section (Bottom Half) */
        .projects-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 48px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .search-bar input {
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          width: 300px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-bar input:focus {
          border-color: #f97316;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 32px;
        }

        .project-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .project-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .thumbnail-container {
          position: relative;
          aspect-ratio: 9/16;
          background: #f1f5f9;
        }

        .thumbnail-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 0.9rem;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .project-card:hover .overlay {
          opacity: 1;
        }

        .open-label {
          background: white;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .project-info {
          padding: 16px;
        }

        .project-info h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .ratio-tag {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .dot { font-size: 1rem; line-height: 0; }

        .empty-projects {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 20px;
          border: 2px dashed #e2e8f0;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

