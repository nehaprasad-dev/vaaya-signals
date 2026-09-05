import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="empty-state">
        <p className="kicker">Not found</p>
        <h3>This watch does not exist</h3>
        <p className="muted">
          It may have been deleted, or the link you followed is no longer valid.
        </p>
        <Link href="/watches" className="primary-button">
          Back to watches
        </Link>
      </div>
    </main>
  );
}
