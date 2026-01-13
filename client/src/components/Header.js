"use client";

export default function Header() {
  return (
    <header className="header">
      <div className="header-right">
        {/* Placeholder for future header elements */}
      </div>

      <style jsx>{`
        .header {
          height: var(--header-height);
          background: white;
          position: fixed;
          top: 0;
          right: 0;
          left: var(--sidebar-width);
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0 30px;
          border-bottom: 1px solid #f0f0f0;
          z-index: 90;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .language-selector {
          font-size: 0.9rem;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .notification {
          position: relative;
          cursor: pointer;
        }

        .bell {
            font-size: 1.2rem;
            color: #666;
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4fac;
          color: white;
          font-size: 0.6rem;
          padding: 2px 4px;
          border-radius: 50%;
          min-width: 16px;
          text-align: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .avatar {
          width: 32px;
          height: 32px;
          background: #ddd;
          border-radius: 50%;
        }

        .username {
          font-size: 0.9rem;
          color: #333;
          font-weight: 500;
        }

        .arrow {
            font-size: 0.8rem;
            color: #999;
        }
      `}</style>
    </header>
  );
}
