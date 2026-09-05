import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header-wrap">
      <div className="site-header">
        <Link href="/watches" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 16c2.1-2.6 3.6-6.8 4.2-11 .7 4.6 2.4 8.2 4.8 11 2.2 2.5 4.8 3.4 7 2.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-text">Vaaya Signals</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <Link href="/watches" className="nav-link">
            Watches
          </Link>
          <Link href="/watches/new" className="nav-link">
            Create
          </Link>
          <a href="#watches-list" className="nav-link">
            Workspace
          </a>
        </nav>

        <div className="header-actions">
          <Link href="/watches" className="text-link">
            Open app
          </Link>
          <Link href="/watches/new" className="primary-button">
            Start watch
          </Link>
        </div>
      </div>
    </header>
  );
}
