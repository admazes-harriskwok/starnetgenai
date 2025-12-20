"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Influencer Discovery', path: '/influencers', icon: <InfluencersIcon /> },
    { name: 'AI Matching Assistant', path: '/ai-matching', icon: <AiIcon /> },
    { name: 'Campaigns', path: '/campaigns', icon: <CampaignsIcon /> },
    { name: 'Ad Library', path: '/ad-library', icon: <AdLibraryIcon /> },
    { name: 'My Zone', path: '/my-zone', icon: <MyZoneIcon /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <span className="logo-icon">★</span>
        <span className="logo-text">starnet.ai</span>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="user-profile">
        <div className="avatar">JD</div>
        <div className="user-info">
          <span className="user-name">John Doe</span>
          <span className="user-plan">Pro Plan</span>
          <button
            onClick={() => window.open('https://aistudio.google.com/app/plan', '_blank')}
            className="billing-link"
          >
            Check Billing Plan
          </button>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          background: var(--bg-white);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
          box-shadow: 1px 0 10px rgba(0,0,0,0.02);
        }
        
        .logo-container {
          height: var(--header-height);
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 12px;
        }

        .logo-icon {
          color: var(--primary-start);
          font-size: 24px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--text-heading);
          letter-spacing: -0.03em;
        }

        .nav-menu {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px; /* Breathing room */
          flex: 1;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: #64748B;
          font-size: 14px; /* text-sm */
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }

        .nav-item:hover {
          background-color: #F8FAFC;
          color: #475569;
        }

        .nav-item.active {
          background-color: #FFF7ED;
          color: #F97316;
          font-weight: 500;
        }

        .icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-profile {
            padding: 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 16px;
            background: var(--bg-white);
        }

        .avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #eee, #ddd);
            color: var(--text-heading);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-heading);
        }

        .user-plan {
            font-size: 0.75rem;
            color: var(--text-meta);
            font-weight: 500;
        }

        .billing-link {
            background: none;
            border: none;
            color: var(--primary-start);
            font-size: 0.7rem;
            text-decoration: underline;
            padding: 0;
            margin-top: 4px;
            cursor: pointer;
            text-align: left;
            transition: color 0.2s;
        }

        .billing-link:hover {
            color: var(--primary-end);
        }
      `}</style>
    </aside>
  );
}

// Icons
function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  )
}

function InfluencersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
      <path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path>
      <path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path>
      <path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
      <rect x="7" y="7" width="10" height="10" rx="3"></rect>
    </svg>
  );
}

function CampaignsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h13.4a3 3 0 0 0 3.2-2.1L19 2h3v15z"></path>
      <path d="M22 22l-4-5"></path>
    </svg>
  );
}

function AdLibraryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function AssetsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  )
}

function MyZoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  )
}
