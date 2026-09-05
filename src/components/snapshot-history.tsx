import { formatSnapshotDate } from "@/lib/format";
import type { WatchSnapshotSummary } from "@/types/signals";

export function SnapshotHistory({
  snapshots,
}: {
  snapshots: WatchSnapshotSummary[];
}) {
  return (
    <section className="surface-card panel-card">
      <p className="kicker">Snapshots</p>
      <h2>Run history</h2>
      <div className="snapshot-list">
        {snapshots.length === 0 ? (
          <p className="muted">No snapshots yet.</p>
        ) : (
          snapshots.map((snapshot) => (
            <div key={snapshot.id} className="snapshot-row">
              <div>
                <p className="snapshot-date">{formatSnapshotDate(snapshot.capturedAt)}</p>
                <p className="muted">
                  {snapshot.isBaseline
                    ? `${snapshot.data.events.length} signals captured`
                    : `${snapshot.changeCount} new changes`}
                </p>
              </div>
              <span className="status-badge">
                {snapshot.isBaseline ? "first run" : "update"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
