import Link from "next/link";
import { notFound } from "next/navigation";
import { CapturedState } from "@/components/captured-state";
import { ChangeFeed } from "@/components/change-feed";
import { DeleteWatchForm } from "@/components/delete-watch-form";
import { RunWatchForm } from "@/components/run-watch-form";
import { SnapshotHistory } from "@/components/snapshot-history";
import { displayCompanyName, formatRelativeTime, plainText } from "@/lib/format";
import { listSnapshots } from "@/snapshots/listSnapshots";
import { getWatch } from "@/watches/getWatch";

export const dynamic = "force-dynamic";

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const watch = await getWatch(id);

  if (!watch) {
    notFound();
  }

  const snapshots = await listSnapshots(watch.id);
  const latestSnapshot = snapshots[0];
  const sources = latestSnapshot?.data.sources ?? [];

  return (
    <main className="page-shell detail-page">
      <Link href="/watches" className="text-link">
        ← All watches
      </Link>

      <header className="detail-toolbar">
        <div className="detail-identity">
          <div className="watch-avatar watch-avatar-lg" aria-hidden="true">
            {displayCompanyName(watch.companyName).slice(0, 1)}
          </div>
          <div>
            <h1 className="page-title">{displayCompanyName(watch.companyName)}</h1>
            <p className="detail-meta-line">
              <a href={watch.companyUrl} target="_blank" rel="noreferrer">
                {hostnameFromUrl(watch.companyUrl)}
              </a>
              <span>{watch.status}</span>
              <span>Every {watch.watchFrequency}</span>
              <span>Checked {formatRelativeTime(watch.lastCheckedAt)}</span>
            </p>
            <div className="watch-chip-row">
              {watch.enabledSignals.map((signal) => (
                <span key={signal} className="mini-chip">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="button-row">
          <RunWatchForm watchId={watch.id} />
          <DeleteWatchForm watchId={watch.id} />
        </div>
      </header>

      <ChangeFeed snapshot={latestSnapshot} />
      <CapturedState snapshot={latestSnapshot} />

      <div className="detail-meta-grid">
        <SnapshotHistory snapshots={snapshots} />

        <section className="panel-card">
          <p className="kicker">Sources</p>
          <h2>Evidence</h2>
          <div className="source-list">
            {sources.length === 0 ? (
              <p className="muted">No sources captured yet.</p>
            ) : (
              sources.slice(0, 8).map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="source-item"
                >
                  <span className="source-item-title">{plainText(source.title)}</span>
                  <span className="source-item-host">{hostnameFromUrl(source.url)}</span>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
