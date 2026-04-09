import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <div className="brand-mark">OO</div>
        <div>
          <div className="brand-title">OperatorOS</div>
          <div className="brand-subtitle">Business diagnostic and optimization roadmap</div>
        </div>
      </div>

      <nav className="header-links">
        <Link href="/#framework">Framework</Link>
        <Link href="/assessment">Assessment</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}
