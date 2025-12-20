"use client";
import React, { useState } from 'react';

export default function MyZonePage() {
    const [activeTab, setActiveTab] = useState('account'); // 'account' or 'transaction'

    // Mock Data for Transactions
    const transactions = [
        { id: 1, desc: "Top up", party: "Starnet", date: "Jul 30, 2023, 4:35 PM", amount: "+ 2,000", type: "credit" },
        { id: 2, desc: "Credit Transfer", party: "Influencer 1", date: "Jul 30, 2023, 4:35 PM", amount: "- 2,000", type: "debit" },
        { id: 3, desc: "Top up", party: "Starnet", date: "Jul 30, 2023, 4:35 PM", amount: "+ 2,000", type: "credit" },
        { id: 4, desc: "Credit Transfer", party: "Influencer 1", date: "Jul 30, 2023, 4:35 PM", amount: "- 2,000", type: "debit" },
        { id: 5, desc: "Credit Transfer", party: "Influencer 1", date: "Jul 30, 2023, 4:35 PM", amount: "- 2,000", type: "debit" },
        { id: 6, desc: "Top up", party: "Starnet", date: "Jul 30, 2023, 4:35 PM", amount: "+ 2,000", type: "credit" },
        { id: 7, desc: "Top up", party: "Starnet", date: "Jul 30, 2023, 4:35 PM", amount: "+ 2,000", type: "credit" },
    ];

    return (
        <div className="page-container">
            {/* Banner */}
            <div className="banner">
                <div className="banner-content">
                    <h1>My Zone</h1>
                    <p>View and update your account details, profile and more.</p>
                </div>
                <div className="banner-decoration"></div>
            </div>

            {/* Tabs */}
            <div className="tabs-row">
                <button
                    className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'transaction' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transaction')}
                >
                    Transaction History
                </button>
            </div>

            {/* Content Area */}
            <div className="content-card">
                {activeTab === 'transaction' ? (
                    // Transaction History Tab
                    <div className="tab-content trans-content">
                        <div className="card-header-row">
                            <div className="header-left">
                                <h2>Transaction History</h2>
                                <p className="subtitle">View and download your credit transaction history seamlessly.</p>
                            </div>
                            <div className="header-right">
                                <div className="button-group">
                                    <button className="icon-btn pdf-btn">
                                        📄
                                    </button>
                                    <button className="icon-btn csv-btn">
                                        📊
                                    </button>
                                </div>
                                <button className="date-picker-btn">
                                    📅 Feb 12, 2024 - Jun 30, 2024 <span className="arrow">⌄</span>
                                </button>
                            </div>
                        </div>

                        <table className="trans-table">
                            <thead>
                                <tr>
                                    <th>TRANSACTION DESCRIPTION</th>
                                    <th>PARTY</th>
                                    <th>TRANSACTION DATE</th>
                                    <th className="text-right">CREDIT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id}>
                                        <td className="font-medium">{t.desc}</td>
                                        <td>{t.party}</td>
                                        <td className="text-gray">{t.date}</td>
                                        <td className={`text-right font-bold ${t.type === 'credit' ? 'text-green' : 'text-dark'}`}>
                                            {t.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <span>Showing 1 to 8 of 230 entries</span>
                            <div className="page-controls">
                                <span className="page-nav">First</span>
                                <span className="page-nav">&lt;</span>
                                <span className="page-num active">1</span>
                                <span className="page-num">2</span>
                                <span className="page-num">3</span>
                                <span>...</span>
                                <span className="page-num">8</span>
                                <span className="page-num">9</span>
                                <span className="page-num">10</span>
                                <span className="page-nav">&gt;</span>
                                <span className="page-nav">Last</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Account Details Tab
                    <div className="tab-content account-content">
                        <h2>Account Information</h2>

                        <div className="account-grid">
                            <div className="form-column">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" value="Test Company Name" readOnly className="form-input bg-gray" />
                                </div>

                                <div className="form-group">
                                    <label>Account Email</label>
                                    <div className="input-icon-wrapper">
                                        <input type="text" value="trevorphilips@gmail.com" readOnly className="form-input bg-gray" />
                                        <span className="verified-badge">
                                            <span className="verified-text">verified</span>
                                            <span className="check-circle">✓</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="row-input">
                                        <input type="password" value="..............." readOnly className="form-input bg-gray" />
                                        <button className="outline-btn">Edit Password</button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="row-input">
                                        <div className="phone-select">
                                            <span className="flag">🇻🇳</span> +852 ⌄
                                        </div>
                                        <input type="text" value="0123954214" readOnly className="form-input bg-gray flex-1" />
                                        <button className="outline-btn">Edit Phone</button>
                                    </div>
                                </div>
                            </div>

                            <div className="balance-column">
                                <div className="balance-card">
                                    <div className="sparkle-icon">✨</div>
                                    <div className="coins-icon">💰</div>
                                    <p className="balance-label">Current Balance</p>
                                    <h1 className="balance-amount">12,546</h1>
                                    <p className="balance-unit">Credit</p>

                                    <button className="top-up-btn">Top Up</button>

                                    <div className="balance-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">TOTAL TOP UP</span>
                                            <span className="stat-value">15.2K</span>
                                        </div>
                                        <div className="vertical-divider"></div>
                                        <div className="stat-item">
                                            <span className="stat-label">TOTAL EXPENSES</span>
                                            <span className="stat-value">2.4K</span>
                                        </div>
                                    </div>

                                    <a href="#" className="refund-link">ⓘ Ask for Return Credit</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                
                .banner-decoration {
                    position: absolute;
                    bottom: 0;
                    right: 15%;
                    width: 250px;
                    height: 120px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 125px 125px 0 0;
                }

                .banner h1 { font-size: 2.2rem; margin-bottom: 8px; font-weight: 700; }
                .banner p { font-size: 1rem; opacity: 0.9; }

                /* Tabs */
                .tabs-row { display: flex; gap: 8px; }
                .tab-btn {
                    padding: 10px 24px;
                    background: #f5f5f5;
                    border: none;
                    border-radius: 8px 8px 0 0; /* Or standard rounded button style from design */
                    border-radius: 6px;
                    color: #666;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .tab-btn.active {
                    background: white;
                    color: #333;
                    font-weight: 600;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                /* Content Card */
                .content-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.03);
                    min-height: 500px;
                }

                h2 { font-size: 1.2rem; font-weight: 700; color: #333; margin-bottom: 8px; }
                .subtitle { color: #888; font-size: 0.9rem; margin-bottom: 24px; }

                /* Transaction Header */
                .card-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                }
                
                .header-right {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .button-group { display: flex; gap: 8px; }
                .icon-btn {
                    width: 32px;
                    height: 32px;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                }

                .date-picker-btn {
                    border: 1px solid #ff6b3d;
                    background: white;
                    color: #ff6b3d;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Transaction Table */
                .trans-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .trans-table th {
                    text-align: left;
                    padding: 16px 0;
                    color: #999;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    border-bottom: 1px solid #eee;
                }

                .trans-table td {
                    padding: 24px 0;
                    border-bottom: 1px solid #f9f9f9;
                    font-size: 0.9rem;
                    color: #333;
                }
                
                .font-medium { font-weight: 500; }
                .text-gray { color: #888; }
                .text-right { text-align: right; }
                .font-bold { font-weight: 700; }
                .text-green { color: #10b981; }
                .text-dark { color: #333; }

                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 32px;
                    font-size: 0.85rem;
                    color: #888;
                }

                .page-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .page-nav { cursor: pointer; }
                .page-num {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .page-num.active {
                    background: #ff6b3d; /* Orange active page */
                    color: white;
                }

                /* Account Details Layout */
                .account-grid {
                    display: flex;
                    gap: 40px;
                    margin-top: 24px;
                }
                
                .form-column { flex: 6; display: flex; flex-direction: column; gap: 24px; }
                .balance-column { flex: 4; }

                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #444;
                    margin-bottom: 8px;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #555;
                }
                
                .bg-gray { background: #f8f9fa; }

                .input-icon-wrapper { position: relative; }
                .verified-badge {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #111;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .check-circle {
                    background: #28c76f;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                }

                .row-input { display: flex; gap: 12px; }
                
                .outline-btn {
                    border: 1px solid #ff6b3d;
                    color: #ff6b3d;
                    background: white;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .phone-select {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 0 12px;
                    font-size: 0.9rem;
                }

                .flex-1 { flex: 1; }

                /* Balance Card */
                .balance-card {
                    border: 1px solid #eee;
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    position: relative;
                }
                
                .sparkle-icon {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1.5rem;
                    color: #28c76f;
                }

                .coins-icon { font-size: 3rem; margin-bottom: 12px; }
                
                .balance-label { font-size: 0.9rem; color: #666; margin-bottom: 4px; }
                .balance-amount { font-size: 2.5rem; color: #28c76f; font-weight: 700; line-height: 1; }
                .balance-unit { font-size: 0.9rem; color: #888; margin-bottom: 20px; }

                .top-up-btn {
                    background: #ff6b3d;
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 10px rgba(255, 107, 61, 0.2);
                }

                .balance-stats {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .stat-label { font-size: 0.7rem; color: #aaa; font-weight: 600; }
                .stat-value { font-size: 1.1rem; color: #333; font-weight: 700; }

                .vertical-divider { width: 1px; height: 30px; background: #eee; }

                .refund-link {
                    color: #ff4fac;
                    font-size: 0.8rem;
                    text-decoration: none;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
