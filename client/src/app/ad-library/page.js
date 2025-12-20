"use client";
import React, { useState } from 'react';

export default function AdLibraryPage() {
    // Mock Data for Ad Library
    const ads = [
        { id: 1, handle: "@h0i.2", likes: "1,688", comments: "19", caption: "Summer vibes only! Checking out the best spots in the city. ⚡ #summer #vib...", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80" }, // Mountains/Nature
        { id: 2, handle: "@h0i.2", likes: "894", comments: "12", caption: "Snow days are the best days ❄️ Can't get enough of this view!", image: "https://images.unsplash.com/photo-1517658925526-5b6d518d6A67?auto=format&fit=crop&w=400&q=80" }, // Minimalist object
        { id: 3, handle: "@h0i.2", likes: "2,090", comments: "18", caption: "// 定格在那個夏天的溫度🍉 Feeling the warmth of summer memories.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" }, // Model in sweater
        { id: 4, handle: "@h0i.2", likes: "322", comments: "6", caption: "00_6_0 💢 Caught in the moment.", image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=400&q=80" }, // Minimalist poster
        { id: 5, handle: "@h0i.2", likes: "1,120", comments: "45", caption: "Coffee shop aesthetics ☕️ Time to focus.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80" }, // Coffee poster
        { id: 6, handle: "@h0i.2", likes: "max", comments: "100", caption: "Art is expression.", image: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=400&q=80" }, // Neon sign
        { id: 7, handle: "@h0i.2", likes: "1,540", comments: "22", caption: "Portrait of confidence.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80" }, // Portrait
        { id: 8, handle: "@h0i.2", likes: "765", comments: "8", caption: "Simplicity is key.", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" }, // Interior
    ];

    return (
        <div className="page-container">
            {/* Banner */}
            <div className="banner">
                <div className="banner-content">
                    <h1>Ad Library</h1>
                    <p>Search ads by keyword, hashtag, or influencer to discover trends</p>
                </div>
                <div className="banner-decoration"></div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-dropdown">
                    Hong Kong <span className="arrow">⌄</span>
                </div>

                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by keyword, hashtag or influencer"
                        className="search-input"
                    />
                </div>

                <div className="filter-btn">
                    <span className="filter-icon">⚙️</span> Filter
                </div>
            </div>

            {/* Sort Section */}
            <div className="sort-section">
                <div className="sort-dropdown">
                    Sort by: Most Recent <span className="arrow">⌄</span>
                </div>
            </div>

            {/* Ad Grid */}
            <div className="ad-grid">
                {ads.map(ad => (
                    <div key={ad.id} className="ad-card">
                        <div className="image-container">
                            <img src={ad.image} alt="Ad Visual" className="ad-image" />
                            <a href="#" className="external-link">↗</a>
                            <div className="overlay-gradient"></div>

                            <div className="card-info">
                                <div className="card-header">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <img src="https://i.pravatar.cc/150?u=5" alt="user" />
                                        </div>
                                        <span className="user-handle">{ad.handle}</span>
                                    </div>
                                    <div className="card-stats">
                                        <span className="stat">🤍 {ad.likes}</span>
                                        <span className="stat">💬 {ad.comments}</span>
                                    </div>
                                </div>
                                <p className="caption">{ad.caption}</p>
                            </div>
                        </div>
                    </div>
                ))}
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
                    height: 160px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.2);
                }
                
                .banner h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .banner p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }

                .banner-decoration {
                    position: absolute;
                    top: -50px;
                    right: 150px;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 50%;
                }

                /* Search Section */
                .search-section {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .search-dropdown {
                    background: white;
                    border: 1px solid #eff0f6;
                    border-radius: 8px;
                    padding: 0 16px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: #333;
                    cursor: pointer;
                    min-width: 140px;
                }

                .search-bar {
                    flex: 1;
                    background: white;
                    border-radius: 8px;
                    padding: 0 16px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid #eff0f6;
                }

                .search-input {
                    border: none;
                    outline: none;
                    flex: 1;
                    font-size: 0.95rem;
                }

                .filter-btn {
                    background: white;
                    border: 1px solid #ff6b3d;
                    color: #ff6b3d;
                    height: 48px;
                    padding: 0 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                /* Sort Section */
                .sort-section {
                    display: flex;
                    justify-content: flex-end;
                }

                .sort-dropdown {
                    background: white;
                    border: 1px solid #eff0f6;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 0.9rem;
                    color: #ff6b3d;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Grid */
                .ad-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 24px;
                }

                .ad-card {
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                    background: white;
                    transition: transform 0.2s;
                    aspect-ratio: 1; /* Square cards */
                    position: relative;
                }

                .ad-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                }

                .image-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .ad-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .external-link {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 32px;
                    height: 32px;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.9rem;
                    z-index: 10;
                }

                .overlay-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60%;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    pointer-events: none;
                }

                .card-info {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 16px;
                    color: white;
                    z-index: 5;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .user-avatar img {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 1px solid white;
                }

                .user-handle {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .card-stats {
                    display: flex;
                    gap: 12px;
                    font-size: 0.8rem;
                }

                .caption {
                    font-size: 0.8rem;
                    opacity: 0.9;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
