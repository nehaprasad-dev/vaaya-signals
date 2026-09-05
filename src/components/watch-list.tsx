import Link from "next/link";
import { displayCompanyName, formatRelativeTime } from "@/lib/format";
import type { WatchSummary } from "@/types/signals";

export function WatchList({ watches }: { watches: WatchSummary[] }) {
  if (watches.length === 0) {
    return (
      <div className="empty-state">
        <p className="kicker">No watches yet</p>
        <h3>Add a company and see its live signals</h3>
        <p className="muted">
          Add a URL once. The first run captures current product, news, hiring,
          and pricing. Later runs only highlight what changed.
        </p>
        <Link href="/watches/new" className="primary-button">
          Start your first watch
        </Link>
      </div>
    );
  }

  return (
    <div className="watch-table">
      {watches.map((watch) => {
        const latestSnapshot = watch.latestSnapshot;
        const latestLabel = latestSnapshot
          ? `${latestSnapshot.data.events.length} signals`
          : "Not run yet";

        return (
          <Link href={`/watches/${watch.id}`} key={watch.id} className="watch-row">
            <div className="watch-row-main">
              <div className="watch-avatar">{displayCompanyName(watch.companyName).slice(0, 1)}</div>
              <div>
                <p className="watch-name">{displayCompanyName(watch.companyName)}</p>
                <p className="muted watch-url">{watch.companyUrl}</p>
              </div>
            </div>

            <div className="watch-chip-row">
              {watch.enabledSignals.map((signal) => (
                <span key={signal} className="mini-chip">
                  {signal}
                </span>
              ))}
            </div>

            <div className="watch-row-meta">
              <span className="status-badge">{watch.status}</span>
              <span className="muted">
                {latestLabel} · {formatRelativeTime(watch.lastCheckedAt)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
