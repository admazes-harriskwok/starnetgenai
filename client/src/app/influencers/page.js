"use client";
import React, { useState } from 'react';

export default function InfluencersPage() {
    const [showFilters, setShowFilters] = useState(true);

    // Mock Data
    const influencers = [
        { id: 1, name: "Jessica Chen", handle: "@jessica.lifestyle", followers: "485K", engagement: "3.8%", avgLikes: "18.4K", avatar: "https://i.pravatar.cc/150?u=1", verified: true },
        { id: 2, name: "David Wong", handle: "@davidwong_eats", followers: "126K", engagement: "4.2%", avgLikes: "5.3K", avatar: "https://i.pravatar.cc/150?u=2", verified: false },
        { id: 3, name: "Sophie Lin", handle: "@sophie.beauty", followers: "892K", engagement: "2.1%", avgLikes: "18.7K", avatar: "https://i.pravatar.cc/150?u=3", verified: true },
        { id: 4, name: "Tech Review HK", handle: "@techreviewhk", followers: "210K", engagement: "5.5%", avgLikes: "11.5K", avatar: "https://i.pravatar.cc/150?u=4", verified: false },
        { id: 5, name: "Mina Travel", handle: "@minatravels", followers: "1.2M", engagement: "1.8%", avgLikes: "21.6K", avatar: "https://i.pravatar.cc/150?u=5", verified: false },
        { id: 6, name: "Alex Fitness", handle: "@alexfit_hk", followers: "345K", engagement: "4.8%", avgLikes: "16.5K", avatar: "https://i.pravatar.cc/150?u=6", verified: true },
        { id: 7, name: "Sarah Wu", handle: "@sarah.style", followers: "420K", engagement: "3.5%", avgLikes: "15.2K", avatar: "https://i.pravatar.cc/150?u=7", verified: true },
        { id: 8, name: "John Park", handle: "@john_explore", followers: "180K", engagement: "4.0%", avgLikes: "7.2K", avatar: "https://i.pravatar.cc/150?u=8", verified: false },
        { id: 9, name: "Kelly Chan", handle: "@kelly.makeup", followers: "750K", engagement: "2.5%", avgLikes: "19.5K", avatar: "https://i.pravatar.cc/150?u=9", verified: true },
        { id: 10, name: "Gaming Pro", handle: "@gamingpro_hk", followers: "280K", engagement: "5.0%", avgLikes: "14.0K", avatar: "https://i.pravatar.cc/150?u=10", verified: false },
    ];

    const categories = ["Beauty", "Style & Fashion", "Family", "Kids & Toys", "Luxury", "Parenting", "Pets & Animals", "Music", "Artistic Performance", "Entertainment", "Health & Fitness", "Travel", "Food & Culinary", "Technology"];

    return (
        <div className="page-container">
            {/* Banner */}
            <div className="banner">
                <div className="banner-content">
                    <h1>Influencer Discovery</h1>
                    <p>Find influencers that match your brand and marketing goals.</p>
                </div>
                <div className="banner-decoration"></div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-bar">
                    <div className="dropdown platform-select">
                        <span className="icon-instagram">📸</span> Instagram <span className="arrow">⌄</span>
                    </div>
                    <div className="divider"></div>
                    <div className="dropdown location-select">
                        Hong Kong <span className="arrow">⌄</span>
                    </div>
                    <div className="divider"></div>
                    <input
                        type="text"
                        placeholder="Enter influencer username or bio keywords"
                        className="search-input"
                    />
                    <button className="search-btn">🔍</button>
                </div>
                <button className="filters-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                    <span className="icon-filter">⚙️</span> Filters
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-row">
                        {/* Left Column */}
                        <div className="filters-col left-col">
                            <div className="filter-group">
                                <label>Followers</label>
                                <div className="range-inputs">
                                    <input type="text" placeholder="min 0" />
                                    <span className="separator">—</span>
                                    <input type="text" placeholder="max 10M+" />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Age Group <span className="ai-badge">(AI Prediction)</span></label>
                                <div className="tags-row">
                                    {['18-24', '25-34', '35-44', '45-54', '55+'].map(age => (
                                        <button key={age} className="filter-tag">{age}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group row-group">
                                <div className="checkbox-item">
                                    <input type="checkbox" id="has-email" />
                                    <label htmlFor="has-email">Has email</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" id="is-verified" />
                                    <label htmlFor="is-verified">Is Verified</label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="filters-col right-col">
                            <div className="filter-group">
                                <div className="group-header">
                                    <label>Influencer Type</label>
                                    <div className="radio-option">
                                        <input type="radio" checked readOnly /> Match All
                                    </div>
                                </div>
                                <div className="tags-cloud">
                                    {categories.map(cat => (
                                        <button key={cat} className={`filter-tag ${cat === 'Beauty' ? 'active' : ''}`}>{cat}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Influencer Gender <span className="ai-badge">(AI Prediction)</span></label>
                                <div className="tags-row">
                                    <button className="filter-tag">Male</button>
                                    <button className="filter-tag active">Female</button>
                                    <button className="filter-tag">Any</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filters-actions">
                        <button className="clear-btn">Clear All</button>
                        <button className="apply-btn">Apply Filters</button>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="results-container">
                <table className="influencers-table">
                    <thead>
                        <tr>
                            <th className="col-influencer">INFLUENCER</th>
                            <th>FOLLOWERS ⇅</th>
                            <th>ENGAGEMENT ⇅</th>
                            <th>AVG LIKES ⇅</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {influencers.map(inf => (
                            <tr key={inf.id}>
                                <td>
                                    <div className="influencer-cell">
                                        <img src={inf.avatar} alt={inf.name} className="avatar" />
                                        <div className="info">
                                            <div className="name-row">
                                                <span className="name">{inf.name}</span>
                                                {inf.verified && <span className="verified-badge">✓</span>}
                                            </div>
                                            <span className="handle">{inf.handle}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="font-medium">{inf.followers}</td>
                                <td className="font-medium">{inf.engagement}</td>
                                <td className="font-medium">{inf.avgLikes}</td>
                                <td className="col-action">
                                    <button className="insights-btn">Insights</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <span>Showing <strong>1</strong> to <strong>10</strong> of <strong>97</strong> results</span>
                    <div className="pagination-controls">
                        <span className="page-link disabled">&lt; Prev</span>
                        <span className="page-link active">1</span>
                        <span className="page-link">2</span>
                        <span className="page-link">3</span>
                        <span className="page-ellipsis">...</span>
                        <span className="page-link">8</span>
                        <span className="page-link">9</span>
                        <span className="page-link">10</span>
                        <span className="page-link">Next &gt;</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Banner */
                .banner {
                    background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
                    border-radius: 16px;
                    padding: 40px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.2);
                }
                
                .banner-decoration {
                    position: absolute;
                    top: -50%;
                    right: 10%;
                    width: 300px;
                    height: 300px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    transform: rotate(15deg);
                }

                .banner h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .banner p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }

                /* Search Bar */
                .search-section {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .search-bar {
                    flex: 1;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    border: 1px solid #f0f0f0;
                    height: 60px;
                }

                .dropdown {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: #333;
                    cursor: pointer;
                    padding: 0 12px;
                    white-space: nowrap;
                }

                .divider {
                    width: 1px;
                    height: 24px;
                    background: #eee;
                    margin: 0 8px;
                }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 0 16px;
                    font-size: 1rem;
                    color: #333;
                }

                .search-input::placeholder {
                    color: #aaa;
                }

                .search-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 8px;
                    opacity: 0.6;
                }

                .filters-toggle-btn {
                    background: white;
                    border: 1px solid #ff6b3d;
                    color: #ff6b3d;
                    height: 60px;
                    padding: 0 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filters-toggle-btn:hover {
                    background: #fff5f0;
                }

                /* Filters Panel */
                .filters-panel {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #eff0f6;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }

                .filters-row {
                    display: flex;
                    gap: 40px;
                }

                .filters-col {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .left-col { flex: 4; }
                .right-col { flex: 6; }

                .filter-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                }

                .range-inputs {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .range-inputs input {
                    width: 100%;
                    padding: 10px 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                .tags-row, .tags-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .filter-tag {
                    background: #f8f9fc;
                    border: 1px solid #f0f0f0;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    color: #555;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-tag:hover {
                    border-color: #ddd;
                }

                .filter-tag.active {
                    background: #ff6b3d;
                    color: white;
                    border-color: #ff6b3d;
                }

                .group-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .group-header label { margin-bottom: 0; }

                .radio-option {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: #666;
                }
                
                .ai-badge {
                    color: #ff4fac;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin-left: 6px;
                }

                .row-group {
                    display: flex;
                    gap: 24px;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: #444;
                    cursor: pointer;
                }

                .filters-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #f5f5f5;
                }

                .clear-btn {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 0.95rem;
                }

                .apply-btn {
                    background: #ff6b3d;
                    color: white;
                    border: none;
                    padding: 10px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Table */
                .results-container {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #eff0f6;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }

                .influencers-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .influencers-table th {
                    text-align: left;
                    padding: 20px 24px;
                    color: #888;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    border-bottom: 1px solid #f0f0f0;
                    background: #fafafa;
                }

                .influencers-table td {
                    padding: 24px;
                    border-bottom: 1px solid #f9f9f9;
                    vertical-align: middle;
                    color: #333;
                }

                .col-influencer { width: 40%; }
                
                .influencer-cell {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #eee;
                }

                .info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .name-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .name {
                    font-weight: 700;
                    font-size: 1rem;
                    color: #111;
                }

                .verified-badge {
                    color: #3b82f6;
                    font-size: 0.8rem;
                }

                .handle {
                    color: #888;
                    font-size: 0.85rem;
                }

                .font-medium {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .col-action {
                    text-align: right;
                }

                .insights-btn {
                    background: white;
                    border: 1px solid #e0e0e0;
                    color: #444;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .insights-btn:hover {
                    border-color: #aaa;
                    background: #f9f9f9;
                }
                
                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-top: 1px solid #f0f0f0;
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .pagination-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .page-link {
                    padding: 6px 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                
                .page-link:hover {
                    background: #f5f5f5;
                }
                
                .page-link.active {
                    background: #ff6b3d;
                    color: white;
                }
                
                .page-link.disabled {
                    color: #ccc;
                    cursor: not-allowed;
                }
                
                .page-link.disabled:hover { background: none; }
            `}</style>
        </div>
    );
}
